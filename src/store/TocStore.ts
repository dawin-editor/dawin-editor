import { create } from "zustand";
import type { TableOfContentDataItem } from "@tiptap/extension-table-of-contents";

interface TocState {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    anchors: TableOfContentDataItem[];
    setAnchors: (anchors: TableOfContentDataItem[]) => void;
}

export const useTocStore = create<TocState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  anchors: [],
  setAnchors: (anchors) => set({ anchors }),
}));


