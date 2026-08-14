"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Dumbbell, Salad, Footprints, Scale, Activity, TrendingDown, Pill } from "lucide-react"
import { dashboardPage, dashboardGrid, dashboardCard } from "@/lib/animations"

type Section = {
  id: string
  name: string
  type: string
  icon: string
  color: string
  order_index: number
}

type Workout = {
  id: string
  section_id: string
  day_label: string
  exercises: { name: string; sets: string }[]
  notes: string | null
  order_index: number
}

type Nutrition = {
  id: string
  category: string
  items: string[]
  rules: string[]
  order_index: number
}

// I define the three fixed sections so the overview always shows all of them even if data is empty
const HEALTH_SECTIONS = [
  {
    slug: "gym",
    label: "Gym",
    description: "Workout plans and exercises",
    icon: Dumbbell,
    gradient: "from-orange-500/10 to-orange-600/5",
    accent: "border-orange-500/20",
    iconClass: "text-orange-500",
  },
  {
    slug: "nutrition",
    label: "Nutrition",
    description: "Meal plans and diet rules",
    icon: Salad,
    gradient: "from-green-500/10 to-green-600/5",
    accent: "border-green-500/20",
    iconClass: "text-green-500",
  },
  {
    slug: "running",
    label: "Running",
    description: "Running logs and plans",
    icon: Footprints,
    gradient: "from-blue-500/10 to-blue-600/5",
    accent: "border-blue-500/20",
    iconClass: "text-blue-500",
  },
]

export default function HealthClient({ sections, workouts, nutrition }: {
  sections: Section[]
  workouts: Workout[]
  nutrition: Nutrition[]
}) {
  // I count gym sections (non-nutrition, non-running types) for the gym card
  const gymSections = sections.filter(
    (s) => s.type !== "nutrition" && !s.name.toLowerCase().includes("running") && !s.type.toLowerCase().includes("running")
  )
  // I count running sections by checking name or type contains "running" case-insensitively
  const runningSections = sections.filter(
    (s) => s.name.toLowerCase().includes("running") || s.type.toLowerCase().includes("running")
  )

  const countFor = (slug: string): number => {
    if (slug === "gym") return gymSections.length
    if (slug === "nutrition") return nutrition.length
    if (slug === "running") return runningSections.length
    return 0
  }

  const subtitleFor = (slug: string): string => {
    if (slug === "gym") {
      const totalWorkouts = workouts.filter((w) => gymSections.some((s) => s.id === w.section_id)).length
      return `${gymSections.length} section${gymSections.length !== 1 ? "s" : ""}, ${totalWorkouts} day${totalWorkouts !== 1 ? "s" : ""}`
    }
    if (slug === "nutrition") return `${nutrition.length} categor${nutrition.length !== 1 ? "ies" : "y"}`
    if (slug === "running") return `${runningSections.length} section${runningSections.length !== 1 ? "s" : ""}`
    return ""
  }

  return (
    <motion.div
      className="flex flex-col gap-6 max-w-5xl"
      variants={dashboardPage}
      initial="hidden"
      animate="visible"
    >
      <div>
        <h1 className="text-xl font-semibold">Health and Fitness</h1>
        <p className="text-xs text-muted-foreground mt-0.5">My training and nutrition overview</p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        variants={dashboardGrid}
        initial="hidden"
        animate="visible"
      >
        {HEALTH_SECTIONS.map((s) => (
          <motion.div key={s.slug} variants={dashboardCard}>
            <Link
              href={`/dashboard/health/${s.slug}`}
              className={`flex flex-col gap-3 p-4 rounded-xl border bg-gradient-to-br ${s.gradient} ${s.accent} hover:shadow-md transition-all group block`}
            >
              <div className="flex items-center justify-between">
                <s.icon className={`h-5 w-5 ${s.iconClass}`} />
                <span className="text-2xl font-bold tabular-nums text-foreground/80">{countFor(s.slug)}</span>
              </div>
              <div>
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">{s.label}</p>
                <p className="text-xs text-muted-foreground">{subtitleFor(s.slug)}</p>
              </div>
            </Link>
          </motion.div>
        ))}
        <motion.div variants={dashboardCard}>
          <Link
            href="/dashboard/health/body-metrics"
            className="flex flex-col gap-3 p-4 rounded-xl border bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <Scale className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">Body Metrics</p>
              <p className="text-xs text-muted-foreground">Weight, measurements, composition</p>
            </div>
          </Link>
        </motion.div>
        <motion.div variants={dashboardCard}>
          <Link
            href="/dashboard/health/analytics"
            className="flex flex-col gap-3 p-4 rounded-xl border bg-gradient-to-br from-rose-500/10 to-rose-600/5 border-rose-500/20 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <Activity className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">Activity Analytics</p>
              <p className="text-xs text-muted-foreground">Strava runs, rides and training trends</p>
            </div>
          </Link>
        </motion.div>
        <motion.div variants={dashboardCard}>
          <Link
            href="/dashboard/health/weight-loss"
            className="flex flex-col gap-3 p-4 rounded-xl border bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <TrendingDown className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">Weight Loss</p>
              <p className="text-xs text-muted-foreground">Goal, weight, calories and workouts</p>
            </div>
          </Link>
        </motion.div>
        <motion.div variants={dashboardCard}>
          <Link
            href="/dashboard/health/medication-reminder"
            className="flex flex-col gap-3 p-4 rounded-xl border bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <Pill className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">Medication</p>
              <p className="text-xs text-muted-foreground">Reminders for you and family</p>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
