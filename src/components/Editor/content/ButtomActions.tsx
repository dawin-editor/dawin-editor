import { Tooltip } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipContent } from "@/components/ui/tooltip";
import { MessageCircle, ClipboardCopy, TableOfContents } from "lucide-react";
import { toast } from "react-hot-toast";
import { useEditorStore } from "@/store/EditroStore.ts";
import Toast from "../navbar/components/Toast";
import { useTocStore } from "@/store/TocStore";
const tallyId = import.meta.env.VITE_TALLY_ID;
const ButtomActions = () => {
  const { editor } = useEditorStore();
  const { isOpen, setIsOpen } = useTocStore();
  return (
    <div className="fixed bottom-16 md:bottom-10 left-6 md:left-8 flex flex-row gap-2 z-40">
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
        <TooltipTrigger className="bg-icons-bg p-1.5 rounded-sm hover:bg-icons-color-hover cursor-pointer block">
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
