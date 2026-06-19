// Small stat box: label + big number, optionally with a trend indicator. Replaces the
// hand-rolled "border rounded-lg p-4 bg-card" pattern duplicated across CodingClient,
// ApplicationsAnalytics and the dashboard home page.

import { TrendIndicator } from "./TrendIndicator"

export function StatCard({
  label,
  value,
  trend,
  accentClassName,
}: {
  label: string
  value: string | number
  trend?: { delta: number; label?: string }
  accentClassName?: string
}) {
  return (
    <div className={`border border-border rounded-lg p-4 bg-card ${accentClassName ?? ""}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-bold">{value}</p>
        {trend && <TrendIndicator delta={trend.delta} label={trend.label} />}
      </div>
    </div>
  )
}
