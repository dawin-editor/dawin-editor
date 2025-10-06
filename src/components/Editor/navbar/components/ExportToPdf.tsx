import { CodeXml } from "lucide-react";
import { useEditorStore } from "@/store/EditroStore";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import {ExportToPDF} from "@/lib/ExportToPDF";

const ExportToPdf = () => {
  const { editor } = useEditorStore();
  const [documentTitle, setDocumentTitle] = useState("تصدير");

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const blog = await db.blogs.get(1);
        if (blog?.title) {
          setDocumentTitle(blog.title);
        }
      } catch (error) {
        console.error("Error fetching title from IndexedDB:", error);
      }
    };

    fetchTitle();
  }, []);

  

  return (
    <span
      className="flex items-center justify-end px-3 py-2 cursor-pointer gap-1.5 hover:bg-gray-100 rounded-md"
      onClick={() => {
        ExportToPDF(editor!, documentTitle);
      }}
    >
      <span className="font-dubai-regular text-[0.95rem] leading-none text-gray-600">
        PDF تصدير
      </span>
      <CodeXml className="size-5 translate-y-[0.5px]" opacity={0.3} />
    </span>
  );
};

export default ExportToPdf;
