"use client"
// I use a thin wrapper here because the server page passes config as
// Record<string, unknown> (the generic Supabase JSON type) and CourseClient expects
// a typed CourseConfig. The cast lives here to keep it out of the server page.

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

type CourseConfig = Record<string, unknown>

export default function CourseWrapper({
  modules,
  config,
}: {
  modules: CourseModule[]
  config: CourseConfig
}) {
  return <CourseClient modules={modules} config={config as any} />
}
