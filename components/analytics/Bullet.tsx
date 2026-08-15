"use client"

// A bullet chart: a single horizontal bar for the actual value against a target marker line.
// Uses STATUS_COLOURS-style on-target/behind semantics rather than a new palette, since "did I
// hit the target" is a status, not a category.
export function Bullet({
  label,
  value,
  target,
  max,
  valueFormatter,
}: {
  label: string
  value: number
  target: number
  // Scale ceiling. Defaults to the larger of value/target with 10% headroom.
  max?: number
  valueFormatter?: (value: number) => string
}) {
  const ceiling = max ?? (Math.max(value, target) * 1.1 || 1)
  const valuePct = Math.min((value / ceiling) * 100, 100)
  const targetPct = Math.min((target / ceiling) * 100, 100)
  const onTarget = value >= target
  const format = valueFormatter ?? ((v: number) => String(v))

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {format(value)} <span className="text-muted-foreground/60">/ {format(target)} target</span>
        </span>
      </div>
      <div className="relative h-4 rounded-sm bg-muted/40" title={`${label}: ${format(value)}, ${onTarget ? "on target" : "behind target"} (target ${format(target)})`}>
        <div
          className="h-full rounded-sm"
          style={{ width: `${valuePct}%`, backgroundColor: onTarget ? "#22c55e" : "#f59e0b" }}
        />
        <div
          className="absolute top-[-2px] h-[calc(100%+4px)] w-[2px] bg-foreground"
          style={{ left: `${targetPct}%` }}
          title={`Target: ${format(target)}`}
        />
      </div>
    </div>
  )
}
