import type { ReactNode } from "react";
import type { ZoneData } from "shotchart.d3.ts";
import { CodeBlock } from "./CodeBlock";
import { type Column, DataTable } from "./DataTable";

interface Props {
  data: ZoneData[];
}

const COLUMNS: Column<ZoneData>[] = [
  { key: "bucket", header: "bucket", mono: true, nowrap: true },
  { key: "fgm", header: "fgm", mono: true, align: "right" },
  { key: "fga", header: "fga", mono: true, align: "right" },
  { key: "percentile", header: "percentile", mono: true, align: "right" },
];

/** The live zoned dataset as a table and as JSON, side by side. */
export function ZoneDataInspector({ data }: Props) {
  const json = JSON.stringify(data, null, 2);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Table" meta={`${data.length} ${data.length === 1 ? "zone" : "zones"}`}>
        <div className="max-h-[420px] overflow-auto">
          <DataTable columns={COLUMNS} rows={data} rowKey={(r) => r.bucket} stickyHeader bare />
        </div>
      </Panel>

      <Panel title="JSON">
        <div className="max-h-[420px] overflow-auto">
          <CodeBlock code={json} lang="json" bare />
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="flex items-center justify-between border-b border-line bg-canvas-subtle px-4 py-2">
        <p className="text-xs font-medium text-fg-muted">{title}</p>
        {meta && <p className="font-mono text-[11px] text-fg-muted">{meta}</p>}
      </div>
      {children}
    </div>
  );
}
