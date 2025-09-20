"use client";

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

interface ExportDialogProps {
  contentType: "HTML" | "Markdown" | ""; // allow empty
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
}



const ExportDialog = ({
  contentType,
  isOpen,
  onOpenChange,
  content,
}: ExportDialogProps) => {
  const documentTitle = localStorage.getItem("docTitle") || "مستند بدون عنوان";

  const handleDownload = () => {
    if (!content) return;

    const mimeType = contentType === "HTML" ? "text/html" : "text/markdown";

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${documentTitle}.${
      contentType === "HTML" ? "html" : "md"
    }`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
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
            onClick={() => {
              handleCopy();
              toast.success("تم نسخ المحتوى إلى الحافظة!", {
                style: { zIndex: 9999 },
              });
            }}
            disabled={!content}
            variant="default"
            className="bg-main-blue gap-1.5 hover:bg-[#11324d]"
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
