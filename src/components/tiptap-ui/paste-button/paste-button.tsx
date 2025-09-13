import { ClipboardPaste } from "lucide-react";
import { useEditorStore } from "@/store/EditroStore";
import { Button } from "@/components/tiptap-ui-primitive/button";

const PasteButton = () => {
  const { editor } = useEditorStore();

  const handlePaste = async () => {
    if (!editor) return;

    try {
      // Read text from the clipboard
      const text = await navigator.clipboard.readText();
      if (text) {
        // Insert the text at the current cursor position
        editor.commands.insertContent(text);
        // Optional: focus the editor after pasting
        editor.commands.focus();
      }
    } catch (err) {
      console.error("Failed to read clipboard: ", err);
    }
  };

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      aria-label="paste from clipboard"
      tooltip="paste from clipboard"
      onClick={handlePaste}
    >
      <ClipboardPaste className="tiptap-button-icon" />
    </Button>
  );
};

export default PasteButton;
