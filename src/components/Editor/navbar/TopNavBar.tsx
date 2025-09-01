import ExportDropMenu from "./ExportDropMenu";
import { cn } from "@/lib/utils";

const TopNavBar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  return (
    <div
      className={cn(
        "bg-lapis-lazuli text-white shadow-sm h-15 flex justify-between items-center px-6",
        {
          "h-1 [&>*]:hidden": isCollapsed,
        }
      )}
      dir="rtl"
    >
      <h1 className="font-dubai-medium text-xl">محرّر دَوّن</h1>

      <ul className="flex gap-10 px-10 font-dubai-regular opacity-90">
        <li>
          <ExportDropMenu />
        </li>
        <li>طريقة الاستعمال</li>
        <li>حول المحرّر</li>
      </ul>
    </div>
  );
};

export default TopNavBar;
