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
    const documentTitle = await fetchDocumentTitle();
    let html = "";
    if (type === "HTML") {
      html = `
        <html>
          <head>
            <title>${documentTitle}</title>
            <link rel="stylesheet" href="https://cdn.simplecss.org/simple.css">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">

          

           <link href="https://raw.githubusercontent.com/benotsman-youssuf/quranJson/main/Graphik%20Arabic%20SemiBold.ttf" rel="stylesheet">
           <link href="https://raw.githubusercontent.com/benotsman-youssuf/quranJson/main/Samim.ttf" rel="stylesheet">

           <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
           <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
           <script>hljs.highlightAll();</script>




            <style>
            pre {
              overflow: visible !important;
              white-space: pre-wrap;
              word-wrap: break-word;
              direction: ltr;
            }

            pre code {
              background: none !important;
              padding: 0;
              margin: 0;
              display: block;
              direction: ltr;
            }

            
            @font-face {
              font-family: 'Graphik Arabic';
              src: url('https://raw.githubusercontent.com/benotsman-youssuf/quranJson/main/Graphik%20Arabic%20SemiBold.ttf') format('truetype');
              font-weight: 600;
              font-style: normal;
            }
            
            @font-face {
              font-family: 'Samim';
              src: url('https://raw.githubusercontent.com/benotsman-youssuf/quranJson/main/Samim.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
            }
            
            body {
              font-family: 'Samim', sans-serif;
              direction: rtl;
            }
            h1,h2,h3,h4,h5,h6 {
              font-family: 'Graphik Arabic', sans-serif;
            }
            p{
              font-family: 'Samim', sans-serif;
            }
            ul,
            ol {
              direction: rtl;
            }
            table {
              border-collapse: collapse;
              width: 100%;            /* size to content */
              table-layout: auto;    /* natural column sizing */
              margin: 1em 0;      /* center horizontally */
              background: transparent;
              display: table;        /* ensure it's treated like a table */
            }

            table th,
            table td {
              border: none;
              padding: 8px 12px;
              text-align: right;     /* keep RTL cell alignment */
              vertical-align: middle;
            }   
            img {
              display: block;
              max-width: fit-content;
              height: auto;
              margin-left: auto;
              margin-right: auto;
            }
       
           
            
            </style>
          </head>
          <body style="font-family: 'Tajawal', sans-serif;">
            ${editor?.getHTML() || ""}
          </body>
        </html>
      `;
      setIsOpen({
        contentType: "HTML",
        isOpen: true,
        content: html,
      });
    } else if (type === "Markdown") {
      setIsOpen({
        contentType: "Markdown",
        isOpen: true,
        content:
          (editor?.storage as { markdown?: { getMarkdown: () => string } })?.markdown?.getMarkdown?.() ||
          "",
      })
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
