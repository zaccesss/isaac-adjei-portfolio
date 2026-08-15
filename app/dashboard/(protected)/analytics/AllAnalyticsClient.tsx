"use client"
// A hub combining a headline slice from every domain that already has its own analytics page or
// mini-analytics section - Applications, Music, Ops, Fitness, Coding, Lab, Time Allocation, plus
// the CRUD pages that only ever show mini-analytics inline (Goals, Projects, Inventory, Habits,
// Streaks, Faith, Study, Weight-loss). Each section links out to its own full page for depth;
// this page's job is the combined picture, not a duplicate of what each page already shows in full.

import Link from "next/link"
import { useMemo } from "react"
import {
  StatCard, StackedArea, BarChart, PieChart, Bubble, DEFAULT_CHART_COLOURS,
  AnalyticsPeriodProvider, PeriodSelector, useAnalyticsPeriod, filterByPeriod,
} from "@/components/analytics"
import type { TimeAllocationDay } from "@/app/dashboard/actions"
import {
  LayoutGrid, Target, FolderKanban, Briefcase, Package, Code2, Dumbbell, Waves, ArrowRight,
  Church, Brain, Flame, CheckSquare, Scale, Lock, Gift,
} from "lucide-react"

type Overview = {
  summary: {
    goals: { total: number; done: number; inProgress: number }
    applications: { active: number; offers: number }
    streaks: { total: number; checkedInToday: number }
    modules: { gpaEstimate: number | null }
    study: { sessionsThisWeek: number; minutesThisWeek: number }
    faith: { lastEntry: string | null }
  }
  timeAllocation365: TimeAllocationDay[]
  projects: { total: number; byStatus: { name: string; value: number }[] }
  lab: { totalReadings: number; sets: number }
  inventory: { total: number; byCategory: { name: string; value: number }[] }
  medication: { adherence90: number | null }
  applications: { byStatus: { name: string; value: number }[] }
  habits: { total: number; completedToday: number }
  weightLoss: { latestKg: number | null; deltaKg: number | null }
  vault: { total: number; byType: { name: string; value: number }[] }
  wishlist: { total: number; got: number; byCategory: { name: string; value: number }[] }
}

function Section({ icon: Icon, title, href, children }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  href: string
  children: React.ReactNode
}) {
  return (
    <div className="border border-border rounded-xl p-4 bg-card flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold">{title}</p>
        </div>
        <Link href={href} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          Full page <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {children}
    </div>
  )
}

const fmtHours = (mins: number) => `${Math.round((mins / 60) * 10) / 10}h`

function Inner({ data }: { data: Overview }) {
  const { period } = useAnalyticsPeriod()
  const { summary, timeAllocation365, projects, lab, inventory, medication, applications, habits, weightLoss, vault, wishlist } = data

  // Everything genuinely activity-over-time (coding, fitness, applications) is derived from the
  // same period-filtered window the selector controls - not a second, separately-fixed read.
  const visible = filterByPeriod(timeAllocation365, period, (d) => d.date)
  const codingHours = fmtHours(visible.reduce((s, d) => s + d.codingMinutes, 0))
  const stravaKm = Math.round((visible.reduce((s, d) => s + d.stravaDistanceM, 0) / 1000) * 10) / 10
  const stravaHours = fmtHours(visible.reduce((s, d) => s + d.stravaMinutes, 0))
  const applicationsInPeriod = visible.reduce((s, d) => s + d.applicationsCount, 0)

  // A genuinely combinational view, not a restated per-domain chart: each day's study minutes vs
  // that same day's coding minutes, bubble-sized by that day's fitness minutes - a day-joined
  // cross-domain read (do study-heavy days also skew towards more/less coding and fitness?) that
  // no single domain page could show on its own.
  const correlation = useMemo(
    () => visible.filter((d) => d.studyMinutes > 0 || d.codingMinutes > 0),
    [visible],
  )

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" /> All analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            A combined view across every domain - each section links to its own full analytics page.
          </p>
        </div>
        <PeriodSelector />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Goals done" value={`${summary.goals.done}/${summary.goals.total}`} scope="current" />
        <StatCard label="Projects done" value={`${projects.byStatus.find((s) => s.name === "done")?.value ?? 0}/${projects.total}`} scope="current" />
        <StatCard label="Active applications" value={summary.applications.active} scope="current" />
        <StatCard label="GPA estimate" value={summary.modules.gpaEstimate ?? "-"} scope="current" />
        <StatCard label="Coding" value={codingHours} />
        <StatCard label="Strava distance" value={`${stravaKm}km`} />
      </div>

      <div className="border border-border rounded-xl p-4 bg-card">
        <p className="text-sm font-semibold mb-3">Time allocation</p>
        {visible.length > 0 ? (
          <StackedArea
            data={visible}
            xKey="date"
            series={[
              { key: "studyMinutes", name: "Study" },
              { key: "codingMinutes", name: "Coding" },
              { key: "stravaMinutes", name: "Fitness" },
              { key: "musicMinutes", name: "Music" },
              { key: "faithMinutes", name: "Faith" },
            ]}
            colours={["#F0E442", "#3b82f6", "#FC4C02", "#CC79A7", "#009E73"]}
            valueFormatter={(v) => `${v}m`}
          />
        ) : (
          <p className="text-xs text-muted-foreground py-8 text-center">No activity logged in this period.</p>
        )}
      </div>

      {correlation.length > 2 && (
        <div className="border border-border rounded-xl p-4 bg-card">
          <p className="text-sm font-semibold">Study vs coding minutes, by day</p>
          <p className="text-xs text-muted-foreground mb-3">Bubble size is that day&apos;s fitness minutes - a cross-domain read no single page shows on its own.</p>
          <Bubble
            data={correlation}
            xKey="studyMinutes"
            yKey="codingMinutes"
            zKey="stravaMinutes"
            xLabel="Study (min)"
            yLabel="Coding (min)"
            xFormatter={(v) => `${v}m`}
            yFormatter={(v) => `${v}m`}
            zFormatter={(v) => `${v}m fitness`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section icon={Target} title="Goals & Projects" href="/dashboard/projects">
          {projects.byStatus.length > 0
            ? <PieChart data={projects.byStatus} colours={DEFAULT_CHART_COLOURS} height={180} />
            : <p className="text-xs text-muted-foreground">No projects logged yet.</p>}
        </Section>

        <Section icon={Briefcase} title="Applications" href="/dashboard/analytics/applications">
          <StatCard label="Submitted this period" value={applicationsInPeriod} />
          {applications.byStatus.length > 0
            ? <BarChart data={applications.byStatus} dataKey="value" xKey="name" colours={DEFAULT_CHART_COLOURS} />
            : <p className="text-xs text-muted-foreground">No applications logged yet.</p>}
        </Section>

        <Section icon={Package} title="Inventory" href="/dashboard/inventory">
          <div className="flex items-center gap-4">
            <StatCard label="Total items" value={inventory.total} scope="current" />
            {inventory.byCategory.length > 0 && (
              <div className="flex-1"><PieChart data={inventory.byCategory} colours={DEFAULT_CHART_COLOURS} height={160} /></div>
            )}
          </div>
        </Section>

        <Section icon={Dumbbell} title="Fitness & Health" href="/dashboard/health/analytics">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Strava hours" value={stravaHours} />
            <StatCard label="Medication adherence" value={medication.adherence90 !== null ? `${medication.adherence90}%` : "-"} scope="all-time" />
          </div>
        </Section>

        <Section icon={Code2} title="Coding" href="/dashboard/coding">
          <StatCard label="Hours" value={codingHours} />
        </Section>

        <Section icon={Waves} title="Lab Measurements" href="/dashboard/analytics/lab-measurements">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Readings logged" value={lab.totalReadings} scope="current" />
            <StatCard label="Measurement sets" value={lab.sets} scope="current" />
          </div>
        </Section>

        <Section icon={Brain} title="Study" href="/dashboard/study">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Sessions this week" value={summary.study.sessionsThisWeek} scope="current" />
            <StatCard label="Minutes this week" value={summary.study.minutesThisWeek} scope="current" />
          </div>
        </Section>

        <Section icon={Church} title="Faith" href="/dashboard/faith">
          <StatCard
            label="Last entry"
            value={summary.faith.lastEntry ? new Date(summary.faith.lastEntry).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "-"}
            scope="current"
          />
        </Section>

        <Section icon={Flame} title="Streaks" href="/dashboard/streaks">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Active streaks" value={summary.streaks.total} scope="current" />
            <StatCard label="Checked in today" value={summary.streaks.checkedInToday} scope="current" />
          </div>
        </Section>

        <Section icon={CheckSquare} title="Habits" href="/dashboard/habits">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Active habits" value={habits.total} scope="current" />
            <StatCard label="Completed today" value={habits.completedToday} scope="current" />
          </div>
        </Section>

        <Section icon={Scale} title="Weight-loss" href="/dashboard/health/weight-loss/analytics">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Latest weight" value={weightLoss.latestKg !== null ? `${weightLoss.latestKg}kg` : "-"} scope="current" />
            <StatCard
              label="Change since last log"
              value={weightLoss.deltaKg !== null ? `${weightLoss.deltaKg > 0 ? "+" : ""}${weightLoss.deltaKg}kg` : "-"}
              scope="current"
            />
          </div>
        </Section>

        <Section icon={Lock} title="Vault" href="/dashboard/vault">
          <div className="flex items-center gap-4">
            <StatCard label="Total entries" value={vault.total} scope="current" />
            {vault.byType.length > 0 && (
              <div className="flex-1"><PieChart data={vault.byType} colours={DEFAULT_CHART_COLOURS} height={160} /></div>
            )}
          </div>
        </Section>

        <Section icon={Gift} title="Wishlist" href="/dashboard/wishlist">
          <div className="flex items-center gap-4">
            <StatCard label="Obtained" value={`${wishlist.got}/${wishlist.total}`} scope="current" />
            {wishlist.byCategory.length > 0 && (
              <div className="flex-1"><PieChart data={wishlist.byCategory} colours={DEFAULT_CHART_COLOURS} height={160} /></div>
            )}
          </div>
        </Section>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <FolderKanban className="h-3.5 w-3.5" />
        Music, Ops and Time Allocation each already have their own full analytics page in the sidebar - this hub links out rather than duplicating them in full.
      </div>
    </div>
  )
}

export default function AllAnalyticsClient({ data }: { data: Overview }) {
  return (
    <AnalyticsPeriodProvider defaultPeriod="30d">
      <Inner data={data} />
    </AnalyticsPeriodProvider>
  )
}
