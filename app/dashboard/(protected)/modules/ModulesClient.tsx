"use client"

import { useState, useTransition } from "react"
import {
  updateAssessmentMark, updateAssessment, createAssessment, deleteAssessment,
  updateModuleStatus, updateModule, createModule, deleteModule,
} from "../../actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronDown, ChevronUp, Plus, Trash2, Edit2, AlertTriangle } from "lucide-react"
import { AssessmentBarChart, ProgressLineChart } from "./ModuleCharts"

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
  code: string | null
  name: string
  credits: number | null
  year: number | null
  semester: number | null
  status: string
  summary: string | null
  rules: string | null
  assessments: Assessment[]
}

const YEAR_ORDER = [1, 2, 3, 4]
const YEAR_LABELS: Record<number, string> = {
  1: "Year 1 - Stage 1 (Level 4)",
  2: "Year 2 - Stage 2 (Level 5)",
  3: "Placement Year (Optional)",
  4: "Final Year - Stage F (Level 6)",
}
const YEAR_SHORT: Record<number, string> = { 1: "Year 1", 2: "Year 2", 3: "Placement", 4: "Final Year" }

const ASSESSMENT_TYPES = ["coursework","exam","lab","project","quiz","report","dissertation","presentation","portfolio","other"]
const QUIZ_FORMATS = ["online","in-person","open book","closed book"]

function calcMark(assessments: Assessment[]): number | null {
  const graded = assessments.filter((a) => !a.is_pass_fail && a.mark_achieved != null && a.weight_percent != null && a.mark_max != null)
  if (!graded.length) return null
  const total = graded.reduce((s, a) => s + (a.mark_achieved! / a.mark_max!) * a.weight_percent!, 0)
  return Math.round(total * 100) / 100
}

function classLabel(mark: number | null): string {
  if (mark == null) return "-"
  if (mark >= 80) return "First"
  if (mark >= 60) return "2:1"
  if (mark >= 40) return "2:2"
  return "Fail"
}

function markColour(mark: number | null): string {
  if (mark == null) return "text-muted-foreground"
  if (mark >= 80) return "text-green-600 dark:text-green-400"
  if (mark >= 60) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

function classBadge(mark: number | null): string {
  if (mark == null) return "bg-muted text-muted-foreground"
  if (mark >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
  if (mark >= 60) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
  if (mark >= 40) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
}

function requiredFor(remaining: number, current: number): { pass: string; twoTwo: string; twoOne: string; first: string } {
  function needed(target: number): string {
    if (current >= target) return "Already achieved"
    if (remaining <= 0) return "Not achievable"
    const needed = ((target - current) / remaining) * 100
    return needed > 100 ? "Not achievable" : `${needed.toFixed(1)}%`
  }
  return { pass: needed(40), twoTwo: needed(40), twoOne: needed(60), first: needed(80) }
}

function StatsBar({ label, stats }: { label: string; stats: { label: string; value: string; colour?: string }[] }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label: l, value, colour }) => (
          <div key={l} className="border border-border rounded-lg p-3 bg-card flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{l}</span>
            <span className={`font-semibold text-sm ${colour ?? ""}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AssessmentRow({ a, onEdit, onDelete }: {
  a: Assessment
  onEdit: (a: Assessment) => void
  onDelete: (id: string) => void
}) {
  const [editingMark, setEditingMark] = useState(false)
  const [val, setVal] = useState(a.mark_achieved?.toString() ?? "")
  const [, startTransition] = useTransition()

  function saveMark() {
    const num = val === "" ? null : parseFloat(val)
    startTransition(() => updateAssessmentMark(a.id, num))
    setEditingMark(false)
  }

  const weighted = a.mark_achieved != null && a.weight_percent != null && a.mark_max != null
    ? ((a.mark_achieved / a.mark_max) * a.weight_percent).toFixed(2)
    : null

  const ietFlag = !a.is_pass_fail && (a.weight_percent ?? 0) > 30
  const missingDate = !a.date && !a.week

  return (
    <tr className="border-b border-border/50 last:border-0 text-sm">
      <td className="py-2 pr-3 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm">{a.name}</span>
          {ietFlag && <span title="IET: must score 30%+ on this component"><AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" /></span>}
          {missingDate && <span className="text-xs text-amber-500" title="No date or week set">!</span>}
        </div>
        <div className="text-xs text-muted-foreground capitalize">{a.type} · {a.is_pass_fail ? "Pass/Fail" : `${a.weight_percent}%`}</div>
        {(a.week || a.date) && <div className="text-xs text-muted-foreground">{a.week}{a.week && a.date ? " · " : ""}{a.date ? new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}</div>}
      </td>
      <td className="py-2 pr-3 text-right">
        {a.is_pass_fail ? (
          <span className={`text-xs font-medium ${a.mark_achieved != null ? "text-green-600" : "text-muted-foreground"}`}>
            {a.mark_achieved != null ? "Pass" : "-"}
          </span>
        ) : editingMark ? (
          <div className="flex items-center gap-1 justify-end">
            <Input className="w-20 h-7 text-xs text-right" value={val} onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveMark() }} autoFocus />
            <Button size="sm" className="h-7 px-2 text-xs" onClick={saveMark}>Save</Button>
          </div>
        ) : (
          <button type="button" onClick={() => setEditingMark(true)} className="text-right hover:underline cursor-pointer">
            {a.mark_achieved != null ? (
              <span className={`font-medium ${markColour(a.mark_achieved)}`}>{a.mark_achieved}%</span>
            ) : <span className="text-muted-foreground">-</span>}
          </button>
        )}
      </td>
      <td className="py-2 pr-3 text-right text-xs text-muted-foreground">{weighted ?? "-"}</td>
      <td className="py-2 text-right">
        <div className="flex gap-1 justify-end">
          <button type="button" onClick={() => onEdit(a)} aria-label="Edit assessment" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="h-3 w-3" /></button>
          <button type="button" onClick={() => onDelete(a.id)} aria-label="Delete assessment" className="p-1 rounded hover:bg-muted text-destructive/60 hover:text-destructive transition-colors"><Trash2 className="h-3 w-3" /></button>
        </div>
      </td>
    </tr>
  )
}

function AssessmentForm({ initial, moduleId, onClose }: {
  initial?: Partial<Assessment>
  moduleId: string
  onClose: (saved: Assessment | null) => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    type: initial?.type ?? "coursework",
    quizFormat: "",
    weight_percent: initial?.weight_percent ?? 0,
    mark_achieved: initial?.mark_achieved?.toString() ?? "",
    mark_max: initial?.mark_max ?? 100,
    target_mark: initial?.target_mark ?? 70,
    date: initial?.date ?? "",
    week: initial?.week ?? "",
    is_pass_fail: initial?.is_pass_fail ?? false,
    my_notes: initial?.my_notes ?? "",
  })
  const [, startTransition] = useTransition()

  function save() {
    const typeFull = form.type === "quiz" && form.quizFormat ? `quiz (${form.quizFormat})` : form.type
    const data = {
      module_id: moduleId,
      name: form.name,
      type: typeFull,
      weight_percent: form.weight_percent,
      mark_achieved: form.mark_achieved === "" ? null : parseFloat(form.mark_achieved),
      mark_max: form.mark_max,
      target_mark: form.target_mark,
      date: form.date || null,
      week: form.week || null,
      is_pass_fail: form.is_pass_fail,
      my_notes: form.my_notes || null,
    }
    if (initial?.id) {
      startTransition(() => updateAssessment(initial.id!, data))
      onClose({ id: initial.id!, ...data, mark_max: form.mark_max } as Assessment)
    } else {
      startTransition(async () => {
        const inserted = await createAssessment(data)
        onClose(inserted as Assessment)
      })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Assessment name" autoFocus />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Type</label>
          <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{ASSESSMENT_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {form.type === "quiz" && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Quiz format</label>
            <Select value={form.quizFormat} onValueChange={(v) => setForm((f) => ({ ...f, quizFormat: v }))}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>{QUIZ_FORMATS.map((f) => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Weight (%)</label>
          <Input type="number" value={form.weight_percent} onChange={(e) => setForm((f) => ({ ...f, weight_percent: Number(e.target.value) }))} className="h-8 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Week</label>
          <Input value={form.week} onChange={(e) => setForm((f) => ({ ...f, week: e.target.value }))} placeholder="e.g. Week 6" className="h-8 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Due date</label>
          <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="h-8 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Mark achieved (%)</label>
          <Input value={form.mark_achieved} onChange={(e) => setForm((f) => ({ ...f, mark_achieved: e.target.value }))} placeholder="Leave blank if pending" className="h-8 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Target (%)</label>
          <Input type="number" value={form.target_mark} onChange={(e) => setForm((f) => ({ ...f, target_mark: Number(e.target.value) }))} className="h-8 text-sm" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={form.is_pass_fail} onChange={(e) => setForm((f) => ({ ...f, is_pass_fail: e.target.checked }))} />
        Pass/Fail assessment (does not count toward module mark)
      </label>
      <Input value={form.my_notes} onChange={(e) => setForm((f) => ({ ...f, my_notes: e.target.value }))} placeholder="My notes about this assessment (optional)" className="h-8 text-sm" />
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={() => onClose(null)}>Cancel</Button>
        <Button size="sm" onClick={save} disabled={!form.name.trim()}>Save</Button>
      </div>
    </div>
  )
}

function ModuleDetail({ mod: initial, onBack }: { mod: Module; onBack: () => void }) {
  const [mod, setMod] = useState<Module>(initial)
  const [addAssOpen, setAddAssOpen] = useState(false)
  const [editAss, setEditAss] = useState<Assessment | null>(null)
  const [editingModule, setEditingModule] = useState(false)
  const [modDraft, setModDraft] = useState({ name: mod.name, code: mod.code ?? "", credits: mod.credits ?? 15, summary: mod.summary ?? "", rules: mod.rules ?? "" })
  const [, startTransition] = useTransition()

  const graded = mod.assessments.filter((a) => !a.is_pass_fail)
  const passFail = mod.assessments.filter((a) => a.is_pass_fail)
  const mark = calcMark(graded)
  const completedWeight = graded.filter((a) => a.mark_achieved != null).reduce((s, a) => s + (a.weight_percent ?? 0), 0)
  const remainingWeight = graded.reduce((s, a) => s + (a.weight_percent ?? 0), 0) - completedWeight
  const req = requiredFor(remainingWeight, mark ?? 0)

  const chartData = graded
    .filter((a) => a.mark_achieved != null)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
    .map((a) => ({
      name: a.name.length > 10 ? a.name.slice(0, 10) + "…" : a.name,
      mark: a.mark_achieved,
      weighted: a.weight_percent != null && a.mark_max != null ? (a.mark_achieved! / a.mark_max) * a.weight_percent : null,
    }))

  function handleAssessmentSaved(saved: Assessment | null) {
    if (!saved) { setAddAssOpen(false); setEditAss(null); return }
    if (editAss) {
      setMod((m) => ({ ...m, assessments: m.assessments.map((a) => a.id === saved.id ? saved : a) }))
    } else {
      setMod((m) => ({ ...m, assessments: [...m.assessments, saved] }))
    }
    setAddAssOpen(false)
    setEditAss(null)
  }

  function handleDeleteAssessment(id: string) {
    setMod((m) => ({ ...m, assessments: m.assessments.filter((a) => a.id !== id) }))
    startTransition(() => deleteAssessment(id))
  }

  function saveModuleEdit() {
    setMod((m) => ({ ...m, ...modDraft }))
    setEditingModule(false)
    startTransition(() => updateModule(mod.id, modDraft))
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} aria-label="Back to modules" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft className="h-4 w-4" /></button>
        <div className="flex flex-col gap-0.5 min-w-0">
          {editingModule ? (
            <div className="flex gap-2 items-center">
              <Input value={modDraft.code} onChange={(e) => setModDraft((d) => ({ ...d, code: e.target.value }))} placeholder="Code" className="h-7 w-24 text-xs font-mono" />
              <Input value={modDraft.name} onChange={(e) => setModDraft((d) => ({ ...d, name: e.target.value }))} className="h-7 text-sm flex-1" />
              <Button size="sm" className="h-7 text-xs" onClick={saveModuleEdit}>Save</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingModule(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground">{mod.code}</span>
              <h1 className="font-semibold text-lg">{mod.name}</h1>
              <button type="button" onClick={() => setEditingModule(true)} aria-label="Edit module" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Edit2 className="h-3.5 w-3.5" /></button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">{mod.credits} credits · {mod.year ? YEAR_SHORT[mod.year] : ""}</p>
        </div>
      </div>

      {/* Grade thresholds */}
      <div className="flex gap-px h-6 rounded-lg overflow-hidden text-xs font-medium">
        <div className="flex items-center justify-center bg-green-500 text-white flex-1">First ≥80%</div>
        <div className="flex items-center justify-center bg-blue-500 text-white flex-1">2:1 60-79%</div>
        <div className="flex items-center justify-center bg-amber-500 text-white flex-1">2:2 40-59%</div>
        <div className="flex items-center justify-center bg-red-500 text-white flex-1">Fail &lt;40%</div>
      </div>

      {/* Module stats */}
      {mark != null && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Current mark", value: `${mark}%`, colour: markColour(mark) },
            { label: "Classification", value: classLabel(mark) },
            { label: "Completed weight", value: `${completedWeight}%` },
            { label: "Remaining weight", value: `${remainingWeight}%` },
          ].map(({ label, value, colour }) => (
            <div key={label} className="border border-border rounded-lg p-3 bg-card flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className={`font-semibold text-sm ${colour ?? ""}`}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Required averages */}
      {remainingWeight > 0 && (
        <div className="border border-border rounded-lg p-3 bg-card">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Need for remaining {remainingWeight}% weight</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div><span className="text-muted-foreground">Pass (40%):</span> <span className="font-medium">{req.pass}</span></div>
            <div><span className="text-muted-foreground">2:2 (40%):</span> <span className="font-medium">{req.twoTwo}</span></div>
            <div><span className="text-muted-foreground">2:1 (60%):</span> <span className="font-medium text-blue-600">{req.twoOne}</span></div>
            <div><span className="text-muted-foreground">First (80%):</span> <span className="font-medium text-green-600">{req.first}</span></div>
          </div>
        </div>
      )}

      {/* Charts */}
      {chartData.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Assessment marks</p>
            <AssessmentBarChart data={chartData} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Progress trend</p>
            <ProgressLineChart data={chartData} />
          </div>
        </div>
      )}

      {/* Assessments table */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Graded assessments</p>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setEditAss(null); setAddAssOpen(true) }}>
            <Plus className="h-3 w-3" />Add
          </Button>
        </div>

        {graded.length > 0 ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border/50 bg-muted/30">
                  <th className="text-left px-3 py-2 font-normal">Assessment</th>
                  <th className="text-right px-3 py-2 font-normal">Mark</th>
                  <th className="text-right px-3 py-2 font-normal">Weighted</th>
                  <th className="text-right px-3 py-2 font-normal"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {graded.map((a) => (
                  <AssessmentRow key={a.id} a={a} onEdit={(a) => { setEditAss(a); setAddAssOpen(true) }} onDelete={handleDeleteAssessment} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-lg p-5 text-center">
            <p className="text-sm text-muted-foreground">No assessments yet.</p>
          </div>
        )}

        {passFail.length > 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-2">Pass/Fail (do not count toward mark)</p>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y divide-border/30">
                  {passFail.map((a) => (
                    <AssessmentRow key={a.id} a={a} onEdit={(a) => { setEditAss(a); setAddAssOpen(true) }} onDelete={handleDeleteAssessment} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Module status</span>
        <Select value={mod.status} onValueChange={(v) => { setMod((m) => ({ ...m, status: v })); startTransition(() => updateModuleStatus(mod.id, v)) }}>
          <SelectTrigger className="w-36 h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ongoing">In Progress</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="resit">Resit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      {mod.summary && (
        <div className="border border-border rounded-lg p-3 bg-muted/20">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Module summary</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{mod.summary}</p>
        </div>
      )}

      <Dialog open={addAssOpen} onOpenChange={(o) => { if (!o) { setAddAssOpen(false); setEditAss(null) } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editAss ? "Edit assessment" : "New assessment"}</DialogTitle></DialogHeader>
          <AssessmentForm initial={editAss ?? undefined} moduleId={mod.id} onClose={handleAssessmentSaved} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function yearStats(mods: Module[]) {
  const completed = mods.filter((m) => m.status === "complete")
  const marks = completed.map((m) => calcMark(m.assessments)).filter((x): x is number => x != null)
  if (!marks.length) return null
  const avg = parseFloat((marks.reduce((s, x) => s + x, 0) / marks.length).toFixed(2))
  const credits = completed.reduce((s, m) => s + (m.credits ?? 0), 0)
  const totalCredits = mods.reduce((s, m) => s + (m.credits ?? 0), 0)
  return { avg, credits, totalCredits, done: completed.length, total: mods.length }
}

function YearCard({ year, mods, onClick }: { year: number; mods: Module[]; onClick: () => void }) {
  const ys = yearStats(mods)
  const label = YEAR_LABELS[year] ?? `Year ${year}`

  return (
    <button type="button" onClick={onClick} className="w-full text-left border border-border rounded-xl p-5 bg-card hover:shadow-md transition-all">
      <p className="font-semibold text-sm">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{mods.length} module{mods.length !== 1 ? "s" : ""}</p>
      {ys ? (
        <div className="mt-3 flex gap-4 text-xs">
          <span className={`font-semibold ${markColour(ys.avg)}`}>{ys.avg}%</span>
          <span className="text-muted-foreground">{classLabel(ys.avg)}</span>
          <span className="text-muted-foreground">{ys.credits}/{ys.totalCredits} credits</span>
          <span className="text-muted-foreground">{ys.done}/{ys.total} done</span>
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">No completed modules yet</p>
      )}
    </button>
  )
}

function YearView({ year, mods: initial, onBack }: { year: number; mods: Module[]; onBack: () => void }) {
  const [mods, setMods] = useState<Module[]>(initial)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [addModOpen, setAddModOpen] = useState(false)
  const [, startTransition] = useTransition()
  const ys = yearStats(mods)

  if (selectedModule) {
    const live = mods.find((m) => m.id === selectedModule.id) ?? selectedModule
    return <ModuleDetail mod={live} onBack={() => setSelectedModule(null)} />
  }

  const allMarks = mods.flatMap((m) => m.assessments.filter((a) => !a.is_pass_fail && a.mark_achieved != null))
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
    .map((a) => ({
      name: a.name.length > 8 ? a.name.slice(0, 8) + "…" : a.name,
      mark: a.mark_achieved,
      weighted: null,
    }))

  const moduleMarks = mods.map((m) => {
    const mark = calcMark(m.assessments)
    return { name: m.code ?? m.name.slice(0, 6), mark, weighted: null }
  }).filter((m) => m.mark != null)

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} aria-label="Back to years" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft className="h-4 w-4" /></button>
        <h1 className="font-semibold text-lg">{YEAR_LABELS[year] ?? `Year ${year}`}</h1>
      </div>

      {/* Grade thresholds bar */}
      <div className="flex gap-px h-6 rounded-lg overflow-hidden text-xs font-medium">
        <div className="flex items-center justify-center bg-green-500 text-white flex-1">First ≥80%</div>
        <div className="flex items-center justify-center bg-blue-500 text-white flex-1">2:1 60-79%</div>
        <div className="flex items-center justify-center bg-amber-500 text-white flex-1">2:2 40-59%</div>
        <div className="flex items-center justify-center bg-red-500 text-white flex-1">Fail &lt;40%</div>
      </div>

      {/* Year stats */}
      {ys && (
        <StatsBar label="" stats={[
          { label: `${YEAR_SHORT[year] ?? "Year"} average`, value: `${ys.avg}%`, colour: markColour(ys.avg) },
          { label: "Classification", value: classLabel(ys.avg) },
          { label: "Credits done", value: `${ys.credits} / ${ys.totalCredits}` },
          { label: "Modules done", value: `${ys.done} / ${ys.total}` },
        ]} />
      )}

      {/* Year charts */}
      {moduleMarks.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">All module marks</p>
            <AssessmentBarChart data={moduleMarks} />
          </div>
          {allMarks.length >= 2 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Assessment progress trend</p>
              <ProgressLineChart data={allMarks} />
            </div>
          )}
        </div>
      )}

      {/* Modules list */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Modules</p>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setAddModOpen(true)}>
          <Plus className="h-3 w-3" />Add module
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {mods.map((mod) => {
          const mark = calcMark(mod.assessments)
          return (
            <button key={mod.id} type="button" onClick={() => setSelectedModule(mod)}
              className="w-full text-left border border-border rounded-lg p-4 bg-card hover:shadow-sm transition-all flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-muted-foreground">{mod.code}</span>
                  <span className="font-medium text-sm">{mod.name}</span>
                  <Badge className={`text-xs px-2 py-0 ${mod.status === "complete" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : mod.status === "resit" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"}`}>
                    {mod.status === "complete" ? "Complete" : mod.status === "resit" ? "Resit" : "In Progress"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{mod.credits} credits</span>
                  {mark != null && <span className={`font-semibold ${markColour(mark)}`}>{mark}%</span>}
                  {mark != null && <Badge className={`text-xs px-2 py-0 ${classBadge(mark)}`}>{classLabel(mark)}</Badge>}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 -rotate-90" />
            </button>
          )
        })}
      </div>

      <Dialog open={addModOpen} onOpenChange={setAddModOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add module to {YEAR_SHORT[year] ?? `Year ${year}`}</DialogTitle></DialogHeader>
          <AddModuleForm year={year} onClose={(mod) => { if (mod) setMods((m) => [...m, mod]); setAddModOpen(false) }} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AddModuleForm({ year, onClose }: { year: number; onClose: (mod: Module | null) => void }) {
  const [form, setForm] = useState({ code: "", name: "", credits: 15, semester: 1, status: "ongoing" })
  const [, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      const inserted = await createModule({ ...form, year, summary: "", rules: "" })
      onClose(inserted ? { ...inserted, assessments: [] } as Module : null)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Code</label>
          <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="e.g. EI2APE" className="h-8" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Credits</label>
          <Input type="number" value={form.credits} onChange={(e) => setForm((f) => ({ ...f, credits: Number(e.target.value) }))} className="h-8" />
        </div>
      </div>
      <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Module name" className="h-8" autoFocus />
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={() => onClose(null)}>Cancel</Button>
        <Button size="sm" onClick={save} disabled={!form.name.trim()}>Add</Button>
      </div>
    </div>
  )
}

export default function ModulesClient({ modules }: { modules: Module[] }) {
  const [mods, setMods] = useState<Module[]>(modules)
  const [activeYear, setActiveYear] = useState<number | null>(null)

  const yearsPresent = YEAR_ORDER.filter((y) => mods.some((m) => m.year === y))

  // Master stats
  const allCompleted = mods.filter((m) => m.status === "complete")
  const allMarks = allCompleted.map((m) => calcMark(m.assessments)).filter((x): x is number => x != null)
  const masterAvg = allMarks.length ? parseFloat((allMarks.reduce((s, x) => s + x, 0) / allMarks.length).toFixed(2)) : null
  const masterCredits = allCompleted.reduce((s, m) => s + (m.credits ?? 0), 0)
  const totalCredits = mods.reduce((s, m) => s + (m.credits ?? 0), 0)

  if (activeYear != null) {
    return (
      <YearView
        year={activeYear}
        mods={mods.filter((m) => m.year === activeYear)}
        onBack={() => setActiveYear(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <h1 className="text-xl font-semibold">Modules</h1>

      {/* Master stats */}
      {masterAvg != null && (
        <StatsBar label="Overall" stats={[
          { label: "Overall average", value: `${masterAvg}%`, colour: markColour(masterAvg) },
          { label: "Classification", value: classLabel(masterAvg) },
          { label: "Total credits", value: `${masterCredits} / ${totalCredits}` },
          { label: "Modules done", value: `${allCompleted.length} / ${mods.length}` },
        ]} />
      )}

      {/* Year cards */}
      <div className="flex flex-col gap-3">
        {yearsPresent.map((year) => (
          <YearCard key={year} year={year} mods={mods.filter((m) => m.year === year)} onClick={() => setActiveYear(year)} />
        ))}
        {/* Empty placement year placeholder */}
        {!yearsPresent.includes(3) && (
          <div className="border border-dashed border-border rounded-xl p-5 text-center">
            <p className="text-sm text-muted-foreground">Placement Year - not started</p>
            <p className="text-xs text-muted-foreground mt-0.5">Add modules with year 3 to track your placement</p>
          </div>
        )}
      </div>
    </div>
  )
}
