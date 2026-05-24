"use client"

import { useRouter } from "next/navigation"
import PinGate from "@/components/dashboard/PinGate"
import CourseClient from "./CourseClient"

type CourseModule = {
  id: string
  stage: string
  section: string | null
  code: string
  title: string
  credits: number | null
  level: number | null
  core_or_option: string
  condonable: boolean
  prerequisites: string | null
  order_index: number
}

// I accept the same config shape CourseClient expects
type CourseConfig = Record<string, unknown>

export default function CourseWrapper({
  pinVerified,
  modules,
  config,
}: {
  pinVerified: boolean
  modules: CourseModule[]
  config: CourseConfig
}) {
  const router = useRouter()

  if (!pinVerified) {
    // I call router.refresh() on unlock so the server re-runs the page with pinVerified=true
    return <PinGate pageName="Course" onUnlock={() => router.refresh()} />
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <CourseClient modules={modules} config={config as any} />
}
