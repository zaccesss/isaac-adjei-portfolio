import { supabase } from "@/lib/supabase"
import WishlistClient from "./WishlistClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Wishlist", robots: "noindex, nofollow" }

export default async function WishlistPage() {
  const { data: items } = await supabase
    .from("wishlist")
    .select("*")
    .order("category")
    .order("name")

  return <WishlistClient items={items ?? []} />
}
