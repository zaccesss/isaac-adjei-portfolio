import { supabase } from "@/lib/supabase"
import LibraryClient from "./LibraryClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function LibraryPage() {
  const [{ data: books }, { data: modules }] = await Promise.all([
    supabase.from("uni_library_books").select("*, uni_modules(code, color)").order("due_date"),
    supabase.from("uni_modules").select("id, code, name").eq("active", true).order("semester"),
  ])
  return <LibraryClient books={books ?? []} modules={modules ?? []} />
}
