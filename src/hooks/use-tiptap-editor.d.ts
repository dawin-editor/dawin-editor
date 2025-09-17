import type { Editor } from "@tiptap/react";
/**
 * Hook that provides access to a Tiptap editor instance.
 *
 * Accepts an optional editor instance directly, or falls back to retrieving
 * the editor from the Tiptap context if available. This allows components
 * to work both when given an editor directly and when used within a Tiptap
 * editor context.
 *
 * @param providedEditor - Optional editor instance to use instead of the context editor
 * @returns The provided editor or the editor from context, whichever is available
 */
export declare function useTiptapEditor(providedEditor?: Editor | null): {
    editor: Editor | null;
    editorState?: Editor["state"];
    canCommand?: Editor["can"];
};
//# sourceMappingURL=use-tiptap-editor.d.ts.map