"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Copy, Download } from "lucide-react";
import toast from "react-hot-toast";
import Toast from "./Toast";
import { db } from "@/lib/db";

interface ExportDialogProps {
  contentType: "HTML" | "Markdown" | ""; // allow empty
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
}

const DEFAULT_TITLE = "مستند بدون عنوان";

/** Sanitize file name for most file systems */
const sanitizeFileName = (name: string) =>
  (name || "")
    .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, "_") // forbidden chars + control chars
    .trim()
    .slice(0, 240) || DEFAULT_TITLE;

const ExportDialog = ({
  contentType,
  isOpen,
  onOpenChange,
  content,
}: ExportDialogProps) => {
  const [documentTitle, setDocumentTitle] = useState<string>(DEFAULT_TITLE);

  // preload title when dialog opens (best-effort)
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const fetchDocumentTitle = async () => {
      try {
        // guard: ensure we are in browser environment
        if (typeof window === "undefined" || !db?.blogs) return;
        const blog = await db.blogs.orderBy("id").last();
        if (!cancelled && blog?.title) {
          setDocumentTitle(blog.title);
        }
      } catch (error) {
        // don't spam console in production, but log for dev
        console.error("Error fetching document title from IndexedDB:", error);
      }
    };

    fetchDocumentTitle();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // always fetch the latest title from IndexedDB right before download.
  const handleDownload = async () => {
    if (!content) {
      toast.error("لا يوجد محتوى للتحميل.");
      return;
    }

    let titleToUse = documentTitle || DEFAULT_TITLE;

    try {
      if (typeof window !== "undefined" && db?.blogs) {
        const blog = await db.blogs.orderBy("id").last();
        if (blog?.title) {
          titleToUse = blog.title;
          setDocumentTitle(blog.title); // update state for next time
        }
      }
    } catch (err) {
      console.warn("Failed to read title from IndexedDB at download time:", err);
      // fallback to whatever we already have in state
    }

    const safeTitle = sanitizeFileName(titleToUse);
    const ext = contentType === "HTML" ? "html" : "md";
    const mimeType = contentType === "HTML" ? "text/html" : "text/markdown";

    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${safeTitle}.${ext}`;

      // some browsers require link to be in the DOM
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success(`تم تنزيل الملف: ${safeTitle}.${ext}`);
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("حدث خطأ أثناء التحميل.");
    }
  };

  const handleCopy = async () => {
    if (!content) {
      toast.error("لا يوجد محتوى للنسخ.");
      return;
    }
    try {
      await navigator.clipboard.writeText(content);
      toast.success("تم نسخ المحتوى إلى الحافظة!", {
        style: { zIndex: 9999 },
      });
    } catch (err) {
      console.error("Clipboard write failed:", err);
      toast.error("فشل في نسخ المحتوى.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-2xl">
        <DialogHeader className="text-right sm:text-right">
          <DialogTitle className="font-dubai-medium text-[1.1rem]">
            تصدير كملف {contentType}
          </DialogTitle>
          <DialogDescription className="font-dubai-regular">
            عاين المحتوى قبل التصدير. بإمكانك التحميل المباشر أو نسخ المحتوى.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1" role="region" aria-label="معاينة المحتوى">
          <textarea
            readOnly
            className="w-full min-h-[260px] max-h-[50vh] rounded-md text-consolas-regular border border-[var(--border)] bg-[var(--secondary)]/70 dark:bg-[var(--accent)]/10 p-3 text-[0.92rem] font-mono leading-6 outline-none text-foreground/90 selection:bg-cerulean/25 selection:text-foreground/95 resize-vertical"
            style={{
              fontFamily:
                "'ConsolasCustom', Consolas, 'Liberation Mono', 'Courier New', monospace",
            }}
            value={content || ""}
            placeholder="لا يوجد محتوى للعرض..."
          />
        </div>

        <div className="mt-2 text-right text-xs text-muted-foreground">
          اسم الملف المتوقع عند التنزيل:{" "}
          <span className="font-mono">
            {sanitizeFileName(documentTitle)}.{contentType === "HTML" ? "html" : "md"}
          </span>
        </div>

        <DialogFooter className="sm:flex-row-reverse sm:justify-start gap-2">
          <Button
            data-cy="download-button"
            onClick={handleDownload}
            disabled={!content}
            variant="default"
            className="bg-main-blue gap-1.5 hover:bg-[#11324d] cursor-pointer"
          >
            <Download className="size-4.5 translate-y-[0.5px]" />
            تنزيل
          </Button>
          <Button
            onClick={handleCopy}
            disabled={!content}
            variant="default"
            className="bg-main-blue gap-1.5 hover:bg-[#11324d] cursor-pointer"
            title="نسخ"
          >
            <Copy className="size-4.5 translate-y-[0.5px]" />
            نسخ
          </Button>
        </DialogFooter>
        <Toast />
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
