import { type Editor } from "@tiptap/react";
import * as React from "react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor.ts";

// --- Icons ---
import { ChevronDownIcon } from "@/components/Editor/content/tiptap-icons/chevron-down-icon.tsx";
import {
  PilcrowLeft,
  PilcrowRight,
  Pilcrow,
  RemoveFormatting,
} from "lucide-react";

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

type TextDirectionType = "rtl" | "ltr" | "auto" | "unset";

interface DirectionOption {
  direction: TextDirectionType;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const directionOptions: DirectionOption[] = [
  {
    direction: "rtl",
    label: "من اليمين لليسار",
    icon: ({ className }) => <PilcrowRight className={className} />,
  },
  {
    direction: "ltr",
    label: "من اليسار لليمين",
    icon: ({ className }) => <PilcrowLeft className={className} />,
  },
  {
    direction: "auto",
    label: "تلقائي",
    icon: ({ className }) => <Pilcrow className={className} />,
  },
  {
    direction: "unset",
    label: "إزالة الاتجاه",
    icon: ({ className }) => <RemoveFormatting className={className} />,
  },
];

function getActiveDirection(editor: Editor | null): TextDirectionType | null {
  if (!editor) return null;

  const { dir } = editor.getAttributes("paragraph");
  if (dir === "rtl") return "rtl";
  if (dir === "ltr") return "ltr";
  if (dir === "auto") return "auto";
  return null;
}

function getActiveIcon(
  activeDir: TextDirectionType | null,
): React.FC<{ className?: string }> {
  const match = directionOptions.find((opt) => opt.direction === activeDir);
  if (match) return match.icon;
  // Default to RTL icon since the editor default is RTL
  return directionOptions[0].icon;
}

export interface TextDirectionDropdownMenuProps extends Omit<
  ButtonProps,
  "type"
> {
  editor?: Editor;
  hideWhenUnavailable?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  portal?: boolean;
}

export function TextDirectionDropdownMenu({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onOpenChange,
  portal = false,
  ...props
}: TextDirectionDropdownMenuProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange],
  );

  if (!editor || !editor.isEditable) {
    return null;
  }

  const canUseDirection =
    typeof editor.commands.setTextDirection === "function";

  if (hideWhenUnavailable && !canUseDirection) {
    return null;
  }

  const activeDir = getActiveDirection(editor);
  const ActiveIcon = getActiveIcon(activeDir);

  const handleDirectionChange = (direction: TextDirectionType) => {
    if (direction === "unset") {
      editor.commands.unsetTextDirection();
    } else {
      editor.commands.setTextDirection(direction);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          data-active-state={activeDir ? "on" : "off"}
          role="button"
          tabIndex={-1}
          disabled={!canUseDirection}
          data-disabled={!canUseDirection}
          aria-label="اتجاه النص"
          tooltip="اتجاه النص"
          {...props}
        >
          <ActiveIcon className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" portal={portal}>
        <Card >
          <CardBody>
            <ButtonGroup>
              {directionOptions.map((option) => {
                const Icon = option.icon;
                const isActive =
                  option.direction !== "unset" &&
                  activeDir === option.direction;

                return (
                  <DropdownMenuItem key={option.direction} asChild>
                    <Button
                      type="button"
                      data-style="ghost"
                      data-active-state={isActive ? "on" : "off"}
                      role="menuitem"
                      tabIndex={-1}
                      aria-label={option.label}
                      onClick={() => handleDirectionChange(option.direction)}
                      dir="ltr"
                      style={{ flexDirection: "row-reverse" }}
                    >
                      <Icon className="tiptap-button-icon" />
                      <span className="tiptap-button-text">{option.label}</span>

                    </Button>
                  </DropdownMenuItem>
                );
              })}
            </ButtonGroup>
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TextDirectionDropdownMenu;
