import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import NotesFolderClient from "./NotesFolderClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

// I convert a folder name to a URL slug for consistent routing
const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, "-")

export default async function NotesFolderPage({ params }: { params: Promise<{ folder: string }> }) {
  const { folder } = await params
  const cookieStore = await cookies()
  const pinVerified = cookieStore.get("dashboard_pin_verified")?.value === "1"

  // I require PIN verification here too since notes are sensitive
  if (!pinVerified) {
    redirect("/dashboard/notes")
  }

  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false })

  const filtered =
    folder === "all"
      ? (notes ?? [])
      : (notes ?? []).filter((n) => toSlug(n.folder) === folder)

  const displayFolder =
    folder === "all"
      ? "All notes"
      : filtered[0]?.folder ??
        folder.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <NotesFolderClient
      notes={filtered}
      folder={displayFolder}
      folderSlug={folder}
    />
  )
}
