import type { Editor } from "@tiptap/react";

export const openFile = (editor: Editor) => {
  editor.commands.clearContent();
  if (!editor) return;

  if ("launchQueue" in window) {
    (window as any).launchQueue.setConsumer(async (launchParams: any) => {
      if (!launchParams?.files?.length) return;

      for (const fileHandle of launchParams.files) {
        const file = await fileHandle.getFile();
        const text = await file.text();
        editor.commands.setContent(text);
      }
    });
  }
};
