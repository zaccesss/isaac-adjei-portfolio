"use client"

// Thin recharts wrappers themed from the existing dashboard convention (hsl(var(--border))
// gridlines, hsl(var(--primary)) default series colour, hsl(var(--muted)) tooltip cursor) -
// see CodingClient.tsx for the pattern this mirrors. Sections migrating onto the shared
// analytics framework (Coding, Blog, Modules, Applications) use these instead of importing
// recharts primitives directly, so chart styling stays consistent in one place.

import * as React from "react"
import {
  LineChart as RLineChart, Line, BarChart as RBarChart, Bar,
  PieChart as RPieChart, Pie, Cell, Sector,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"

export const DEFAULT_CHART_COLOURS = [
  "hsl(var(--primary))",
  "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#ec4899", "#14b8a6",
]

type ChartDatum = Record<string, string | number>

// Themed tooltip matching the dashboard card/border tokens
function ThemedTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean
  payload?: { name: string; value: number; color?: string }[]
  label?: string
  valueFormatter?: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
      {label && <p className="mb-1.5 font-medium text-foreground">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-1.5 py-0.5">
          {p.color && (
            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
          )}
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">
            {valueFormatter && typeof p.value === "number" ? valueFormatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function LineChart({
  data,
  dataKey,
  xKey = "name",
  height = 160,
  colour = "hsl(var(--primary))",
  valueFormatter,
  dots = false,
}: {
  data: ChartDatum[]
  dataKey: string
  xKey?: string
  height?: number
  colour?: string
  valueFormatter?: (value: number) => string
  // Show a marker at every data point. Helps when there are only a few points so each one is
  // visible rather than reading as a bare line. The dots do not force every x label to render:
  // labels always preserve the first and last and thin the middle to a readable gap, so a dense
  // series (e.g. many activities) no longer crowds its labels into an unreadable strip.
  dots?: boolean
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RLineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={dots ? 22 : 5} />
        <YAxis hide />
        <Tooltip
          content={({ active, payload, label }) => (
            <ThemedTooltip
              active={active}
              payload={payload?.map((p) => ({ name: String(p.name ?? dataKey), value: Number(p.value ?? 0), color: colour }))}
              label={String(label ?? "")}
              valueFormatter={valueFormatter}
            />
          )}
          cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
        />
        <Line type="monotone" dataKey={dataKey} stroke={colour} strokeWidth={2} dot={dots ? { r: 3, fill: colour, strokeWidth: 0 } : false} activeDot={{ r: 4, strokeWidth: 0 }} />
      </RLineChart>
    </ResponsiveContainer>
  )
}

export function BarChart({
  data,
  dataKey,
  xKey = "name",
  height = 160,
  colour = "hsl(var(--primary))",
  colours = DEFAULT_CHART_COLOURS,
  valueFormatter,
  interval = "preserveStartEnd",
  legend = false,
  name,
}: {
  data: ChartDatum[]
  dataKey: string
  xKey?: string
  height?: number
  colour?: string
  // Palette used when `legend` is on, so each category bar matches its slice in the paired pie.
  colours?: string[]
  valueFormatter?: (value: number) => string
  // XAxis tick strategy. Defaults to preserveStartEnd so the first and last category labels
  // always render; recharts' own default is preserveEnd, which silently drops the leading ones.
  interval?: number | "preserveStart" | "preserveEnd" | "preserveStartEnd"
  // Colour each bar by category and show a matching legend, so a single-series bar reads like
  // the donut it sits next to. Off by default so the plain single-colour bars stay unchanged.
  legend?: boolean
  // Series label shown in the tooltip (falls back to the data key).
  name?: string
}) {
  return (
    <>
      <ResponsiveContainer width="100%" height={height}>
        <RBarChart data={data} barSize={legend ? undefined : 6} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={interval} />
          <YAxis hide />
          <Tooltip
            content={({ active, payload, label }) => (
              <ThemedTooltip
                active={active}
                payload={payload?.map((p, i) => ({ name: String(name ?? p.name ?? dataKey), value: Number(p.value ?? 0), color: legend ? colours[i % colours.length] : colour }))}
                label={String(label ?? "")}
                valueFormatter={valueFormatter}
              />
            )}
            cursor={{ fill: "hsl(var(--muted))", radius: 3 }}
          />
          <Bar dataKey={dataKey} fill={colour} radius={[3, 3, 0, 0]}>
            {legend && data.map((d, i) => <Cell key={String(d[xKey])} fill={colours[i % colours.length]} />)}
          </Bar>
        </RBarChart>
      </ResponsiveContainer>
      {/* When legend is on the bars are per-category colours, so a swatch list matching the
          neighbouring donut labels them the same way the pie's legend does. */}
      {legend && (
        <ul className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {data.map((d, i) => (
            <li key={String(d[xKey])} className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: colours[i % colours.length] }} />
              {String(d[xKey])}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

// Active slice shape - expands the hovered segment outward by 6px.
// Spread as `any` below because recharts v3 types do not declare activeIndex/activeShape
// on <Pie> even though both work at runtime.
// eslint-disable @typescript-eslint/no-explicit-any
function ActiveSlice(props: any) {
  return <Sector {...props} outerRadius={props.outerRadius + 6} />
}
type PieActiveProps = any
// eslint-enable @typescript-eslint/no-explicit-any

export function PieChart({
  data,
  height = 200,
  colours = DEFAULT_CHART_COLOURS,
  valueFormatter,
}: {
  data: { name: string; value: number; colour?: string }[]
  height?: number
  colours?: string[]
  valueFormatter?: (value: number) => string
}) {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RPieChart>
        <Pie
          {...({ activeIndex, activeShape: ActiveSlice } as PieActiveProps)}
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={2}
          onMouseEnter={(_: unknown, index: number) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(undefined)}
        >
          {data.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={entry.colour ?? colours[i % colours.length]}
              opacity={activeIndex === undefined || activeIndex === i ? 1 : 0.45}
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => (
            <ThemedTooltip
              active={active}
              payload={payload?.map((p, i) => ({
                name: String(p.name ?? ""),
                value: Number(p.value ?? 0),
                color: (p.payload as { colour?: string })?.colour ?? colours[i % colours.length],
              }))}
              valueFormatter={valueFormatter}
            />
          )}
        />
        <Legend
          wrapperStyle={{ fontSize: "11px" }}
          formatter={(value) => <span style={{ color: "hsl(var(--muted-foreground))" }}>{value}</span>}
        />
      </RPieChart>
    </ResponsiveContainer>
  )
}
