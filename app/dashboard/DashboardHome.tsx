"use client"
// I render the dashboard home overview. All data is passed in as a single Summary
// prop computed server-side so this component stays pure client-side presentation.

import Link from "next/link"
import { useSyncExternalStore } from "react"
import { motion } from "framer-motion"
import {
  Target, Briefcase, Flame, BookOpen, BookMarked,
  Gift, Lock, StickyNote, ArrowRight, Brain, Church, School
} from "lucide-react"
import { dashboardPage, dashboardGrid, dashboardCard } from "@/lib/animations"
import SegmentClock from "@/components/shared/marks/SegmentClock"
import { StackedArea, Gauge } from "@/components/analytics"
import type { TimeAllocationDay } from "./actions"

type Summary = {
  goals: { total: number; done: number; inProgress: number }
  applications: { active: number; offers: number }
  streaks: { total: number; checkedInToday: number }
  modules: { gpaEstimate: number | null }
  diary: { lastMood: string | null; lastEntry: string | null }
  wishlist: { total: number }
  vault: { total: number }
  notes: { total: number; lastUpdated: string | null }
  study: { sessionsThisWeek: number; minutesThisWeek: number }
  faith: { lastEntry: string | null }
  university: { upcomingDeadlines: number; activeModules: number }
  timeAllocation: TimeAllocationDay[]
}

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

// I compute a human-readable relative time string without a library to keep the bundle lean.
// A null clock (before mount) renders blank: the server renders in UTC and the browser in
// local time, so any clock-derived text in the SSR HTML can differ at hydration (React #418).
function relativeTime(isoString: string | null, now: number | null): string {
  if (!isoString) return "Never"
  if (now === null) return ""
  const diff = now - new Date(isoString).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  return `${days} days ago`
}

// The browser clock exposed as an external store, read once per page load: the server
// snapshot is null, so no time-derived text is in the server HTML to disagree with the
// client at hydration (the #418 mismatch on /dashboard - the server renders in UTC and
// the visitor's clock is local). Nothing to subscribe to; the value is stable per load.
const subscribeNever = () => () => {}
let clientLoadTime: number | null = null
const getClientNow = () => {
  if (clientLoadTime === null) clientLoadTime = Date.now()
  return clientLoadTime
}
const getServerNow = () => null

export default function DashboardHome({ summary }: { summary: Summary }) {
  const now = useSyncExternalStore(subscribeNever, getClientNow, getServerNow)
  const greeting = now === null ? "Hello" : getGreeting(new Date(now).getHours())

  const goalsCompletionPct = summary.goals.total > 0 ? Math.round((summary.goals.done / summary.goals.total) * 100) : 0
  const timeAllocationData = summary.timeAllocation.map((d) => ({
    name: new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    study: d.studyMinutes,
    coding: d.codingMinutes,
    strava: d.stravaMinutes,
    music: d.musicMinutes,
    faith: d.faithMinutes,
  }))
  const hasTimeAllocation = summary.timeAllocation.some((d) => d.studyMinutes + d.codingMinutes + d.stravaMinutes > 0)

  const cards = [
    {
      href: "/dashboard/goals",
      icon: Target,
      accentClass: "border-l-amber-500",
      iconClass: "text-amber-500",
      label: "Goals",
      stat: `${summary.goals.done} done / ${summary.goals.total} total`,
      badge:
        summary.goals.inProgress > 0
          ? `${summary.goals.inProgress} in progress`
          : null,
      badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    },
    {
      href: "/dashboard/applications",
      icon: Briefcase,
      accentClass: "border-l-blue-500",
      iconClass: "text-blue-500",
      label: "Applications",
      stat: `${summary.applications.active} active pipeline`,
      badge: summary.applications.offers > 0 ? `${summary.applications.offers} offers` : null,
      badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      href: "/dashboard/streaks",
      icon: Flame,
      accentClass: "border-l-orange-500",
      iconClass: "text-orange-500",
      label: "Streaks",
      stat: `${summary.streaks.checkedInToday} / ${summary.streaks.total} checked in today`,
      badge: null,
      badgeClass: "",
    },
    {
      href: "/dashboard/modules",
      icon: BookOpen,
      accentClass: "border-l-violet-500",
      iconClass: "text-violet-500",
      label: "Modules",
      stat:
        summary.modules.gpaEstimate !== null
          ? `${summary.modules.gpaEstimate}% avg`
          : "No marks yet",
      badge: null,
      badgeClass: "",
    },
    {
      href: "/dashboard/diary",
      icon: BookMarked,
      accentClass: "border-l-rose-500",
      iconClass: "text-rose-500",
      label: "Diary",
      stat: summary.diary.lastMood
        ? `Last mood: ${summary.diary.lastMood}`
        : "No entries yet",
      badge: relativeTime(summary.diary.lastEntry, now),
      badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
    },
    {
      href: "/dashboard/wishlist",
      icon: Gift,
      accentClass: "border-l-pink-500",
      iconClass: "text-pink-500",
      label: "Wishlist",
      stat: `${summary.wishlist.total} items`,
      badge: null,
      badgeClass: "",
    },
    {
      href: "/dashboard/vault",
      icon: Lock,
      accentClass: "border-l-red-500",
      iconClass: "text-red-500",
      label: "Vault",
      stat: `${summary.vault.total} entries`,
      badge: null,
      badgeClass: "",
    },
    {
      href: "/dashboard/notes",
      icon: StickyNote,
      accentClass: "border-l-sky-500",
      iconClass: "text-sky-500",
      label: "Notes",
      stat: `${summary.notes.total} notes`,
      badge: summary.notes.lastUpdated
        ? relativeTime(summary.notes.lastUpdated, now)
        : null,
      badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
    },
    {
      href: "/dashboard/study",
      icon: Brain,
      accentClass: "border-l-teal-500",
      iconClass: "text-teal-500",
      label: "Study",
      stat: summary.study.sessionsThisWeek > 0
        ? `${summary.study.sessionsThisWeek} session${summary.study.sessionsThisWeek === 1 ? "" : "s"} this week`
        : "No sessions this week",
      badge: summary.study.minutesThisWeek > 0
        ? `${Math.round(summary.study.minutesThisWeek / 60 * 10) / 10}h total`
        : null,
      badgeClass: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    },
    {
      href: "/dashboard/faith",
      icon: Church,
      accentClass: "border-l-indigo-500",
      iconClass: "text-indigo-500",
      label: "Faith",
      stat: summary.faith.lastEntry ? `Last entry: ${relativeTime(summary.faith.lastEntry, now)}` : "No entries yet",
      badge: null,
      badgeClass: "",
    },
    {
      href: "/dashboard/university",
      icon: School,
      accentClass: "border-l-purple-500",
      iconClass: "text-purple-500",
      label: "University",
      stat: summary.university.activeModules > 0
        ? `${summary.university.activeModules} active module${summary.university.activeModules === 1 ? "" : "s"}`
        : "No active modules",
      badge: summary.university.upcomingDeadlines > 0
        ? `${summary.university.upcomingDeadlines} deadline${summary.university.upcomingDeadlines === 1 ? "" : "s"} this week`
        : null,
      badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    },
  ]

  return (
    <motion.div
      variants={dashboardPage}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {greeting}, Zac
            </h1>
            <SegmentClock size={30} className="text-muted-foreground shrink-0" />
          </div>
          <p className="text-muted-foreground">Here is your week at a glance.</p>
        </div>
        {/* I show a CTA so there is a clear path into the dashboard after login */}
        <Link
          href="/dashboard/me"
          className="self-start flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Open Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Cross-domain summary: where the last 14 days went, and how goals are tracking overall -
          the one place on the dashboard that reads across topics rather than per-topic. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/analytics/time-allocation"
          className="sm:col-span-2 border border-border rounded-xl p-4 bg-card hover:shadow-md transition-all"
        >
          <p className="text-xs font-medium text-muted-foreground mb-2">Where the time went - last 14 days</p>
          {hasTimeAllocation ? (
            <StackedArea
              data={timeAllocationData}
              series={[
                { key: "study", name: "Study" },
                { key: "coding", name: "Coding" },
                { key: "strava", name: "Strava" },
                { key: "music", name: "Music" },
                { key: "faith", name: "Faith" },
              ]}
              colours={["#14b8a6", "#3b82f6", "#FC4C02", "#ec4899", "#6366f1"]}
              height={140}
              valueFormatter={(v) => `${Math.round((v / 60) * 10) / 10}h`}
            />
          ) : (
            <p className="text-xs text-muted-foreground py-10 text-center">No study, coding or Strava activity in the last 14 days yet.</p>
          )}
        </Link>
        <div className="border border-border rounded-xl p-4 bg-card">
          <p className="text-xs font-medium text-muted-foreground mb-1 text-center">Goals completed</p>
          <Gauge value={goalsCompletionPct} height={140} />
        </div>
      </div>

      <motion.div
        variants={dashboardGrid}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      >
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div key={card.href} variants={dashboardCard}>
              <Link
                href={card.href}
                className={`border border-border border-l-4 ${card.accentClass} rounded-xl p-5 bg-card hover:shadow-md transition-all flex flex-col gap-3 h-full`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 shrink-0 ${card.iconClass}`} />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {card.label}
                  </span>
                </div>
                <p className="text-sm font-semibold leading-snug">{card.stat}</p>
                {card.badge && (
                  <span
                    className={`self-start text-xs px-2 py-0.5 rounded-full font-medium ${card.badgeClass}`}
                  >
                    {card.badge}
                  </span>
                )}
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
