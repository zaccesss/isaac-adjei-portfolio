"use client"

// ECharts renders to canvas, so it cannot read CSS custom properties the way the Recharts
// wrappers do (hsl(var(--border)) resolves fine as an SVG/DOM style attribute, not inside a
// canvas draw call). This resolves the live computed value of each design token into a real
// hsl(...) string and re-reads it whenever the theme changes, so globals.css stays the one
// source of truth instead of duplicating the palette here.

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export interface EChartsColours {
  border: string
  primary: string
  muted: string
  mutedForeground: string
  foreground: string
  background: string
  card: string
}

const VARS: Record<keyof EChartsColours, string> = {
  border: "--border",
  primary: "--primary",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  foreground: "--foreground",
  background: "--background",
  card: "--card",
}

const FALLBACK: EChartsColours = {
  border: "hsl(214.3 31.8% 91.4%)",
  primary: "hsl(225 65% 40%)",
  muted: "hsl(210 40% 96.1%)",
  mutedForeground: "hsl(215.4 16.3% 46.9%)",
  foreground: "hsl(222.2 84% 4.9%)",
  background: "hsl(0 0% 100%)",
  card: "hsl(0 0% 100%)",
}

export function useEChartsColours(): EChartsColours {
  const { resolvedTheme } = useTheme()
  const [colours, setColours] = useState<EChartsColours>(FALLBACK)

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement)
    const next = {} as EChartsColours
    for (const key of Object.keys(VARS) as (keyof EChartsColours)[]) {
      const raw = styles.getPropertyValue(VARS[key]).trim()
      next[key] = raw ? `hsl(${raw})` : FALLBACK[key]
    }
    // getComputedStyle only reflects reality once the theme class has painted, so this reads an
    // external system (the DOM) rather than deriving from React state - the sanctioned case for
    // an effect-driven setState, just not one the lint rule can tell apart from a render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColours(next)
  }, [resolvedTheme])

  return colours
}

// A primary-tinted low-to-high intensity scale, matching the muted -> primary progression the
// existing hand-rolled heatmaps used (bg-muted through bg-primary at 5 steps). The zero stop uses
// `border` rather than `muted`: in dark mode muted (15% lightness) sits too close to the
// surrounding card (10%) to read as a visible "no activity" cell, where border (18%) stays
// distinguishable in both themes - the same token every card outline already relies on for that.
export function intensityScale(colours: EChartsColours): string[] {
  return [colours.border, "#93c5fd", "#60a5fa", "#3b82f6", colours.primary]
}

// Buckets a raw value into a 0-4 intensity level relative to the data's own max, exactly matching
// the percentage thresholds the old hand-rolled heatmaps used (relativeIntensity/intensityIndex).
// This is deliberately NOT a plain linear min-max scale: heatmap activity is typically dominated by
// a handful of outlier hours/days (one marathon coding session, one viral post), and interpolating
// colour linearly between 0 and that single outlier compresses almost every other real value into
// the bottom sliver of the range - everything reads as "basically zero" except the one peak cell.
// Bucketing by percentage-of-max keeps genuinely active cells visually distinct from empty ones
// regardless of how extreme the single busiest cell is.
export function relativeLevel(value: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (value <= 0 || max <= 0) return 0
  const ratio = value / max
  if (ratio < 0.15) return 1
  if (ratio < 0.35) return 2
  if (ratio < 0.65) return 3
  return 4
}
