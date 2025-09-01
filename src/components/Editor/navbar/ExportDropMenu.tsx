import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CodeXml, ChevronDown, Download } from "lucide-react";

const ExportDropMenu = ({ isMobile = false }: { isMobile?: boolean }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="md:inline-flex items-center gap-1.5 font-Regular text-cerulean-30 hover:text-white active:text-white focus:outline-none cursor-pointer">
          {isMobile ? (
            <Download strokeWidth={2} className="cursor-pointer size-5.5"/>
          ) : (
            <>
              <span>تصدير</span>
              <ChevronDown size={16} strokeWidth={3} className="translate-y-[1px]" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="py-1 w-45 ">
        <DropdownMenuItem asChild>
          <span className="flex items-center justify-end px-3 py-2 cursor-pointer">
            <span className="font-dubai-regular text-[1rem] text-gray-600">
              HTML كملف
            </span>
            <CodeXml style={{ width: "20px", height: "20px" }} opacity={0.5} />
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <span className="flex items-center justify-end px-3 py-2 cursor-pointer">
            <span className="font-dubai-regular text-[1rem] text-gray-600">
              MD كملف
            </span>
            <CodeXml style={{ width: "20px", height: "20px" }} opacity={0.5} />
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportDropMenu;
