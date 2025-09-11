import { useEditorStore } from "@/store/EditroStore";
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
    <div className="flex flex-row  items-center justify-between font-dubai-regular ">
      <span className="text-[#c3920a] text-[0.6rem]">إحصائيات</span>
      <ul className="flex flex-row  gap-3 text-[0.8rem] ">
        <li>
          <span className="text-[#8c6d20] ">عدد الحروف: </span>
          <span className="text-[#5c4813]">{characters}</span>
        </li>
        <li>
          <span className="text-[#8c6d20] ">عدد الكلمات: </span>
          <span className="text-[#5c4813]">{words}</span>
        </li>
        <li>
          <span className="text-[#8c6d20] ">معدل القراءة: </span>
          <span className="text-[#5c4813]">{Math.ceil(words / 200)}د</span>
        </li>
      </ul>
    </div>
  );
};

export default Stat;
