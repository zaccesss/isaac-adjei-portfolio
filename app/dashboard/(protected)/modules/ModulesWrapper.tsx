// I separate the PIN gate from ModulesClient so the server page can pass pinVerified
// as a prop without making ModulesClient itself a client component that knows about routing.
"use client"

import { useRouter } from "next/navigation"
import PinGate from "@/components/dashboard/PinGate"
import ModulesClient, { type Module } from "./ModulesClient"

export default function ModulesWrapper({
  pinVerified,
  modules,
}: {
  pinVerified: boolean
  modules: Module[]
}) {
  const router = useRouter()

  if (!pinVerified) {
    // I call router.refresh() on unlock so the server re-runs the page with pinVerified=true
    return <PinGate pageName="Modules" onUnlock={() => router.refresh()} />
  }

  return <ModulesClient modules={modules} />
}
