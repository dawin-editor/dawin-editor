import ExportDropMenu from "./ExportDropMenu";
import { cn } from "@/lib/utils";
import { Eye, SquarePen } from "lucide-react";
import { useState } from "react";

const TopNavBar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <nav
      className={cn(
        "bg-lapis-lazuli text-white shadow-sm h-15 flex justify-center items-center px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out",
        {
          "h-1 [&>*]:hidden transition-all duration-300 ease-in-out":
            isCollapsed,
        }
      )}
    >
      <div className="flex justify-between items-center w-full">
        <h1 className="font-dubai-medium text-xl">محرّر دَوّن</h1>

        {/* hidden on phones, visible from md (>=768px) */}
        <div className="hidden md:flex font-dubai-regular text-cerulean text-medium opacity-85">
          <span className="pl-10">
            <ExportDropMenu isMobile={false} />
          </span>
          <span className="pl-10">طريقة الاستعمال</span>
          <span className="pl-10">حول المحرّر</span>
        </div>

        {/* visible on phones, hidden from md (>=768px) */}
        <div className="flex items-center gap-4 md:hidden">
          <ExportDropMenu isMobile />
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isEditing ? (
              <Eye className="w-5 h-5 text-white" strokeWidth={2} />
            ) : (
              <SquarePen className="w-5 h-5 text-white" strokeWidth={2.1} />
            )}
          </button>

        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
