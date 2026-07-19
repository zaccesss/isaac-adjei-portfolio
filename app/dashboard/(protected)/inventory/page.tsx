import { supabase } from "@/lib/supabase"
import InventoryClient from "./InventoryClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Inventory", robots: "noindex, nofollow" }

export default async function InventoryPage() {
  const { data } = await supabase
    .from("inventory_items")
    .select("*")
    .order("category")
    .order("name")

  return <InventoryClient items={data ?? []} />
}
