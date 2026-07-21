import { supabase } from "@/lib/supabase"
import WishlistCategoryClient from "./WishlistCategoryClient"

export const dynamic = "force-dynamic"

// I convert a category name to a URL slug for consistent routing
const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, "-")

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  if (category === "all") return { title: "Wishlist | All items", robots: "noindex, nofollow" }
  const { data: items } = await supabase.from("wishlist").select("category")
  const match = (items ?? []).find((i) => toSlug(i.category) === category)
  const label = match?.category ?? category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  return { title: `Wishlist | ${label}`, robots: "noindex, nofollow" }
}

export default async function WishlistCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params

  const { data: items } = await supabase
    .from("wishlist")
    .select("*")
    .order("category")
    .order("name")

  // I filter client-side to handle slugs correctly without a DB-side slug column
  const filtered = category === "all"
    ? (items ?? [])
    : (items ?? []).filter((item) => toSlug(item.category) === category)

  // I derive categories from the full list so the form can offer existing categories as options
  const allCategories = Array.from(new Set((items ?? []).map((i) => i.category))).sort()

  const displayCategory = category === "all"
    ? "All items"
    : filtered[0]?.category ?? category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <WishlistCategoryClient
      items={filtered}
      allCategories={allCategories}
      category={displayCategory}
      categorySlug={category}
    />
  )
}
