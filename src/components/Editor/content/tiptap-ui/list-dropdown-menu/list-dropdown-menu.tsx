import { type Editor } from "@tiptap/react";
import * as React from "react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor.ts";

// --- Icons ---
import { ChevronDownIcon } from "@/components/Editor/content/tiptap-icons/chevron-down-icon.tsx";

// --- Tiptap UI ---
import { ListButton, type ListType } from "@/components/Editor/content/tiptap-ui/list-button";

import { useListDropdownMenu } from "./use-list-dropdown-menu.ts";

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

export interface ListDropdownMenuProps extends Omit<ButtonProps, "type"> {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor;
  /**
   * The list types to display in the dropdown.
   */
  types?: ListType[];
  /**
   * Whether the dropdown should be hidden when no list types are available
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

export function ListDropdownMenu({
  editor: providedEditor,
  types = ["bulletList", "orderedList", "taskList"],
  hideWhenUnavailable = false,
  onOpenChange,
  portal = false,
  ...props
}: ListDropdownMenuProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = React.useState(false);

  const { filteredLists, canToggle, isActive, isVisible, Icon } =
    useListDropdownMenu({
      editor,
      types,
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

  // Arabic labels for lists
  const listLabels: Record<string, string> = {
    bulletList: "قائمة نقطية",
    orderedList: "قائمة مرقمة",
    taskList: "قائمة مهام",
  };

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
          aria-label="خيارات القوائم"
          tooltip="قوائم نقطية/مرقمة"
          {...props}
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
                {filteredLists.map((option) => (
                  <DropdownMenuItem key={option.type} asChild>
                    <ListButton
                      editor={editor}
                      type={option.type}
                      text={listLabels[option.type] || option.label}
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

export default ListDropdownMenu;
