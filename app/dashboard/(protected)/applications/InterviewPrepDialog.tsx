"use client"

import { useState, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, CheckSquare, Square, Save } from "lucide-react"
import { updateInterviewPrep } from "../../actions"
import { savedOk } from "@/lib/save-result"
import MarkdownContent from "@/components/shared/MarkdownContent"

type Question = { id: string; text: string; done: boolean }

export type InterviewPrep = {
  notes: string
  questions: Question[]
  company_research: string
}

const EMPTY_PREP: InterviewPrep = { notes: "", questions: [], company_research: "" }

const RESEARCH_LIMIT = 2000
const NOTES_LIMIT = 3000

function parsePrep(raw: unknown): InterviewPrep {
  if (!raw || typeof raw !== "object") return EMPTY_PREP
  const r = raw as Record<string, unknown>
  return {
    notes: typeof r.notes === "string" ? r.notes : "",
    questions: Array.isArray(r.questions)
      ? (r.questions as Question[]).filter(
          (q) => q && typeof q.id === "string" && typeof q.text === "string"
        )
      : [],
    company_research: typeof r.company_research === "string" ? r.company_research : "",
  }
}

function MarkdownField({
  value,
  onChange,
  placeholder,
  rows,
  limit,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  rows: number
  limit: number
}) {
  const [editing, setEditing] = useState(false)
  const remaining = limit - value.length
  const nearLimit = remaining < limit * 0.1

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, limit))}
          rows={rows}
          placeholder={placeholder}
          className="text-sm resize-none"
          autoFocus
          onBlur={() => setEditing(false)}
        />
        <p className={`text-xs text-right ${nearLimit ? "text-amber-500" : "text-muted-foreground"}`}>
          {remaining} / {limit}
        </p>
      </div>
    )
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className="min-h-[72px] cursor-text rounded-md border border-input bg-background px-3 py-2 hover:border-ring transition-colors"
    >
      {value ? (
        <MarkdownContent compact>{value}</MarkdownContent>
      ) : (
        <span className="text-sm text-muted-foreground">{placeholder}</span>
      )}
    </div>
  )
}

export default function InterviewPrepDialog({
  open,
  onClose,
  applicationId,
  company,
  role,
  initialPrep,
  onSave,
}: {
  open: boolean
  onClose: () => void
  applicationId: string
  company: string
  role: string
  initialPrep: unknown
  onSave: (prep: InterviewPrep) => void
}) {
  const [prep, setPrep] = useState<InterviewPrep>(() => parsePrep(initialPrep))
  const [newQ, setNewQ] = useState("")
  const [saved, setSaved] = useState(false)
  const [, startTransition] = useTransition()

  function setNotes(notes: string) { setPrep((p) => ({ ...p, notes })) }
  function setResearch(company_research: string) { setPrep((p) => ({ ...p, company_research })) }

  function addQuestion() {
    const text = newQ.trim()
    if (!text) return
    setPrep((p) => ({
      ...p,
      questions: [...p.questions, { id: crypto.randomUUID(), text, done: false }],
    }))
    setNewQ("")
  }

  function toggleQuestion(id: string) {
    setPrep((p) => ({
      ...p,
      questions: p.questions.map((q) => (q.id === id ? { ...q, done: !q.done } : q)),
    }))
  }

  function removeQuestion(id: string) {
    setPrep((p) => ({ ...p, questions: p.questions.filter((q) => q.id !== id) }))
  }

  function handleSave() {
    onSave(prep)
    startTransition(async () => {
      const res = await updateInterviewPrep(applicationId, prep)
      if (!savedOk(res, "Could not save interview prep")) return
      // Only flash the saved tick once the write has actually landed.
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    })
  }

  const doneCount = prep.questions.filter((q) => q.done).length

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">
            Interview Prep: {company}
            <span className="text-muted-foreground font-normal text-sm ml-1.5">/ {role}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
          {/* Company research */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Company research</label>
            <MarkdownField
              value={prep.company_research}
              onChange={setResearch}
              placeholder="Products, recent news, mission, values, competitors... (supports Markdown)"
              rows={3}
              limit={RESEARCH_LIMIT}
            />
          </div>

          {/* Question checklist */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Questions to prepare</label>
              {prep.questions.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {doneCount}/{prep.questions.length} done
                </span>
              )}
            </div>

            {prep.questions.length > 0 && (
              <div className="flex flex-col gap-1">
                {prep.questions.map((q) => (
                  <div key={q.id} className="flex items-start gap-2 group">
                    <button
                      type="button"
                      onClick={() => toggleQuestion(q.id)}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={q.done ? "Mark incomplete" : "Mark done"}
                      title={q.done ? "Mark incomplete" : "Mark done"}
                    >
                      {q.done
                        ? <CheckSquare className="h-4 w-4 text-green-500" />
                        : <Square className="h-4 w-4" />}
                    </button>
                    <span className={`flex-1 text-sm ${q.done ? "line-through text-muted-foreground" : ""}`}>
                      {q.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      aria-label="Remove question"
                      title="Remove question"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addQuestion() } }}
                placeholder="Add a question or talking point..."
                className="h-8 text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="h-8 px-2 shrink-0">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</label>
            <MarkdownField
              value={prep.notes}
              onChange={setNotes}
              placeholder="Interview notes, feedback, follow-ups, links... (supports Markdown)"
              rows={4}
              limit={NOTES_LIMIT}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          <Button size="sm" onClick={handleSave} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            {saved ? "Saved!" : "Save prep"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
