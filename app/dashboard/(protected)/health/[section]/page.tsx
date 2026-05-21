import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import HealthSectionClient from "./HealthSectionClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

const VALID_SECTIONS = ["gym", "nutrition", "running"]
const SECTION_LABELS: Record<string, string> = {
  gym: "Gym",
  nutrition: "Nutrition",
  running: "Running",
}

export default async function HealthSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  if (!VALID_SECTIONS.includes(section)) notFound()

  const { data: sections } = await supabase
    .from("health_sections")
    .select("*")
    .order("order_index")

  const sectionIds = (sections ?? []).map((s) => s.id)

  const [{ data: workouts }, { data: nutrition }] = await Promise.all([
    sectionIds.length
      ? supabase.from("health_workouts").select("*").in("section_id", sectionIds).order("order_index")
      : Promise.resolve({ data: [] as { id: string; section_id: string; day_label: string; exercises: { name: string; sets: string }[]; notes: string | null; order_index: number }[] }),
    supabase.from("health_nutrition").select("*").order("order_index"),
  ])

  return (
    <HealthSectionClient
      sections={sections ?? []}
      workouts={workouts ?? []}
      nutrition={nutrition ?? []}
      activeSection={section}
      sectionLabel={SECTION_LABELS[section]}
    />
  )
}
