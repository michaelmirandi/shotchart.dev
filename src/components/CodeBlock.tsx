import { useEffect, useRef, useState } from "react";
import { getShikiHighlighter, SHIKI_THEMES } from "../lib/shiki";

interface Props {
  code: string;
  lang: string;
  /** Omit the outer border/radius/background (when nested in another frame). */
  bare?: boolean;
  className?: string;
}

// Safe to use dangerouslySetInnerHTML: `code` only ever comes from
// hard-coded template strings in src/lib/code-templates.ts, never user input.
export function CodeBlock({ code, lang, bare = false, className = "" }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getShikiHighlighter().then((hl) => {
      if (cancelled) return;
      try {
        setHtml(hl.codeToHtml(code, { lang, themes: SHIKI_THEMES, defaultColor: false }));
      } catch {
        setHtml(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context) — silently ignore.
    }
  }

  const frame = bare ? "" : "rounded-lg border border-line bg-canvas-subtle";

  return (
    <div
      className={`group relative overflow-hidden text-[13px] leading-relaxed ${frame} ${className}`}
    >
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className="absolute right-2 top-2 rounded-md border border-line bg-canvas px-2 py-1 font-mono text-[11px] text-fg-muted opacity-0 transition-opacity hover:text-fg focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      {html ? (
        <div
          className="shiki-wrapper"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output, code is hard-coded
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="shiki-wrapper m-0 overflow-x-auto px-5 py-4 font-mono">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
