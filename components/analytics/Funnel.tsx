"use client"

// A bespoke funnel - recharts has no native funnel primitive. Shrinking-width horizontal bars,
// one per stage, each sized relative to the first (widest) stage, with the drop-off percentage
// to the next stage labelled underneath. Follows UptimeGrid.tsx's precedent: build a themed
// component by hand when neither recharts nor echarts has the right shape for it.
import { DEFAULT_CHART_COLOURS } from "./charts"

export interface FunnelStage {
  name: string
  value: number
}

export function Funnel({
  stages,
  colours = DEFAULT_CHART_COLOURS,
  valueFormatter,
}: {
  stages: FunnelStage[]
  colours?: string[]
  valueFormatter?: (value: number) => string
}) {
  if (!stages.length || stages[0].value === 0) {
    return <p className="text-xs text-muted-foreground">No data for this period.</p>
  }
  const max = stages[0].value
  const format = valueFormatter ?? ((v: number) => String(v))

  return (
    <div className="flex flex-col gap-2">
      {stages.map((stage, i) => {
        const widthPct = max > 0 ? Math.max((stage.value / max) * 100, stage.value > 0 ? 4 : 0) : 0
        const prev = i > 0 ? stages[i - 1].value : null
        const dropPct = prev && prev > 0 ? Math.round(((prev - stage.value) / prev) * 1000) / 10 : null
        return (
          <div key={stage.name} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{stage.name}</span>
              <span className="text-muted-foreground tabular-nums">{format(stage.value)}</span>
            </div>
            <div className="h-5 rounded-sm bg-muted/40" title={`${stage.name}: ${format(stage.value)}${dropPct !== null && dropPct > 0 ? ` (-${dropPct}% from ${stages[i - 1].name})` : ""}`}>
              <div
                className="h-full rounded-sm transition-[width]"
                style={{ width: `${widthPct}%`, backgroundColor: colours[i % colours.length] }}
              />
            </div>
            {dropPct !== null && dropPct > 0 && (
              <p className="text-[10px] text-muted-foreground">-{dropPct}% from previous stage</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
