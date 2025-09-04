import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Download, CodeXml } from "lucide-react";
import ExportDialog from "./ExportDialog";
import { useState } from "react";

const ExportDropMenu = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [isOpen, setIsOpen] = useState({
    contentType: "",
    isOpen: false,
  });

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="md:inline-flex items-center gap-1.5 font-Regular text-cerulean-30 hover:text-white active:text-white focus:outline-none cursor-pointer">
          {isMobile ? (
            <Download strokeWidth={2} className="cursor-pointer size-5.5" />
          ) : (
            <>
              <span>تصدير</span>
              <ChevronDown
                size={16}
                strokeWidth={3}
                className="translate-y-[1px]"
              />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="py-1 w-45 ">
        <DropdownMenuItem asChild>
          <span
            className="flex items-center justify-end px-3 py-2 cursor-pointer gap-1.5"
            onClick={() => setIsOpen({ contentType: "HTML", isOpen: true })}
          >
            <span className="font-dubai-regular text-[0.95rem] leading-none text-gray-600">
              HTML كملف
            </span>
            <CodeXml className="size-5 translate-y-[0.5px]" opacity={0.6} />
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <span
            className="flex items-center justify-end px-3 py-2 cursor-pointer gap-1.5"
            onClick={() => setIsOpen({ contentType: "MD", isOpen: true })}
          >
            <span className="font-dubai-regular text-[0.95rem] leading-none text-gray-600">
              MD كملف
            </span>
            <CodeXml className="size-5 translate-y-[0.5px]" opacity={0.6} />
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <ExportDialog 
      contentType={isOpen.contentType} 
      isOpen={isOpen.isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          setIsOpen({ contentType: "", isOpen: false });
        }
      }}
    />
    </>
  );
};

export default ExportDropMenu;
