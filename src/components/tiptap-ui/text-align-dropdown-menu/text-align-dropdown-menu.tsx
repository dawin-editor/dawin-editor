import { type Editor } from "@tiptap/react";
import * as React from "react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon";

// --- Tiptap UI ---
import {
  TextAlignButton,
  type TextAlign,
} from "@/components/tiptap-ui/text-align-button";

import { useTextAlignDropdownMenu } from "./use-text-align-dropdown-menu";

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button";
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu";

export interface TextAlignDropdownMenuProps extends Omit<ButtonProps, "type"> {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor;
  /**
   * The text alignment types to display in the dropdown.
   */
  aligns?: TextAlign[];
  /**
   * Whether the dropdown should be hidden when no alignment types are available
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback for when the dropdown opens or closes
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Whether to render the dropdown menu in a portal
   * @default false
   */
  portal?: boolean;
}

export function TextAlignDropdownMenu({
  editor: providedEditor,
  aligns = ["left", "center", "right", "justify"],
  hideWhenUnavailable = false,
  onOpenChange,
  portal = false,
  ...props
}: TextAlignDropdownMenuProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = React.useState(false);

  const { filteredAligns, canToggle, isActive, isVisible, Icon } =
    useTextAlignDropdownMenu({
      editor,
      aligns,
      hideWhenUnavailable,
    });

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  if (!isVisible || !editor || !editor.isEditable) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          data-active-state={isActive ? "on" : "off"}
          role="button"
          tabIndex={-1}
          disabled={!canToggle}
          data-disabled={!canToggle}
          aria-label="خيارات محاذاة النص"
          tooltip="محاذاة النص"
          {...props}
        >
          <Icon className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" portal={portal}>
        <Card dir="rtl">
          <CardBody>
            <ButtonGroup>
              {filteredAligns.map((option) => (
                <DropdownMenuItem key={option.align} asChild>
                  <TextAlignButton
                    editor={editor}
                    align={option.align}
                    text={
                      option.align === "left"
                        ? "محاذاة لليسار"
                        : option.align === "center"
                        ? "توسيط"
                        : option.align === "right"
                        ? "محاذاة لليمين"
                        : option.align === "justify"
                        ? "ضبط النص"
                        : option.label
                    }
                    showTooltip={false}
                  />
                </DropdownMenuItem>
              ))}
            </ButtonGroup>
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TextAlignDropdownMenu;
