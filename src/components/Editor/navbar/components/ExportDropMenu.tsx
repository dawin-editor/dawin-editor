import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu.tsx";
import { useEditorStore } from "@/store/EditroStore.ts";
import { ChevronDown, CodeXml, Download } from "lucide-react";
import { useState } from "react";
import ExportDialog from "./ExportDialog.tsx";
import UploadFile from "./UploadFile.tsx";
import ExportToPdf from "./ExportToPdf.tsx";
import { db } from "@/lib/db";
import { buildHtmlExport } from "@/lib/exportHtml";



const ExportDropMenu = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [isOpen, setIsOpen] = useState({
    contentType: "",
    isOpen: false,
    content: "",
  });
  const { editor } = useEditorStore();
  const fetchDocumentTitle = async () => {
    const title = await db.blogs.get(1);
    return title?.title;
  };
  const handleExport = async (type: "HTML" | "Markdown") => {
    if (!editor) return;
    if (type === "HTML") {
      const documentTitle = (await fetchDocumentTitle()) ?? "مستند بدون عنوان";
      setIsOpen({
        contentType: "HTML",
        isOpen: true,
        content: buildHtmlExport(editor, documentTitle),
      });
    } else if (type === "Markdown") {
      setIsOpen({
        contentType: "Markdown",
        isOpen: true,
        content:
          (editor?.storage as { markdown?: { getMarkdown: () => string } })?.markdown?.getMarkdown?.() ||
          "",
      });
    }
  };

  return (
    <>
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <button
            className="md:inline-flex items-center gap-1.5 font-Regular text-cerulean-30 hover:text-white active:text-white focus:outline-none cursor-pointer"
            aria-label="قائمة التصدير"
          >
            {isMobile ? (
              <Download strokeWidth={2} className="cursor-pointer size-5.5" />
            ) : (
              <>
                <span>أدوات</span>
                <ChevronDown
                  size={16}
                  strokeWidth={3}
                  className="translate-y-[1px]"
                />
              </>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="py-1 w-45 "
          data-cy="export-dropdown-menu"
        >
          <DropdownMenuItem asChild>
            <UploadFile />
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub >
            <DropdownMenuSubTrigger className="[&>svg]:rotate-180 justify-between">
              <span className="flex flex-row-reverse items-center justify-start px-1 py-1 cursor-pointer gap-1.5 hover:bg-gray-100 rounded-md">
                <span className="font-dubai-regular text-[0.95rem] leading-none text-gray-600">
                  تصدير
                </span>
                <Download
                  className="size-5 translate-y-[0.5px]"
                  opacity={0.3}
                />
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem asChild>
                  <span
                    className="flex items-center justify-start px-3 py-2 cursor-pointer gap-1.5"
                    onClick={() =>
                      handleExport("HTML")
                    }
                    data-cy="export-html"
                  >
                    <CodeXml
                      className="size-5 translate-y-[0.5px]"
                      opacity={0.6}
                    />
                    <span className="font-dubai-regular text-[0.95rem] leading-none text-gray-600">
                      تصدير HTML
                    </span>

                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <span
                    data-cy="export-markdown"
                    className="flex items-center justify-start px-3 py-2 cursor-pointer gap-1.5"
                    onClick={() =>
                      handleExport("Markdown")
                    }
                  >
                    <CodeXml
                      className="size-5 translate-y-[0.5px]"
                      opacity={0.6}
                    />
                    <span className="font-dubai-regular text-[0.95rem] leading-none text-gray-600">
                      تصدير Markdown
                    </span>

                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <ExportToPdf />
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

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
    </>
  );
};

export default ExportDropMenu;
