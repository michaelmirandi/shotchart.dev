import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "shotchart-theme";
const CHANGE_EVENT = "shotchart-theme-change";
const QUERY = "(prefers-color-scheme: dark)";

function readStored(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

/** Explicit choice if there is one, otherwise the system preference. */
export function resolveTheme(): Theme {
  return readStored() ?? (window.matchMedia(QUERY).matches ? "dark" : "light");
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode etc. — still apply for this session.
  }
  applyTheme(theme);
}

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  const onMedia = () => {
    // Only follow the OS while the user hasn't picked explicitly.
    if (!readStored()) applyTheme(resolveTheme());
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  media.addEventListener("change", onMedia);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    media.removeEventListener("change", onMedia);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

/** The active theme (as applied to `<html>`) and a toggle. */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme]);
  return { theme, toggle };
}
