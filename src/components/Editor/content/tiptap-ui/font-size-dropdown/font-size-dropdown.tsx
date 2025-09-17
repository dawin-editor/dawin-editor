import * as React from "react";
import { type Editor, useEditorState } from "@tiptap/react";
import { TextSelection } from "prosemirror-state";

import type { ButtonProps } from "@/components/Editor/content/tiptap-ui-primitive/button";
import { Plus, Minus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/Editor/content/tiptap-ui-primitive/popover";
import { cn } from "@/lib/tiptap-utils.ts";
import { useEditorStore } from "@/store/EditroStore.ts";

export interface FontSizeDropdownProps extends Omit<ButtonProps, "type"> {
  editor?: Editor;
}

const DEFAULT_FONT_SIZE = 16;

export function FontSizeDropdown() {
  const { editor } = useEditorStore();

  const [inputValue, setInputValue] = React.useState(
    DEFAULT_FONT_SIZE.toString()
  );
  const [isFocused, setIsFocused] = React.useState(false);

  // store a font size that should apply on *next typing*
  const pendingFontSizeRef = React.useRef<number | null>(null);

  // current font size at cursor
  const cursorFontSize =
    useEditorState({
      editor,
      selector: (ctx) => {
        const size = ctx.editor?.getAttributes("textStyle").fontSize;
        if (size?.endsWith("px")) {
          const parsed = parseInt(size, 10);
          if (!Number.isNaN(parsed)) return parsed.toString();
        }
        return DEFAULT_FONT_SIZE.toString();
      },
    }) || DEFAULT_FONT_SIZE.toString();

  // sync input when cursor moves
  React.useEffect(() => {
    if (!isFocused && pendingFontSizeRef.current == null) {
      setInputValue(cursorFontSize);
    }
  }, [cursorFontSize, isFocused]);

  // listen for typing -> apply pending font size with flash selection
  React.useEffect(() => {
    if (!editor) return;

    const handler = ({ transaction }: { transaction: any }) => {
      const pending = pendingFontSizeRef.current;
      if (!pending || !transaction.docChanged) return;

      // Flash selection approach - ultra-fast selection and formatting
      setTimeout(() => {
        const { from } = editor.state.selection;

        try {
          // Go back one step, select the just-typed character, apply font size, restore cursor
          editor
            .chain()
            .command(({ tr }) => {
              const prevPos = Math.max(0, from - 1);
              tr.setSelection(TextSelection.create(tr.doc, prevPos, from));
              return true;
            })
            .setFontSize(`${pending}px`)
            .command(({ tr }) => {
              tr.setSelection(TextSelection.create(tr.doc, from));
              return true;
            })
            .run();

          setInputValue(String(pending));
          pendingFontSizeRef.current = null;
        } catch (error) {
          console.warn("Font size flash selection failed:", error);
          // Fallback to simple approach
          editor.chain().focus().setFontSize(`${pending}px`).run();
          setInputValue(String(pending));
          pendingFontSizeRef.current = null;
        }
      }, 0); // Immediate but async for flash effect
    };

    editor.on("transaction", handler);
    return () => {
      editor.off("transaction", handler);
      // Do not return anything here (void)
    };
  }, [editor]);

  // validate & apply typed value
  const applyFontSize = (size: number) => {
    if (!editor) return;

    if (!editor.state.selection.empty) {
      // Apply immediately to selected text
      editor.chain().setFontSize(`${size}px`).run();
      pendingFontSizeRef.current = null;
    } else {
      // Store for next typing (flash selection will handle it)
      pendingFontSizeRef.current = size;
    }
    setInputValue(size.toString());
  };

  const handleInputBlurOrEnter = () => {
    const newSize = parseInt(inputValue, 10);
    if (!Number.isNaN(newSize) && newSize >= 1 && newSize <= 100) {
      applyFontSize(newSize);
    } else {
      // Invalid input - restore current value
      setInputValue(cursorFontSize);
    }
    setIsFocused(false);
  };

  const handleButtonChange = (delta: number) => {
    const base = Number(pendingFontSizeRef.current ?? cursorFontSize);
    const newSize = Math.max(8, Math.min(100, base + delta));
    applyFontSize(newSize);
  };

  const displayValue = isFocused
    ? inputValue
    : pendingFontSizeRef.current ?? cursorFontSize;

  if (!editor) return null;

  return (
    <div className="flex items-center">
      {/* Decrease font size */}
      <button
        onClick={() => handleButtonChange(-1)}
        disabled={Number(displayValue) <= 8}
        className={cn(
          "tiptap-button p-1.5 rounded-md hover:bg-[var(--tt-button-hover-bg-color)]"
        )}
        title="تقليل حجم الخط"
        data-style="ghost"
      >
        <Minus className="w-4 h-4" />
      </button>

      {/* Input field with popover */}
      <Popover open={isFocused}>
        <PopoverTrigger asChild>
          <input
            type="text"
            value={String(displayValue)}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setInputValue(
                String(pendingFontSizeRef.current ?? cursorFontSize)
              );
            }}
            onBlur={handleInputBlurOrEnter}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleInputBlurOrEnter();
              }
              if (e.key === "Escape") {
                setIsFocused(false);
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                handleButtonChange(1);
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                handleButtonChange(-1);
              }
            }}
            className={cn(
              "w-9 h-7 mx-1 px-1 text-center text-sm rounded-md",
              "bg-transparent border-none outline-none cursor-pointer"
            )}
            title="حجم الخط"
          />
        </PopoverTrigger>
        <PopoverContent className="px-2 py-1 text-xs">
          اكتب الحجم
        </PopoverContent>
      </Popover>

      {/* Increase font size */}
      <button
        onClick={() => handleButtonChange(1)}
        disabled={Number(displayValue) >= 100}
        className={cn(
          "tiptap-button p-1.5 rounded-md hover:bg-[var(--tt-button-hover-bg-color)]"
        )}
        title="زيادة حجم الخط"
        data-style="ghost"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

export default FontSizeDropdown;
