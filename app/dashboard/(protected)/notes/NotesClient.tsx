"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Folder, Pin, Lock, EyeOff } from "lucide-react"
import { dashboardPage, dashboardGrid, dashboardCard } from "@/lib/animations"

type Note = {
  id: string
  title: string
  content: string
  folder: string
  tags: string[]
  pinned: boolean
  locked: boolean
  color: string | null
  created_at: string
  updated_at: string
}

// I convert a folder name to a URL slug for consistent routing
const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, "-")

export default function NotesClient({ notes }: { notes: Note[] }) {
  const visibleNotes = notes.filter((n) => !n.hidden)
  const hiddenNotes = notes.filter((n) => n.hidden)
  // I derive unique folders from visible notes only — hidden notes live under the Hidden virtual folder
  const folders = Array.from(new Set(visibleNotes.map((n) => n.folder).filter(Boolean))).sort()
  const pinnedNotes = visibleNotes.filter((n) => n.pinned)
  const lockedNotes = visibleNotes.filter((n) => n.locked)

  return (
    <motion.div
      className="flex flex-col gap-6 max-w-3xl"
      variants={dashboardPage}
      initial="hidden"
      animate="visible"
    >
      <div>
        <h1 className="text-xl font-semibold">Notes</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {notes.length} {notes.length === 1 ? "note" : "notes"} across {folders.length} {folders.length === 1 ? "folder" : "folders"}
        </p>
      </div>

      {visibleNotes.length === 0 && hiddenNotes.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <Folder className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium">No notes yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Visit &quot;All notes&quot; below to create your first note.
          </p>
        </div>
      ) : null}

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
        variants={dashboardGrid}
        initial="hidden"
        animate="visible"
      >
        {/* I always show "All notes" as the first card so the user has quick access to everything */}
        <motion.div variants={dashboardCard}>
          <Link
            href="/dashboard/notes/all"
            className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all group block"
          >
            <div className="flex items-center justify-between">
              <Folder className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold tabular-nums text-foreground/80">{visibleNotes.length}</span>
            </div>
            <div>
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">All notes</p>
              <div className="flex items-center gap-2 mt-1">
                {pinnedNotes.length > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Pin className="h-3 w-3" />{pinnedNotes.length} pinned
                  </span>
                )}
                {lockedNotes.length > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />{lockedNotes.length} locked
                  </span>
                )}
              </div>
            </div>
          </Link>
        </motion.div>

        {/* I show a card per folder so the user can navigate directly to a folder */}
        {folders.map((folder) => {
          const folderNotes = visibleNotes.filter((n) => n.folder === folder)
          const folderPinned = folderNotes.filter((n) => n.pinned).length
          const folderLocked = folderNotes.filter((n) => n.locked).length
          // I show only the first two note titles as a preview so the card is informative but compact
          const preview = folderNotes.slice(0, 2).map((n) => n.title)

          return (
            <motion.div key={folder} variants={dashboardCard}>
              <Link
                href={`/dashboard/notes/${toSlug(folder)}`}
                className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all group block"
              >
                <div className="flex items-center justify-between">
                  <Folder className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold tabular-nums text-foreground/80">{folderNotes.length}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">{folder}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {folderPinned > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Pin className="h-3 w-3" />{folderPinned}
                      </span>
                    )}
                    {folderLocked > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" />{folderLocked}
                      </span>
                    )}
                  </div>
                  {/* I show note title previews so the user knows what is inside without opening the folder */}
                  {preview.length > 0 && (
                    <div className="mt-2 flex flex-col gap-0.5">
                      {preview.map((t) => (
                        <p key={t} className="text-xs text-muted-foreground truncate">{t}</p>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          )
        })}

        {hiddenNotes.length > 0 && (
          <motion.div variants={dashboardCard}>
            <Link
              href="/dashboard/notes/hidden"
              className="flex flex-col gap-3 p-4 rounded-xl border border-border/60 bg-muted/20 hover:shadow-md transition-all group block opacity-70 hover:opacity-100"
            >
              <div className="flex items-center justify-between">
                <EyeOff className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold tabular-nums text-foreground/80">{hiddenNotes.length}</span>
              </div>
              <div>
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">Hidden</p>
                <p className="text-xs text-muted-foreground mt-0.5">Notes hidden from main view</p>
              </div>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
