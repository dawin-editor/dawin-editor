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

export interface FontFamilyDropdownProps extends Omit<ButtonProps, "type"> {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor
  /**
   * The font families to display in the dropdown.
   */
  fontFamilies?: string[]
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

const DEFAULT_FONT_FAMILIES = [
  // Local Arabic fonts
  "SaudiWeb-Regular",
  // Google Fonts Arabic
  "Amiri",
  "Almarai",
  "Cairo",
  "Changa",
  "Harmattan",
  "Noto Kufi Arabic",
  "Noto Naskh Arabic",
  "Tajawal",
]

export function FontFamilyDropdown({
  editor: providedEditor,
  fontFamilies = DEFAULT_FONT_FAMILIES,
  portal = false,
  onOpenChange,
  ...props
}: FontFamilyDropdownProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = React.useState(false)

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open)
      onOpenChange?.(open)
    },
    [onOpenChange]
  )

  const handleFontFamilyChange = React.useCallback(
    (fontFamily: string) => {
      if (!editor || !editor.isEditable) return

      if (fontFamily === "default") {
        editor.chain().focus().unsetFontFamily().run()
      } else {
        editor.chain().focus().setFontFamily(fontFamily).run()
      }
    },
    [editor]
  )

  const getCurrentFontFamily = React.useCallback(() => {
    if (!editor) return "نوع الخط"
    
    const fontFamily = editor.getAttributes("textStyle").fontFamily
    return fontFamily || "نوع الخط"
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
          aria-label="Font family options"
          tooltip="Font Family"
          {...props}
        >
          <span className="tiptap-button-text" style={{ fontFamily: getCurrentFontFamily() }}>
            {getCurrentFontFamily()}
          </span>
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" portal={portal}>
        <Card>
          <CardBody>
            <div className="space-y-1">
              <DropdownMenuItem
                onClick={() => handleFontFamilyChange("default")}
                className="cursor-pointer"
              >
                <span>Default</span>
              </DropdownMenuItem>
              {fontFamilies.map((fontFamily) => (
                <DropdownMenuItem
                  key={fontFamily}
                  onClick={() => handleFontFamilyChange(fontFamily)}
                  className="cursor-pointer"
                >
                  <span style={{ fontFamily }}>{fontFamily}</span>
                </DropdownMenuItem>
              ))}
            </div>
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default FontFamilyDropdown
