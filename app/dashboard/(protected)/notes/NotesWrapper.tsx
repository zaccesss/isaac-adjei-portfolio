"use client"
// I compose the notes landing page from the "Now" status card and the folder overview grid.
// I exist as a separate wrapper so the server notes/page.tsx can fetch both notes and now_status
// in a single Promise.all and pass them down without either child needing to fetch independently.
// The PIN gate mirrors DiaryWrapper: router.refresh() re-runs the server page so the
// notes only load once the signed cookie is set.

import { useRouter } from "next/navigation"
import PinGate from "@/components/dashboard/PinGate"
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

export default function NotesWrapper({ pinVerified, notes, nowStatus }: {
  pinVerified: boolean
  notes: Note[]
  nowStatus: Record<string, string>
}) {
  const router = useRouter()

  if (!pinVerified) {
    return <PinGate pageName="Notes" onUnlock={() => router.refresh()} />
  }

  return (
    <div className="flex flex-col gap-6">
      <NotesNowCard initial={nowStatus} />
      <NotesClient notes={notes} />
    </div>
  )
}
