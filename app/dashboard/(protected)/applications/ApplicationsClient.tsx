"use client"

// SQL already applied - all new columns are in the applications table.

import { useState, useTransition } from "react"
import { createApplication, updateApplication, deleteApplication } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Edit2, ExternalLink, ChevronDown, ChevronRight, Search, LayoutGrid, List, TrendingUp, BarChart2, Layers } from "lucide-react"
import ApplicationsKanban from "./ApplicationsKanban"
import ApplicationsAnalytics from "./ApplicationsAnalytics"
import LinearView from "./LinearView"

// ─── Types ────────────────────────────────────────────────────────────────────

type Application = {
  id: string
  company: string
  role: string
  type: string
  status: string
  url: string | null
  location: string | null
  notes: string | null
  applied_date: string | null
  deadline: string | null
  salary_range: string | null
  work_mode: string | null
  source: string | null
  starred: boolean
  opening_date: string | null
  last_year_opening: string | null
  housing_location: string | null
  cv_required: string | null
  cover_letter_required: string | null
  written_answers: string | null
  sponsors_visa: string | null
  category: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MY_STATUSES = [
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
  "Offer Received",
  "Rejected",
  "Not Interested",
] as const

// I normalise legacy DB values so the UI always works with the current status labels regardless
// of when the row was written - the job scraper and early manual entries used different keys
function normaliseStatus(raw: string): string {
  const map: Record<string, string> = {
    scraped: "Not Applied",
    applied: "Application Submitted",
    oa: "Online Assessment",
    case_study: "Case Study",
    phone_screen: "Telephone Interview",
    face_to_face: "Face-to-face Interview",
    assessment_centre: "Assessment Centre",
    offer: "Offer Received",
    not_interested: "Not Interested",
    // Normalise old labels that match directly
    interested: "Interested",
    hirevue: "HireVue",
    rejected: "Rejected",
    video_interview: "Video Interview",
  }
  return map[raw] ?? raw
}

function statusTextClass(status: string): string {
  const s = normaliseStatus(status)
  if (s === "Not Applied") return "text-red-600 dark:text-red-400"
  if (s === "Interested" || s === "Application Submitted") return "text-blue-600 dark:text-blue-400"
  if (s === "Online Assessment" || s === "Case Study" || s === "HireVue") return "text-purple-600 dark:text-purple-400"
  if (s === "Telephone Interview" || s === "Video Interview" || s === "Face-to-face Interview") return "text-amber-600 dark:text-amber-400"
  if (s === "Assessment Centre") return "text-orange-600 dark:text-orange-400"
  if (s === "Offer Received") return "text-green-600 dark:text-green-400"
  if (s === "Rejected") return "text-muted-foreground line-through"
  if (s === "Not Interested") return "text-muted-foreground"
  return ""
}

const CATEGORIES = [
  "FAANG+",
  "Software Engineering",
  "Data Science",
  "AI and Machine Learning",
  "DevOps and Infrastructure",
  "Embedded",
  "Quant Developer",
  "Tech Consulting",
  "Cyber Security",
  "Startups",
  "IT",
  "Miscellaneous",
] as const

type Category = (typeof CATEGORIES)[number]

const _AI_WORD = /\bai\b/i
const _QUANT_COMPANIES = ["citadel", "optiver", "jane street", "imc", "jump", "two sigma", "susquehanna", "virtu", "drw", "sig ", "flow traders", "akuna", "hudson river", "de shaw"]

// I auto-detect category from company and role so scraped entries get a sensible default
// without requiring manual tagging of every row - the user can always override in the edit form
function detectCategory(company: string, role: string): Category {
  const r = role.toLowerCase()
  const c = company.toLowerCase()
  const faang = ["google", "meta", "amazon", "apple", "microsoft", "netflix", "deepmind", "openai", "anthropic"]
  if (faang.some((f) => c.includes(f))) return "FAANG+"
  if (
    _QUANT_COMPANIES.some((q) => c.includes(q)) ||
    r.includes("quant") ||
    r.includes("trading") ||
    r.includes("algorithmic") ||
    r.includes("derivatives")
  )
    return "Quant Developer"
  if (
    _AI_WORD.test(r) ||
    r.includes("machine learning") ||
    r.includes("artificial intelligence") ||
    r.includes("deep learning") ||
    r.includes("llm") ||
    r.includes("computer vision") ||
    r.includes("nlp") ||
    r.includes("generative ai") ||
    r.includes("neural network")
  )
    return "AI and Machine Learning"
  if (
    r.includes("data science") ||
    r.includes("data scientist") ||
    r.includes("data analyst") ||
    r.includes("data engineer") ||
    r.includes("analytics engineer") ||
    r.includes("business intelligence") ||
    r.includes("bi analyst")
  )
    return "Data Science"
  if (
    r.includes("embedded") ||
    r.includes("firmware") ||
    r.includes("fpga") ||
    r.includes("vhdl") ||
    r.includes("rtos") ||
    r.includes("bare metal") ||
    r.includes("hardware engineer") ||
    r.includes("electronics engineer") ||
    r.includes("microcontroller") ||
    r.includes("iot engineer")
  )
    return "Embedded"
  if (
    r.includes("devops") ||
    r.includes("devsecops") ||
    r.includes("cloud engineer") ||
    r.includes("site reliability") ||
    r.includes("platform engineer") ||
    r.includes("infrastructure engineer") ||
    r.includes("kubernetes") ||
    r.includes("terraform") ||
    r.includes("sre")
  )
    return "DevOps and Infrastructure"
  if (r.includes("security") || r.includes("cyber") || r.includes("penetration") || r.includes("pen test") || r.includes("appsec"))
    return "Cyber Security"
  if (r.includes("consult") || r.includes("advisory") || r.includes("business analyst"))
    return "Tech Consulting"
  if (r.includes("it support") || r.includes("service desk") || r.includes("information technology") || r.includes("helpdesk"))
    return "IT"
  return "Software Engineering"
}

const TAB_TYPES = ["Internships", "Industrial Placements", "Graduate Schemes", "Spring Weeks", "Events", "Jobs"] as const
type Tab = (typeof TAB_TYPES)[number]

// I map the raw type field to a tab rather than relying on exact string equality because the
// job scraper writes inconsistent casing and the legacy "scraped" type predates the current taxonomy
function appBelongsToTab(app: Application, tab: Tab): boolean {
  const t = app.type
  if (tab === "Internships")
    return t === "Internship" || t === "internship" || t === "scraped" || t === "Summer Internship"
  if (tab === "Industrial Placements") return t === "Industrial Placement"
  if (tab === "Graduate Schemes") return t === "Graduate"
  if (tab === "Spring Weeks") return t === "Spring Week"
  if (tab === "Events") return t === "Event"
  if (tab === "Jobs") return t === "Full-time Job"
  return false
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function isDatePast(dateStr: string | null): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

// ─── Form ─────────────────────────────────────────────────────────────────────

const APP_TYPE_OPTIONS = [
  "Internship",
  "Industrial Placement",
  "Graduate",
  "Spring Week",
  "Event",
  "Full-time Job",
  "Other",
]

const YES_NO_OPTIONAL = ["Yes", "No", "Optional"]

const emptyForm = {
  company: "",
  role: "",
  type: "Internship",
  status: "Not Applied",
  url: "",
  notes: "",
  applied_date: "",
  deadline: "",
  opening_date: "",
  last_year_opening: "",
  housing_location: "",
  cv_required: "",
  cover_letter_required: "",
  written_answers: "",
  sponsors_visa: "",
  salary_range: "",
  source: "",
  category: "",
  starred: false,
}

type FormData = typeof emptyForm

function AppForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: FormData
  onSave: (data: FormData) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormData>(initial ?? emptyForm)
  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Company *</label>
          <Input
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Company name"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Programme / Role *</label>
          <Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Job title" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Type</label>
          <Select value={form.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APP_TYPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">My Status</label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MY_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Opening Date</label>
          <Input type="date" value={form.opening_date} onChange={(e) => set("opening_date", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Closing Date</label>
          <Input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Last Year Opening</label>
          <Input type="date" value={form.last_year_opening} onChange={(e) => set("last_year_opening", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Applied Date</label>
          <Input type="date" value={form.applied_date} onChange={(e) => set("applied_date", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Find Housing (area)</label>
          <Input
            value={form.housing_location}
            onChange={(e) => set("housing_location", e.target.value)}
            placeholder="e.g. Covent Garden"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Category</label>
          <Select value={form.category || "auto"} onValueChange={(v) => set("category", v === "auto" ? "" : v)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Auto-detect" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">CV</label>
          <Select value={form.cv_required || "none"} onValueChange={(v) => set("cv_required", v === "none" ? "" : v)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="-" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-</SelectItem>
              {YES_NO_OPTIONAL.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Cover Letter</label>
          <Select value={form.cover_letter_required || "none"} onValueChange={(v) => set("cover_letter_required", v === "none" ? "" : v)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="-" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-</SelectItem>
              {YES_NO_OPTIONAL.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Written Answers</label>
          <Select value={form.written_answers || "none"} onValueChange={(v) => set("written_answers", v === "none" ? "" : v)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="-" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-</SelectItem>
              {YES_NO_OPTIONAL.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Sponsors Visa</label>
          <Select value={form.sponsors_visa || "none"} onValueChange={(v) => set("sponsors_visa", v === "none" ? "" : v)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="-" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-</SelectItem>
              {["Yes", "No"].map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Salary Range</label>
          <Input
            value={form.salary_range}
            onChange={(e) => set("salary_range", e.target.value)}
            placeholder="e.g. £25k-£30k"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">URL</label>
        <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://..." />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Source</label>
        <Input value={form.source} onChange={(e) => set("source", e.target.value)} placeholder="LinkedIn, Indeed, etc." />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Notes</label>
        <Textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          placeholder="Any notes about the application..."
        />
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={form.starred} onChange={(e) => set("starred", e.target.checked)} />
        Star this application
      </label>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (form.company.trim() && form.role.trim()) onSave(form)
          }}
          disabled={!form.company.trim() || !form.role.trim()}
        >
          Save
        </Button>
      </div>
    </div>
  )
}

// ─── Cell renderers ───────────────────────────────────────────────────────────

function DateBadge({ date, openingStyle }: { date: string | null; openingStyle?: boolean }) {
  if (!date) return <span className="text-muted-foreground/40">-</span>
  const past = isDatePast(date)
  // Opening: green if past (applications open), no colour if future
  // Closing: green if future (still open), red if past (closed)
  let cls = "px-1.5 py-0.5 rounded text-xs font-medium"
  if (openingStyle) {
    cls += past ? " bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : " text-foreground"
  } else {
    cls += past
      ? " bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      : " bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
  }
  return <span className={cls}>{formatDate(date)}</span>
}

function YesNoBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground/40">-</span>
  return <span className="text-xs">{value}</span>
}

const NOTES_TRUNCATE_LENGTH = 80

function NotesCell({ notes }: { notes: string | null }) {
  const [expanded, setExpanded] = useState(false)
  if (!notes) return <span className="text-muted-foreground/40">-</span>
  const isLong = notes.length > NOTES_TRUNCATE_LENGTH
  return (
    <span className="text-muted-foreground text-xs">
      {isLong && !expanded ? notes.slice(0, NOTES_TRUNCATE_LENGTH) + "…" : notes}
      {isLong && (
        <>
          {" "}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-muted-foreground underline cursor-pointer"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        </>
      )}
    </span>
  )
}

// ─── Table row ────────────────────────────────────────────────────────────────

function AppRow({
  app,
  onEdit,
  onDelete,
  onStatusChange,
  isEvent,
}: {
  app: Application
  onEdit: (a: Application) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
  isEvent: boolean
}) {
  const displayStatus = normaliseStatus(app.status)
  const statusCls = statusTextClass(app.status)

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors text-xs">
      {/* My Status - inline select */}
      <td className="px-2 py-1.5 whitespace-nowrap min-w-[160px]">
        <select
          value={displayStatus}
          onChange={(e) => onStatusChange(app.id, e.target.value)}
          title="My Status"
          aria-label="My Status"
          className={`bg-transparent border-none outline-none cursor-pointer text-xs font-medium w-full ${statusCls}`}
        >
          {MY_STATUSES.map((s) => (
            <option key={s} value={s} className="text-foreground bg-background">
              {s}
            </option>
          ))}
        </select>
      </td>

      {/* Company */}
      <td className="px-2 py-1.5 whitespace-nowrap font-medium">
        {app.url ? (
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            {app.company}
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        ) : (
          app.company
        )}
      </td>

      {/* Programme Name */}
      <td className="px-2 py-1.5 whitespace-nowrap">
        {app.url ? (
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {app.role}
          </a>
        ) : (
          app.role
        )}
      </td>

      {/* Location */}
      <td className="px-2 py-1.5 whitespace-nowrap text-xs text-muted-foreground">
        {app.location ? (
          <span className={
            app.location.toLowerCase().includes("london") ? "text-emerald-600 dark:text-emerald-400 font-medium" :
            app.location.toLowerCase().includes("birmingham") ? "text-blue-600 dark:text-blue-400 font-medium" :
            app.location.toLowerCase().includes("manchester") ? "text-violet-600 dark:text-violet-400 font-medium" :
            ""
          }>
            {app.location}
          </span>
        ) : (
          <span className="opacity-40">-</span>
        )}
      </td>

      {isEvent ? (
        <>
          {/* Eligibility (location reuse) */}
          <td className="px-2 py-1.5 whitespace-nowrap text-muted-foreground">{app.location ?? "-"}</td>
          {/* Format (work_mode reuse) */}
          <td className="px-2 py-1.5 whitespace-nowrap text-muted-foreground">{app.work_mode ?? "-"}</td>
          {/* Event Date */}
          <td className="px-2 py-1.5 whitespace-nowrap">
            <DateBadge date={app.deadline} />
          </td>
        </>
      ) : (
        <>
          {/* Opening Date */}
          <td className="px-2 py-1.5 whitespace-nowrap">
            <DateBadge date={app.opening_date} openingStyle />
          </td>
          {/* Closing Date */}
          <td className="px-2 py-1.5 whitespace-nowrap">
            <DateBadge date={app.deadline} />
          </td>
          {/* Last Year Opening */}
          <td className="px-2 py-1.5 whitespace-nowrap text-muted-foreground text-xs">
            {app.last_year_opening ? formatDate(app.last_year_opening) : <span className="opacity-40">-</span>}
          </td>
          {/* Find Housing */}
          <td className="px-2 py-1.5 whitespace-nowrap">
            {app.housing_location ? (
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(app.housing_location + " accommodation")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {app.housing_location}
              </a>
            ) : (
              <span className="opacity-40">-</span>
            )}
          </td>
          {/* CV */}
          <td className="px-2 py-1.5 whitespace-nowrap">
            <YesNoBadge value={app.cv_required} />
          </td>
          {/* Cover Letter */}
          <td className="px-2 py-1.5 whitespace-nowrap">
            <YesNoBadge value={app.cover_letter_required} />
          </td>
          {/* Written Answers */}
          <td className="px-2 py-1.5 whitespace-nowrap">
            <YesNoBadge value={app.written_answers} />
          </td>
          {/* Sponsors Visa */}
          <td className="px-2 py-1.5 whitespace-nowrap">
            <YesNoBadge value={app.sponsors_visa} />
          </td>
        </>
      )}

      {/* Notes */}
      <td className="px-2 py-1.5 max-w-[180px]">
        <NotesCell notes={app.notes} />
      </td>

      {/* Actions */}
      <td className="px-2 py-1.5 whitespace-nowrap">
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={() => onEdit(app)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Edit"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(app.id)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Category group ───────────────────────────────────────────────────────────

function CategoryGroup({
  category,
  apps,
  onEdit,
  onDelete,
  onStatusChange,
  isEvent,
}: {
  category: string
  apps: Application[]
  onEdit: (a: Application) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
  isEvent: boolean
}) {
  const [open, setOpen] = useState(true)

  return (
    <>
      {/* Category header row */}
      <tr className="bg-muted/60 dark:bg-muted/40 border-b border-border">
        <td colSpan={isEvent ? 8 : 14} className="px-2 py-1.5">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 font-semibold text-xs text-foreground w-full text-left"
          >
            {open ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            )}
            {category}
            <span className="ml-1 font-normal text-muted-foreground">({apps.length})</span>
          </button>
        </td>
      </tr>

      {open &&
        apps.map((app) => (
          <AppRow
            key={app.id}
            app={app}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            isEvent={isEvent}
          />
        ))}
    </>
  )
}

// ─── Funnel chart ─────────────────────────────────────────────────────────────

function ApplicationsFunnel({ apps }: { apps: Application[] }) {
  const statuses = apps.map((a) => normaliseStatus(a.status))

  const applied = statuses.filter(
    (s) => !["Not Applied", "Interested", "Not Interested"].includes(s)
  ).length
  const assessment = statuses.filter((s) =>
    ["Online Assessment", "Case Study", "HireVue", "Telephone Interview", "Video Interview",
      "Face-to-face Interview", "Assessment Centre", "Offer Received"].includes(s)
  ).length
  const interview = statuses.filter((s) =>
    ["Telephone Interview", "Video Interview", "Face-to-face Interview", "Assessment Centre", "Offer Received"].includes(s)
  ).length
  const offer = statuses.filter((s) => s === "Offer Received").length

  const stages = [
    { label: "Applied", count: applied, color: "bg-blue-500" },
    { label: "Assessment", count: assessment, color: "bg-violet-500" },
    { label: "Interview", count: interview, color: "bg-amber-500" },
    { label: "Offer", count: offer, color: "bg-green-500" },
  ]
  const max = applied || 1

  return (
    <div className="border-t border-border px-4 py-4 shrink-0 bg-background">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Application Funnel</span>
      </div>
      <div className="flex flex-col gap-2">
        {stages.map((stage, i) => {
          const pct = Math.round((stage.count / max) * 100)
          const prev = stages[i - 1]
          const convRate = prev ? (prev.count > 0 ? Math.round((stage.count / prev.count) * 100) : 0) : null
          return (
            <div key={stage.label} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 shrink-0">{stage.label}</span>
              <div className="flex-1 bg-muted rounded-full h-1.5">
                <div
                  className={`${stage.color} h-1.5 rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold w-5 text-right tabular-nums">{stage.count}</span>
              <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
                {convRate !== null ? `${convRate}%` : ""}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main client ──────────────────────────────────────────────────────────────

export default function ApplicationsClient({ applications: initial }: { applications: Application[] }) {
  const [apps, setApps] = useState<Application[]>(initial)
  const [activeTab, setActiveTab] = useState<Tab>("Internships")
  const [search, setSearch] = useState("")
  const [filterOpenStatus, setFilterOpenStatus] = useState("All")
  const [filterCoverLetter, setFilterCoverLetter] = useState("All")
  const [filterMyStatus, setFilterMyStatus] = useState("All")
  const [filterLocation, setFilterLocation] = useState("All")
  const [filterKeyword, setFilterKeyword] = useState("All")
  const [view, setView] = useState<"table" | "kanban" | "analytics" | "linear">("table")
  const [addOpen, setAddOpen] = useState(false)
  const [editApp, setEditApp] = useState<Application | null>(null)
  const [, startTransition] = useTransition()

  const isEvent = activeTab === "Events"
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Tab-filtered apps
  const tabApps = apps.filter((a) => appBelongsToTab(a, activeTab))

  // Apply filters
  const filtered = tabApps.filter((a) => {
    const q = search.toLowerCase()
    if (q && !a.company.toLowerCase().includes(q) && !a.role.toLowerCase().includes(q) && !(a.location ?? "").toLowerCase().includes(q)) return false

    if (filterMyStatus !== "All") {
      if (normaliseStatus(a.status) !== filterMyStatus) return false
    }

    if (filterOpenStatus !== "All") {
      const deadline = a.deadline ? new Date(a.deadline) : null
      if (filterOpenStatus === "Open") {
        if (deadline && deadline < today) return false
      } else if (filterOpenStatus === "Closed") {
        if (!deadline || deadline >= today) return false
      }
    }

    if (filterCoverLetter !== "All") {
      if ((a.cover_letter_required ?? "") !== filterCoverLetter) return false
    }

    if (filterLocation !== "All") {
      const loc = (a.location ?? "").toLowerCase()
      if (filterLocation === "London" && !loc.includes("london")) return false
      if (filterLocation === "Birmingham" && !loc.includes("birmingham")) return false
      if (filterLocation === "Manchester" && !loc.includes("manchester")) return false
      if (filterLocation === "Remote / Hybrid" && !loc.includes("remote") && !loc.includes("hybrid") && !loc.includes("work from home")) return false
      if (filterLocation === "Other") {
        const isKnown = loc.includes("london") || loc.includes("birmingham") || loc.includes("manchester") || loc.includes("remote") || loc.includes("hybrid")
        if (isKnown || !loc) return false
      }
    }

    if (filterKeyword !== "All") {
      const cat = ((a.category && a.category !== "Software Engineering" ? a.category : null) || detectCategory(a.company, a.role) || "").toLowerCase()
      const kwMap: Record<string, string> = {
        "Software":      "software",
        "Data":          "data",
        "Cloud":         "cloud",
        "DevOps":        "devops",
        "Security":      "security",
        "Finance/Quant": "finance",
        "Embedded":      "embedded",
        "Consulting":    "consulting",
      }
      const needle = kwMap[filterKeyword]
      if (needle && !cat.includes(needle)) return false
    }

    return true
  })

  // Stats (based on filtered)
  const activeStatuses = ["Not Applied", "Interested", "Application Submitted", "Online Assessment", "Case Study", "HireVue", "Telephone Interview", "Video Interview", "Face-to-face Interview", "Assessment Centre"]
  const statsTotal = filtered.length
  const statsPipeline = filtered.filter((a) => activeStatuses.includes(normaliseStatus(a.status))).length
  const statsOffers = filtered.filter((a) => normaliseStatus(a.status) === "Offer Received").length
  const statsRejected = filtered.filter((a) => normaliseStatus(a.status) === "Rejected").length

  // Group by category then sort: London/Birmingham first, then Manchester, then remote, then other
  function locPriority(loc: string | null): number {
    const l = (loc ?? "").toLowerCase()
    if (l.includes("london")) return 0
    if (l.includes("birmingham")) return 1
    if (l.includes("manchester")) return 2
    if (l.includes("remote") || l.includes("hybrid")) return 3
    if (!l) return 4
    return 5
  }
  const grouped: Record<string, Application[]> = {}
  for (const cat of CATEGORIES) grouped[cat] = []
  for (const app of filtered) {
    const cat = (app.category && app.category !== "Software Engineering" ? app.category as Category : null) || detectCategory(app.company, app.role)
    if (cat in grouped) grouped[cat].push(app)
    else grouped["Miscellaneous"].push(app)
  }
  for (const cat of CATEGORIES) {
    grouped[cat].sort((a, b) => locPriority(a.location) - locPriority(b.location))
  }

  // ─── Handlers ───────────────────────────────────────────────

  function handleAdd(data: FormData) {
    const cat = data.category || detectCategory(data.company, data.role)
    const optimistic: Application = {
      id: crypto.randomUUID(),
      company: data.company,
      role: data.role,
      type: data.type,
      status: data.status,
      url: data.url || null,
      location: null,
      notes: data.notes || null,
      applied_date: data.applied_date || null,
      deadline: data.deadline || null,
      salary_range: data.salary_range || null,
      work_mode: null,
      source: data.source || null,
      starred: data.starred,
      opening_date: data.opening_date || null,
      last_year_opening: data.last_year_opening || null,
      housing_location: data.housing_location || null,
      cv_required: data.cv_required || null,
      cover_letter_required: data.cover_letter_required || null,
      written_answers: data.written_answers || null,
      sponsors_visa: data.sponsors_visa || null,
      category: cat,
    }
    setApps((prev) => [optimistic, ...prev])
    setAddOpen(false)
    startTransition(() =>
      void createApplication({
        company: data.company,
        role: data.role,
        type: data.type,
        status: data.status,
        url: data.url || "",
        notes: data.notes || "",
        applied_date: data.applied_date || "",
        deadline: data.deadline || "",
        starred: data.starred,
        salary_range: data.salary_range,
        source: data.source,
        opening_date: data.opening_date || undefined,
        last_year_opening: data.last_year_opening || undefined,
        housing_location: data.housing_location || undefined,
        cv_required: data.cv_required || undefined,
        cover_letter_required: data.cover_letter_required || undefined,
        written_answers: data.written_answers || undefined,
        sponsors_visa: data.sponsors_visa || undefined,
        category: cat || undefined,
      })
    )
  }

  function handleEdit(data: FormData) {
    if (!editApp) return
    const cat = data.category || detectCategory(data.company, data.role)
    setApps((prev) =>
      prev.map((a) =>
        a.id === editApp.id
          ? {
              ...a,
              ...data,
              url: data.url || null,
              notes: data.notes || null,
              applied_date: data.applied_date || null,
              deadline: data.deadline || null,
              salary_range: data.salary_range || null,
              source: data.source || null,
              opening_date: data.opening_date || null,
              last_year_opening: data.last_year_opening || null,
              housing_location: data.housing_location || null,
              cv_required: data.cv_required || null,
              cover_letter_required: data.cover_letter_required || null,
              written_answers: data.written_answers || null,
              sponsors_visa: data.sponsors_visa || null,
              category: cat,
            }
          : a
      )
    )
    setEditApp(null)
    startTransition(() =>
      void updateApplication(editApp.id, {
        company: data.company,
        role: data.role,
        type: data.type,
        status: data.status,
        url: data.url || "",
        notes: data.notes || "",
        applied_date: data.applied_date || "",
        deadline: data.deadline || "",
        starred: data.starred,
        salary_range: data.salary_range,
        source: data.source,
        opening_date: data.opening_date || undefined,
        last_year_opening: data.last_year_opening || undefined,
        housing_location: data.housing_location || undefined,
        cv_required: data.cv_required || undefined,
        cover_letter_required: data.cover_letter_required || undefined,
        written_answers: data.written_answers || undefined,
        sponsors_visa: data.sponsors_visa || undefined,
        category: cat || undefined,
      })
    )
  }

  function handleDelete(id: string) {
    setApps((prev) => prev.filter((a) => a.id !== id))
    startTransition(() => void deleteApplication(id))
  }

  function handleStatusChange(id: string, newDisplayStatus: string) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: newDisplayStatus } : a)))
    startTransition(() => void updateApplication(id, { status: newDisplayStatus }))
  }

  function editFormInitial(app: Application): FormData {
    return {
      company: app.company,
      role: app.role,
      type: app.type,
      status: normaliseStatus(app.status),
      url: app.url ?? "",
      notes: app.notes ?? "",
      applied_date: app.applied_date ?? "",
      deadline: app.deadline ?? "",
      opening_date: app.opening_date ?? "",
      last_year_opening: app.last_year_opening ?? "",
      housing_location: app.housing_location ?? "",
      cv_required: app.cv_required ?? "",
      cover_letter_required: app.cover_letter_required ?? "",
      written_answers: app.written_answers ?? "",
      sponsors_visa: app.sponsors_visa ?? "",
      salary_range: app.salary_range ?? "",
      source: app.source ?? "",
      category: app.category ?? "",
      starred: app.starred,
    }
  }

  const hasAnyFiltered = filtered.length > 0

  return (
    <div className="flex flex-col gap-0 h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <h1 className="text-lg font-semibold">Applications</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setView("table")}
              title="Table view"
              className={`p-1.5 transition-colors ${view === "table" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView("kanban")}
              title="Kanban view"
              className={`p-1.5 transition-colors ${view === "kanban" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView("analytics")}
              title="Analytics"
              className={`p-1.5 transition-colors ${view === "analytics" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView("linear")}
              title="Linear"
              className={`p-1.5 transition-colors ${view === "linear" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Layers className="h-3.5 w-3.5" />
            </button>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1 h-8 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>New Application</DialogTitle>
              </DialogHeader>
              <AppForm onSave={handleAdd} onCancel={() => setAddOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border shrink-0 px-4">
        {TAB_TYPES.map((tab) => {
          const count = apps.filter((a) => appBelongsToTab(a, tab)).length
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              <span className="ml-1.5 text-muted-foreground font-normal">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 px-4 py-2 border-b border-border text-xs shrink-0">
        <span>
          Total: <span className="font-semibold">{statsTotal}</span>
        </span>
        <span>
          Active pipeline: <span className="font-semibold text-blue-600 dark:text-blue-400">{statsPipeline}</span>
        </span>
        <span>
          Offers: <span className="font-semibold text-green-600 dark:text-green-400">{statsOffers}</span>
        </span>
        <span>
          Rejected: <span className="font-semibold text-red-600 dark:text-red-400">{statsRejected}</span>
        </span>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 px-4 py-2 shrink-0 flex-wrap items-center border-b border-border">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or role…"
            className="h-8 text-xs pl-7"
          />
        </div>

        <Select value={filterMyStatus} onValueChange={setFilterMyStatus}>
          <SelectTrigger className="h-8 text-xs w-44">
            <SelectValue placeholder="Filter by My Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            {MY_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterOpenStatus} onValueChange={setFilterOpenStatus}>
          <SelectTrigger className="h-8 text-xs w-36">
            <SelectValue placeholder="Open Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCoverLetter} onValueChange={setFilterCoverLetter}>
          <SelectTrigger className="h-8 text-xs w-40">
            <SelectValue placeholder="Cover Letter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
            <SelectItem value="Optional">Optional</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterLocation} onValueChange={setFilterLocation}>
          <SelectTrigger className="h-8 text-xs w-44">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Locations</SelectItem>
            <SelectItem value="London">London</SelectItem>
            <SelectItem value="Birmingham">Birmingham</SelectItem>
            <SelectItem value="Manchester">Manchester</SelectItem>
            <SelectItem value="Remote / Hybrid">Remote / Hybrid</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterKeyword} onValueChange={setFilterKeyword}>
          <SelectTrigger className="h-8 text-xs w-44">
            <SelectValue placeholder="Keyword" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Keywords</SelectItem>
            <SelectItem value="Software">Software</SelectItem>
            <SelectItem value="Data">Data</SelectItem>
            <SelectItem value="Cloud">Cloud</SelectItem>
            <SelectItem value="DevOps">DevOps</SelectItem>
            <SelectItem value="Security">Security</SelectItem>
            <SelectItem value="Finance/Quant">Finance / Quant</SelectItem>
            <SelectItem value="Embedded">Embedded</SelectItem>
            <SelectItem value="Consulting">Consulting</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban view */}
      {view === "kanban" && (
        <div className="flex-1 overflow-auto min-h-0 px-4 pb-4 pt-3">
          <ApplicationsKanban applications={apps} />
        </div>
      )}

      {/* Analytics */}
      {view === "analytics" && <ApplicationsAnalytics apps={tabApps} />}

      {/* Linear */}
      {view === "linear" && <LinearView />}

      {/* Table */}
      {view === "table" && <div className="flex-1 overflow-auto min-h-0 px-4 pb-4">
        {!hasAnyFiltered ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-sm font-medium">No applications found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || filterMyStatus !== "All" || filterOpenStatus !== "All" || filterCoverLetter !== "All"
                ? "Try adjusting your filters."
                : "Add your first application using the button above."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted dark:bg-muted/80 text-foreground">
                  <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">My Status</th>
                  <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Company</th>
                  <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Programme Name</th>
                  <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Location</th>
                  {isEvent ? (
                    <>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Eligibility</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Format</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Event Date</th>
                    </>
                  ) : (
                    <>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Opening Date</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Closing Date</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Last Year Opening</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Find Housing</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">CV</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Cover Letter</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Written Answers</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Sponsors Visa</th>
                    </>
                  )}
                  <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Notes</th>
                  <th className="px-2 py-2 text-left font-semibold whitespace-nowrap sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((cat) => {
                  const catApps = grouped[cat]
                  if (!catApps || catApps.length === 0) return null
                  return (
                    <CategoryGroup
                      key={cat}
                      category={cat}
                      apps={catApps}
                      onEdit={setEditApp}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                      isEvent={isEvent}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>}

      {/* Funnel */}
      <ApplicationsFunnel apps={apps} />

      {/* Edit dialog */}
      <Dialog
        open={!!editApp}
        onOpenChange={(o) => {
          if (!o) setEditApp(null)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
          </DialogHeader>
          {editApp && <AppForm initial={editFormInitial(editApp)} onSave={handleEdit} onCancel={() => setEditApp(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
