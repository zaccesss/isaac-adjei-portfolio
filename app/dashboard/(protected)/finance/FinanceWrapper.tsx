"use client"
// Mirrors VaultWrapper/DiaryWrapper's PIN gate pattern exactly - Cmd+L locks the page without
// opening a new tab, router.refresh() triggers a server re-render so pinVerified flips to true
// without a full page navigation.

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import PinGate from "@/components/dashboard/PinGate"
import FinanceClient from "./FinanceClient"
import type { FinanceTransaction } from "../../actions"

export default function FinanceWrapper({ pinVerified, transactions }: {
  pinVerified: boolean
  transactions: FinanceTransaction[]
}) {
  const router = useRouter()

  async function handleLock() {
    await fetch("/api/dashboard/verify-pin", { method: "DELETE" })
    router.refresh()
  }

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
    return <PinGate pageName="Finance" onUnlock={() => router.refresh()} />
  }

  return (
    <div className="relative flex flex-col gap-6">
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
      <FinanceClient transactions={transactions} />
    </div>
  )
}
