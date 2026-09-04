import type { ReactNode } from "react";

interface DemoProps {
  children: ReactNode;
  /** Controls rendered in a footer strip under the chart. */
  controls?: ReactNode;
}

/** The frame every live chart sits in. */
export function Demo({ children, controls }: DemoProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-canvas-subtle">
      <div className="p-6">{children}</div>
      {controls && (
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3 border-t border-line px-4 py-3">
          {controls}
        </div>
      )}
    </div>
  );
}

interface ControlProps {
  label: string;
  children: ReactNode;
}

/** A labeled control inside a `Demo` footer. */
export function Control({ label, children }: ControlProps) {
  return (
    <div className="space-y-1.5">
      <p className="font-mono text-[11px] text-fg-muted">{label}</p>
      {children}
    </div>
  );
}
