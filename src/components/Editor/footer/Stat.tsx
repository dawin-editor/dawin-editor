import { useEditorStore } from "@/store/EditroStore.ts";
import { useEffect, useState } from "react";

const Stat = () => {
  const { editor } = useEditorStore();
  const [characters, setCharacters] = useState(0);
  const [words, setWords] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const updateStats = () => {
      setCharacters(editor.storage.characterCount.characters());
      setWords(editor.storage.characterCount.words());
    };

    // Update stats on every document update
    editor.on("update", updateStats);

    // Initial stats
    updateStats();

    return () => {
      editor.off("update", updateStats);
    };
  }, [editor]);

  return (
    <div className="flex flex-row items-baseline justify-between font-dubai-regular">
      <span className="text-jasmine dark:text-cornsilk text-[0.8rem]">إحصائيات</span>
      <ul className="flex items-end gap-4 text-[0.8rem]">
        <li>
          <span className="text-jasmine/80 dark:text-cornsilk/80">الحروف: </span>
          <span className="text-jasmine dark:text-cornsilk">{characters}</span>
        </li>
        <li>
          <span className="text-jasmine/80 dark:text-cornsilk/80">الكلمات: </span>
          <span className="text-jasmine dark:text-cornsilk">{words}</span>
        </li>
        <li>
          <span className="text-jasmine/80 dark:text-cornsilk/80">معدل القراءة: </span>
          <span className="text-jasmine dark:text-cornsilk">{Math.ceil(words / 200)}د</span>
        </li>
      </ul>
    </div>
  );
};

export default Stat;
