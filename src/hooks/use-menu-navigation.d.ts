import * as React from "react";
import type { Editor } from "@tiptap/react";
type Orientation = "horizontal" | "vertical" | "both";
interface MenuNavigationOptions<T> {
    /**
     * The Tiptap editor instance, if using with a Tiptap editor.
     */
    editor?: Editor | null;
    /**
     * Reference to the container element for handling keyboard events.
     */
    containerRef?: React.RefObject<HTMLElement | null>;
    /**
     * Search query that affects the selected item.
     */
    query?: string;
    /**
     * Array of items to navigate through.
     */
    items: T[];
    /**
     * Callback fired when an item is selected.
     */
    onSelect?: (item: T) => void;
    /**
     * Callback fired when the menu should close.
     */
    onClose?: () => void;
    /**
     * The navigation orientation of the menu.
     * @default "vertical"
     */
    orientation?: Orientation;
    /**
     * Whether to automatically select the first item when the menu opens.
     * @default true
     */
    autoSelectFirstItem?: boolean;
}
/**
 * Hook that implements keyboard navigation for dropdown menus and command palettes.
 *
 * Handles arrow keys, tab, home/end, enter for selection, and escape to close.
 * Works with both Tiptap editors and regular DOM elements.
 *
 * @param options - Configuration options for the menu navigation
 * @returns Object containing the selected index and a setter function
 */
export declare function useMenuNavigation<T>({ editor, containerRef, query, items, onSelect, onClose, orientation, autoSelectFirstItem, }: MenuNavigationOptions<T>): {
    selectedIndex: number | undefined;
    setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
};
export {};
//# sourceMappingURL=use-menu-navigation.d.ts.map