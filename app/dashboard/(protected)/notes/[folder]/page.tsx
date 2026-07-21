// I fetch all notes from Supabase, then filter by the folder slug from the URL before passing them
// to the client component. I handle the virtual "all" and "hidden" folder slugs here so the client
// component only ever sees the notes it should display and does not need to re-filter.
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { isPinVerified } from "@/lib/pin"
import NotesFolderClient from "./NotesFolderClient"

export const dynamic = "force-dynamic"

const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, "-")

export async function generateMetadata({ params }: { params: Promise<{ folder: string }> }) {
  const { folder } = await params
  if (folder === "hidden") return { title: "Notes | Hidden", robots: "noindex, nofollow" }
  if (folder === "all") return { title: "Notes | All notes", robots: "noindex, nofollow" }

  const { data: notes } = await supabase.from("notes").select("folder").eq("hidden", false)
  const match = (notes ?? []).find((n) => toSlug(n.folder) === folder)
  const label = match?.folder ?? folder.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  return { title: `Notes | ${label}`, robots: "noindex, nofollow" }
}

export default async function NotesFolderPage({ params }: { params: Promise<{ folder: string }> }) {
  // Folder pages ship full note content, so they get the same server-side PIN check
  // as the landing page, which hosts the unlock prompt.
  if (!(await isPinVerified())) redirect("/dashboard/notes")

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

  // I prefer the actual folder name from the first note rather than capitalising the slug,
  // because note folders can have mixed casing (e.g. "JavaScript" not "Javascript")
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
