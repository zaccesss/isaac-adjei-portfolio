"use client"

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
