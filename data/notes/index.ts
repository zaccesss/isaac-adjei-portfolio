// I store my public research/project notes as structured entries so /notes/[slug] can render any
// of them from one dynamic route instead of a hand-rolled page per note. One file per entry,
// same pattern as data/til and data/blog.

export type NoteBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[] }
  | { type: "pre"; text: string }

export interface NoteReference {
  text: string
  url: string
}

export interface NoteEntry {
  slug: string
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  tags: string[]
  lead: string
  body: NoteBlock[]
  references: NoteReference[]
}

export function getNoteBySlug(slug: string): NoteEntry | undefined {
  return notes.find((n) => n.slug === slug)
}

// Auto-generated: one file per entry
import multiSportAiPredictor from "./entries/multi-sport-ai-predictor"
import prostheticsHealthTech from "./entries/prosthetics-health-tech"
import codeforcesAutoPush from "./entries/codeforces-auto-push"

export const notes: NoteEntry[] = [
  multiSportAiPredictor,
  prostheticsHealthTech,
  codeforcesAutoPush,
]
