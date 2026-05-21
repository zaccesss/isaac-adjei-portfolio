import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import ModulesYearClient from "./ModulesYearClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

const YEAR_SLUGS: Record<string, number> = {
  "year-1": 1,
  "year-2": 2,
  "placement": 3,
  "final-year": 4,
}

const YEAR_LABELS: Record<string, string> = {
  "year-1": "Year 1",
  "year-2": "Year 2",
  "placement": "Placement Year",
  "final-year": "Final Year",
}

export default async function ModulesYearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params
  const yearNum = YEAR_SLUGS[year]
  if (!yearNum) notFound()

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("year", yearNum)
    .order("semester")

  const moduleIds = (modules ?? []).map((m) => m.id)
  const { data: assessments } = moduleIds.length
    ? await supabase.from("assessments").select("*").in("module_id", moduleIds)
    : { data: [] }

  return (
    <ModulesYearClient
      modules={modules ?? []}
      assessments={assessments ?? []}
      yearLabel={YEAR_LABELS[year]}
      yearSlug={year}
    />
  )
}
