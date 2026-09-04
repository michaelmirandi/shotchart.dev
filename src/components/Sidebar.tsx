import { Link } from "@tanstack/react-router";
import libraryPackage from "shotchart.ts/package.json";
import { NAV } from "../lib/sections";
import { DocsToc } from "./DocsToc";
import { ThemeToggle } from "./ThemeToggle";

const GITHUB = "https://github.com/michaelmirandi/shotchart.ts";
const NPM = "https://www.npmjs.com/package/shotchart.ts";

function Wordmark() {
  return (
    <Link to="/" className="text-[15px] font-semibold tracking-tight text-fg">
      shotchart.ts
    </Link>
  );
}

/** Desktop: sticky full-height column with nav, links and the theme toggle. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-line px-5 py-6 lg:flex">
      <div className="flex items-baseline justify-between">
        <Wordmark />
        <span className="font-mono text-[11px] text-fg-muted">v{libraryPackage.version}</span>
      </div>

      <div className="mt-8 flex-1 overflow-y-auto">
        <DocsToc groups={NAV} />
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm">
        <div className="flex gap-4">
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer"
            className="text-fg-muted transition-colors hover:text-fg"
          >
            GitHub
          </a>
          <a
            href={NPM}
            target="_blank"
            rel="noreferrer"
            className="text-fg-muted transition-colors hover:text-fg"
          >
            npm
          </a>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}

/** Mobile: slim sticky top bar. The section nav is hidden below `lg`. */
export function MobileBar() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-canvas/90 px-5 py-3 backdrop-blur-sm lg:hidden">
      <Wordmark />
      <div className="flex items-center gap-4 text-sm">
        <a
          href={GITHUB}
          target="_blank"
          rel="noreferrer"
          className="text-fg-muted transition-colors hover:text-fg"
        >
          GitHub
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
