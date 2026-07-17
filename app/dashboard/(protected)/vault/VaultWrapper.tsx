"use client"
// I mirror the same PIN gate pattern as DiaryWrapper - the Cmd+L shortcut locks the
// page without opening a new tab, and router.refresh() triggers a server re-render
// so pinVerified flips to true without a full page navigation.

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import PinGate from "@/components/dashboard/PinGate"
import VaultClient from "./VaultClient"

type VaultEntry = {
  id: string
  name: string
  type: string
  username: string | null
  email: string | null
  password: string | null
  url: string | null
  totp_secret: string | null
  card_number: string | null
  card_holder: string | null
  card_expiry: string | null
  phone: string | null
  address: string | null
  key_name: string | null
  key_value: string | null
  key_expiry: string | null
  content: string | null
  notes: string | null
  fields: Record<string, unknown>
}

export default function VaultWrapper({ pinVerified, entries, encryptionReady }: {
  pinVerified: boolean
  entries: VaultEntry[]
  encryptionReady: boolean
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
    return <PinGate pageName="Vault" onUnlock={() => router.refresh()} />
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
      <VaultClient entries={entries} encryptionReady={encryptionReady} />
    </div>
  )
}
