import { create } from "zustand";

interface TitleState {
  title: string;
  setTitle: (title: string) => void;
}

export const useTitleStore = create<TitleState>((set) => ({
  title: "",
  setTitle: (title) => set({ title }),
}));


// {anchors.map((anchor) => (
//   <div
//     key={anchor.id}
//     style={{ paddingLeft: `${anchor.level * 16}px` }}
//     className={anchor.isActive ? "active" : ""}
//     onClick={() => {
//       // Scroll to heading
//       const element = document.getElementById(anchor.id);
//       if (element) {
//         element.scrollIntoView({ behavior: "smooth", block: "start" });
//       }
//     }}
//   >
//     {anchor.textContent}
//   </div>
// ))}