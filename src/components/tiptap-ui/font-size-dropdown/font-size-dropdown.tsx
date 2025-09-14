import * as React from "react"
import { type Editor, useEditorState } from "@tiptap/react"

import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Plus, Minus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/tiptap-ui-primitive/popover"
import { cn } from "@/lib/tiptap-utils"
import { useEditorStore } from "@/store/EditroStore"

export interface FontSizeDropdownProps extends Omit<ButtonProps, "type"> {
  editor?: Editor
}

const DEFAULT_FONT_SIZE = "16"

export function FontSizeDropdown() {
  const { editor } = useEditorStore()

  // state for input field
  const [inputValue, setInputValue] = React.useState(DEFAULT_FONT_SIZE)
  const [isFocused, setIsFocused] = React.useState(false)

  // store a font size that should apply on *next typing*
  const pendingFontSizeRef = React.useRef<number | null>(null)

  // current font size at cursor
  const cursorFontSize = useEditorState({
    editor,
    selector: (ctx) => {
      const current = ctx.editor?.getAttributes("textStyle").fontSize
      if (current?.endsWith("px")) {
        const parsed = parseInt(current, 10)
        if (!Number.isNaN(parsed)) return parsed.toString()
      }
      return DEFAULT_FONT_SIZE
    },
  }) || DEFAULT_FONT_SIZE

  // sync input when cursor moves
  React.useEffect(() => {
    if (!isFocused && pendingFontSizeRef.current == null) {
      setInputValue(cursorFontSize)
    }
  }, [cursorFontSize, isFocused])

  // listen for typing -> apply pending font size
  React.useEffect(() => {
    if (!editor) return
    const handler = ({ transaction }: { transaction: any }) => {
      const pending = pendingFontSizeRef.current
      if (!pending || !transaction.docChanged) return
      editor.chain().focus().setFontSize(`${pending}px`).run()
      setInputValue(String(pending))
      pendingFontSizeRef.current = null
    }
    editor.on("transaction", handler)
    return () => editor.off("transaction", handler)
  }, [editor])

  // validate & apply typed value
  const handleInputChange = () => {
    const newSize = parseInt(inputValue, 10)
    if (Number.isNaN(newSize) || newSize < 1 || newSize > 100) return

    if (editor && !editor.state.selection.empty) {
      editor.chain().setFontSize(`${newSize}px`).run()
      pendingFontSizeRef.current = null
    } else {
      pendingFontSizeRef.current = newSize
    }
  }

  // +/- buttons
  const handleFontSizeChange = (delta: number) => {
    const base = Number(isFocused ? inputValue : (pendingFontSizeRef.current ?? cursorFontSize))
    if (Number.isNaN(base)) return

    let newSize = Math.max(8, Math.min(100, base + delta))
    setInputValue(newSize.toString())

    if (editor && !editor.state.selection.empty) {
      editor.chain().setFontSize(`${newSize}px`).run()
      pendingFontSizeRef.current = null
    } else {
      pendingFontSizeRef.current = newSize
    }
  }

  const displayValue = isFocused ? inputValue : (pendingFontSizeRef.current ?? cursorFontSize)

  if (!editor) return null

  return (
    <div className="flex items-center">
      {/* Decrease font size */}
      <button
        onClick={() => handleFontSizeChange(-1)}
        disabled={Number(displayValue) <= 8}
        className={cn("tiptap-button p-1.5 rounded-md hover:bg-[var(--tt-button-hover-bg-color)]")}
        title="تقليل حجم الخط"
        data-style="ghost"
      >
        <Minus className="w-4 h-4" />
      </button>

      {/* Input field */}
      <Popover open={isFocused}>
        <PopoverTrigger asChild>
          <input
            type="text"
            value={String(displayValue)}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              setIsFocused(true)
              setInputValue(String(pendingFontSizeRef.current ?? cursorFontSize))
            }}
            onBlur={() => {
              setIsFocused(false)
              handleInputChange()
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleInputChange()
                setIsFocused(false)
              }
              if (e.key === "Escape") setIsFocused(false)
              if (e.key === "ArrowUp") {
                e.preventDefault()
                handleFontSizeChange(1)
              }
              if (e.key === "ArrowDown") {
                e.preventDefault()
                handleFontSizeChange(-1)
              }
            }}
            className={cn(
              "w-9 h-7 mx-1 px-1 text-center text-sm rounded-md",
              "bg-transparent border-none outline-none cursor-pointer"
            )}
            title="حجم الخط"
          />
        </PopoverTrigger>
        <PopoverContent className="px-2 py-1 text-xs">اكتب الحجم</PopoverContent>
      </Popover>

      {/* Increase font size */}
      <button
        onClick={() => handleFontSizeChange(1)}
        disabled={Number(displayValue) >= 100}
        className={cn("tiptap-button p-1.5 rounded-md hover:bg-[var(--tt-button-hover-bg-color)]")}
        title="زيادة حجم الخط"
        data-style="ghost"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}

export default FontSizeDropdown
