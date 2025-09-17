import { Eye, SquarePen } from "lucide-react";
import { usePreviewStore } from "@/store/preview.ts";
import { Button } from "@/components/ui/button.tsx";
import { useEditorStore } from "@/store/EditroStore.ts";

interface EyePenProps {
  className?: string;
  size?: "icon" | number;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link";
  IconsStyle?: string;
  IconsStroke?: number;
}

const EyePen = ({
  className,
  size = "icon",
  variant = "default",
  IconsStyle = "",
  IconsStroke = 2,
}: EyePenProps) => {
  const { setPreview, preview } = usePreviewStore();
  const { editor } = useEditorStore();

  const handleClick = () => {
    const newPreview = !preview;
    setPreview(newPreview);
    editor?.setEditable(!newPreview); // Tiptap-native method
  };

  return (
    <Button
      onClick={handleClick}
      className={className}
      variant={variant}
      size={size === "icon" ? "icon" : "default"}
    >
      {preview ? (
        <SquarePen
          className={IconsStyle}
          strokeWidth={IconsStroke}
          onClick={() => editor?.commands.focus("end")}
        />
      ) : (
        <Eye
          className={IconsStyle}
          strokeWidth={IconsStroke}
        />
      )}
    </Button>
  );
};

export default EyePen;
