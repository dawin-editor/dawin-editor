import type { Editor } from "@tiptap/react";
import { db } from "./db";
export const openFile = (editor: Editor) => {
  editor.commands.clearContent();
  if (!editor) return;

  if ("launchQueue" in window) {
    (window as any).launchQueue.setConsumer(async (launchParams: any) => {
      if (!launchParams?.files?.length) return;

      for (const fileHandle of launchParams.files) {
        const file = await fileHandle.getFile();
        const text = await file.text();
        await db.blogs.put({
          id: 1,
          title: file.name,
          text,
          updatedAt: new Date(),
          createdAt: new Date(),
        });
        editor.commands.setContent(text);
      }
    });
  }
};
