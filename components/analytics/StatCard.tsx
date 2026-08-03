// Small stat box: label + big number, optionally with a trend indicator. Replaces the
// hand-rolled "border rounded-lg p-4 bg-card" pattern duplicated across CodingClient,
// ApplicationsAnalytics and the dashboard home page.

import { TrendIndicator } from "./TrendIndicator"

export function StatCard({
  label,
  value,
  trend,
  accentClassName,
  scope,
}: {
  label: string
  value: string | number
  trend?: { delta: number; label?: string }
  accentClassName?: string
  // Marks a card that does NOT follow the page's period selector - a wording choice like "Current
  // weight" or "Total habits" was the only signal before this, easy to miss beside cards that DO
  // move with the selector in the same grid. A small badge is a real visual distinguisher instead
  // of relying on every page remembering the right words.
  scope?: "all-time" | "current"
}) {
  return (
    <div className={`border border-border rounded-lg p-4 bg-card ${accentClassName ?? ""}`}>
      <div className="flex items-center gap-1.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        {scope && (
          <span className="text-[9px] uppercase tracking-wide text-muted-foreground/70 border border-border/50 rounded px-1 leading-tight">
            {scope}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-bold">{value}</p>
        {trend && <TrendIndicator delta={trend.delta} label={trend.label} />}
      </div>
    </div>
  )
}
