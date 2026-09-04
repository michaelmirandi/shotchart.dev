import type { Highlighter } from "shiki";

/** Both palettes are loaded; CSS picks one via `--shiki-light` / `--shiki-dark`. */
export const SHIKI_THEMES = { light: "github-light", dark: "github-dark" } as const;

let promise: Promise<Highlighter> | null = null;

export function getShikiHighlighter() {
  promise ??= import("shiki").then(({ createHighlighter }) =>
    createHighlighter({
      themes: [SHIKI_THEMES.light, SHIKI_THEMES.dark],
      langs: ["typescript", "tsx", "vue", "svelte", "bash", "json"],
    }),
  );
  return promise;
}
