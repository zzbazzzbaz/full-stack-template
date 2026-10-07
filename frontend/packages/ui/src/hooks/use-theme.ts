import { useSyncExternalStore } from "react";

const STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribe(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

/** 主题是纯客户端 UI 状态：light/dark 存在 localStorage，class 挂在 <html> 上。 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "light" as Theme);

  const setTheme = (next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem(STORAGE_KEY, next);
  };

  return { theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}
