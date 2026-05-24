"use client"

import { useRouter } from "next/navigation"
import PinGate from "@/components/dashboard/PinGate"
import ModulesClient from "./ModulesClient"

// I re-use the Module type from ModulesClient but declare it here to avoid a circular import
type Assessment = {
  id: string
  name: string
  type: string | null
  weight_percent: number | null
  mark_achieved: number | null
  mark_max: number | null
  target_mark: number | null
  date: string | null
  week: string | null
  is_pass_fail: boolean
  my_notes: string | null
}

type Module = {
  id: string
  code: string
  title: string
  year: number
  semester: number | null
  credits: number | null
  assessments: Assessment[]
  [key: string]: unknown
}

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
