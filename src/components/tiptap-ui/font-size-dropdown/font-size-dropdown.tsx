import * as React from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"

export interface FontSizeDropdownProps extends Omit<ButtonProps, "type"> {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor
  /**
   * The font sizes to display in the dropdown.
   */
  fontSizes?: string[]
  /**
   * Whether to render the dropdown menu in a portal
   * @default false
   */
  portal?: boolean
  /**
   * Callback for when the dropdown opens or closes
   */
  onOpenChange?: (isOpen: boolean) => void
}

const DEFAULT_FONT_SIZES = [
  "8px",
  "9px", 
  "10px",
  "11px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "36px",
  "48px",
  "72px",
]

export function FontSizeDropdown({
  editor: providedEditor,
  fontSizes = DEFAULT_FONT_SIZES,
  portal = false,
  onOpenChange,
  ...props
}: FontSizeDropdownProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = React.useState(false)

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open)
      onOpenChange?.(open)
    },
    [onOpenChange]
  )

  const handleFontSizeChange = React.useCallback(
    (fontSize: string) => {
      if (!editor || !editor.isEditable) return

      if (fontSize === "default") {
        editor.chain().focus().unsetFontSize().run()
      } else {
        editor.chain().focus().setFontSize(fontSize).run()
      }
    },
    [editor]
  )

  const getCurrentFontSize = React.useCallback(() => {
    if (!editor) return "Font Size"
    
    const fontSize = editor.getAttributes("textStyle").fontSize
    return fontSize || "Font Size"
  }, [editor])

  if (!editor || !editor.isEditable) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          role="button"
          tabIndex={-1}
          aria-label="Font size options"
          tooltip="Font Size"
          {...props}
        >
          <span className="tiptap-button-text">
            {getCurrentFontSize()}
          </span>
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" portal={portal}>
        <Card>
          <CardBody>
            <div className="space-y-1">
              <DropdownMenuItem
                onClick={() => handleFontSizeChange("default")}
                className="cursor-pointer"
              >
                <span>Default</span>
              </DropdownMenuItem>
              {fontSizes.map((fontSize) => (
                <DropdownMenuItem
                  key={fontSize}
                  onClick={() => handleFontSizeChange(fontSize)}
                  className="cursor-pointer"
                >
                  <span style={{ fontSize }}>{fontSize}</span>
                </DropdownMenuItem>
              ))}
            </div>
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default FontSizeDropdown
