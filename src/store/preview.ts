// stores/useEditorStore.ts
import { create } from "zustand";

interface PreviewState {
  preview: boolean;
  setPreview: (preview: boolean) => void;
}

export const usePreviewStore = create<PreviewState>((set) => ({
  preview: false,
  setPreview: () => set((state) => ({ preview: !state.preview })),
}));
