import { CodeXml } from "lucide-react";
import { useEditorStore } from "@/store/EditroStore";
import { ExportToPDF } from "@/lib/ExportToPDF";

const ExportToPdf = () => {
  const { editor } = useEditorStore();

  return (
    <span
      className="flex items-center justify-start px-3 py-2 cursor-pointer gap-1.5 hover:bg-gray-100 rounded-md"
      onClick={() => {
        ExportToPDF(editor!);
      }}
    >
      <CodeXml className="size-5 translate-y-[0.5px]" opacity={0.3} />
      <span className="font-dubai-regular text-[0.95rem] leading-none text-gray-600">
        تصدير PDF
      </span>
    </span>
  );
};

export default ExportToPdf;
