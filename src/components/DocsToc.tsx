import { type MouseEvent, useEffect, useMemo, useState } from "react";
import { flattenNav, type NavGroup, type NavItem, navContains } from "../lib/sections";

interface Props {
  groups: NavGroup[];
}

/** Scroll offset in px — clears the mobile top bar and gives sections breathing room. */
export const SCROLL_OFFSET = 64;

function jump(e: MouseEvent<HTMLAnchorElement>, id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
  history.replaceState(null, "", `#${id}`);
}

/** Grouped, always-expanded section nav with scroll-spy. */
export function DocsToc({ groups }: Props) {
  const ids = useMemo(() => flattenNav(groups).map((item) => item.id), [groups]);
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    // Sections can nest (a sub-section lives inside its parent's element), so
    // several can intersect at once. Track the set and pick the one that comes
    // last in page order — that is always the innermost / most recent one.
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const current = [...ids].reverse().find((id) => visible.has(id));
        if (current) setActive(current);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  return (
    <nav aria-label="On this page" className="space-y-5">
      {groups.map((group) => {
        const groupActive = group.items.some((item) => navContains(item, active));
        return (
          <div key={group.label}>
            <p
              className={`mb-1.5 text-xs font-medium transition-colors ${
                groupActive ? "text-fg" : "text-fg-muted"
              }`}
            >
              {group.label}
            </p>
            <ul className="border-l border-line">
              {group.items.map((item) => (
                <Item key={item.id} item={item} depth={0} active={active} />
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function Item({ item, depth, active }: { item: NavItem; depth: number; active: string }) {
  const isActive = active === item.id;
  // A parent whose child is active reads as "current" too, just without the marker.
  const holdsActive = !isActive && navContains(item, active);
  const indent = depth === 0 ? "pl-3" : "pl-6";

  return (
    <li>
      <a
        href={`#${item.id}`}
        onClick={(e) => jump(e, item.id)}
        aria-current={isActive ? "location" : undefined}
        className={`-ml-px block border-l py-1 text-sm transition-colors ${indent} ${
          isActive
            ? "border-fg font-medium text-fg"
            : holdsActive
              ? "border-transparent text-fg"
              : "border-transparent text-fg-muted hover:text-fg"
        }`}
      >
        {item.label}
      </a>
      {item.children && (
        <ul>
          {item.children.map((child) => (
            <Item key={child.id} item={child} depth={depth + 1} active={active} />
          ))}
        </ul>
      )}
    </li>
  );
}
