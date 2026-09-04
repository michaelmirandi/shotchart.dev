import { useEffect, useState } from "react";
import {
  FRAMEWORK_LABELS,
  FRAMEWORK_SHIKI_LANG,
  FRAMEWORKS,
  type Framework,
} from "../lib/code-templates";
import { CodeBlock } from "./CodeBlock";
import { SegmentedControl } from "./SegmentedControl";

const STORAGE_KEY = "shotchart-docs-framework";
const CHANGE_EVENT = "shotchart-framework-change";

const OPTIONS = FRAMEWORKS.map((fw) => ({ value: fw, label: FRAMEWORK_LABELS[fw] }));

function getInitial(): Framework {
  if (typeof window === "undefined") return "react";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Framework | null;
    if (stored && FRAMEWORKS.includes(stored)) return stored;
  } catch {
    // ignore
  }
  return "react";
}

interface Props {
  examples: Record<Framework, string>;
}

export function FrameworkTabs({ examples }: Props) {
  const [active, setActive] = useState<Framework>(getInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, active);
    } catch {
      // ignore
    }
  }, [active]);

  // Every FrameworkTabs on the page follows the same choice.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue && FRAMEWORKS.includes(e.newValue as Framework)) {
        setActive(e.newValue as Framework);
      }
    }
    function onCustom(e: Event) {
      const next = (e as CustomEvent<Framework>).detail;
      if (next && FRAMEWORKS.includes(next)) setActive(next);
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(CHANGE_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CHANGE_EVENT, onCustom);
    };
  }, []);

  function pick(fw: Framework) {
    setActive(fw);
    window.dispatchEvent(new CustomEvent<Framework>(CHANGE_EVENT, { detail: fw }));
  }

  return (
    <div className="space-y-3">
      <SegmentedControl value={active} onChange={pick} options={OPTIONS} />
      <CodeBlock code={examples[active]} lang={FRAMEWORK_SHIKI_LANG[active]} />
    </div>
  );
}
