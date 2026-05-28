import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import InventoryItemClient from "./InventoryItemClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function InventoryItemPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>
}) {
  // I await params as required by Next.js 14 App Router
  const { category, id } = await params

  const { data: item } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("id", id)
    .single()

  if (!item) notFound()

  return <InventoryItemClient item={item} category={category} />
}
