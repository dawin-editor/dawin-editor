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
import {
  Button,
  ButtonGroup,
} from "@/components/Editor/content/tiptap-ui-primitive/button";
import {
  Card,
  CardBody,
} from "@/components/Editor/content/tiptap-ui-primitive/card";
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

    const handleRemoveHeading = () => {
      const level = editor?.getAttributes("heading")?.level;
      if (editor?.isActive("heading")) {
        editor.commands.toggleHeading({ level: level });
      }
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
                  <DropdownMenuItem asChild>
                    <Button
                      data-style="ghost"
                      data-active-state="off"
                      onClick={handleRemoveHeading}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        className="tiptap-button-icon"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 4C3 3.44772 3.44772 3 4 3H20C20.5523 3 21 3.44772 21 4V7C21 7.55228 20.5523 8 20 8C19.4477 8 19 7.55228 19 7V5H13V19H15C15.5523 19 16 19.4477 16 20C16 20.5523 15.5523 21 15 21H9C8.44772 21 8 20.5523 8 20C8 19.4477 8.44772 19 9 19H11V5H5V7C5 7.55228 4.55228 8 4 8C3.44772 8 3 7.55228 3 7V4Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                      <span>فقرة</span>
                    </Button>
                  </DropdownMenuItem>
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
