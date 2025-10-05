import { create } from "zustand";

interface TitleState {
  title: string;
  setTitle: (title: string) => void;
}

export const useTitleStore = create<TitleState>((set) => ({
  title: "مستند بدون عنوان",
  setTitle: (title) => set({ title }),
}));
