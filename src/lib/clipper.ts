import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

// Shared mutable URL used by turndown rules to resolve relative links
let currentUrl = "";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  hr: "---",
  emDelimiter: "*",
  strongDelimiter: "**",
});

turndownService.use(gfm);

turndownService.addRule("links", {
  filter: "a",
  replacement(content, node) {
    const href = node.getAttribute("href");
    if (!href) return content;
    let absoluteUrl = href;
    try {
      absoluteUrl = new URL(href, currentUrl).href;
    } catch {}
    const title = node.getAttribute("title");
    return `[${content}](${absoluteUrl}${title ? ` "${title}"` : ""})`;
  },
});

turndownService.addRule("images", {
  filter: "img",
  replacement(_content, node) {
    const src = node.getAttribute("src");
    if (!src) return "";
    let absoluteUrl = src;
    try {
      absoluteUrl = new URL(src, currentUrl).href;
    } catch {}
    return `![${node.getAttribute("alt") || ""}](${absoluteUrl})`;
  },
});

// ─── Content extraction ──────────────────────────────────────────────────────

const REMOVE_SELECTORS = [
  "script", "style", "noscript", "iframe", "embed", "object",
  "nav", "header", "footer", "aside", "form",
  "button", "input", "select", "textarea",
  "svg", "canvas", "video", "audio", "source", "track",
  "[role='navigation']", "[role='banner']", "[role='contentinfo']",
  "[role='complementary']", "[aria-hidden='true']",
  ".ad", ".ads", ".advertisement", ".social-share",
  ".comments", ".comment", ".sidebar", ".cookie", ".cookie-banner",
  ".popup", ".modal", ".newsletter", ".subscribe",
  ".nav", ".menu", ".footer", ".header", ".share",
  ".related", ".recommended", ".promo", ".advert", ".sponsored", ".promotion",
  "#comments", "#sidebar", "#footer", "#header", "#nav",
];

const CONTENT_SELECTORS = [
  "article", "[role='main']", "main",
  ".post-content", ".article-content", ".entry-content",
  ".article-body", ".post-body", ".story-body", ".content-body",
  ".content", ".post", ".article",
];

function extractArticle(doc: Document): { html: string } | null {
  try {
    const article = new Readability(doc, { charThreshold: 100 }).parse();
    if (article?.content) return { html: article.content };
  } catch {}

  const clone = doc.body.cloneNode(true) as HTMLElement;
  for (const sel of REMOVE_SELECTORS) {
    try { clone.querySelectorAll(sel).forEach((el) => el.remove()); } catch {}
  }

  const article =
    CONTENT_SELECTORS.map((sel) => clone.querySelector(sel)).find(Boolean) || clone;

  const text = article.textContent?.trim() ?? "";
  if (text.length < 100) return null;

  return { html: article.innerHTML };
}

function buildMarkdown(title: string, url: string, html: string): string {
  const date = new Date().toISOString().split("T")[0];
  const domain = new URL(url).hostname;
  return [
    `# ${title}`,
    "",
    `> **المصدر:** [${domain}](${url})`,
    `> **التاريخ:** ${date}`,
    "",
    "---",
    "",
    turndownService.turndown(html),
  ].join("\n");
}

// ─── Fetch helpers ───────────────────────────────────────────────────────────

async function fetchDirect(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { Accept: "text/html" }, redirect: "follow" });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// Cloudflare Worker proxy — 100k requests/day free, worker/index.js
const PROXY = "https://dawin-cors-proxy.benotsman-youssuf-22e.workers.dev/?url=";

async function fetchViaProxy(url: string): Promise<string | null> {
  try {
    const res = await fetch(`${PROXY}${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseHtml(html: string, url: string, title?: string): ClipResult | null {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const base = doc.createElement("base");
  base.href = url;
  doc.head.prepend(base);

  const extracted = extractArticle(doc);
  if (!extracted) return null;

  const articleTitle = title || doc.title || new URL(url).hostname;
  return {
    title: articleTitle,
    url,
    markdown: buildMarkdown(articleTitle, url, extracted.html),
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface ClipResult {
  title: string;
  url: string;
  markdown: string;
}

/**
 * Fetch a URL and convert its article content to Markdown.
 * Tries a direct fetch first, then falls back to the Cloudflare Worker proxy.
 * Returns null if both fail or no article content is found.
 */
export async function clipUrl(url: string, title?: string): Promise<ClipResult | null> {
  currentUrl = url;

  const direct = await fetchDirect(url);
  if (direct) {
    const result = parseHtml(direct, url, title);
    if (result) return result;
  }

  const proxied = await fetchViaProxy(url);
  if (proxied) {
    const result = parseHtml(proxied, url, title);
    if (result) return result;
  }

  return null;
}

/**
 * Returns a minimal markdown bookmark when full content extraction fails.
 */
export function clipUrlFallback(url: string, title?: string): ClipResult {
  const displayTitle = title || url;
  const date = new Date().toISOString().split("T")[0];
  let domain = url;
  try { domain = new URL(url).hostname; } catch {}

  return {
    title: displayTitle,
    url,
    markdown: [
      `# ${displayTitle}`,
      "",
      `> **المصدر:** [${domain}](${url})`,
      `> **التاريخ:** ${date}`,
      "",
      "---",
      "",
      `[${displayTitle}](${url})`,
    ].join("\n"),
  };
}
