"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import PinGate from "@/components/dashboard/PinGate"
import DiaryClient from "./DiaryClient"

type Entry = {
  id: string
  title: string
  content: string
  mood: string | null
  hidden: boolean
  pinned: boolean
  locked: boolean
  created_at: string
  updated_at: string
}

export default function DiaryWrapper({ pinVerified, entries }: {
  pinVerified: boolean
  entries: Entry[]
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
    return <PinGate pageName="Diary" onUnlock={() => router.refresh()} />
  }

  return (
    <div className="relative flex flex-col gap-6">
      {/* Sits left of the fixed theme toggle in the viewport corner so the two never overlap. */}
      <div className="absolute top-0 right-12">
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
      <DiaryClient entries={entries} />
    </div>
  )
}
