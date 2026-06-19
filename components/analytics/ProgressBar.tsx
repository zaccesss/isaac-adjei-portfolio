// Thin labelled progress bar, shared by anything that needs a "X of Y" or percentage
// indicator (goal progress, habit compliance, funnel stage fill).
export function ProgressBar({
  value,
  max = 100,
  label,
  colorClassName = "bg-primary",
}: {
  value: number
  max?: number
  label?: string
  colorClassName?: string
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>}
      <div className="flex-1 bg-muted rounded-full h-1.5">
        <div
          className={`${colorClassName} h-1.5 rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold w-10 text-right tabular-nums">{pct}%</span>
    </div>
  )
}
