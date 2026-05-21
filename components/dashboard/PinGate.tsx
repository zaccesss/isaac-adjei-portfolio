"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Eye, EyeOff, KeyRound, Shield } from "lucide-react"

interface Props {
  pageName: string
  onUnlock: () => void
}

export default function PinGate({ pageName, onUnlock }: Props) {
  const [pin, setPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showChange, setShowChange] = useState(false)
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [changeMsg, setChangeMsg] = useState("")

  async function handleUnlock() {
    if (!pin.trim()) return
    setLoading(true)
    setError("")
    try {
      // I call a server-side route rather than verifying in the browser so the hash never leaves the server
      const res = await fetch("/api/dashboard/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })
      if (res.ok) {
        onUnlock()
      } else {
        // I clear the field on a wrong attempt so the user starts fresh
        setError("Wrong PIN. Try again.")
        setPin("")
      }
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePin() {
    if (!currentPin || !newPin) return
    setLoading(true)
    setChangeMsg("")
    try {
      const res = await fetch("/api/dashboard/change-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin, newPin }),
      })
      const data = await res.json()
      if (res.ok) {
        setChangeMsg("PIN changed successfully.")
        setCurrentPin("")
        setNewPin("")
        setShowChange(false)
      } else {
        setChangeMsg(data.error ?? "Failed to change PIN.")
      }
    } catch {
      setChangeMsg("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  if (showChange) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 max-w-sm w-full">
          <div className="flex flex-col items-center gap-2 text-center">
            <KeyRound className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Change PIN</h2>
            <p className="text-sm text-muted-foreground">Enter your current PIN then set a new one</p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Input
              type="password"
              placeholder="Current PIN"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
            />
            <Input
              type="password"
              placeholder="New PIN (min 4 characters)"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleChangePin() }}
            />
          </div>
          {changeMsg && (
            <p className={`text-sm ${changeMsg.includes("success") ? "text-green-600" : "text-destructive"}`}>
              {changeMsg}
            </p>
          )}
          <div className="flex gap-2 w-full">
            <Button variant="ghost" className="flex-1" onClick={() => setShowChange(false)}>Back</Button>
            <Button className="flex-1" onClick={handleChangePin} disabled={loading || !currentPin || !newPin}>
              {loading ? "Saving..." : "Change PIN"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 max-w-sm w-full">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">{pageName}</h2>
          <p className="text-sm text-muted-foreground">Enter your PIN to continue</p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <div className="relative">
            <Input
              type={showPin ? "text" : "password"}
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleUnlock() }}
              className="pr-10 text-center text-lg tracking-widest"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPin((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <Button onClick={handleUnlock} disabled={loading || !pin.trim()} className="w-full gap-2">
            <Lock className="h-4 w-4" />
            {loading ? "Verifying..." : "Unlock"}
          </Button>
        </div>

        <button
          onClick={() => setShowChange(true)}
          className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
        >
          Change PIN
        </button>
      </div>
    </div>
  )
}
