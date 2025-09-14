import { type Editor } from "@tiptap/react";
import * as React from "react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { ButtonGroup } from "@/components/tiptap-ui-primitive/button";

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon";

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu";

export interface FontFamilyDropdownProps extends Omit<ButtonProps, "type"> {
  editor?: Editor;
  fontFamilies?: string[];
  portal?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const DEFAULT_FONT_FAMILIES = [
  "SaudiWeb-Regular",
  "Amiri",
  "Almarai",
  "Cairo",
  "Changa",
  "Harmattan",
  "Noto Kufi Arabic",
  "Noto Naskh Arabic",
  "Tajawal",
];

export function FontFamilyDropdown({
  editor: providedEditor,
  fontFamilies = DEFAULT_FONT_FAMILIES,
  portal = false,
  onOpenChange,
  ...props
}: FontFamilyDropdownProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  const handleFontFamilyChange = React.useCallback(
    (fontFamily: string) => {
      if (!editor || !editor.isEditable) return;
      if (fontFamily === "default") {
        editor.chain().focus().unsetFontFamily().run();
      } else {
        editor.chain().focus().setFontFamily(fontFamily).run();
      }
    },
    [editor]
  );

  const getCurrentFontFamily = React.useCallback(() => {
    if (!editor) return "الخط";
    const fontFamily = editor.getAttributes("textStyle").fontFamily;
    return fontFamily || "الخط";
  }, [editor]);

  if (!editor || !editor.isEditable) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          role="button"
          tabIndex={-1}
          aria-label="خيارات نوع الخط"
          tooltip="نوع الخط"
          dir="rtl"
          {...props}
        >
          <span
            className="tiptap-button-text"
            style={{ fontFamily: getCurrentFontFamily() }}
          >
            {getCurrentFontFamily()}
          </span>
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" portal={portal}>
        <div dir="rtl">
          <Card>
            <CardBody>
              <ButtonGroup  dir="rtl" className="space-y-1">
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer"
                  onClick={() => handleFontFamilyChange("default")}
                >
                  <Button type="button" data-style="ghost">
                    الافتراضي
                  </Button>
                </DropdownMenuItem>
                {fontFamilies.map((fontFamily) => (
                  <DropdownMenuItem
                    key={fontFamily}
                    asChild
                    className="cursor-pointer"
                    onClick={() => handleFontFamilyChange(fontFamily)}
                  >
                    <Button
                      type="button"
                      data-style="ghost"
                      style={{ fontFamily }}
                    >
                      {fontFamily}
                    </Button>
                  </DropdownMenuItem>
                ))}
              </ButtonGroup>
            </CardBody>
          </Card>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default FontFamilyDropdown;
