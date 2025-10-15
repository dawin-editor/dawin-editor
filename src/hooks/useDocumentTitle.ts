import { useEffect, useState } from "react";
import { db } from "@/lib/db";

export function useDocumentTitle(defaultTitle = "تصدير") {
  const [documentTitle, setDocumentTitle] = useState(defaultTitle);

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

  return documentTitle;
}
