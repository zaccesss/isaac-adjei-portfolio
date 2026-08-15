"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, BarChart3 } from "lucide-react"
import {
  AnalyticsPeriodProvider,
  PeriodSelector,
  useAnalyticsPeriod,
  periodStartDate,
  StatCard,
  LineChart,
  BarChart,
  PieChart,
  Waterfall,
  type WaterfallStep,
} from "@/components/analytics"

// Monday of the ISO week containing this date, used to bucket weight entries into weekly
// checkpoints for the waterfall below (weight is often logged more than once a week).
function weekStart(dateStr: string): string {
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}

type Weight = { value: number; date: string }
type Nutrition = { date: string; calories: number; protein_g: number | null; carbs_g: number | null; fat_g: number | null }
type Workout = { date: string; type: string; calories: number | null }
type Strava = { sport_type: string | null; calories: number | null; start_date: string | null }

const round1 = (n: number) => Math.round(n * 10) / 10
const fmtDay = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <p className="text-sm font-medium">{title}</p>
      {children}
    </div>
  )
}

const Empty = () => <p className="text-xs text-muted-foreground py-10 text-center">Not enough data yet.</p>

function Inner({ weights, nutrition, workouts, strava }: { weights: Weight[]; nutrition: Nutrition[]; workouts: Workout[]; strava: Strava[] }) {
  const { period } = useAnalyticsPeriod()
  const start = periodStartDate(period)
  const cutoff = start ? start.toISOString().slice(0, 10) : null
  const inP = (d: string | null | undefined) => !cutoff || (!!d && d.slice(0, 10) >= cutoff)

  const w = weights.filter((x) => inP(x.date))
  const n = nutrition.filter((x) => inP(x.date))
  const wo = workouts.filter((x) => inP(x.date))
  const sv = strava.filter((x) => inP(x.start_date))

  const latest = weights[weights.length - 1]?.value ?? null
  const periodFirst = w[0]?.value ?? null
  const change = latest != null && periodFirst != null ? round1(latest - periodFirst) : null

  const calByDay: Record<string, number> = {}
  for (const x of n) calByDay[x.date] = (calByDay[x.date] ?? 0) + (x.calories ?? 0)
  const calDays = Object.keys(calByDay).sort()
  const avgCalIn = calDays.length ? Math.round(calDays.reduce((a, d) => a + calByDay[d], 0) / calDays.length) : 0

  const totalWorkouts = wo.length + sv.length

  const weightSeries = w.map((x) => ({ name: fmtDay(x.date), value: x.value }))

  // Weekly-delta waterfall: last logged weight per ISO week, starting weight as an absolute bar,
  // each week's change as a floating delta, current weight as a final absolute bar.
  const weeklyLast = new Map<string, Weight>()
  for (const x of w) weeklyLast.set(weekStart(x.date), x)
  const weeklyPoints = [...weeklyLast.values()].sort((a, b) => a.date.localeCompare(b.date))
  const weightWaterfall: WaterfallStep[] = []
  if (weeklyPoints.length > 0) {
    weightWaterfall.push({ name: `Start (${fmtDay(weeklyPoints[0].date)})`, delta: weeklyPoints[0].value, isTotal: true })
    for (let i = 1; i < weeklyPoints.length; i++) {
      weightWaterfall.push({ name: fmtDay(weeklyPoints[i].date), delta: round1(weeklyPoints[i].value - weeklyPoints[i - 1].value) })
    }
    if (weeklyPoints.length > 1) {
      weightWaterfall.push({ name: "Current", delta: weeklyPoints[weeklyPoints.length - 1].value, isTotal: true })
    }
  }
  const calSeries = calDays.map((d) => ({ name: fmtDay(d), value: calByDay[d] }))

  const typeAgg: Record<string, number> = {}
  for (const x of wo) typeAgg[x.type] = (typeAgg[x.type] ?? 0) + 1
  for (const x of sv) {
    const t = x.sport_type ?? "activity"
    typeAgg[t] = (typeAgg[t] ?? 0) + 1
  }
  const workoutPie = Object.entries(typeAgg)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  const macroDays: Record<string, { p: number; c: number; f: number }> = {}
  for (const x of n) {
    if (x.protein_g == null && x.carbs_g == null && x.fat_g == null) continue
    const m = macroDays[x.date] ?? { p: 0, c: 0, f: 0 }
    m.p += x.protein_g ?? 0
    m.c += x.carbs_g ?? 0
    m.f += x.fat_g ?? 0
    macroDays[x.date] = m
  }
  const mDays = Object.values(macroDays)
  const macroPie =
    mDays.length > 0
      ? [
          { name: "Protein", value: Math.round(mDays.reduce((a, m) => a + m.p, 0) / mDays.length) },
          { name: "Carbs", value: Math.round(mDays.reduce((a, m) => a + m.c, 0) / mDays.length) },
          { name: "Fat", value: Math.round(mDays.reduce((a, m) => a + m.f, 0) / mDays.length) },
        ].filter((x) => x.value > 0)
      : []

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/health/weight-loss" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" /> Weight-loss analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Weight, calories and training over time</p>
          </div>
        </div>
        <PeriodSelector />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Current weight" value={latest != null ? `${latest} kg` : "-"} scope="current" sparkline={weightSeries.map((w) => w.value)} />
        <StatCard
          label="Change in period"
          value={change != null ? `${change > 0 ? "+" : ""}${change} kg` : "-"}
          accentClassName={change != null && change < 0 ? "border-green-500/30" : undefined}
        />
        <StatCard label="Avg calories in" value={avgCalIn || "-"} />
        <StatCard label="Workouts" value={totalWorkouts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Weight trend">
          {weightSeries.length > 0 ? (
            <LineChart data={weightSeries} dataKey="value" colour="#10b981" valueFormatter={(v) => `${v} kg`} dots />
          ) : (
            <Empty />
          )}
        </ChartCard>
        <ChartCard title="Calories eaten per day">
          {calSeries.length > 0 ? <BarChart data={calSeries} dataKey="value" valueFormatter={(v) => `${v} kcal`} /> : <Empty />}
        </ChartCard>
        <ChartCard title="Workouts by type">{workoutPie.length > 0 ? <PieChart data={workoutPie} /> : <Empty />}</ChartCard>
        <ChartCard title="Average macros (g/day)">{macroPie.length > 0 ? <PieChart data={macroPie} /> : <Empty />}</ChartCard>
      </div>

      <ChartCard title="Weekly weight change">
        {weightWaterfall.length > 1 ? <Waterfall steps={weightWaterfall} valueFormatter={(v) => `${v} kg`} /> : <Empty />}
      </ChartCard>
    </div>
  )
}

export default function WeightLossAnalyticsClient(props: {
  weights: Weight[]
  nutrition: Nutrition[]
  workouts: Workout[]
  strava: Strava[]
}) {
  return (
    <AnalyticsPeriodProvider defaultPeriod="90d">
      <Inner {...props} />
    </AnalyticsPeriodProvider>
  )
}
