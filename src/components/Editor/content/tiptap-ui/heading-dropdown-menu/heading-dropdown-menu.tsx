import * as React from "react";

// --- Icons ---
import { ChevronDownIcon } from "@/components/Editor/content/tiptap-icons/chevron-down-icon.tsx";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor.ts";

// --- Tiptap UI ---
import { HeadingButton } from "@/components/Editor/content/tiptap-ui/heading-button";
import type { UseHeadingDropdownMenuConfig } from "@/components/Editor/content/tiptap-ui/heading-dropdown-menu/index.tsx";
import { useHeadingDropdownMenu } from "@/components/Editor/content/tiptap-ui/heading-dropdown-menu/index.tsx";

// --- UI Primitives ---
import type { ButtonProps } from "@/components/Editor/content/tiptap-ui-primitive/button";
import { Button, ButtonGroup } from "@/components/Editor/content/tiptap-ui-primitive/button";
import { Card, CardBody } from "@/components/Editor/content/tiptap-ui-primitive/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/Editor/content/tiptap-ui-primitive/dropdown-menu";

export interface HeadingDropdownMenuProps
  extends Omit<ButtonProps, "type">,
    UseHeadingDropdownMenuConfig {
  /**
   * Whether to render the dropdown menu in a portal
   * @default false
   */
  portal?: boolean;
  /**
   * Callback for when the dropdown opens or closes
   */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Dropdown menu component for selecting heading levels in a Tiptap editor.
 *
 * For custom dropdown implementations, use the `useHeadingDropdownMenu` hook instead.
 */
export const HeadingDropdownMenu = React.forwardRef<
  HTMLButtonElement,
  HeadingDropdownMenuProps
>(
  (
    {
      editor: providedEditor,
      levels = [1, 2, 3, 4, 5, 6],
      hideWhenUnavailable = false,
      portal = false,
      onOpenChange,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = React.useState(false);
    const { isVisible, isActive, canToggle, Icon } = useHeadingDropdownMenu({
      editor,
      levels,
      hideWhenUnavailable,
    });

    const handleOpenChange = React.useCallback(
      (open: boolean) => {
        if (!editor || !canToggle) return;
        setIsOpen(open);
        onOpenChange?.(open);
      },
      [canToggle, editor, onOpenChange]
    );

    if (!isVisible) {
      return null;
    }

    // Arabic labels for headings
    const headingLabels: Record<number, string> = {
      1: "عنوان رئيسي ١",
      2: "عنوان رئيسي ٢",
      3: "عنوان رئيسي ٣",
      4: "عنوان رئيسي ٤",
      5: "عنوان رئيسي ٥",
      6: "عنوان رئيسي ٦",
    };

    return (
      <DropdownMenu modal open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            data-style="ghost"
            data-active-state={isActive ? "on" : "off"}
            role="button"
            tabIndex={-1}
            disabled={!canToggle}
            data-disabled={!canToggle}
            aria-label="تنسيق النص كعنوان"
            aria-pressed={isActive}
            tooltip="رؤوس/عناوين"
            {...buttonProps}
            ref={ref}
          >
            <Icon className="tiptap-button-icon" />
            <ChevronDownIcon className="tiptap-button-dropdown-small" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" portal={portal}>
          <div dir="rtl">
            <Card>
              <CardBody>
                <ButtonGroup>
                  {levels.map((level) => (
                    <DropdownMenuItem key={`heading-${level}`} asChild>
                      <HeadingButton
                        editor={editor}
                        level={level}
                        text={headingLabels[level] || `عنوان ${level}`}
                        showTooltip={false}
                      />
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
);

HeadingDropdownMenu.displayName = "HeadingDropdownMenu";

export default HeadingDropdownMenu;
