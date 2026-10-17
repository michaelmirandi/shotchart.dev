interface Props {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

/** A native color picker shown as a swatch plus its hex value. */
export function ColorSwatch({ value, onChange, label }: Props) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-line bg-canvas-subtle py-0.5 pr-2.5 pl-0.5">
      <input
        type="color"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="size-6 cursor-pointer rounded-[5px] border-0 bg-transparent p-0"
      />
      <span className="font-mono text-[11px] text-fg-muted">{value}</span>
    </label>
  );
}
