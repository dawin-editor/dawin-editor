import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {  Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

const ExportDialog = ({contentType, isOpen, onOpenChange}: {contentType: string; isOpen: boolean; onOpenChange: (open: boolean) => void}) => {

  const sample =
    contentType.toLowerCase() === "html"
      ? '<p>محرّر دَوّن هو محرر ماركداون (Markdown) سهل للغاية، لا يحتاج منك أي جهد لتعلم الكتابة به، فقط اكتب أو عدل هذا النص!</p>\n<a href="http://example.com">يمكنك إدراج رابط بهذا الشكل</a>. كما يمكنك أيضًا إدراج عناصر مثل <strong>نص مُشدّد</strong> أو <em>نص مائل</em> أو حتى <del>نص مشطوب</del>.\n<blockquote>\n<p>هذا مثال على اقتباس، لاحظ انتباهه بعلامة أكبر.</p>\n</blockquote>'
      : "يمكنك كتابة Markdown هنا.\n\n- نص غامق: **مثال**\n- رابط: [example](http://example.com)\n> اقتباس";

 

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
            dir="rtl"
            readOnly
            className="w-full min-h-[260px] max-h-[50vh] rounded-md border border-[var(--border)] bg-[var(--secondary)]/70 dark:bg-[var(--accent)]/10 p-3 text-[0.92rem] font-mono leading-6 outline-none text-foreground/90 selection:bg-cerulean/25 selection:text-foreground/95 resize-vertical"
            value={sample}
          />
        </div>

        <DialogFooter className="sm:flex-row-reverse sm:justify-start">
          <Button
            className="font-dubai-medium bg-main-blue gap-1.5 hover:bg-[#11324Dff] cursor-pointer"
            variant="default"
          >
            <Download className="size-4.5 translate-y-[0.5px]" />
            تنزيل
          </Button>
          <Button
            className="font-dubai-medium bg-main-blue gap-1.5  hover:bg-[#11324Dff] cursor-pointer"
            variant="default"
          >
            <Copy className="size-4.5 translate-y-[0.5px]" />
            نسخ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
