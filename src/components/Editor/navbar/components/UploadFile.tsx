import { Upload } from "lucide-react";
import { useEditorStore } from "@/store/EditroStore.ts";
import { handleUpload } from "@/lib/upload.ts";

const UploadFile = () => {
  const { editor } = useEditorStore();

  if (!editor) return null;

  return (
    <>
      <label
        htmlFor="file-upload"
        className="flex items-center justify-end px-3 py-2 cursor-pointer gap-1.5 hover:bg-gray-100 rounded-md"
        onClick={() => {
          // Close dropdown by simulating escape key
          setTimeout(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
          }, 50);
        }}
      >
        <span className="font-dubai-regular text-[0.95rem] leading-none text-gray-600">
          استيراد ملف
        </span>
        <Upload className="size-5 translate-y-[0.5px]" opacity={0.3} />
      </label>

      <input
        id="file-upload"
        type="file"
        accept=".txt,.md,.html,.json"
        className="hidden"
        onChange={(e) => handleUpload(e, editor)}
      />
    </>
  );
};

export default UploadFile;
