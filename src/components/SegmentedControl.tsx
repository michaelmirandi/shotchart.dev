interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
}

/** A bordered group of toggle buttons, one pressed at a time. No motion beyond a color transition. */
export function SegmentedControl<T extends string>({ value, onChange, options }: Props<T>) {
  return (
    <div className="inline-flex flex-wrap gap-0.5 rounded-md border border-line bg-canvas-subtle p-0.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-[5px] px-2.5 py-1 text-xs font-medium transition-colors ${
              active
                ? "bg-canvas text-fg shadow-[0_0_0_1px_var(--line-strong)]"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
