import type { ChangeEvent } from "react";
import type { Editor } from "@tiptap/react";
import { importFile } from "./importFile";

export const handleUpload = (
  e: ChangeEvent<HTMLInputElement>,
  editor: Editor
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = (ev) => {
    const content = ev.target?.result as string;
    importFile(editor, content, file.name);
  };

  // Reset input so re-importing the same file triggers onChange
  e.target.value = "";
};
