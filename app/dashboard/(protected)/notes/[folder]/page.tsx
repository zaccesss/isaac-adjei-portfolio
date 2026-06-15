import { supabase } from "@/lib/supabase"
import NotesFolderClient from "./NotesFolderClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, "-")

export default async function NotesFolderPage({ params }: { params: Promise<{ folder: string }> }) {
  const { folder } = await params

  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false })

  const filtered =
    folder === "hidden"
      ? (notes ?? []).filter((n) => n.hidden)
      : folder === "all"
      ? (notes ?? []).filter((n) => !n.hidden)
      : (notes ?? []).filter((n) => toSlug(n.folder) === folder && !n.hidden)

  const displayFolder =
    folder === "hidden"
      ? "Hidden"
      : folder === "all"
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
