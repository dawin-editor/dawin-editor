import Layout from "./Layout";
import { useEffect, useState } from "react";
import "./index.css";
import { db } from "./lib/db";
import { openFile } from "./lib/openFiles";
import { getSharedContent } from "./lib/share";
import { useEditorStore } from "./store/EditroStore";
import { toast } from "react-hot-toast";
import logoSvg from "/logo.svg";

const App = () => {
  const { editor } = useEditorStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Check for shared content in URL
      const path = window.location.pathname;
      const shareMatch = path.match(/^\/s\/(.+)$/);

      if (shareMatch && editor) {
        const sharedId = shareMatch[1];
        try {
          const content = await getSharedContent(sharedId);
          editor.commands.setContent(content);

          // Optionally save to local DB or just keep in editor
          // We'll update the first blog entry for simplicity in this template
          await db.blogs.update(1, {
            text: typeof content === 'string' ? content : JSON.stringify(content),
            updatedAt: new Date()
          });

          toast.success("تم تحميل المحتوى المشارك!");
          // Clear the URL without reloading
          window.history.replaceState({}, "", "/");
        } catch (error) {
          console.error("Error loading shared content:", error);
          toast.error("فشل في تحميل المحتوى المشارك.");
        }
      }

      const count = await db.blogs.toArray();
      if (count.length === 0) {
        try {
          await db.blogs.put({
            id: 1,
            title: "",
            text: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } catch (error) {
          console.error("Error initializing blog:", error);
        }
      }
    };

    if (editor) {
      init();
      openFile(editor);
    }

      const timer = setTimeout(() => setLoading(false), 1300);
      return () => clearTimeout(timer);
  }, [editor]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center ">
        <img
          src={logoSvg}
          alt="Loading..."
          className="w-32 h-32 animate-splash"
        />
      </div>
    );
  }

  return <Layout />;
};

export default App;
