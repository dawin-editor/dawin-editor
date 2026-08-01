import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "dawin-theme";

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") return getSystemPreference();
  return theme;
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  updateThemeColor(resolved);
}

function updateThemeColor(resolved: "light" | "dark") {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute(
      "content",
      resolved === "dark" ? "#0d1117" : "#2368A1"
    );
  }
}

function listenForSystemChanges(onChange: () => void) {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export const useThemeStore = create<ThemeState>((set) => {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  const initial: Theme = stored ?? "system";
  const initialResolved = resolveTheme(initial);
  applyTheme(initialResolved);

  let unsubscribeSystem: (() => void) | null = null;

  if (typeof window !== "undefined" && initial === "system") {
    unsubscribeSystem = listenForSystemChanges(() => {
      const resolved = resolveTheme("system");
      applyTheme(resolved);
      set({ resolved });
    });
  }

  return {
    theme: initial,
    resolved: initialResolved,
    setTheme: (theme: Theme) => {
      // Always drop the previous system listener: a stale listener would
      // keep flipping the resolved theme even after the user explicitly
      // chose light/dark.
      unsubscribeSystem?.();
      unsubscribeSystem = null;

      localStorage.setItem(STORAGE_KEY, theme);
      const resolved = resolveTheme(theme);
      applyTheme(resolved);
      set({ theme, resolved });

      if (theme === "system") {
        unsubscribeSystem = listenForSystemChanges(() => {
          const r = resolveTheme("system");
          applyTheme(r);
          set({ resolved: r });
        });
      }
    },
  };
});
