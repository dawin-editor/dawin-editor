import Layout from "./Layout";
import { useEffect, useState } from "react";
import "./index.css";
import { db } from "./lib/db";
import { openFile } from "./lib/openFiles";
import { useEditorStore } from "./store/EditroStore";
const App = () => {
  const { editor } = useEditorStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Use put instead of add to handle both create and update cases
        await db.blogs.put({
          id: 1,
          title: "مستند بدون عنوان",
          text: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error('Error initializing blog:', error);
      }
    };
    init();

    if (editor) {
      openFile(editor);
    }

    const timer = setTimeout(() => setLoading(false), 1300);
    return () => clearTimeout(timer);
  }, [editor]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center ">
        <img
          src="logo.svg"
          alt="Loading..."
          className="w-32 h-32 animate-splash"
        />
      </div>
    );
  }

  return <Layout />;
};

export default App;
