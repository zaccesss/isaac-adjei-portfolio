import { supabase } from "@/lib/supabase"
import InventoryCategoryClient from "./InventoryCategoryClient"

export const dynamic = "force-dynamic"

// I convert a category name to a URL slug for consistent routing
const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, "-")

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const { data: items } = await supabase.from("inventory_items").select("category")
  const match = (items ?? []).find((i) => toSlug(i.category) === category)
  const label = match?.category ?? category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  return { title: `Inventory | ${label}`, robots: "noindex, nofollow" }
}

export default async function InventoryCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params

  const { data: items } = await supabase
    .from("inventory_items")
    .select("*")
    .order("name")

  const filtered = (items ?? []).filter((item) => toSlug(item.category) === category)
  // I derive all categories from the full list so the form can offer existing options
  const allCategories = Array.from(new Set((items ?? []).map((i) => i.category))).sort()

  const displayCategory =
    filtered[0]?.category ??
    category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <InventoryCategoryClient
      items={filtered}
      allCategories={allCategories}
      category={displayCategory}
      categorySlug={category}
    />
  )
}
