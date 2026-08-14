"use client"

// A 0-100 radial gauge for adherence/completion-style percentages (medication, goals, streaks),
// using ECharts' native gauge series - same integration pattern as RadialClock.tsx (theme colours
// resolved live via useEChartsColours since ECharts renders to canvas, not the DOM).
import ReactECharts from "echarts-for-react"
import { useEChartsColours } from "./echarts-theme"

export function Gauge({
  value,
  label,
  height = 180,
  valueFormatter,
}: {
  // 0-100
  value: number
  label?: string
  height?: number
  valueFormatter?: (value: number) => string
}) {
  const colours = useEChartsColours()
  const clamped = Math.max(0, Math.min(100, value))
  const colour = clamped >= 80 ? "#22c55e" : clamped >= 50 ? "#f59e0b" : "#ef4444"

  const band = clamped >= 80 ? "on track (80%+)" : clamped >= 50 ? "getting there (50-79%)" : "needs attention (below 50%)"

  const option = {
    tooltip: {
      show: true,
      trigger: "item",
      backgroundColor: colours.card,
      borderColor: colours.border,
      textStyle: { color: colours.foreground, fontSize: 11 },
      formatter: () => `${label ? `${label}: ` : ""}${valueFormatter ? valueFormatter(clamped) : `${Math.round(clamped)}%`} - ${band}`,
    },
    series: [
      {
        type: "gauge",
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        radius: "90%",
        progress: { show: true, width: 12, itemStyle: { color: colour } },
        axisLine: { lineStyle: { width: 12, color: [[1, colours.muted]] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        anchor: { show: false },
        detail: {
          valueAnimation: true,
          formatter: (v: number) => (valueFormatter ? valueFormatter(v) : `${Math.round(v)}%`),
          color: colours.foreground,
          fontSize: 22,
          fontWeight: 700,
          offsetCenter: [0, "0%"],
        },
        title: { show: !!label, offsetCenter: [0, "70%"], color: colours.mutedForeground, fontSize: 11 },
        data: [{ value: clamped, name: label ?? "" }],
      },
    ],
  }

  return <ReactECharts option={option} style={{ height, width: "100%" }} opts={{ renderer: "svg" }} notMerge />
}
