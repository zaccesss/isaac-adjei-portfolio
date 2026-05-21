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
  weight_percent: number | null  // null for pass/fail assessments which have no percentage weight
  mark_achieved: number | null   // null when the result has not yet been released
  mark_max: number | null
  target_mark: number | null
  date: string | null
  week: string | null            // free-text week label e.g. "Week 6" - I store this separately from the date
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
  assessments: Assessment[]     // I nest assessments on the module rather than fetching them separately
}

// I define year order explicitly so it is always 1→2→3→4 regardless of insertion order in the DB
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

// I compute the weighted mark purely from the assessments array in local state
// so any edits are reflected instantly without a DB round trip
function calcMark(assessments: Assessment[]): number | null {
  // I exclude pass/fail assessments because they do not contribute to the module percentage mark
  const graded = assessments.filter((a) => !a.is_pass_fail && a.mark_achieved != null && a.weight_percent != null && a.mark_max != null)
  if (!graded.length) return null
  // I calculate weighted average: for each assessment (mark / max) * weight, then sum
  // this gives the module mark as a percentage out of 100 assuming all weights sum to 100
  const total = graded.reduce((s, a) => s + (a.mark_achieved! / a.mark_max!) * a.weight_percent!, 0)
  return Math.round(total * 100) / 100
}

// I map raw marks to UK classification labels so the display is meaningful at a glance
function classLabel(mark: number | null): string {
  if (mark == null) return "-"
  if (mark >= 80) return "First"
  if (mark >= 60) return "2:1"
  if (mark >= 40) return "2:2"
  return "Fail"
}

// I use Tailwind colour classes to make the grade obvious without reading the number
function markColour(mark: number | null): string {
  if (mark == null) return "text-muted-foreground"
  if (mark >= 80) return "text-green-600 dark:text-green-400"
  if (mark >= 60) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

// I keep badge colours in a separate function from markColour because badges need background + text
function classBadge(mark: number | null): string {
  if (mark == null) return "bg-muted text-muted-foreground"
  if (mark >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
  if (mark >= 60) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
  if (mark >= 40) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
}

// I compute what average I need on the remaining weight to hit each classification boundary
// so I know exactly how hard I need to work on upcoming assessments
function requiredFor(remaining: number, current: number): { pass: string; twoTwo: string; twoOne: string; first: string } {
  function needed(target: number): string {
    if (current >= target) return "Already achieved"
    if (remaining <= 0) return "Not achievable"
    // I back-calculate: target = current + (needed * remaining/100), so needed = (target - current) / remaining * 100
    const needed = ((target - current) / remaining) * 100
    return needed > 100 ? "Not achievable" : `${needed.toFixed(1)}%`
  }
  return { pass: needed(40), twoTwo: needed(40), twoOne: needed(60), first: needed(80) }
}

// I abstract the stats grid into a reusable component because it appears at both the module and year level
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
  // I keep inline mark editing in local state so typing does not trigger a server action per keystroke
  const [editingMark, setEditingMark] = useState(false)
  const [val, setVal] = useState(a.mark_achieved?.toString() ?? "")
  // I use startTransition here so saving the mark does not freeze the input while the action runs
  const [, startTransition] = useTransition()

  function saveMark() {
    // I coerce "" to null so clearing a mark properly removes it rather than storing NaN
    const num = val === "" ? null : parseFloat(val)
    startTransition(() => updateAssessmentMark(a.id, num))
    setEditingMark(false)
  }

  // I compute the weighted contribution inline so the table column can show it immediately without a re-render
  const weighted = a.mark_achieved != null && a.weight_percent != null && a.mark_max != null
    ? ((a.mark_achieved / a.mark_max) * a.weight_percent).toFixed(2)
    : null

  // I flag assessments over 30% weight because IET accreditation requires a 30% pass on each such component
  // - failing to notice this could mean a module resit even with a passing average
  const ietFlag = !a.is_pass_fail && (a.weight_percent ?? 0) > 30
  const missingDate = !a.date && !a.week  // I surface missing dates because they make scheduling harder

  return (
    <tr className="border-b border-border/50 last:border-0 text-sm">
      <td className="py-2 pr-3 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm">{a.name}</span>
          {/* I render the IET warning icon inline with the name so it is impossible to miss */}
          {ietFlag && <span title="IET: must score 30%+ on this component"><AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" /></span>}
          {missingDate && <span className="text-xs text-amber-500" title="No date or week set">!</span>}
        </div>
        <div className="text-xs text-muted-foreground capitalize">{a.type} · {a.is_pass_fail ? "Pass/Fail" : `${a.weight_percent}%`}</div>
        {/* I only render the date row when there is something to show */}
        {(a.week || a.date) && <div className="text-xs text-muted-foreground">{a.week}{a.week && a.date ? " · " : ""}{a.date ? new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}</div>}
      </td>
      <td className="py-2 pr-3 text-right">
        {a.is_pass_fail ? (
          // I show "Pass" rather than a percentage for pass/fail assessments
          <span className={`text-xs font-medium ${a.mark_achieved != null ? "text-green-600" : "text-muted-foreground"}`}>
            {a.mark_achieved != null ? "Pass" : "-"}
          </span>
        ) : editingMark ? (
          // I show an inline input + save button when editing rather than opening a dialog
          // so the workflow stays in the same row without losing context
          <div className="flex items-center gap-1 justify-end">
            <Input className="w-20 h-7 text-xs text-right" value={val} onChange={(e) => setVal(e.target.value)}
              // I allow Enter to save so the keyboard flow is one less click
              onKeyDown={(e) => { if (e.key === "Enter") saveMark() }} autoFocus />
            <Button size="sm" className="h-7 px-2 text-xs" onClick={saveMark}>Save</Button>
          </div>
        ) : (
          // I make the mark itself clickable to enter edit mode rather than a separate edit button
          <button type="button" onClick={() => setEditingMark(true)} className="text-right hover:underline cursor-pointer">
            {a.mark_achieved != null ? (
              <span className={`font-medium ${markColour(a.mark_achieved)}`}>{a.mark_achieved}%</span>
            ) : <span className="text-muted-foreground">-</span>}
          </button>
        )}
      </td>
      {/* I show the weighted contribution so I can see at a glance which assessments are moving the needle most */}
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
  // I initialise from `initial` so the form doubles as an edit form with pre-filled values
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    type: initial?.type ?? "coursework",
    quizFormat: "",     // I separate quizFormat from type so the DB stores the combined string e.g. "quiz (online)"
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
    // I concatenate the quiz format into the type string before saving so querying is straightforward
    const typeFull = form.type === "quiz" && form.quizFormat ? `quiz (${form.quizFormat})` : form.type
    const data = {
      module_id: moduleId,
      name: form.name,
      type: typeFull,
      weight_percent: form.weight_percent,
      // I coerce the empty string mark to null so the DB column stays nullable rather than storing "NaN"
      mark_achieved: form.mark_achieved === "" ? null : parseFloat(form.mark_achieved),
      mark_max: form.mark_max,
      target_mark: form.target_mark,
      date: form.date || null,    // I coerce empty string to null so the DB date column stays null rather than ""
      week: form.week || null,
      is_pass_fail: form.is_pass_fail,
      my_notes: form.my_notes || null,
    }
    if (initial?.id) {
      // I optimistically close and pass back the updated assessment so the table updates immediately
      startTransition(() => updateAssessment(initial.id!, data))
      onClose({ id: initial.id!, ...data, mark_max: form.mark_max } as Assessment)
    } else {
      // I need to await the insert to get the DB-generated id so the row is deletable without a reload
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
        {/* I only show the quiz format Select when type is "quiz" so the form stays minimal otherwise */}
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
          {/* I use a text input rather than number here so I can leave it blank for pending results */}
          <Input value={form.mark_achieved} onChange={(e) => setForm((f) => ({ ...f, mark_achieved: e.target.value }))} placeholder="Leave blank if pending" className="h-8 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Target (%)</label>
          <Input type="number" value={form.target_mark} onChange={(e) => setForm((f) => ({ ...f, target_mark: Number(e.target.value) }))} className="h-8 text-sm" />
        </div>
      </div>
      {/* I use a native checkbox rather than a toggle component to keep the form lightweight */}
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
  // I keep a local copy of the module so edits to assessments and module metadata update instantly
  const [mod, setMod] = useState<Module>(initial)
  const [addAssOpen, setAddAssOpen] = useState(false)
  const [editAss, setEditAss] = useState<Assessment | null>(null)
  const [editingModule, setEditingModule] = useState(false)
  // I keep a draft object for module edits so half-typed changes do not corrupt the displayed name
  const [modDraft, setModDraft] = useState({ name: mod.name, code: mod.code ?? "", credits: mod.credits ?? 15, summary: mod.summary ?? "", rules: mod.rules ?? "" })
  const [, startTransition] = useTransition()

  // I split graded and pass/fail into separate lists so the table sections are always consistent
  const graded = mod.assessments.filter((a) => !a.is_pass_fail)
  const passFail = mod.assessments.filter((a) => a.is_pass_fail)
  const mark = calcMark(graded)
  // I track completed weight so I know how much of the module mark is already locked in
  const completedWeight = graded.filter((a) => a.mark_achieved != null).reduce((s, a) => s + (a.weight_percent ?? 0), 0)
  const remainingWeight = graded.reduce((s, a) => s + (a.weight_percent ?? 0), 0) - completedWeight
  const req = requiredFor(remainingWeight, mark ?? 0)

  // I build the chart data sorted by date so the line chart always progresses left to right
  const chartData = graded
    .filter((a) => a.mark_achieved != null)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
    .map((a) => ({
      // I truncate names to 10 chars so they fit in the bar chart x-axis labels without overlap
      name: a.name.length > 10 ? a.name.slice(0, 10) + "…" : a.name,
      mark: a.mark_achieved,
      weighted: a.weight_percent != null && a.mark_max != null ? (a.mark_achieved! / a.mark_max) * a.weight_percent : null,
    }))

  function handleAssessmentSaved(saved: Assessment | null) {
    if (!saved) { setAddAssOpen(false); setEditAss(null); return }
    if (editAss) {
      // I replace the edited assessment in-place so the mark calculations update immediately
      setMod((m) => ({ ...m, assessments: m.assessments.map((a) => a.id === saved.id ? saved : a) }))
    } else {
      // I append the new assessment so it appears at the bottom of the table without re-sorting
      setMod((m) => ({ ...m, assessments: [...m.assessments, saved] }))
    }
    setAddAssOpen(false)
    setEditAss(null)
  }

  function handleDeleteAssessment(id: string) {
    // I update local state first so the row disappears instantly
    setMod((m) => ({ ...m, assessments: m.assessments.filter((a) => a.id !== id) }))
    startTransition(() => deleteAssessment(id))
  }

  function saveModuleEdit() {
    // I update local state optimistically so the header name changes before the server responds
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
            // I show an inline edit row so renaming does not navigate away from the detail view
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

      {/* I render the grade threshold bar at every level so the classification boundaries are always visible */}
      <div className="flex gap-px h-6 rounded-lg overflow-hidden text-xs font-medium">
        <div className="flex items-center justify-center bg-green-500 text-white flex-1">First ≥80%</div>
        <div className="flex items-center justify-center bg-blue-500 text-white flex-1">2:1 60-79%</div>
        <div className="flex items-center justify-center bg-amber-500 text-white flex-1">2:2 40-59%</div>
        <div className="flex items-center justify-center bg-red-500 text-white flex-1">Fail &lt;40%</div>
      </div>

      {/* I only render the stats grid when there is at least one marked assessment */}
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

      {/* I only show the "what do I need?" panel when there is still weight to be assessed */}
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

      {/* I only show charts when there are at least 2 data points - a single bar chart is meaningless */}
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

      {/* I separate graded and pass/fail into visually distinct tables to avoid confusion */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Graded assessments</p>
          {/* I reset editAss to null before opening the dialog so clicking Add never pre-fills from a previous edit */}
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
                  <th className="text-right px-3 py-2 font-normal"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {graded.map((a) => (
                  // I pass a callback that sets editAss and opens the dialog so the form pre-fills
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

      {/* I put the module status selector at the bottom so it is not the first thing I interact with */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Module status</span>
        {/* I fire the server action directly in onValueChange rather than requiring a save button */}
        <Select value={mod.status} onValueChange={(v) => { setMod((m) => ({ ...m, status: v })); startTransition(() => updateModuleStatus(mod.id, v)) }}>
          <SelectTrigger className="w-36 h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ongoing">In Progress</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="resit">Resit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mod.summary && (
        <div className="border border-border rounded-lg p-3 bg-muted/20">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Module summary</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{mod.summary}</p>
        </div>
      )}

      {/* I use a single Dialog for both add and edit - the title and initial state drive which mode it is in */}
      <Dialog open={addAssOpen} onOpenChange={(o) => { if (!o) { setAddAssOpen(false); setEditAss(null) } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editAss ? "Edit assessment" : "New assessment"}</DialogTitle></DialogHeader>
          <AssessmentForm initial={editAss ?? undefined} moduleId={mod.id} onClose={handleAssessmentSaved} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// I compute year-level stats here rather than in YearCard so the logic is in one place
function yearStats(mods: Module[]) {
  const completed = mods.filter((m) => m.status === "complete")
  // I filter out null marks before averaging so incomplete modules do not drag the average down to zero
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
    // I make the whole card a button so the click target is the entire card surface
    <button type="button" onClick={onClick} className="w-full text-left border border-border rounded-xl p-5 bg-card hover:shadow-md transition-all">
      <p className="font-semibold text-sm">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{mods.length} module{mods.length !== 1 ? "s" : ""}</p>
      {ys ? (
        // I show the key numbers inline so I can compare years at a glance without drilling in
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
    // I read the module from local state so any assessment edits made in ModuleDetail
    // are reflected when the user navigates back to the year view
    const live = mods.find((m) => m.id === selectedModule.id) ?? selectedModule
    return <ModuleDetail mod={live} onBack={() => setSelectedModule(null)} />
  }

  // I flatten all graded assessments across modules and sort by date for the year-level trend chart
  const allMarks = mods.flatMap((m) => m.assessments.filter((a) => !a.is_pass_fail && a.mark_achieved != null))
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
    .map((a) => ({
      name: a.name.length > 8 ? a.name.slice(0, 8) + "…" : a.name,
      mark: a.mark_achieved,
      weighted: null,  // I leave weighted null at the year level because cross-module weighting is not meaningful
    }))

  // I build a per-module bar chart so I can see which modules are pulling my average down
  const moduleMarks = mods.map((m) => {
    const mark = calcMark(m.assessments)
    return { name: m.code ?? m.name.slice(0, 6), mark, weighted: null }
  }).filter((m) => m.mark != null)  // I filter out modules with no marked assessments to avoid empty bars

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} aria-label="Back to years" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft className="h-4 w-4" /></button>
        <h1 className="font-semibold text-lg">{YEAR_LABELS[year] ?? `Year ${year}`}</h1>
      </div>

      {/* I show the grade threshold bar at the year view level as well as module level for consistency */}
      <div className="flex gap-px h-6 rounded-lg overflow-hidden text-xs font-medium">
        <div className="flex items-center justify-center bg-green-500 text-white flex-1">First ≥80%</div>
        <div className="flex items-center justify-center bg-blue-500 text-white flex-1">2:1 60-79%</div>
        <div className="flex items-center justify-center bg-amber-500 text-white flex-1">2:2 40-59%</div>
        <div className="flex items-center justify-center bg-red-500 text-white flex-1">Fail &lt;40%</div>
      </div>

      {ys && (
        <StatsBar label="" stats={[
          { label: `${YEAR_SHORT[year] ?? "Year"} average`, value: `${ys.avg}%`, colour: markColour(ys.avg) },
          { label: "Classification", value: classLabel(ys.avg) },
          { label: "Credits done", value: `${ys.credits} / ${ys.totalCredits}` },
          { label: "Modules done", value: `${ys.done} / ${ys.total}` },
        ]} />
      )}

      {moduleMarks.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">All module marks</p>
            <AssessmentBarChart data={moduleMarks} />
          </div>
          {/* I only render the trend chart when there are enough assessment data points to be useful */}
          {allMarks.length >= 2 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Assessment progress trend</p>
              <ProgressLineChart data={allMarks} />
            </div>
          )}
        </div>
      )}

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
                  {/* I colour the status badge so completed/resit/in-progress are instantly distinguishable */}
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
          {/* I append the new module to local state and close the dialog in the onClose callback */}
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
      // I await the insert so I get the DB id back - without it the new module card has no clickable id
      const inserted = await createModule({ ...form, year, summary: "", rules: "" })
      // I attach an empty assessments array because the type requires it and there are none yet
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
  // I use null for "no year selected" rather than 0 or -1 to avoid ambiguity with real year values
  const [activeYear, setActiveYear] = useState<number | null>(null)

  // I filter to only years that have at least one module so empty year cards never appear
  const yearsPresent = YEAR_ORDER.filter((y) => mods.some((m) => m.year === y))

  // I compute master stats across all completed modules for the overview banner
  const allCompleted = mods.filter((m) => m.status === "complete")
  const allMarks = allCompleted.map((m) => calcMark(m.assessments)).filter((x): x is number => x != null)
  const masterAvg = allMarks.length ? parseFloat((allMarks.reduce((s, x) => s + x, 0) / allMarks.length).toFixed(2)) : null
  const masterCredits = allCompleted.reduce((s, m) => s + (m.credits ?? 0), 0)
  const totalCredits = mods.reduce((s, m) => s + (m.credits ?? 0), 0)

  if (activeYear != null) {
    // I render YearView as a full replacement rather than a panel so the back button makes sense
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

      {/* I only show the master stats bar when there is at least one completed module with a mark */}
      {masterAvg != null && (
        <StatsBar label="Overall" stats={[
          { label: "Overall average", value: `${masterAvg}%`, colour: markColour(masterAvg) },
          { label: "Classification", value: classLabel(masterAvg) },
          { label: "Total credits", value: `${masterCredits} / ${totalCredits}` },
          { label: "Modules done", value: `${allCompleted.length} / ${mods.length}` },
        ]} />
      )}

      <div className="flex flex-col gap-3">
        {yearsPresent.map((year) => (
          <YearCard key={year} year={year} mods={mods.filter((m) => m.year === year)} onClick={() => setActiveYear(year)} />
        ))}
        {/* I always show a placeholder for year 3 (placement) so I remember to track it when the time comes */}
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
