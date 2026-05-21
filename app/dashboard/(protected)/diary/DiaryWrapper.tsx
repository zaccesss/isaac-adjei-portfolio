"use client"

import { useRouter } from "next/navigation"
import PinGate from "@/components/dashboard/PinGate"
import DiaryClient from "./DiaryClient"

type Entry = {
  id: string
  title: string
  content: string
  mood: string | null
  created_at: string
  updated_at: string
}

export default function DiaryWrapper({ pinVerified, entries }: {
  pinVerified: boolean
  entries: Entry[]
}) {
  const router = useRouter()

  if (!pinVerified) {
    // I call router.refresh() on unlock so the server re-runs the page and passes pinVerified=true
    return <PinGate pageName="Diary" onUnlock={() => router.refresh()} />
  }

  return <DiaryClient entries={entries} />
}
