import type { ChangeEvent } from "react";
import type { Editor } from "@tiptap/react";

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
      editor.commands.setContent(content);
    };
  }
};
