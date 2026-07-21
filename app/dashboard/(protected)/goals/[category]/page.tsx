import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import GoalsCategoryClient from "./GoalsCategoryClient"

export const dynamic = "force-dynamic"

const VALID_CATEGORIES = ["personal", "academic", "career", "health", "finance", "other"]

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const label = VALID_CATEGORIES.includes(category)
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : null
  return { title: label ? `Goals | ${label}` : "Goals", robots: "noindex, nofollow" }
}

export default async function GoalsCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  if (!VALID_CATEGORIES.includes(category)) notFound()

  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1)

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("category", displayCategory)
    .order("created_at", { ascending: false })

  return <GoalsCategoryClient goals={goals ?? []} category={displayCategory} />
}
