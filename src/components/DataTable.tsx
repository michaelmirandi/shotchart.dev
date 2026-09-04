import type { ReactNode } from "react";

export interface Column<Row> {
  key: keyof Row & string;
  header: string;
  align?: "left" | "right";
  /** Render the cell in monospace (codes, numbers, formulas). */
  mono?: boolean;
  nowrap?: boolean;
  render?: (row: Row) => ReactNode;
}

interface Props<Row> {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row, index: number) => string;
  /** Keep the header visible inside a scrolling container. */
  stickyHeader?: boolean;
  /** Omit the outer border/radius (when the table sits inside another frame). */
  bare?: boolean;
  className?: string;
}

/** The one table style used everywhere on the site. */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  stickyHeader = false,
  bare = false,
  className = "",
}: Props<Row>) {
  const frame = bare ? "" : "rounded-lg border border-line";
  return (
    <div className={`overflow-x-auto ${frame} ${className}`}>
      <table className="w-full text-sm">
        <thead className={stickyHeader ? "sticky top-0 bg-canvas-subtle" : undefined}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`whitespace-nowrap border-b border-line px-3 py-2 text-xs font-medium text-fg-muted ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:last-child>td]:border-b-0">
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`border-b border-line px-3 py-2 align-top ${
                    col.mono ? "font-mono text-[13px]" : ""
                  } ${col.nowrap ? "whitespace-nowrap" : ""} ${
                    col.align === "right" ? "text-right" : ""
                  }`}
                >
                  {col.render ? col.render(row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
