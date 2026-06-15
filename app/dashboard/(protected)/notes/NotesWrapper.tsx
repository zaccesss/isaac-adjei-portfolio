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
