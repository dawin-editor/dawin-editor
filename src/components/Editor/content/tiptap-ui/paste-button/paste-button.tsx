"use client"

import * as React from "react"
import { ClipboardPaste } from "lucide-react"
import { useEditorStore } from "@/store/EditroStore.ts"
import { Button } from "@/components/Editor/content/tiptap-ui-primitive/button"

export interface PasteButtonProps {
  /**
   * Optional tooltip text for the button.
   * @default "لصق كنص عادي"
   */
  tooltip?: string
}

const PasteButton = React.forwardRef<HTMLButtonElement, PasteButtonProps>(
  ({ tooltip = "لصق كنص عادي", ...props }, ref) => {
    const { editor } = useEditorStore()

    const handlePaste = React.useCallback(async () => {
      if (!editor) return

      try {
        // Read text from the clipboard
        const text = await navigator.clipboard.readText()
        if (text) {
          // Insert the text at the current cursor position
          editor.commands.insertContent(text)
          // Focus the editor after pasting
          editor.commands.focus()
        }
      } catch (err) {
        console.error("Failed to read clipboard: ", err)
      }
    }, [editor])

    return (
      <Button
        type="button"
        data-style="ghost"
        role="button"
        tabIndex={-1}
        aria-label={tooltip}
        tooltip={tooltip} // ✅ Tooltip موحد
        onClick={handlePaste}
        ref={ref}
        {...props}
      >
        <ClipboardPaste className="tiptap-button-icon" />
      </Button>
    )
  }
)

PasteButton.displayName = "PasteButton"

export default PasteButton
