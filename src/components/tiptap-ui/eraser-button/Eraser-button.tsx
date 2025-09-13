"use client"

import * as React from "react"
import { Eraser } from "lucide-react"
import { useEditorStore } from "@/store/EditroStore"
import { Button } from "@/components/tiptap-ui-primitive/button"

export interface EraserButtonProps {
  /**
   * Optional tooltip text for the button.
   * @default "مسح المحتوى"
   */
  tooltip?: string
}

const EraserButton = React.forwardRef<HTMLButtonElement, EraserButtonProps>(
  ({ tooltip = "مسح المحتوى", ...props }, ref) => {
    const { editor } = useEditorStore()

    const handleErase = React.useCallback(() => {
      editor?.commands.clearContent()
    }, [editor])

    return (
      <Button
        type="button"
        data-style="ghost"
        role="button"
        tabIndex={-1}
        aria-label={tooltip}
        tooltip={tooltip} // ✅ نفس pattern زي MarkButton
        onClick={handleErase}
        ref={ref}
        {...props}
      >
        <Eraser className="tiptap-button-icon" />
      </Button>
    )
  }
)

EraserButton.displayName = "EraserButton"

export default EraserButton
