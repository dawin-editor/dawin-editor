import type { ChangeEvent } from "react";
import type { Editor } from "@tiptap/react";
import { db } from "./db";
import { useTitleStore } from "../store/titleStore";

export const handleUpload = (
  e: ChangeEvent<HTMLInputElement>,
  editor: Editor
) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      
      const content = e.target?.result as string;
      const title = file.name.replace(/\.[^/.]+$/, "");

      editor.commands.setContent(content);
      useTitleStore.setState({ title });

      db.blogs.update(1, { title });
    };
  }
};
