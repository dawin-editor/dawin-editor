import * as React from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import type { TextAlign } from "@/components/tiptap-ui/text-align-button"
import {
  canSetTextAlign,
  isTextAlignActive,
  textAlignIcons,
  textAlignLabels,
} from "@/components/tiptap-ui/text-align-button/use-text-align"

// --- Icons ---
import { AlignLeftIcon } from "@/components/tiptap-icons/align-left-icon"

export interface UseTextAlignDropdownMenuConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The text alignment types to display in the dropdown.
   */
  aligns?: TextAlign[]
  /**
   * Whether the dropdown should be hidden when no alignment types are available
   * @default false
   */
  hideWhenUnavailable?: boolean
}

export function getActiveTextAlign(
  editor: Editor | null,
  availableAligns: TextAlign[]
): TextAlign | undefined {
  if (!editor) return undefined

  return availableAligns.find((align) => isTextAlignActive(editor, align))
}

export function canToggleAnyTextAlign(
  editor: Editor | null,
  aligns: TextAlign[]
): boolean {
  if (!editor) return false

  return aligns.some((align) => canSetTextAlign(editor, align))
}

export function isAnyTextAlignActive(
  editor: Editor | null,
  aligns: TextAlign[]
): boolean {
  if (!editor) return false

  return aligns.some((align) => isTextAlignActive(editor, align))
}

export function getFilteredTextAlignOptions(aligns: TextAlign[]) {
  return aligns.map((align) => ({
    align,
    label: textAlignLabels[align],
    icon: textAlignIcons[align],
  }))
}

export function shouldShowTextAlignDropdown({
  editor,
  hideWhenUnavailable,
  canToggleAny,
}: {
  editor: Editor | null
  hideWhenUnavailable: boolean
  canToggleAny: boolean
}): boolean {
  if (!editor || !editor.isEditable) return false

  if (hideWhenUnavailable) {
    return canToggleAny
  }

  return true
}

/**
 * Custom hook that provides text align dropdown menu functionality for Tiptap editor
 */
export function useTextAlignDropdownMenu(config?: UseTextAlignDropdownMenuConfig) {
  const {
    editor: providedEditor,
    aligns = ["left", "center", "right", "justify"],
    hideWhenUnavailable = false,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = React.useState(false)

  const filteredAligns = React.useMemo(
    () => getFilteredTextAlignOptions(aligns),
    [aligns]
  )

  const canToggleAny = canToggleAnyTextAlign(editor, aligns)
  const isAnyActive = isAnyTextAlignActive(editor, aligns)
  const activeAlign = getActiveTextAlign(editor, aligns)
  const activeAlignOption = filteredAligns.find((option) => option.align === activeAlign)

  React.useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowTextAlignDropdown({
          editor,
          hideWhenUnavailable,
          canToggleAny,
        })
      )
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [canToggleAny, editor, hideWhenUnavailable, aligns])

  return {
    isVisible,
    activeAlign,
    isActive: isAnyActive,
    canToggle: canToggleAny,
    aligns,
    filteredAligns,
    label: "Text Alignment",
    Icon: activeAlignOption ? activeAlignOption.icon : AlignLeftIcon,
  }
}

