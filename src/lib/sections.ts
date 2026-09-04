export interface NavItem {
  id: string;
  label: string;
  children?: NavItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Sidebar structure. Section ids must match the `id`s rendered by the page. */
export const NAV: NavGroup[] = [
  {
    label: "Getting started",
    items: [
      { id: "overview", label: "Overview" },
      { id: "installation", label: "Installation" },
    ],
  },
  {
    label: "Courts",
    items: [
      { id: "halfcourt", label: "Halfcourt" },
      { id: "fullcourt", label: "Fullcourt" },
      { id: "floor", label: "Court floor" },
      { id: "coordinates", label: "Coordinates & dimensions" },
    ],
  },
  {
    label: "Shots",
    items: [
      { id: "shot-data", label: "Shot data" },
      { id: "shot-scatter", label: "Individual" },
      {
        id: "zoned-shotchart",
        label: "Buckets",
        children: [
          { id: "zone-data", label: "ZoneData shape" },
          { id: "zone-codes", label: "Zone codes" },
        ],
      },
      { id: "hexbin", label: "Hexbin" },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "api-reference", label: "API reference" },
      { id: "resources", label: "Resources" },
    ],
  },
];

/** Every section id in page order (parents before their children). */
export function flattenNav(groups: NavGroup[]): NavItem[] {
  const out: NavItem[] = [];
  const walk = (items: NavItem[]) => {
    for (const item of items) {
      out.push({ id: item.id, label: item.label });
      if (item.children) walk(item.children);
    }
  };
  for (const group of groups) walk(group.items);
  return out;
}

/** True if `id` is `item` or one of its descendants. */
export function navContains(item: NavItem, id: string): boolean {
  if (item.id === id) return true;
  return item.children?.some((child) => navContains(child, id)) ?? false;
}
