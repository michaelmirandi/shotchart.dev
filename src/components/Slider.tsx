interface Props {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  /** Readout suffix, e.g. `"ft"`. */
  unit?: string;
  label: string;
}

/** A compact range input with its current value beside it. */
export function Slider({ value, onChange, min, max, step, unit, label }: Props) {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-28 accent-current"
      />
      <span className="w-14 font-mono text-[11px] text-fg-muted tabular-nums">
        {value.toFixed(decimals)}
        {unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
}
