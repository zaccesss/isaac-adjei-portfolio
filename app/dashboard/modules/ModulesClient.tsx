"use client"

import { useState, useTransition } from "react"
import { updateAssessmentMark, updateModuleStatus, createAssessment } from "../actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronUp, Plus } from "lucide-react"

type Assessment = {
  id: string
  name: string
  type: string | null
  weight_percent: number | null
  mark_achieved: number | null
  mark_max: number | null
  target_mark: number | null
}

type Module = {
  id: string
  code: string | null
  name: string
  credits: number | null
  year: number | null
  semester: number | null
  status: string
  assessments: Assessment[]
}

function calcMark(assessments: Assessment[]): number | null {
  const graded = assessments.filter(
    (a) => a.mark_achieved != null && a.weight_percent != null && a.mark_max != null
  )
  if (!graded.length) return null
  const total = graded.reduce(
    (s, a) => s + (a.mark_achieved! / a.mark_max!) * a.weight_percent!,
    0
  )
  return Math.round(total * 100) / 100
}

function markColour(mark: number | null, target: number | null): string {
  if (mark == null) return "text-muted-foreground"
  const threshold = target ?? 80
  if (mark >= threshold) return "text-green-600 dark:text-green-400"
  if (mark >= threshold * 0.85) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

function classLabel(mark: number | null): string {
  if (mark == null) return "-"
  if (mark >= 80) return "First"
  if (mark >= 60) return "2:1"
  if (mark >= 40) return "2:2"
  return "Fail"
}

function classBadge(mark: number | null): string {
  if (mark == null) return "bg-muted text-muted-foreground"
  if (mark >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
  if (mark >= 60) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
  if (mark >= 40) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
}

function statusBadge(status: string): string {
  if (status === "complete") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
  if (status === "resit") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
}

function statusLabel(status: string): string {
  if (status === "complete") return "Complete"
  if (status === "resit") return "Resit"
  return "In Progress"
}

function AssessmentRow({ a, moduleId }: { a: Assessment; moduleId: string }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(a.mark_achieved?.toString() ?? "")
  const [, startTransition] = useTransition()

  function save() {
    const num = val === "" ? null : parseFloat(val)
    startTransition(() => updateAssessmentMark(a.id, num))
    setEditing(false)
  }

  const weightedMark =
    a.mark_achieved != null && a.weight_percent != null && a.mark_max != null
      ? ((a.mark_achieved / a.mark_max) * a.weight_percent).toFixed(2)
      : null

  // I flag assessments worth >30% that could trigger the IET component fail rule
  const ietFlag = (a.weight_percent ?? 0) > 30

  return (
    <tr className="border-b border-border/50 last:border-0 text-sm">
      <td className="py-2 pr-4">
        <div className="flex items-center gap-1.5">
          <span>{a.name}</span>
          {ietFlag && (
            <span title="IET rule: must score ≥30% on this component" className="text-xs text-amber-600 dark:text-amber-400 font-medium">⚠</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground capitalize">{a.type} · {a.weight_percent}%</span>
      </td>
      <td className="py-2 pr-4 text-right">
        {editing ? (
          <div className="flex items-center gap-1 justify-end">
            <Input
              className="w-20 h-7 text-xs text-right"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save() }}
              autoFocus
            />
            <Button size="sm" className="h-7 px-2 text-xs" onClick={save}>Save</Button>
          </div>
        ) : (
          <button
            className="text-right hover:underline cursor-pointer"
            onClick={() => setEditing(true)}
          >
            {a.mark_achieved != null ? `${a.mark_achieved}%` : <span className="text-muted-foreground">-</span>}
          </button>
        )}
      </td>
      <td className="py-2 text-right text-muted-foreground text-xs">
        {weightedMark != null ? `${weightedMark}` : "-"}
      </td>
    </tr>
  )
}

function AddAssessmentDialog({ moduleId, onClose }: { moduleId: string; onClose: () => void }) {
  const [form, setForm] = useState({
    name: "", type: "coursework", weight_percent: 0, mark_achieved: "", mark_max: 100, target_mark: 70,
  })
  const [, startTransition] = useTransition()
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }))

  function save() {
    startTransition(() => createAssessment({
      module_id: moduleId,
      name: form.name,
      type: form.type,
      weight_percent: form.weight_percent,
      mark_achieved: form.mark_achieved === "" ? null : parseFloat(form.mark_achieved as string),
      mark_max: form.mark_max,
      target_mark: form.target_mark,
    }))
    onClose()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Name</label>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Coursework 1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Type</label>
          <Select value={form.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["coursework","exam","lab","project"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Weight (%)</label>
          <Input type="number" value={form.weight_percent} onChange={(e) => set("weight_percent", Number(e.target.value))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Mark achieved (%)</label>
          <Input value={form.mark_achieved} onChange={(e) => set("mark_achieved", e.target.value)} placeholder="Leave blank if pending" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Target mark (%)</label>
          <Input type="number" value={form.target_mark} onChange={(e) => set("target_mark", Number(e.target.value))} />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={!form.name.trim()}>Add</Button>
      </div>
    </div>
  )
}

function ModuleCard({ mod }: { mod: Module }) {
  const [open, setOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [, startTransition] = useTransition()
  const mark = calcMark(mod.assessments)

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <button
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">{mod.code}</span>
            <span className="font-medium text-sm">{mod.name}</span>
            <Badge className={`text-xs px-2 py-0 ${statusBadge(mod.status)}`}>{statusLabel(mod.status)}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{mod.credits} credits</span>
            {mark != null && (
              <>
                <span className={`text-sm font-semibold ${markColour(mark, null)}`}>{mark}%</span>
                <Badge className={`text-xs px-2 py-0 ${classBadge(mark)}`}>{classLabel(mark)}</Badge>
              </>
            )}
            {mark == null && mod.assessments.length > 0 && (
              <span className="text-xs text-muted-foreground">No marks yet</span>
            )}
            {mod.assessments.length === 0 && (
              <span className="text-xs text-muted-foreground italic">No assessments added</span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-muted-foreground">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border/50 p-4 flex flex-col gap-4">
          {mod.assessments.length > 0 && (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border/50">
                  <th className="text-left pb-2 font-normal">Assessment</th>
                  <th className="text-right pb-2 font-normal pr-4">Mark</th>
                  <th className="text-right pb-2 font-normal">Weighted</th>
                </tr>
              </thead>
              <tbody>
                {mod.assessments.map((a) => (
                  <AssessmentRow key={a.id} a={a} moduleId={mod.id} />
                ))}
              </tbody>
            </table>
          )}

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" />Add assessment
            </Button>
            <Select
              value={mod.status}
              onValueChange={(v) => startTransition(() => updateModuleStatus(mod.id, v))}
            >
              <SelectTrigger className="w-36 h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">In Progress</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="resit">Resit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add assessment — {mod.code}</DialogTitle></DialogHeader>
          <AddAssessmentDialog moduleId={mod.id} onClose={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

const YEAR_LABELS: Record<number, string> = {
  1: "Year 1 — Stage 1 (Level 4)",
  2: "Year 2 — Stage 2 (Level 5)",
  3: "Final Year — Stage F (Level 6)",
}

export default function ModulesClient({ modules }: { modules: Module[] }) {
  const years = [...new Set(modules.map((m) => m.year ?? 0))].sort()

  // overall year 1 stats
  const y1mods = modules.filter((m) => m.year === 1)
  const y1completed = y1mods.filter((m) => m.status === "complete")
  const y1marks = y1completed.map((m) => calcMark(m.assessments)).filter((x): x is number => x != null)
  const y1avg = y1marks.length ? (y1marks.reduce((s, x) => s + x, 0) / y1marks.length).toFixed(2) : null
  const y1credits = y1completed.reduce((s, m) => s + (m.credits ?? 0), 0)

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex items-start justify-between">
        <h1 className="text-xl font-semibold">Modules</h1>
      </div>

      {/* Year 1 stats bar */}
      {y1avg && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Year 1 average", value: `${y1avg}%` },
            { label: "Classification", value: classLabel(parseFloat(y1avg)) },
            { label: "Credits done", value: `${y1credits} / 120` },
            { label: "Modules done", value: `${y1completed.length} / ${y1mods.length}` },
          ].map(({ label, value }) => (
            <div key={label} className="border border-border rounded-lg p-3 bg-card flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="font-semibold text-sm">{value}</span>
            </div>
          ))}
        </div>
      )}

      {years.map((year) => (
        <div key={year} className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {YEAR_LABELS[year] ?? `Year ${year}`}
          </p>
          {modules
            .filter((m) => (m.year ?? 0) === year)
            .map((mod) => <ModuleCard key={mod.id} mod={mod} />)}
        </div>
      ))}
    </div>
  )
}
