import { supabase } from "@/lib/supabase"
import InventoryCategoryClient from "./InventoryCategoryClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Inventory", robots: "noindex, nofollow" }

// I convert a category name to a URL slug for consistent routing
const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, "-")

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
