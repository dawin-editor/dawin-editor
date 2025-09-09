import * as React from "react"
import { type Editor, useEditorState } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Plus, Minus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/tiptap-ui-primitive/popover"
import { cn } from "@/lib/tiptap-utils"

export interface FontSizeDropdownProps extends Omit<ButtonProps, "type"> {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor
}

const DEFAULT_FONT_SIZE = "16"

export function FontSizeDropdown({
  editor: providedEditor,
}: FontSizeDropdownProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [inputValue, setInputValue] = React.useState(DEFAULT_FONT_SIZE)
  const [isFocused, setIsFocused] = React.useState(false)

  const cursorFontSize = useEditorState({
    editor,
    selector: (context) => {
      if (!context.editor) return DEFAULT_FONT_SIZE
      
      const current = context.editor.getAttributes("textStyle").fontSize as string | undefined
      if (current && current.endsWith("px")) {
        const parsed = parseInt(current, 10)
        if (!Number.isNaN(parsed)) {
          return parsed.toString()
        }
      }
      return DEFAULT_FONT_SIZE
    },
  }) || DEFAULT_FONT_SIZE

  const handleInputChange = () => {
    const newSize = parseInt(inputValue, 10)

    if (Number.isNaN(newSize) || newSize < 1 || newSize > 100) {
      return
    }
    
    if (newSize.toString() !== cursorFontSize) {
      editor?.chain().setFontSize(`${newSize}px`).run()
    }
  }

  const handleFontSizeChange = (delta: number) => {
    const currentSize = Number(displayValue)
    let newSize = currentSize + delta

    // Clamp between reasonable bounds
    newSize = Math.max(8, Math.min(100, newSize))

    editor?.chain().setFontSize(`${newSize}px`).run()
  }

  const displayValue = isFocused ? inputValue : cursorFontSize

  if (!editor) return null

  return (
    <div className="flex items-center">
      {/* Decrease button */}
      <button
        onClick={() => {
          handleFontSizeChange(-1)
        }}
        className={cn(
          "tiptap-button",
          "p-1.5 rounded-md",
          "transition-all duration-150 ease-out group",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "hover:bg-[var(--tt-button-hover-bg-color)]",
          "active:bg-[var(--tt-button-active-bg-color)]"
        )}
        disabled={Number(displayValue) <= 8}
        title="تقليل حجم الخط"
        data-style="ghost"
      >
        <Minus className="w-4 h-4 tiptap-button-icon" />
      </button>

      {/* Font size input */}
      <Popover open={isFocused} modal={false}>
        <PopoverTrigger asChild>
          <input
            className={cn(
              "w-9 h-7 mx-1 px-1 text-center text-sm",
              "tiptap-button-text",
              "rounded-md border-none outline-none cursor-pointer",
              "transition-all duration-150 ease-out",
              "hover:bg-[var(--tt-button-hover-bg-color)] hover:text-[var(--tt-button-hover-text-color)]",
              "focus:bg-[var(--tt-button-active-bg-color)] focus:text-[var(--tt-button-active-text-color)]",
              "selection:bg-blue-500/30",
              "bg-transparent"
            )}
            value={displayValue}
            onBlur={() => {
              setIsFocused(false)
              handleInputChange()
            }}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              setIsFocused(true)
              setInputValue(cursorFontSize)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleInputChange()
                setIsFocused(false)
              }
              if (e.key === "Escape") {
                setIsFocused(false)
              }
              if (e.key === "ArrowUp") {
                e.preventDefault()
                handleFontSizeChange(1)
              }
              if (e.key === "ArrowDown") {
                e.preventDefault()
                handleFontSizeChange(-1)
              }
            }}
            type="text"
            title="حجم الخط"
          />
        </PopoverTrigger>
        <PopoverContent
          className="w-auto px-2 py-1 bg-[var(--tt-gray-light-a-100)] border-[var(--tt-gray-light-200)] text-xs text-[var(--tt-gray-light-a-600)] dark:bg-[var(--tt-gray-dark-a-100)] dark:border-[var(--tt-gray-dark-200)] dark:text-[var(--tt-gray-dark-a-600)]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          اكتب الحجم 
        </PopoverContent>
      </Popover>

      {/* Increase button */}
      <button
        onClick={() => handleFontSizeChange(1)}
        className={cn(
          "tiptap-button",
          "p-1.5 rounded-md",
          "transition-all duration-150 ease-out group",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "hover:bg-[var(--tt-button-hover-bg-color)]",
          "active:bg-[var(--tt-button-active-bg-color)]"
        )}
        disabled={Number(displayValue) >= 100}
        title="زيادة حجم الخط"
        data-style="ghost"
      >
        <Plus className="w-4 h-4 tiptap-button-icon" />
      </button>
    </div>
  )
}

export default FontSizeDropdown
