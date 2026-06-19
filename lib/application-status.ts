// Single source of truth for application status classification. Kanban, Analytics and the
// Table view each used to define their own normaliseStatus()/active-status filter, which drifted
// out of sync over time (the most visible symptom: Kanban checked a raw "scraped" status value
// against data that had already been normalised, so the check never matched anything).

export const APPLICATION_STATUSES = [
  "Not Applied",
  "Interested",
  "Application Submitted",
  "Online Assessment",
  "Case Study",
  "HireVue",
  "Telephone Interview",
  "Video Interview",
  "Face-to-face Interview",
  "Assessment Centre",
  "Final Round",
  "Offer Received",
  "Negotiating",
  "Accepted",
  "Rejected",
  "Ghosted",
  "Withdrawn",
  "Not Interested",
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

// Legacy/scraper DB values, keyed by lower_snake_case so callers don't need to match casing/spacing.
const LEGACY_STATUS_MAP: Record<string, ApplicationStatus> = {
  not_applied: "Not Applied",
  scraped: "Not Applied",
  interested: "Interested",
  applied: "Application Submitted",
  application_submitted: "Application Submitted",
  oa: "Online Assessment",
  online_assessment: "Online Assessment",
  case_study: "Case Study",
  hirevue: "HireVue",
  phone_screen: "Telephone Interview",
  telephone_interview: "Telephone Interview",
  video_interview: "Video Interview",
  face_to_face: "Face-to-face Interview",
  face_to_face_interview: "Face-to-face Interview",
  assessment_centre: "Assessment Centre",
  final_round: "Final Round",
  offer: "Offer Received",
  offer_received: "Offer Received",
  negotiating: "Negotiating",
  accepted: "Accepted",
  rejected: "Rejected",
  ghosted: "Ghosted",
  withdrawn: "Withdrawn",
  not_interested: "Not Interested",
}

export function normaliseStatus(raw: string): ApplicationStatus | string {
  const key = raw.toLowerCase().replace(/ /g, "_")
  return LEGACY_STATUS_MAP[key] ?? raw
}

export const STATUS_COLOURS: Record<string, string> = {
  "Not Applied":             "#94a3b8",
  "Interested":              "#3b82f6",
  "Application Submitted":   "#6366f1",
  "Online Assessment":       "#8b5cf6",
  "Case Study":              "#a855f7",
  "HireVue":                 "#c026d3",
  "Telephone Interview":     "#f59e0b",
  "Video Interview":         "#f97316",
  "Face-to-face Interview":  "#ef4444",
  "Assessment Centre":       "#dc2626",
  "Final Round":             "#e11d48",
  "Offer Received":          "#22c55e",
  "Negotiating":             "#14b8a6",
  "Accepted":                "#10b981",
  "Rejected":                "#64748b",
  "Ghosted":                 "#71717a",
  "Withdrawn":               "#fb923c",
  "Not Interested":          "#475569",
}

export function statusTextClass(status: string): string {
  const s = normaliseStatus(status)
  if (s === "Not Applied")            return "text-red-500 dark:text-red-400"
  if (s === "Interested")             return "text-yellow-500 dark:text-yellow-400"
  if (s === "Application Submitted")  return "text-blue-600 dark:text-blue-400"
  if (s === "Online Assessment")      return "text-violet-600 dark:text-violet-400"
  if (s === "Case Study")             return "text-cyan-600 dark:text-cyan-400"
  if (s === "HireVue")                return "text-fuchsia-600 dark:text-fuchsia-400"
  if (s === "Telephone Interview")    return "text-amber-500 dark:text-amber-400"
  if (s === "Video Interview")        return "text-lime-600 dark:text-lime-400"
  if (s === "Face-to-face Interview") return "text-orange-500 dark:text-orange-400"
  if (s === "Assessment Centre")      return "text-pink-600 dark:text-pink-400"
  if (s === "Final Round")            return "text-rose-600 dark:text-rose-400"
  if (s === "Offer Received")         return "text-green-600 dark:text-green-400"
  if (s === "Negotiating")            return "text-teal-600 dark:text-teal-400"
  if (s === "Accepted")               return "text-emerald-600 dark:text-emerald-400 font-semibold"
  if (s === "Rejected")               return "text-red-400 dark:text-red-500 line-through"
  if (s === "Ghosted")                return "text-slate-400 dark:text-slate-500 line-through opacity-60"
  if (s === "Withdrawn")              return "text-orange-400 dark:text-orange-500 italic"
  if (s === "Not Interested")         return "text-zinc-400 dark:text-zinc-500"
  return ""
}

// Statuses that still count as an open pipeline entry (not yet accepted, rejected or withdrawn).
const PIPELINE_STATUSES: ApplicationStatus[] = [
  "Not Applied", "Interested", "Application Submitted", "Online Assessment", "Case Study",
  "HireVue", "Telephone Interview", "Video Interview", "Face-to-face Interview",
  "Assessment Centre", "Final Round", "Offer Received", "Negotiating",
]

export function isInPipeline(status: string): boolean {
  return PIPELINE_STATUSES.includes(normaliseStatus(status) as ApplicationStatus)
}

// Kanban/manual-tracking entries exclude the auto-scraped Jobs tab and rows that have never been
// touched since being scraped. Must be called with the RAW (pre-normalised) status, since the
// scraper writes the literal "scraped" sentinel that normaliseStatus() maps away from.
export function isTrackedApplication(app: { type: string; status: string }): boolean {
  return app.type !== "Full-time Job" && app.status.toLowerCase() !== "scraped"
}

export type FunnelStage = "not_started" | "applied" | "assessment" | "interview" | "offer" | "rejected"

export function classifyFunnelStage(status: string): FunnelStage {
  const s = normaliseStatus(status)
  if (s === "Not Applied" || s === "Interested" || s === "Not Interested") return "not_started"
  if (s === "Rejected" || s === "Ghosted" || s === "Withdrawn") return "rejected"
  if (s === "Offer Received" || s === "Negotiating" || s === "Accepted") return "offer"
  if (s === "Telephone Interview" || s === "Video Interview" || s === "Face-to-face Interview" ||
      s === "Assessment Centre" || s === "Final Round") return "interview"
  if (s === "Online Assessment" || s === "Case Study" || s === "HireVue") return "assessment"
  return "applied" // Application Submitted
}

export function computeFunnelCounts(statuses: string[]): {
  applied: number
  assessment: number
  interview: number
  offer: number
  rejected: number
} {
  let applied = 0, assessment = 0, interview = 0, offer = 0, rejected = 0
  for (const raw of statuses) {
    const stage = classifyFunnelStage(raw)
    if (stage !== "not_started") applied++
    if (stage === "assessment") assessment++
    if (stage === "interview" || stage === "offer") interview++
    if (stage === "offer") offer++
    if (stage === "rejected") rejected++
  }
  return { applied, assessment, interview, offer, rejected }
}

// Kanban column definitions: each maps to a display status and a target status to write on drop.
export const KANBAN_COLUMNS: { id: string; label: string; targetStatus: ApplicationStatus; statuses: ApplicationStatus[] }[] = [
  { id: "wishlist",    label: "Wishlist",    targetStatus: "Interested",            statuses: ["Interested"] },
  { id: "applied",     label: "Applied",     targetStatus: "Application Submitted", statuses: ["Application Submitted"] },
  { id: "assessment",  label: "Assessment",  targetStatus: "Online Assessment",     statuses: ["Online Assessment", "HireVue", "Case Study"] },
  { id: "interview",   label: "Interview",   targetStatus: "Video Interview",       statuses: ["Telephone Interview", "Video Interview", "Face-to-face Interview", "Assessment Centre"] },
  { id: "final_round", label: "Final Round", targetStatus: "Final Round",           statuses: ["Final Round"] },
  { id: "offer",       label: "Offer",       targetStatus: "Offer Received",        statuses: ["Offer Received"] },
  { id: "negotiating", label: "Negotiating", targetStatus: "Negotiating",           statuses: ["Negotiating"] },
  { id: "accepted",    label: "Accepted",    targetStatus: "Accepted",              statuses: ["Accepted"] },
  { id: "closed",      label: "Closed",      targetStatus: "Rejected",              statuses: ["Rejected", "Ghosted", "Withdrawn", "Not Interested"] },
]
