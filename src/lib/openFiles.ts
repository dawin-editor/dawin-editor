import type { Editor } from "@tiptap/react";
import { db } from "./db";
import { clipUrl, clipUrlFallback } from "./clipper";
import { importFile } from "./importFile";
import toast from "react-hot-toast";

const SHARED_DB_NAME = "DawinDB";
const SHARED_STORE = "sharedFiles";

function openSharedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SHARED_DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const idb = (e.target as IDBOpenDBRequest).result;
      if (!idb.objectStoreNames.contains(SHARED_STORE)) {
        idb.createObjectStore(SHARED_STORE, { keyPath: "name" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadSharedFiles(editor: Editor): Promise<boolean> {
  try {
    const idb = await openSharedDB();
    const tx = idb.transaction(SHARED_STORE, "readonly");
    const store = tx.objectStore(SHARED_STORE);
    const files = await new Promise<any[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (files.length === 0) {
      idb.close();
      return false;
    }

    const file = files[0];
    const success = await importFile(editor, file.text, file.name);

    // Clear the shared files store after loading
    const clearTx = idb.transaction(SHARED_STORE, "readwrite");
    clearTx.objectStore(SHARED_STORE).clear();
    await new Promise<void>((resolve, reject) => {
      clearTx.oncomplete = () => resolve();
      clearTx.onerror = () => reject(clearTx.error);
    });

    idb.close();
    return success;
  } catch (err) {
    console.error("Failed to load shared files:", err);
    toast.error("فشل تحميل الملف المشترك.");
    return false;
  }
}

async function loadSharedUrl(
  editor: Editor,
  clipUrlParam: string,
  clipTitleParam: string
): Promise<void> {
  toast.loading("جارٍ استيراد المحتوى...", { id: "clip" });

  const result = await clipUrl(clipUrlParam, clipTitleParam);

  const clipResult = result || clipUrlFallback(clipUrlParam, clipTitleParam);

  editor.commands.setContent(clipResult.markdown);

  await db.blogs.update(1, {
    title: clipResult.title,
    text: JSON.stringify(editor.getJSON()),
    sourceUrl: clipResult.url,
    updatedAt: new Date(),
  });

  toast.success(
    result ? "تم استيراد المحتوى بنجاح" : "تم إنشاء رابط (تعذر استخراج المحتوى)",
    { id: "clip" }
  );
}

// Track whether launch queue consumer is already registered
let launchQueueRegistered = false;

export const openFile = (editor: Editor) => {
  if (!editor) return;

  // Check if this is a share target launch (?shared=1)
  const url = new URL(window.location.href);
  if (url.searchParams.get("shared") === "1") {
    const clipUrlParam = url.searchParams.get("clipUrl");
    const clipTitleParam = url.searchParams.get("clipTitle") || "";

    // Clean URL params
    url.searchParams.delete("shared");
    url.searchParams.delete("clipUrl");
    url.searchParams.delete("clipTitle");
    window.history.replaceState({}, "", url.pathname);

    if (clipUrlParam) {
      loadSharedUrl(editor, clipUrlParam, clipTitleParam);
      return;
    }

    loadSharedFiles(editor);
    return;
  }

  // Handle Launch Queue API (file_handlers from OS) - register only once
  if ("launchQueue" in window && !launchQueueRegistered) {
    launchQueueRegistered = true;
    (window as any).launchQueue.setConsumer(async (launchParams: any) => {
      if (!launchParams?.files?.length) return;

      for (const fileHandle of launchParams.files) {
        try {
          const file = await fileHandle.getFile();
          const text = await file.text();
          await importFile(editor, text, file.name);
        } catch (err) {
          console.error("Error opening file:", err);
          toast.error("فشل فتح الملف.");
        }
      }
    });
  }
};
