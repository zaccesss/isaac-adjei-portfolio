import { ArrowUp, ArrowDown, Minus } from "lucide-react"

// Small up/down/flat arrow with a percentage or absolute delta, used inside StatCard and
// anywhere else a section wants to show "+12% vs last period" style context.
export function TrendIndicator({ delta, label }: { delta: number; label?: string }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        {label ?? "0%"}
      </span>
    )
  }
  const positive = delta > 0
  const Icon = positive ? ArrowUp : ArrowDown
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        positive ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
      }`}
    >
      <Icon className="h-3 w-3" />
      {label ?? `${Math.abs(delta)}%`}
    </span>
  )
}
