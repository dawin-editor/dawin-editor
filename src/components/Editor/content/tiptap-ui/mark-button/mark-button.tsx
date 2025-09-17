"use client"

import * as React from "react"

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils.ts"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor.ts"

// --- Tiptap UI ---
import type { Mark, UseMarkConfig } from "@/components/Editor/content/tiptap-ui/mark-button/index.tsx"
import { MARK_SHORTCUT_KEYS, useMark } from "@/components/Editor/content/tiptap-ui/mark-button/index.tsx"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/Editor/content/tiptap-ui-primitive/button"
import { Button } from "@/components/Editor/content/tiptap-ui-primitive/button"
import { Badge } from "@/components/Editor/content/tiptap-ui-primitive/badge"

export interface MarkButtonProps
  extends Omit<ButtonProps, "type">,
    UseMarkConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcut?: boolean
  /**
   * Optional tooltip text for the button.
   * @default "Text Mailing"
   */
  tooltip?: string
}

export function MarkShortcutBadge({
  type,
  shortcutKeys = MARK_SHORTCUT_KEYS[type],
}: {
  type: Mark
  shortcutKeys?: string
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>
}

/**
 * Button component for toggling marks in a Tiptap editor.
 *
 * For custom button implementations, use the `useMark` hook instead.
 */
export const MarkButton = React.forwardRef<HTMLButtonElement, MarkButtonProps>(
  (
    {
      editor: providedEditor,
      type,
      text,
      hideWhenUnavailable = false,
      onToggled,
      showShortcut = false,
      onClick,
      children,
      tooltip,
        ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const {
      isVisible,
      handleMark,
      label,
      canToggle,
      isActive,
      Icon,
      shortcutKeys,
    } = useMark({
      editor,
      type,
      hideWhenUnavailable,
      onToggled,
    })

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleMark()
      },
      [handleMark, onClick]
    )

    if (!isVisible) {
      return null
    }

    return (
      <Button
        type="button"
        disabled={!canToggle}
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        data-disabled={!canToggle}
        role="button"
        tabIndex={-1}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={tooltip}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Icon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
            {showShortcut && (
              <MarkShortcutBadge type={type} shortcutKeys={shortcutKeys} />
            )}
          </>
        )}
      </Button>
    )
  }
)

MarkButton.displayName = "MarkButton"
