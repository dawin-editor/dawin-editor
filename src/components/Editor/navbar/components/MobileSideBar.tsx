import { handleUpload } from "@/lib/upload.ts";
import { cn } from "@/lib/utils.ts";
import { useEditorStore } from "@/store/EditroStore.ts";
import {
  Download,
  Info,
  MousePointerClick,
  Upload,
  X,
  MessageCircle,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";

declare global {
  interface Window {
    Tally?: {
      openPopup: (formId: string, options: {
        layout: string;
        emoji: {
          text: string;
          animation: string;
        };
        onOpen?: () => void;
        onClose?: () => void;
      }) => void;
    };
  }
}
import ExportDialog from "./ExportDialog.tsx";
import { db } from "@/lib/db";
import { ExportToPDF } from "@/lib/ExportToPDF.ts";

interface MobileSideBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const tallyId = import.meta.env.VITE_TALLY_ID;


const MobileSideBar = ({ open, setOpen }: MobileSideBarProps) => {
  const { editor } = useEditorStore();
  const [isOpen, setIsOpen] = useState({
    contentType: "",
    isOpen: false,
    content: "",
  });
  const [documentTitle, setDocumentTitle] = useState("تصدير");

  const handleFeedbackClick = useCallback(() => {
    if (window.Tally) {
      window.Tally.openPopup(tallyId, {
        layout: 'modal',
        emoji: {
          text: '👋',
          animation: 'wave'
        },
        onOpen: () => {
          console.log('Tally feedback form opened');
        },
        onClose: () => {
          console.log('Tally feedback form closed');
        }
      });
    } else {
      console.error('Tally script not loaded');
    }
  }, [tallyId]);

  // Lock scroll on mobile when sidebar is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);
  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const blog = await db.blogs.get(1);
        if (blog?.title) {
          setDocumentTitle(blog.title);
        }
      } catch (error) {
        console.error("Error fetching title from IndexedDB:", error);
      }
    };

    fetchTitle();
  }, []);

  if (!editor) return null;
  return (
    <div
      onClick={() => setOpen(false)}
      className={cn(
        "fixed inset-0 z-50 transition-colors duration-300 ease-out md:hidden",
        open ? "bg-black/70" : "pointer-events-none bg-transparent"
      )}
    >
      {/* Sidebar container */}
      <div
        dir="rtl"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "fixed top-0 right-0 h-full w-8/9 bg-main-blue shadow-xl transition-transform duration-300 ease-out transform-gpu md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-15 flex items-center justify-between bg-[#2C83CB] p-4 md:hidden">
          <h1 className="font-dubai-medium text-xl text-white">محرّر دَوّن</h1>
          <X
            className="size-6 cursor-pointer text-white "
            onClick={() => setOpen(false)}
            role="button"
            aria-label="إغلاق القائمة"
          />
        </div>

        {/* Menu */}
        <ul className="p-4 space-y-3 text-white md:hidden">
          {/* upload from sidebar */}
          <li className="group">
            <label
              htmlFor="file-upload"
              className="w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 hover:bg-white/10 cursor-pointer"
              aria-label="استيراد ملف"
            >
              <Upload className="size-6 text-blue-200" />
              <span className="font-dubai-medium text-lg">استيراد ملف</span>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".txt,.md,.html,.json"
              className="hidden"
              onChange={(e) => {
                handleUpload(e, editor);
                setOpen(false);
              }}
            />
          </li>
          <div className="h-2">
            <hr className="border-white/10" />
          </div>
          <li className="group">
            <button
              className="w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 hover:bg-white/10 cursor-pointer"
              aria-label="تصدير كملف HTML"
              onClick={() => {
                setIsOpen({
                  contentType: "HTML",
                  isOpen: true,
                  content: editor?.getHTML() || "",
                });
              }}
            >
              <Download className="size-6 text-blue-200" />
              <span className="font-dubai-medium text-lg">تصدير كملف HTML</span>
            </button>
          </li>
          <li className="group">
            <button
              className="w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 hover:bg-white/10 cursor-pointer"
              aria-label="تصدير كملف Markdown"
              onClick={() => {
                setIsOpen({
                  contentType: "MD",
                  isOpen: true,
                  content:
                    (
                      editor?.storage as unknown as {
                        markdown?: { getMarkdown?: () => string };
                      }
                    )?.markdown?.getMarkdown?.() || "",
                });
              }}
            >
              <Download className="size-6 text-blue-200" />
              <span className="font-dubai-medium text-lg">
                تصدير كملف Markdown
              </span>
            </button>
          </li>
          <li className="group">
            <button
              className="w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 hover:bg-white/10 cursor-pointer"
              aria-label="تصدير كملف PDF"
              onClick={() => {
                ExportToPDF(editor!, documentTitle);
              }}
            >
              <Download className="size-6 text-blue-200" />
              <span className="font-dubai-medium text-lg">تصدير كملف PDF</span>
            </button>
          </li>

          <div className="h-2">
            <hr className="border-white/10" />
          </div>

          <li className="group">
            <button
              className="w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 hover:bg-white/10 cursor-pointer"
              aria-label="طريقة الاستخدام"
            >
              <Info className="size-6 text-blue-200" />
              <a
                href="https://guide.dawin.io/"
                className="font-dubai-medium text-lg"
              >
                طريقة الاستخدام
              </a>
            </button>
          </li>
          <li className="group">
            <button
             className="w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 hover:bg-white/10 cursor-pointer"
              aria-label="أرسل ملاحظتك"
              onClick={handleFeedbackClick}
            >
              <MessageCircle className="size-6 text-blue-200" />
              <span className="font-dubai-medium text-lg">أرسل ملاحظتك</span>
            </button>
          </li>
          <li className="group">
            <button
              className="w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 hover:bg-white/10 cursor-pointer"
              aria-label="حول المحرّر"
            >
              <MousePointerClick className="size-6 text-blue-200" />
              <a
                href="https://www.dawin.io/about"
                className="font-dubai-medium text-lg"
              >
                حول المحرّر
              </a>
            </button>
          </li>
        </ul>
      </div>

      <ExportDialog
        contentType={
          isOpen.contentType === "HTML" || isOpen.contentType === "Markdown"
            ? isOpen.contentType
            : ""
        }
        isOpen={isOpen.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsOpen({ contentType: "", isOpen: false, content: "" });
          }
        }}
        content={isOpen.content}
      />
    </div>
  );
};

export default MobileSideBar;
