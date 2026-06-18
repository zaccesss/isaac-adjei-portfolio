// I store all academic publications and research outputs for the /research-publications page.

export interface Publication {
  id: string
  title: string
  authors: string[]
  venue: string
  year: number
  month?: number
  doi: string
  zenodoUrl?: string
  scholarUrl?: string
  pdfUrl?: string
  type: "technical-note" | "conference" | "journal" | "preprint"
  abstract?: string
  keywords?: string[]
}

// Auto-generated: one file per entry
import _0 from "./items/git-unlocked-2026"

export const publications: Publication[] = [
  _0,
]
