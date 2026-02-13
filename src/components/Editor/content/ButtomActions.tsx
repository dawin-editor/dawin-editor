import { Tooltip } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipContent } from "@/components/ui/tooltip";
import { MessageCircle, ClipboardCopy, TableOfContents, Share2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useEditorStore } from "@/store/EditroStore.ts";
import Toast from "../navbar/components/Toast";
import { useTocStore } from "@/store/TocStore";
import { shareContent } from "@/lib/share";
import { useState } from "react";

const tallyId = import.meta.env.VITE_TALLY_ID;

const ButtomActions = () => {
  const { editor } = useEditorStore();
  const { isOpen, setIsOpen } = useTocStore();
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    const content = (
      editor?.storage as {
        markdown?: { getMarkdown: () => string };
      }
    )?.markdown?.getMarkdown?.() || "";

    if (!content) {
      toast.error("لا يوجد محتوى للمشاركة!");
      return;
    }

    setIsSharing(true);
    try {
      const jsonContent = editor?.getJSON();
      if (!jsonContent) {
        toast.error("لا يوجد محتوى للمشاركة!");
        return;
      }
      const url = await shareContent(jsonContent);
      await navigator.clipboard.writeText(url);
      toast.success("تم إنشاء الرابط ونسخه إلى الحافظة!");
    } catch (error) {
      toast.error("فشل في إنشاء رابط المشاركة.");
      console.error(error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed bottom-10 left-8 flex flex-row gap-2">
      <Tooltip>
        <TooltipTrigger
          className="bg-icons-bg p-1.5 rounded-sm hover:bg-icons-color-hover cursor-pointer hidden md:block"
          data-tally-open={tallyId}
          data-tally-emoji-text="👋"
          data-tally-emoji-animation="wave"
          aria-label="Provide feedback"
          data-tally-layout="modal"
        >
          <div>
            <MessageCircle
              className="text-icons-color size-5.5"
              strokeWidth={2}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-black">إرسال ملاحظات</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger className="bg-icons-bg p-1.5 rounded-sm hover:bg-icons-color-hover cursor-pointer hidden md:block">
          <div
            onClick={() => {
              navigator.clipboard.writeText(
                (
                  editor?.storage as {
                    markdown?: { getMarkdown: () => string };
                  }
                )?.markdown?.getMarkdown?.() || ""
              );
              toast.success("تم نسخ المحتوى إلى الحافظة!");
            }}
          >
            <ClipboardCopy
              className="text-icons-color size-5.5"
              strokeWidth={2}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-black">نسخ</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger className="bg-icons-bg p-1.5 rounded-sm hover:bg-icons-color-hover cursor-pointer hidden md:block">
          <div
            onClick={handleShare}
            className={isSharing ? "opacity-50 cursor-not-allowed" : ""}
          >
            <Share2
              className={`text-icons-color size-5.5 ${isSharing ? "animate-pulse" : ""}`}
              strokeWidth={2}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-black">مشاركة</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger className="bg-icons-bg p-1.5 rounded-sm hover:bg-icons-color-hover cursor-pointer hidden md:block">
          <div>
            <TableOfContents
              className="text-icons-color size-5.5"
              strokeWidth={2}
              onClick={() => setIsOpen(!isOpen)}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-black">جدول المحتويات</TooltipContent>
      </Tooltip>
      <Toast />
    </div>
  );
};

export default ButtomActions;
