import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/EditroStore";
import { useState, useCallback } from "react";
const ExportDialog = ({
  contentType,
  isOpen,
  onOpenChange,
}: {
  contentType: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { editor } = useEditorStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const content =
    contentType.toLowerCase() === "html"
      ? editor?.getHTML()
      : JSON.stringify(editor?.getJSON(), null, 2);

  const handleDownload = useCallback(async () => {
    if (!content) return;
    
    setIsDownloading(true);
    setError(null);
    
    try {
      const fileExtension = contentType.toLowerCase() === "html" ? "html" : "json";
      const mimeType = contentType.toLowerCase() === "html" 
        ? "text/html" 
        : "application/json";
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `document.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("فشل في تحميل الملف");
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  }, [content, contentType]);

  const handleCopy = useCallback(async () => {
    if (!content) return;
    
    setIsCopying(true);
    setError(null);
    
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError("فشل في نسخ المحتوى");
      console.error("Copy error:", err);
    } finally {
      setIsCopying(false);
    }
  }, [content]);

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

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
            <AlertCircle className="size-4 flex-shrink-0" />
            <span className="text-sm font-dubai-regular">{error}</span>
          </div>
        )}

        <div className="mt-1" role="region" aria-label="معاينة المحتوى">
          <textarea
            readOnly
            className="w-full min-h-[260px] max-h-[50vh] rounded-md border border-[var(--border)] bg-[var(--secondary)]/70 dark:bg-[var(--accent)]/10 p-3 text-[0.92rem] font-mono leading-6 outline-none text-foreground/90 selection:bg-cerulean/25 selection:text-foreground/95 resize-vertical"
            value={content || ""}
            placeholder="لا يوجد محتوى للعرض..."
          />
        </div>

        <DialogFooter className="sm:flex-row-reverse sm:justify-start">
          <Button
            onClick={handleDownload}
            disabled={!content || isDownloading}
            className="font-dubai-medium bg-main-blue gap-1.5 hover:bg-[#11324Dff] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            variant="default"
          >
            {isDownloading ? (
              <div className="size-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Download className="size-4.5 translate-y-[0.5px]" />
            )}
            {isDownloading ? "جاري التحميل..." : "تنزيل"}
          </Button>
          <Button
            onClick={handleCopy}
            disabled={!content || isCopying}
            className={`font-dubai-medium gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              copySuccess 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-main-blue hover:bg-[#11324Dff]"
            }`}
            variant="default"
          >
            {isCopying ? (
              <div className="size-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : copySuccess ? (
              <Check className="size-4.5 translate-y-[0.5px]" />
            ) : (
              <Copy className="size-4.5 translate-y-[0.5px]" />
            )}
            {isCopying ? "جاري النسخ..." : copySuccess ? "تم النسخ!" : "نسخ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
