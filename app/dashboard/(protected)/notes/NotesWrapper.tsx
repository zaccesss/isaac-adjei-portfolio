// I compose the notes landing page from the "Now" status card and the folder overview grid.
// I exist as a separate wrapper so the server notes/page.tsx can fetch both notes and now_status
// in a single Promise.all and pass them down without either child needing to fetch independently.
"use client"

import NotesClient from "./NotesClient"
import NotesNowCard from "./NotesNowCard"

type Note = {
  id: string
  title: string
  content: string
  folder: string
  tags: string[]
  pinned: boolean
  locked: boolean
  hidden: boolean
  color: string | null
  created_at: string
  updated_at: string
}

export default function NotesWrapper({ notes, nowStatus }: {
  notes: Note[]
  nowStatus: Record<string, string>
}) {
  return (
    <div className="flex flex-col gap-6">
      <NotesNowCard initial={nowStatus} />
      <NotesClient notes={notes} />
    </div>
  )
}
