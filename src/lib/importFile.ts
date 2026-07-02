import type { Editor } from "@tiptap/react";
import { generateJSON } from "@tiptap/core";
import { db } from "./db";
import { useTitleStore } from "../store/titleStore";
import toast from "react-hot-toast";

type FileType = "markdown" | "html" | "text" | "json";

function detectFileType(filename: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "html" || ext === "htm") return "html";
  if (ext === "md" || ext === "markdown") return "markdown";
  if (ext === "json") return "json";
  return "text";
}

function stripHtmlWrappers(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;
  if (!body) return html;

  // If the HTML has a <body> tag with meaningful content, use body's innerHTML
  const bodyContent = body.innerHTML.trim();
  // If body is empty or just whitespace, fall back to the original html
  if (!bodyContent) return html;
  return bodyContent;
}

export async function importFile(
  editor: Editor,
  content: string,
  filename: string
): Promise<boolean> {
  const fileType = detectFileType(filename);
  const title = filename.replace(/\.[^/.]+$/, "");

  try {
    switch (fileType) {
      case "html": {
        // Parse HTML using Tiptap's native parser — bypass markdown extension
        const cleanHtml = stripHtmlWrappers(content);
        const json = generateJSON(
          cleanHtml,
          editor.extensionManager.extensions
        );
        editor.commands.setContent(json);
        break;
      }
      case "markdown":
        // Let tiptap-markdown extension handle conversion
        editor.commands.setContent(content);
        break;
      case "json": {
        const parsed = JSON.parse(content);
        editor.commands.setContent(parsed);
        break;
      }
      case "text":
      default:
        // Plain text — wrap in paragraphs by splitting on newlines
        editor.commands.setContent(content);
        break;
    }

    // Persist title and content to DB
    const jsonContent = JSON.stringify(editor.getJSON());
    await db.blogs.update(1, {
      title,
      text: jsonContent,
      updatedAt: new Date(),
    });

    useTitleStore.setState({ title });

    toast.success(`تم استيراد: ${title}`, { duration: 3000 });
    return true;
  } catch (err) {
    console.error("File import failed:", err);
    toast.error("فشل استيراد الملف. تأكد من صحة الملف.");
    return false;
  }
}

export function detectFileTypeFromName(filename: string): FileType {
  return detectFileType(filename);
}
