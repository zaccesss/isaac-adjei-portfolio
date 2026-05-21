import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import GoalsCategoryClient from "./GoalsCategoryClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

const VALID_CATEGORIES = ["personal", "academic", "career", "health", "finance", "other"]

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
