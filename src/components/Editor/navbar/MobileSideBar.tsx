import { X, Download, MousePointerClick, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileSideBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MobileSideBar = ({ open, setOpen }: MobileSideBarProps) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-colors duration-300 md:hidden",
        open ? "bg-black/80" : "pointer-events-none bg-transparent"
      )}
    >
      {/* Sidebar container */}
      <div
        dir="rtl"
        className={cn(
          "fixed top-0 right-0 h-full w-8/9 bg-main-blue shadow-xl transition-transform duration-300 ease-in-out md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-15 flex items-center justify-between bg-[#2C83CB] p-4 md:hidden">
          <h1 className="font-dubai-medium text-xl text-white">محرّر دَوّن</h1>
          <X
            className="size-6 cursor-pointer text-white "
            onClick={() => setOpen(false)}
          />
        </div>

        {/* Menu */}
        <ul className="p-4 space-y-3 text-white md:hidden">
          <li className="group">
            <button className="w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 hover:bg-white/10 cursor-pointer">
              <Download className="size-6 text-blue-200" />
              <span className="font-dubai-medium text-lg">تصدير كملف HTML</span>
            </button>
          </li>
          <li className="group">
            <button className="w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 hover:bg-white/10 cursor-pointer">
              <Download className="size-6 text-blue-200" />
              <span className="font-dubai-medium text-lg">تصدير كملف MD</span>
            </button>
          </li>
          <li className="group">
            <button className="w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 hover:bg-white/10 cursor-pointer">
              <Info className="size-6 text-blue-200" />
              <a href="https://guide.dawin.io/" className="font-dubai-medium text-lg">طريقة الاستخدام</a>
            </button>
          </li>
          <li className="group">
            <button className="w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 hover:bg-white/10 cursor-pointer">
              <MousePointerClick className="size-6 text-blue-200" />
              <a href="https://www.dawin.io/about" className="font-dubai-medium text-lg">حول المحرّر</a>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MobileSideBar;
