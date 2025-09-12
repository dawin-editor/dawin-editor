import { Eraser } from "lucide-react";
import { useEditorStore } from "@/store/EditroStore";
import { Button } from "@/components/tiptap-ui-primitive/button";

const EraserButton = () => {
  const { editor } = useEditorStore();
  const handleErase = () => {
    editor?.commands.clearContent();
  };
  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      aria-label="Clear all content"
      tooltip="Clear all content"
      onClick={handleErase}
    >
      <Eraser className="tiptap-button-icon" />
    </Button>
  );
};

export default EraserButton;
