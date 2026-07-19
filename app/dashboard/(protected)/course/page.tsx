// I load course data from Supabase and pass it to CourseWrapper for the module progress and grade tracker.

import { supabase } from "@/lib/supabase"
import CourseWrapper from "./CourseWrapper"

export const dynamic = "force-dynamic"
export const metadata = { title: "Course", robots: "noindex, nofollow" }

const DEFAULT_CONFIG = {
  programme: "BEng Electronic Engineering and Computer Science",
  university: "Aston University",
  accreditation: "IET accredited",
  duration: "3 years (4 with placement)",
  grade_thresholds: { First: 80, "2:1": 60, "2:2": 40, Fail: 0 },
  iet_rules: [
    "Must pass all non-condonable modules",
    "Must achieve at least 40% overall",
    "No more than 30 credits condoned across the programme",
    "Any individual assessment worth more than 30% of a module must score at least 30%",
  ],
  term_dates_2025_26: {
    "Term 1": "22 September - 12 December 2025",
    "Term 2": "5 January - 28 March 2026",
    "Term 3": "23 April - 6 June 2026",
  },
}

export default async function CoursePage() {
  const [{ data: modules }, { data: config }] = await Promise.all([
    supabase.from("course_modules").select("*").order("order_index"),
    supabase.from("config").select("value").eq("key", "course_data").single(),
  ])

  const courseConfig = { ...DEFAULT_CONFIG, ...(config?.value as Record<string, unknown> ?? {}) }

  return (
    <CourseWrapper
      modules={modules ?? []}
      config={courseConfig}
    />
  )
}
