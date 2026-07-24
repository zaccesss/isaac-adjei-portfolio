"use client"

// A genuine 24-hour clock face read of "plays by hour" - hour 0 at the top, running clockwise like
// a real clock, bar length from the centre encoding activity - rather than the plain linear 24-bar
// chart every "listening clock" on the site used until now. ECharts' polar coordinate system is the
// right tool for this specifically (a true clock-face layout, not just another bar chart), which is
// why this is ECharts rather than joining the Recharts wrappers in charts.tsx.

import ReactECharts from "echarts-for-react"
import { useEChartsColours } from "./echarts-theme"

const HOUR_LABELS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"))

interface RadialClockProps {
  hours: number[] // 24 values, index 0 = midnight
  height?: number
  valueLabel?: string
  valueFormatter?: (value: number) => string
  colour?: string
}

export function RadialClock({ hours, height = 260, valueLabel = "", valueFormatter, colour }: RadialClockProps) {
  const colours = useEChartsColours()
  const barColour = colour ?? colours.primary
  const safeHours = Array.from({ length: 24 }, (_, h) => {
    const v = hours[h]
    return Number.isFinite(v) ? v : 0
  })
  const max = Math.max(...safeHours, 1)

  const option = {
    polar: { radius: ["15%", "80%"] },
    angleAxis: {
      type: "category",
      data: HOUR_LABELS,
      // startAngle 90 + clockwise puts index 0 (midnight) at 12 o'clock, running clockwise like a
      // real clock face - ECharts' own default (0deg, counter-clockwise) would put it at 3 o'clock
      // running backwards, which reads nothing like a clock.
      startAngle: 90,
      clockwise: true,
      axisLine: { lineStyle: { color: colours.border } },
      axisLabel: { color: colours.mutedForeground, fontSize: 9, interval: 1 },
      splitLine: { show: false },
    },
    radiusAxis: {
      type: "value",
      max,
      axisLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: colours.border, type: "dashed" } },
    },
    tooltip: {
      trigger: "item",
      backgroundColor: colours.card,
      borderColor: colours.border,
      textStyle: { color: colours.foreground, fontSize: 11 },
      formatter: (p: { name: string; value: number }) => {
        const formatted = valueFormatter ? valueFormatter(p.value) : p.value.toLocaleString()
        return `${p.name}:00<br/>${formatted}${valueLabel ? ` ${valueLabel}` : ""}`
      },
    },
    series: [
      {
        type: "bar",
        coordinateSystem: "polar",
        data: safeHours,
        itemStyle: { color: barColour },
        roundCap: true,
      },
    ],
  }

  return <ReactECharts option={option} style={{ height, width: "100%" }} opts={{ renderer: "svg" }} notMerge />
}
