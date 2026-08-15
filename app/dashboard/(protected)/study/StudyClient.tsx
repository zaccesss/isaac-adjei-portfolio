"use client"

import { useState, useTransition } from "react"
import { createStudySession, deleteStudySession, updateStudySession } from "../../actions"
import { savedOk } from "@/lib/save-result"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import MarkdownEditor from "@/components/shared/MarkdownEditor"
import MarkdownContent from "@/components/shared/MarkdownContent"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Clock, BookOpen, Pencil } from "lucide-react"
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, YAxis } from "recharts"
import { AnalyticsPeriodProvider, PeriodSelector, useAnalyticsPeriod, filterByPeriod, allTimeChartDays, Composed, Bubble } from "@/components/analytics"
import { Pagination } from "@/components/shared/Pagination"
import { calcMark } from "../modules/ModulesClient"

type Session = {
  id: string
  date: string
  subject: string
  duration_m: number
  notes: string | null
  technique: string | null
  productive: boolean
  created_at: string
  module_id: string | null
}

type ModuleLite = { id: string; name: string; code: string | null }
type AssessmentLite = { module_id: string; weight_percent: number | null; mark_achieved: number | null; mark_max: number | null; is_pass_fail: boolean }

const STUDY_PAGE_SIZE = 24

const TECHNIQUES = [
  "Pomodoro",
  "Active recall",
  "Spaced repetition",
  "Mind mapping",
  "Practice problems",
  "Lecture notes",
  "Past papers",
  "Other",
]

function fmtMinutes(m: number): string {
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`
}

function StudyClientInner({ sessions, today, modules, assessments }: { sessions: Session[]; today: string; modules: ModuleLite[]; assessments: AssessmentLite[] }) {
  const [open, setOpen] = useState(false)
  const [editSession, setEditSession] = useState<Session | null>(null)
  const [isPending, startTransition] = useTransition()
  const [subjectFilter, setSubjectFilter] = useState<string>("all")
  const [page, setPage] = useState(1)

  const [form, setForm] = useState({
    date: today,
    subject: "",
    duration_m: "",
    notes: "",
    technique: "",
    productive: true,
    module_id: "",
  })

  function resetForm() {
    setForm({ date: today, subject: "", duration_m: "", notes: "", technique: "", productive: true, module_id: "" })
    setEditSession(null)
  }

  function openEdit(s: Session) {
    setEditSession(s)
    setForm({
      date: s.date,
      subject: s.subject,
      duration_m: String(s.duration_m),
      notes: s.notes ?? "",
      technique: s.technique ?? "",
      productive: s.productive,
      module_id: s.module_id ?? "",
    })
    setOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const duration = Number(form.duration_m)
    if (!form.subject.trim() || !duration) return
    const payload = {
      date: form.date,
      subject: form.subject.trim(),
      duration_m: duration,
      notes: form.notes.trim() || undefined,
      technique: form.technique || undefined,
      productive: form.productive,
      module_id: form.module_id || undefined,
    }
    startTransition(async () => {
      const res = editSession ? await updateStudySession(editSession.id, payload) : await createStudySession(payload)
      if (!savedOk(res, "Could not save session")) return
      setOpen(false)
      resetForm()
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => { savedOk(await deleteStudySession(id), "Could not delete session") })
  }

  const { period } = useAnalyticsPeriod()
  const subjects = [...new Set(sessions.map((s) => s.subject))].sort()
  const filtered = subjectFilter === "all" ? sessions : sessions.filter((s) => s.subject === subjectFilter)

  const totalPages = Math.max(1, Math.ceil(filtered.length / STUDY_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * STUDY_PAGE_SIZE, safePage * STUDY_PAGE_SIZE)
  const resetKey = `${subjectFilter}`
  const [prevResetKey, setPrevResetKey] = useState(resetKey)
  if (resetKey !== prevResetKey) { setPrevResetKey(resetKey); setPage(1) }

  // Stats and charts follow the period selector; the session list below stays complete.
  const periodSessions = filterByPeriod(sessions, period, (s) => s.date)
  const totalMinutes = periodSessions.reduce((a, s) => a + s.duration_m, 0)
  const todayMinutes = sessions.filter((s) => s.date === today).reduce((a, s) => a + s.duration_m, 0)
  const uniqueDays = new Set(periodSessions.map((s) => s.date)).size
  const avgPerDay = uniqueDays > 0 ? Math.round(totalMinutes / uniqueDays) : 0
  const periodSubjectCount = new Set(periodSessions.map((s) => s.subject)).size

  // Subject breakdown (within the period)
  const bySubject = subjects.map((subj) => ({
    subject: subj.length > 12 ? subj.slice(0, 12) + "…" : subj,
    fullSubject: subj,
    minutes: periodSessions.filter((s) => s.subject === subj).reduce((a, s) => a + s.duration_m, 0),
  })).filter((b) => b.minutes > 0).sort((a, b) => b.minutes - a.minutes)

  // Study hours vs module mark - total duration_m across ALL logged sessions carrying a
  // module_id (not just this period, since a module's mark reflects the whole course, not a
  // recent slice), summed per module, plotted against that module's own computed mark. Degrades
  // to an explanatory empty state until enough sessions carry a module_id to plot anything.
  const assessmentsByModule = new Map<string, AssessmentLite[]>()
  for (const a of assessments) {
    if (!assessmentsByModule.has(a.module_id)) assessmentsByModule.set(a.module_id, [])
    assessmentsByModule.get(a.module_id)!.push(a)
  }
  const minutesByModule = new Map<string, number>()
  for (const s of sessions) {
    if (!s.module_id) continue
    minutesByModule.set(s.module_id, (minutesByModule.get(s.module_id) ?? 0) + s.duration_m)
  }
  const studyVsMark = modules
    .map((m) => {
      const minutes = minutesByModule.get(m.id) ?? 0
      const mark = calcMark(assessmentsByModule.get(m.id) ?? [])
      return { name: m.code ?? m.name, hours: Math.round((minutes / 60) * 10) / 10, mark }
    })
    .filter((d): d is { name: string; hours: number; mark: number } => d.hours > 0 && d.mark != null)

  // Pareto of time by subject - which subjects account for most of my study time, read as
  // cumulative share rather than absolute minutes (the bar chart above already covers that).
  const subjectTotal = bySubject.reduce((a, b) => a + b.minutes, 0)
  const subjectRunningTotals = bySubject.reduce<number[]>((acc, b) => [...acc, (acc[acc.length - 1] ?? 0) + b.minutes], [])
  const subjectPareto = bySubject.map((b, i) => ({
    name: b.subject,
    minutes: b.minutes,
    cumulativePct: subjectTotal > 0 ? Math.round((subjectRunningTotals[i] / subjectTotal) * 100) : 0,
  }))

  // Daily totals across a window that follows the period. "All time" used to silently reuse 1y's
  // 365-day window, looking identical to 1y once there was more than a year of sessions - it now
  // spans back to the earliest session actually logged instead.
  const numDays = period === "24h" || period === "7d" ? 7
    : period === "30d" ? 30
    : period === "90d" ? 90
    : period === "1y" ? 365
    : allTimeChartDays(sessions.map((s) => s.date), 365)
  const dailyData = Array.from({ length: numDays }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (numDays - 1 - i))
    const ds = d.toISOString().split("T")[0]
    const minutes = sessions.filter((s) => s.date === ds).reduce((a, s) => a + s.duration_m, 0)
    return { day: ds.slice(5), minutes }
  })

  const colours = [
    "hsl(var(--primary))", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444",
    "#06b6d4", "#f97316", "#84cc16",
  ]

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Study</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track focused study sessions by subject</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Log session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editSession ? "Edit session" : "Log study session"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Date</label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Duration (min)</label>
                  <Input
                    type="number"
                    min={1}
                    max={1440}
                    placeholder="e.g. 45"
                    value={form.duration_m}
                    onChange={(e) => setForm((f) => ({ ...f, duration_m: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Subject</label>
                <Input
                  placeholder="e.g. Digital Electronics, Maths, Algorithms..."
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  required
                  list="subjects-list"
                />
                <datalist id="subjects-list">
                  {subjects.map((s) => <option key={s} value={s} />)}
                </datalist>
              </div>
              {modules.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Module (optional, for the study-vs-mark chart)</label>
                  <Select value={form.module_id || "none"} onValueChange={(v) => setForm((f) => ({ ...f, module_id: v === "none" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Not linked to a module..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not linked</SelectItem>
                      {modules.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.code ? `${m.code} - ${m.name}` : m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Technique (optional)</label>
                <Select value={form.technique} onValueChange={(v) => setForm((f) => ({ ...f, technique: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select technique..." /></SelectTrigger>
                  <SelectContent>
                    {TECHNIQUES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
                <MarkdownEditor
                  placeholder="What did you cover? Key takeaways..."
                  value={form.notes}
                  onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="productive"
                  checked={form.productive}
                  onChange={(e) => setForm((f) => ({ ...f, productive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="productive" className="text-sm">Session was productive</label>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {editSession ? "Save changes" : "Log session"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm() }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex justify-end">
        <PeriodSelector />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: fmtMinutes(totalMinutes), icon: "📚" },
          { label: "Today", value: fmtMinutes(todayMinutes), icon: "⏱", scope: "current" as const },
          { label: "Avg per study day", value: fmtMinutes(avgPerDay), icon: "📊" },
          { label: "Subjects", value: periodSubjectCount, icon: "🗂" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              {s.scope && (
                <span className="text-[9px] uppercase tracking-wide text-muted-foreground/70 border border-border/50 rounded px-1 leading-tight">
                  {s.scope}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold">{s.icon} {s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily minutes - 30 day line chart */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <p className="text-sm font-medium">Daily minutes</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={dailyData}>
              <XAxis dataKey="day" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={Math.ceil(numDays / 8)} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 6 }}
                formatter={(v) => [fmtMinutes(Number(v)), "studied"]}
              />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject breakdown */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <p className="text-sm font-medium">By subject</p>
          {bySubject.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={bySubject.slice(0, 6)} layout="vertical" barSize={10}>
                <XAxis type="number" hide />
                <XAxis type="category" dataKey="subject" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} hide />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 6 }}
                  formatter={(v) => [fmtMinutes(Number(v)), "studied"]}
                  labelFormatter={(l) => bySubject.find((b) => b.subject === l)?.fullSubject ?? l}
                />
                <Bar dataKey="minutes" radius={[0, 3, 3, 0]}>
                  {bySubject.slice(0, 6).map((_, i) => (
                    <Cell key={i} fill={colours[i % colours.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pareto of time by subject */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <p className="text-sm font-medium">Time by subject - Pareto</p>
          {subjectPareto.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions yet</p>
          ) : (
            <Composed
              data={subjectPareto}
              barKey="minutes"
              lineKey="cumulativePct"
              barName="Minutes"
              lineName="Cumulative %"
              barValueFormatter={fmtMinutes}
              lineValueFormatter={(v) => `${v}%`}
            />
          )}
        </div>

        {/* Study hours vs module mark */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <p className="text-sm font-medium">Study hours vs module mark</p>
          {studyVsMark.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Link a study session to a module (using the picker in the form above) and once that module has a mark, this chart plots total hours studied against how it turned out.
            </p>
          ) : (
            <Bubble
              data={studyVsMark}
              xKey="hours"
              yKey="mark"
              xLabel="Hours"
              yLabel="Mark"
              xFormatter={(v) => `${v}h`}
              yFormatter={(v) => `${v}%`}
              colour="#8b5cf6"
            />
          )}
        </div>
      </div>

      {/* Filter + session list */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Sessions</p>
          {subjects.length > 1 && (
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setSubjectFilter("all")}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${subjectFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
              >
                All
              </button>
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubjectFilter(s)}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${subjectFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-muted-foreground text-sm">
            No study sessions yet. Log your first session above.
          </div>
        ) : (
          <div className="space-y-2">
            {pageItems.map((s, i) => (
              <div
                key={s.id}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 hover:border-primary/30 transition-colors group"
              >
                <div
                  className="w-2 h-2 rounded-full mt-2 shrink-0"
                  style={{ background: colours[subjects.indexOf(s.subject) % colours.length] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{s.subject}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />{fmtMinutes(s.duration_m)}
                    </span>
                    {s.technique && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{s.technique}</Badge>}
                    {!s.productive && <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">low focus</Badge>}
                  </div>
                  {s.notes && <MarkdownContent compact className="mt-0.5 line-clamp-3">{s.notes}</MarkdownContent>}
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.date}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit session" onClick={() => openEdit(s)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    title="Delete session"
                    onClick={() => handleDelete(s.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={STUDY_PAGE_SIZE} itemLabel="sessions" className="pt-4" />
      </div>
    </div>
  )
}

export default function StudyClient(props: { sessions: Session[]; today: string; modules: ModuleLite[]; assessments: AssessmentLite[] }) {
  return (
    <AnalyticsPeriodProvider defaultPeriod="30d">
      <StudyClientInner {...props} />
    </AnalyticsPeriodProvider>
  )
}
