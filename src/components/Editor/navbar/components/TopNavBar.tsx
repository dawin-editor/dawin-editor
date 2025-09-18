import ExportDropMenu from "./ExportDropMenu.tsx";
import { cn } from "@/lib/utils.ts";
import { Menu } from "lucide-react";
import { useState } from "react";
import MobileSideBar from "./MobileSideBar.tsx";

const TopNavBar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const [isMobileSideBarOpen, setIsMobileSideBarOpen] = useState(false);
  return (
    <nav
      className={cn(
        "bg-lapis-lazuli text-white shadow-sm h-15 flex justify-center items-center px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out",
        {
          "h-1 [&>*:not(.mobile-menu)]:hidden transition-all duration-300 ease-in-out":
            isCollapsed,
        }
      )}
    >
      <MobileSideBar
        open={isMobileSideBarOpen}
        setOpen={setIsMobileSideBarOpen}
      />

      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-4">
          <Menu
            className="size-6 cursor-pointer !block md:!hidden mobile-menu"
            onClick={() => setIsMobileSideBarOpen(!isMobileSideBarOpen)}
          />

          <h1 className="font-dubai-medium text-xl">محرّر دَوّن</h1>
        </div>
        {/* hidden on phones, visible from md (>=768px) */}
        <div className="hidden md:flex font-dubai-regular text-cerulean text-medium opacity-85">
          <span className="pl-10">
            <ExportDropMenu isMobile={false} />
          </span>
          <a href="https://guide.dawin.io/" className="pl-10">
            طريقة الاستعمال
          </a>
          <a href="https://www.dawin.io/about" className="pl-10">
            حول المحرّر
          </a>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
