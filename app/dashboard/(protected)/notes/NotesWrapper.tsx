"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
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

  async function handleLock() {
    await fetch("/api/dashboard/verify-pin", { method: "DELETE" })
    router.refresh()
  }

  // I listen for Cmd+L (Mac) and Ctrl+L (Windows) to lock the page without opening a new tab
  useEffect(() => {
    if (!pinVerified) return
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
        e.preventDefault()
        void handleLock()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [pinVerified])

  if (!pinVerified) {
    // I call router.refresh() on unlock so the server re-runs the page and passes pinVerified=true
    return <PinGate pageName="Notes" onUnlock={() => router.refresh()} />
  }

  return (
    <div className="relative flex flex-col gap-6">
      <div className="absolute top-0 right-0">
        <button
          type="button"
          onClick={() => void handleLock()}
          title="Lock (Cmd+L)"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
        >
          <Lock className="h-3.5 w-3.5" />
          Lock
        </button>
      </div>
      <NotesNowCard initial={nowStatus} />
      <NotesClient notes={notes} />
    </div>
  )
}
