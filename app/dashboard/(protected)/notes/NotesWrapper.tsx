"use client"

import { useRouter } from "next/navigation"
import PinGate from "@/components/dashboard/PinGate"
import NotesClient from "./NotesClient"

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

export default function NotesWrapper({ pinVerified, notes }: {
  pinVerified: boolean
  notes: Note[]
}) {
  const router = useRouter()

  if (!pinVerified) {
    // I call router.refresh() on unlock so the server re-runs the page and passes pinVerified=true
    return <PinGate pageName="Notes" onUnlock={() => router.refresh()} />
  }

  return <NotesClient notes={notes} />
}
