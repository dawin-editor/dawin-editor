/**
 * useClipImport.ts — Dawin web app hook
 *
 * Replaces BOTH useDawinImport.ts AND the inject script entirely.
 *
 * How it works (Obsidian-style architecture):
 *  1. On mount, check URL for ?clip=<uuid>
 *  2. Call extension directly via chrome.runtime.sendMessage (externally_connectable)
 *     — no inject script, no postMessage relay, no timing race
 *  3. Receive pre-converted Markdown from background (Turndown already ran)
 *  4. Create a NEW blog entry (db.blogs.add — never overwrite)
 *  5. Tell extension to delete the clip (cleanup)
 *  6. Clean the URL
 *
 * Requirements:
 *  - VITE_DAWIN_EXTENSION_ID must be set in .env
 *  - manifest.json must include this origin in externally_connectable.matches
 */

import { useEffect, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { db } from "../lib/db";
import toast from "react-hot-toast";

// ─── Extension ID ─────────────────────────────────────────────────────────────
// Set VITE_DAWIN_EXTENSION_ID in your .env file.
// Get it from chrome://extensions after loading the unpacked extension.

const EXTENSION_ID = "jkcnohhdiadcfbkdbdkinifjfjpodgoa";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useClipImport(editor: Editor | null): void {
  // Prevent double-import on React StrictMode double-invoke
  const imported = useRef(false);

  useEffect(() => {
    if (imported.current) return;
    if (!editor) return;

    const clipId = new URLSearchParams(window.location.search).get("clip");
    if (!clipId) return;

    // Guard: extension API must be available
    if (!hasExtensionApi()) {
      console.warn(
        "[DawinImport] chrome.runtime.sendMessage not available. " +
          "Is the extension installed and this origin in externally_connectable?"
      );
      return;
    }

    if (!EXTENSION_ID) {
      console.error(
        "[DawinImport] VITE_DAWIN_EXTENSION_ID is not set. " +
          "Add it to your .env file."
      );
      return;
    }

    imported.current = true;

    // ── Fetch clip from extension ──────────────────────────────────────────
    chrome.runtime.sendMessage(
      EXTENSION_ID,
      { action: "getClip", clipId },
      async (response: { success?: boolean; data?: unknown; error?: string }) => {
        // Check for chrome runtime errors (extension not installed, ID mismatch, etc.)
        if (chrome.runtime.lastError) {
          console.error("[DawinImport] Extension error:", chrome.runtime.lastError.message);
          toast.error("تعذر الاتصال بإضافة دوّن");
          imported.current = false; // allow retry
          return;
        }

        if (!response?.success || !response.data) {
          console.warn("[DawinImport] Clip not found:", response?.error);
          toast.error("لم يتم العثور على المحتوى — ربما انتهت صلاحيته");
          cleanUrl();
          return;
        }

        const { title, url, markdown } = response.data as {
          title: string;
          url: string;
          markdown: string;
        };

        try {
          // ── Persist to IndexedDB ─────────────────────────────────────────
          // Always ADD a new record — never overwrite an existing one
          const newId = await db.blogs.add({
            title: title || "Imported Article",
            text: markdown,
            sourceUrl: url,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          console.log("[DawinImport] Saved blog id:", newId);

          // ── Push content into editor ─────────────────────────────────────
          editor.commands.setContent(markdown);

          toast.success("تم استيراد المقال بنجاح!");

          // ── Cleanup ──────────────────────────────────────────────────────
          // Tell the extension to delete the clip — fire-and-forget
          chrome.runtime.sendMessage(EXTENSION_ID, { action: "deleteClip", clipId });

          // Remove ?clip= from URL without triggering a page reload
          cleanUrl();
        } catch (err) {
          console.error("[DawinImport] Failed to save clip:", err);
          toast.error("فشل في حفظ المقال");
          imported.current = false; // allow retry
        }
      }
    );
  }, [editor]); // re-run only if editor instance changes
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasExtensionApi(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.runtime?.sendMessage === "function"
  );
}

function cleanUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("clip");
  window.history.replaceState({}, "", url.toString());
}
