"use client"
// A hub combining a headline slice from every domain that already has its own analytics page or
// mini-analytics section - Applications, Music, Ops, Fitness, Coding, Lab, Time Allocation, plus
// the CRUD pages that only ever show mini-analytics inline (Goals, Projects, Inventory). Each
// section links out to its own full page for depth; this page's job is the combined picture, not
// a duplicate of what each page already shows in full.

import Link from "next/link"
import { useMemo } from "react"
import {
  StatCard, StackedArea, BarChart, PieChart, Bubble, DEFAULT_CHART_COLOURS,
} from "@/components/analytics"
import type { TimeAllocationDay } from "@/app/dashboard/actions"
import {
  LayoutGrid, Target, FolderKanban, Briefcase, Package, Code2, Dumbbell, Waves, ArrowRight,
} from "lucide-react"

type Overview = {
  summary: {
    goals: { total: number; done: number; inProgress: number }
    applications: { active: number; offers: number }
    streaks: { total: number; checkedInToday: number }
    modules: { gpaEstimate: number | null }
    study: { sessionsThisWeek: number; minutesThisWeek: number }
  }
  timeAllocation30: TimeAllocationDay[]
  projects: { total: number; byStatus: { name: string; value: number }[] }
  lab: { totalReadings: number; sets: number }
  inventory: { total: number; byCategory: { name: string; value: number }[] }
  coding: { hours30: number }
  strava: { distanceKm30: number; hours30: number }
  medication: { adherence30: number | null }
  applications: { byStatus: { name: string; value: number }[] }
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

export default function AllAnalyticsClient({ data }: { data: Overview }) {
  const { summary, timeAllocation30, projects, lab, inventory, coding, strava, medication, applications } = data

  // A genuinely combinational view, not a restated per-domain chart: each day's study minutes vs
  // that same day's coding minutes, bubble-sized by that day's fitness minutes - a day-joined
  // cross-domain read (do study-heavy days also skew towards more/less coding and fitness?) that
  // no single domain page could show on its own.
  const correlation = useMemo(
    () => timeAllocation30.filter((d) => d.studyMinutes > 0 || d.codingMinutes > 0),
    [timeAllocation30],
  )

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" /> All analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          A combined view across every domain - each section links to its own full analytics page.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Goals done" value={`${summary.goals.done}/${summary.goals.total}`} />
        <StatCard label="Projects done" value={`${projects.byStatus.find((s) => s.name === "done")?.value ?? 0}/${projects.total}`} />
        <StatCard label="Active applications" value={summary.applications.active} />
        <StatCard label="GPA estimate" value={summary.modules.gpaEstimate ?? "-"} />
        <StatCard label="Coding (30d)" value={`${coding.hours30}h`} />
        <StatCard label="Strava (30d)" value={`${strava.distanceKm30}km`} />
      </div>

      <div className="border border-border rounded-xl p-4 bg-card">
        <p className="text-sm font-semibold mb-3">Time allocation, last 30 days</p>
        <StackedArea
          data={timeAllocation30}
          xKey="date"
          series={[
            { key: "studyMinutes", name: "Study" },
            { key: "codingMinutes", name: "Coding" },
            { key: "stravaMinutes", name: "Fitness" },
            { key: "musicMinutes", name: "Music" },
            { key: "faithMinutes", name: "Faith" },
          ]}
          colours={["#14b8a6", "#3b82f6", "#FC4C02", "#ec4899", "#6366f1"]}
          valueFormatter={(v) => `${v}m`}
        />
      </div>

      {correlation.length > 2 && (
        <div className="border border-border rounded-xl p-4 bg-card">
          <p className="text-sm font-semibold">Study vs coding minutes, by day (last 30 days)</p>
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
          {applications.byStatus.length > 0
            ? <BarChart data={applications.byStatus} dataKey="value" xKey="name" colours={DEFAULT_CHART_COLOURS} />
            : <p className="text-xs text-muted-foreground">No applications logged yet.</p>}
        </Section>

        <Section icon={Package} title="Inventory" href="/dashboard/inventory">
          <div className="flex items-center gap-4">
            <StatCard label="Total items" value={inventory.total} />
            {inventory.byCategory.length > 0 && (
              <div className="flex-1"><PieChart data={inventory.byCategory} colours={DEFAULT_CHART_COLOURS} height={160} /></div>
            )}
          </div>
        </Section>

        <Section icon={Dumbbell} title="Fitness & Health" href="/dashboard/health/analytics">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Strava hours (30d)" value={strava.hours30} />
            <StatCard label="Medication adherence" value={medication.adherence30 !== null ? `${medication.adherence30}%` : "-"} />
          </div>
        </Section>

        <Section icon={Code2} title="Coding" href="/dashboard/coding">
          <StatCard label="Hours (30d)" value={coding.hours30} />
        </Section>

        <Section icon={Waves} title="Lab Measurements" href="/dashboard/analytics/lab-measurements">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Readings logged" value={lab.totalReadings} />
            <StatCard label="Measurement sets" value={lab.sets} />
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
