"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Target, Briefcase, Flame, BookOpen, BookMarked,
  Gift, Lock, StickyNote, ArrowRight
} from "lucide-react"
import { dashboardPage, dashboardGrid, dashboardCard } from "@/lib/animations"

type Summary = {
  goals: { total: number; done: number; inProgress: number }
  applications: { active: number; offers: number }
  streaks: { total: number; checkedInToday: number }
  modules: { gpaEstimate: number | null }
  diary: { lastMood: string | null; lastEntry: string | null }
  wishlist: { total: number }
  vault: { total: number }
  notes: { total: number; lastUpdated: string | null }
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

// I compute a human-readable relative time string without a library to keep the bundle lean
function relativeTime(isoString: string | null): string {
  if (!isoString) return "Never"
  const diff = Date.now() - new Date(isoString).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  return `${days} days ago`
}

export default function DashboardHome({ summary }: { summary: Summary }) {
  const greeting = getGreeting()

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
      badge: relativeTime(summary.diary.lastEntry),
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
        ? relativeTime(summary.notes.lastUpdated)
        : null,
      badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
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
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, Zac
          </h1>
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
