"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// I group server actions by section to keep the file navigable

export async function createGoal(data: {
  title: string
  description: string
  category: string
  status: string
  target_date: string
  progress: number
}) {
  await supabase.from("goals").insert(data)
  revalidatePath("/dashboard/goals")
}

export async function updateGoal(id: string, data: Partial<{
  title: string
  description: string
  category: string
  status: string
  target_date: string
  progress: number
}>) {
  await supabase.from("goals").update(data).eq("id", id)
  revalidatePath("/dashboard/goals")
}

export async function deleteGoal(id: string) {
  await supabase.from("goals").delete().eq("id", id)
  revalidatePath("/dashboard/goals")
}

// Modules

export async function updateAssessmentMark(id: string, mark: number | null) {
  await supabase.from("assessments").update({ mark_achieved: mark }).eq("id", id)
  revalidatePath("/dashboard/modules")
}

export async function createAssessment(data: {
  module_id: string
  name: string
  type: string
  weight_percent: number
  mark_achieved: number | null
  mark_max: number
  target_mark: number | null
}) {
  await supabase.from("assessments").insert(data)
  revalidatePath("/dashboard/modules")
}

export async function updateModuleStatus(id: string, status: string) {
  await supabase.from("modules").update({ status }).eq("id", id)
  revalidatePath("/dashboard/modules")
}

// Internships

export async function createApplication(data: {
  company: string
  role: string
  applied_date: string
  deadline: string
  status: string
  notes: string
  url: string
  starred: boolean
}) {
  await supabase.from("applications").insert(data)
  revalidatePath("/dashboard/internships")
}

export async function updateApplication(id: string, data: Partial<{
  company: string
  role: string
  applied_date: string
  deadline: string
  status: string
  notes: string
  url: string
  starred: boolean
}>) {
  await supabase.from("applications").update(data).eq("id", id)
  revalidatePath("/dashboard/internships")
}

export async function deleteApplication(id: string) {
  await supabase.from("applications").delete().eq("id", id)
  revalidatePath("/dashboard/internships")
}
