"use client"
// I manage the full job-application tracking workflow: listing, filtering, creating, editing and deleting
// entries across multiple tabs (Internships, Placements, Graduate Schemes, Spring Weeks, Events, Jobs).
// I also provide Kanban, Analytics and Linear views, an application funnel chart and auto-detected categories.

// SQL already applied - all new columns are in the applications table.

import { useState, useTransition, useRef } from "react"
import Link from "next/link"
import { createApplication, updateApplication, deleteApplication, archiveApplication, reopenApplication, bulkDeleteApplications } from "../../actions"
import { savedOk } from "@/lib/save-result"
import { toast } from "sonner"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { useBulkSelect } from "@/hooks/useBulkSelect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Edit2, ExternalLink, ChevronDown, ChevronRight, Search, LayoutGrid, List, TrendingUp, BarChart2, Layers, Archive, ArchiveRestore, CalendarDays, ClipboardList, DollarSign } from "lucide-react"
import ApplicationsKanban from "./ApplicationsKanban"
import LinearView from "./LinearView"
import TimelineView from "./TimelineView"
import SalaryComparisonView from "./SalaryComparisonView"
import ApplicationsAnalytics from "./ApplicationsAnalytics"
import InterviewPrepDialog, { type InterviewPrep } from "./InterviewPrepDialog"
import MarkdownContent from "@/components/shared/MarkdownContent"
import { Pagination } from "@/components/shared/Pagination"
import { APPLICATION_STATUSES, normaliseStatus, statusTextClass, computeFunnelCounts, isInPipeline, classifyFunnelStage } from "@/lib/application-status"
import { ProgressBar } from "@/components/analytics"

// ─── Types ────────────────────────────────────────────────────────────────────

type Application = {
  id: string
  company: string
  role: string
  type: string
  status: string
  created_at: string
  url: string | null
  location: string | null
  notes: string | null
  applied_date: string | null
  deadline: string | null
  salary_range: string | null
  work_mode: string | null
  source: string | null
  starred: boolean
  archived: boolean
  opening_date: string | null
  last_year_opening: string | null
  housing_location: string | null
  cv_required: string | null
  cover_letter_required: string | null
  written_answers: string | null
  sponsors_visa: string | null
  category: string | null
  last_scraped_at: string | null
  interview_prep: unknown
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "FAANG+",
  "Software Engineering",
  "Data Science",
  "AI and Machine Learning",
  "DevOps and Infrastructure",
  "Embedded",
  "Hardware",
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

// A general careers or search landing page makes me hunt for the role once I get
// there; a direct posting drops me straight on it. I rank links so that when the
// same role was scraped from more than one source, the specific posting is the
// one shown. 2 = looks like a direct posting, 1 = a search/careers landing page,
// 0 = no link at all.
const _GENERAL_URL_RE = /\/search|\/results|early-careers|\/campus|\/students?(\/|$|\?)|[?&](q|keyword|keywords|search)=|\/(careers|jobs|vacancies|opportunities)\/?($|\?)/i
function _urlRank(url: string | null): number {
  if (!url) return 0
  return _GENERAL_URL_RE.test(url) ? 1 : 2
}

// How much I prefer one row over another duplicate of the same role. A row I have
// already touched (any status other than the raw "scraped") always wins so a real
// application is never hidden behind its scraped twin; then a starred row, then the
// most specific link, then the richer row (deadline, location).
function _appPref(a: Application): number {
  let score = 0
  const status = (a.status ?? "").toLowerCase()
  if (status && status !== "scraped") score += 1000
  if (a.starred) score += 100
  score += _urlRank(a.url) * 10
  if (a.deadline) score += 2
  if (a.location) score += 1
  return score
}

// The same role often lands in the table from several sources (the Trackr plus a
// direct ATS, or the daily re-scrape before the URL heal caught up), so it shows
// as duplicate rows - one with the real posting link, one with only the company
// careers page or none. I collapse those to the single best row FOR DISPLAY ONLY,
// keyed on company + role + location. Nothing is deleted: every row stays in the
// database and can still be edited; this only decides which duplicate to render so
// the user sees one clean row pointing at the most specific link I have for it.
function dedupeApps(apps: Application[]): Application[] {
  const norm = (s: string | null) => (s ?? "").toLowerCase().replace(/\s+/g, " ").trim()
  const best = new Map<string, Application>()
  const order: string[] = []
  for (const a of apps) {
    const key = `${norm(a.company)}||${norm(a.role)}||${norm(a.location)}`
    const cur = best.get(key)
    if (!cur) {
      best.set(key, a)
      order.push(key)
    } else if (_appPref(a) > _appPref(cur)) {
      best.set(key, a)
    }
  }
  return order.map((k) => best.get(k) as Application)
}

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

// The table can hold tens of thousands of scraped roles, so I paginate rather than mount a whole tab at
// once. One page of rows is mounted at a time (page controls below the table); all counts, filters, stats
// and bulk actions still run over the full set - only the mounted page of rows is limited.
const PAGE_SIZE = 1000

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

// Evaluated once per page load, not per render: a scraped row not stamped since this
// instant has likely left the boards, so its Pulled At cell warns before I click.
const STALE_PULL_BEFORE = Date.now() - 14 * 86_400_000

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Opening Date</label>
          <Input type="date" value={form.opening_date} onChange={(e) => set("opening_date", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Closing Date</label>
          <Input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Last Year Opening</label>
          <Input type="date" value={form.last_year_opening} onChange={(e) => set("last_year_opening", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Applied Date</label>
          <Input type="date" value={form.applied_date} onChange={(e) => set("applied_date", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

function NotesCell({ notes }: { notes: string | null }) {
  const [expanded, setExpanded] = useState(false)
  if (!notes) return <span className="text-muted-foreground/40">-</span>
  const isLong = notes.length > 120
  return (
    <div className="text-xs">
      {isLong && !expanded
        ? <MarkdownContent compact>{notes.slice(0, 120) + "…"}</MarkdownContent>
        : <MarkdownContent compact>{notes}</MarkdownContent>
      }
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-primary hover:underline mt-0.5"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  )
}

// ─── Table row ────────────────────────────────────────────────────────────────

function AppRow({
  app,
  onEdit,
  onDelete,
  onArchive,
  onReopen,
  onStatusChange,
  onPrep,
  isEvent,
  selected,
  onToggleSelect,
}: {
  app: Application
  onEdit: (a: Application) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onReopen: (id: string) => void
  onStatusChange: (id: string, status: string) => void
  onPrep: (a: Application) => void
  isEvent: boolean
  selected?: boolean
  onToggleSelect?: (id: string) => void
}) {
  const displayStatus = normaliseStatus(app.status)
  const statusCls = statusTextClass(app.status)

  return (
    <tr className={`border-b border-border/50 hover:bg-muted/30 transition-colors text-xs ${selected ? "bg-primary/5" : ""}`}>
      <td className="px-2 py-1.5 w-7">
        {onToggleSelect && (
          <input type="checkbox" checked={!!selected} onChange={() => onToggleSelect(app.id)} title="Select row" className="rounded" />
        )}
      </td>
      {/* My Status - inline select */}
      <td className="px-2 py-1.5 whitespace-nowrap min-w-[160px]">
        <select
          value={displayStatus}
          onChange={(e) => onStatusChange(app.id, e.target.value)}
          title="My Status"
          aria-label="My Status"
          className={`bg-transparent border-none outline-none cursor-pointer text-xs font-medium w-full ${statusCls}`}
        >
          {APPLICATION_STATUSES.map((s) => (
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

      {/* Pulled At - when the scraper last saw this listing; manual rows have never been pulled.
          A stamp older than 14 days means the listing has likely left the boards, so the cell
          turns red as a do-not-trust-this-link warning before I click through. */}
      <td className="px-2 py-1.5 whitespace-nowrap text-xs">
        {app.last_scraped_at ? (
          new Date(app.last_scraped_at).getTime() < STALE_PULL_BEFORE ? (
            <span
              className="text-red-500 dark:text-red-400 font-medium"
              title="Not seen by the scraper in 14 days - the listing may be gone"
            >
              {formatDate(app.last_scraped_at)} · stale
            </span>
          ) : (
            <span className="text-muted-foreground">{formatDate(app.last_scraped_at)}</span>
          )
        ) : (
          <span className="text-muted-foreground opacity-40">-</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-2 py-1.5 whitespace-nowrap">
        <div className="flex gap-0.5">
          {!app.archived && (
            <button
              type="button"
              onClick={() => onEdit(app)}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Edit"
              title="Edit"
            >
              <Edit2 className="h-3 w-3" />
            </button>
          )}
          {!app.archived && (classifyFunnelStage(app.status) === "interview" || classifyFunnelStage(app.status) === "offer") && (
            <button
              type="button"
              onClick={() => onPrep(app)}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              aria-label="Interview prep"
              title="Interview prep"
            >
              <ClipboardList className="h-3 w-3" />
            </button>
          )}
          {app.archived ? (
            <button
              type="button"
              onClick={() => onReopen(app.id)}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Reopen"
              title="Reopen"
            >
              <ArchiveRestore className="h-3 w-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onArchive(app.id)}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-amber-600 transition-colors"
              aria-label="Archive"
              title="Archive"
            >
              <Archive className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(app.id)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Delete"
            title="Delete"
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
  onArchive,
  onReopen,
  onStatusChange,
  onPrep,
  isEvent,
  selectedIds,
  onToggleSelect,
}: {
  category: string
  apps: Application[]
  onEdit: (a: Application) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onReopen: (id: string) => void
  onStatusChange: (id: string, status: string) => void
  onPrep: (a: Application) => void
  isEvent: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <>
      {/* Category header row */}
      <tr className="bg-muted/60 dark:bg-muted/40 border-b border-border">
        <td colSpan={isEvent ? 10 : 16} className="px-2 py-1.5">
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
            onArchive={onArchive}
            onReopen={onReopen}
            onStatusChange={onStatusChange}
            onPrep={onPrep}
            selected={selectedIds?.has(app.id)}
            onToggleSelect={onToggleSelect}
            isEvent={isEvent}
          />
        ))}
    </>
  )
}

// ─── Funnel chart ─────────────────────────────────────────────────────────────

function ApplicationsFunnel({ apps }: { apps: Application[] }) {
  const { applied, assessment, interview, offer } = computeFunnelCounts(apps.map((a) => a.status))

  const stages = [
    { label: "Applied",    count: applied,    colorClassName: "bg-blue-500" },
    { label: "Assessment", count: assessment, colorClassName: "bg-violet-500" },
    { label: "Interview",  count: interview,  colorClassName: "bg-amber-500" },
    { label: "Offer",      count: offer,      colorClassName: "bg-green-500" },
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
          const prev = stages[i - 1]
          const convRate = prev ? (prev.count > 0 ? Math.round((stage.count / prev.count) * 100) : 0) : null
          return (
            <div key={stage.label} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 shrink-0">{stage.label}</span>
              <div className="flex-1">
                <ProgressBar value={stage.count} max={max} colorClassName={stage.colorClassName} />
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
  const [page, setPage] = useState(1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState("")
  const [filterOpenStatus, setFilterOpenStatus] = useState("All")
  const [filterCoverLetter, setFilterCoverLetter] = useState("All")
  const [filterMyStatus, setFilterMyStatus] = useState("All")
  const [filterLocation, setFilterLocation] = useState("All")
  const [filterKeyword, setFilterKeyword] = useState("All")
  const [view, setView] = useState<"table" | "kanban" | "linear" | "timeline" | "salary" | "analytics">("table")
  const [showArchived, setShowArchived] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editApp, setEditApp] = useState<Application | null>(null)
  const [prepApp, setPrepApp] = useState<Application | null>(null)
  const [, startTransition] = useTransition()
  const { confirm: showConfirm, dialog: confirmDialogNode } = useConfirmDialog()

  const isEvent = activeTab === "Events"
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Tab-filtered apps - archived view shows only archived, default hides them
  const tabApps = dedupeApps(apps.filter((a) => appBelongsToTab(a, activeTab) && (showArchived ? a.archived : !a.archived)))

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
        "Hardware":      "hardware",
        "Consulting":    "consulting",
      }
      const needle = kwMap[filterKeyword]
      if (needle && !cat.includes(needle)) return false
    }

    return true
  })

  const { selected: bulkSelected, toggle: bulkToggle, toggleAll: bulkToggleAll, allSelected: bulkAllSelected, someSelected: bulkSomeSelected } = useBulkSelect(filtered)

  // Stats (based on filtered)
  const statsTotal = filtered.length
  const statsPipeline = filtered.filter((a) => isInPipeline(a.status)).length
  const statsOffers = filtered.filter((a) => ["Offer Received", "Negotiating", "Accepted"].includes(normaliseStatus(a.status))).length
  const statsRejected = filtered.filter((a) => ["Rejected", "Ghosted", "Withdrawn"].includes(normaliseStatus(a.status))).length

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

  // Reset to the first page whenever the tab, view or any filter changes so I never sit on an empty page.
  // I adjust during render (React's supported pattern) rather than in an effect, to avoid a cascading render.
  const resetKey = `${activeTab}|${view}|${search}|${filterMyStatus}|${filterOpenStatus}|${filterCoverLetter}|${filterLocation}|${filterKeyword}|${showArchived}`
  const [prevResetKey, setPrevResetKey] = useState(resetKey)
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey)
    setPage(1)
  }

  // Paginate the category-ordered rows at PAGE_SIZE. I flatten the groups in display order, take the
  // current page, then re-split it back into its categories so the grouping stays consistent across pages.
  // The table never mounts more than one page of rows however many thousand scraped roles pile up, while
  // counts, stats and bulk-select still run over the full `filtered` set. (grouped covers every filtered
  // row, so orderedApps.length === filtered.length.)
  const orderedApps: Application[] = []
  for (const cat of CATEGORIES) orderedApps.push(...grouped[cat])
  const totalPages = Math.max(1, Math.ceil(orderedApps.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageIds = new Set(orderedApps.slice(pageStart, pageStart + PAGE_SIZE).map((a) => a.id))
  const visibleGroups: { cat: string; apps: Application[] }[] = []
  for (const cat of CATEGORIES) {
    const catApps = grouped[cat].filter((a) => pageIds.has(a.id))
    if (catApps.length) visibleGroups.push({ cat, apps: catApps })
  }
  function goToPage(p: number) {
    setPage(p)
    scrollRef.current?.scrollTo({ top: 0 })
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
      created_at: new Date().toISOString(),
      url: data.url || null,
      location: null,
      last_scraped_at: null,
      notes: data.notes || null,
      applied_date: data.applied_date || null,
      deadline: data.deadline || null,
      salary_range: data.salary_range || null,
      work_mode: null,
      source: data.source || null,
      starred: data.starred,
      archived: false,
      opening_date: data.opening_date || null,
      last_year_opening: data.last_year_opening || null,
      housing_location: data.housing_location || null,
      cv_required: data.cv_required || null,
      cover_letter_required: data.cover_letter_required || null,
      written_answers: data.written_answers || null,
      sponsors_visa: data.sponsors_visa || null,
      category: cat,
      interview_prep: null,
    }
    const prevApps = apps
    setApps((p) => [optimistic, ...p])
    setAddOpen(false)
    startTransition(async () => {
      const res = await createApplication({
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
      if (!savedOk(res, "Could not save application")) setApps(prevApps)
    })
  }

  function handleEdit(data: FormData) {
    if (!editApp) return
    const cat = data.category || detectCategory(data.company, data.role)
    const prev = apps
    setApps((p) =>
      p.map((a) =>
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
    const editId = editApp.id
    setEditApp(null)
    startTransition(async () => {
      try {
        const res = await updateApplication(editId, {
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
        if (res && (res as { error?: string }).error) throw new Error((res as { error?: string }).error)
      } catch {
        setApps(prev)
        toast.error("Could not save the change")
      }
    })
  }

  async function handleDelete(id: string) {
    const app = apps.find((a) => a.id === id)
    const ok = await showConfirm({
      title: app ? `Delete ${app.company} - ${app.role}?` : "Delete application?",
      description: "This application will be permanently deleted.",
      destructive: true,
    })
    if (!ok) return
    const prev = apps
    setApps((p) => p.filter((a) => a.id !== id))
    startTransition(async () => {
      try {
        const res = await deleteApplication(id)
        if (res && (res as { error?: string }).error) throw new Error((res as { error?: string }).error)
      } catch {
        setApps(prev)
        toast.error("Could not save the change")
      }
    })
  }

  async function handleBulkDelete() {
    const ids = [...bulkSelected]
    if (!ids.length) return
    const ok = await showConfirm({
      title: `Delete ${ids.length} application${ids.length === 1 ? "" : "s"}?`,
      description: `${ids.length} selected application${ids.length === 1 ? "" : "s"} will be permanently deleted.`,
      destructive: true,
    })
    if (!ok) return
    const prev = apps
    setApps((p) => p.filter((a) => !bulkSelected.has(a.id)))
    startTransition(async () => {
      try {
        const res = await bulkDeleteApplications(ids)
        if (res && (res as { error?: string }).error) throw new Error((res as { error?: string }).error)
      } catch {
        setApps(prev)
        toast.error("Could not save the change")
      }
    })
  }

  async function handleArchive(id: string) {
    const app = apps.find((a) => a.id === id)
    const ok = await showConfirm({
      title: app ? `Archive ${app.company} - ${app.role}?` : "Archive application?",
      description: "This application will be moved to the archive. You can reopen it later.",
      confirmLabel: "Archive",
      destructive: false,
    })
    if (!ok) return
    const prev = apps
    setApps((p) => p.map((a) => (a.id === id ? { ...a, archived: true } : a)))
    startTransition(async () => {
      try {
        const res = await archiveApplication(id)
        if (res && (res as { error?: string }).error) throw new Error((res as { error?: string }).error)
      } catch {
        setApps(prev)
        toast.error("Could not save the change")
      }
    })
  }

  function handleReopen(id: string) {
    const prev = apps
    setApps((p) => p.map((a) => (a.id === id ? { ...a, archived: false } : a)))
    startTransition(async () => {
      try {
        const res = await reopenApplication(id)
        if (res && (res as { error?: string }).error) throw new Error((res as { error?: string }).error)
      } catch {
        setApps(prev)
        toast.error("Could not save the change")
      }
    })
  }

  function handleSavePrep(prep: InterviewPrep) {
    if (!prepApp) return
    setApps((prev) => prev.map((a) => (a.id === prepApp.id ? { ...a, interview_prep: prep } : a)))
    setPrepApp((prev) => (prev ? { ...prev, interview_prep: prep } : null))
  }

  function handleStatusChange(id: string, newDisplayStatus: string) {
    const prev = apps
    setApps((p) => p.map((a) => (a.id === id ? { ...a, status: newDisplayStatus } : a)))
    startTransition(async () => {
      try {
        const res = await updateApplication(id, { status: newDisplayStatus })
        if (res && (res as { error?: string }).error) throw new Error((res as { error?: string }).error)
      } catch {
        setApps(prev)
        toast.error("Could not save the change")
      }
    })
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
              onClick={() => setView("timeline")}
              title="Timeline"
              className={`p-1.5 transition-colors ${view === "timeline" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView("salary")}
              title="Salary comparison"
              className={`p-1.5 transition-colors ${view === "salary" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <DollarSign className="h-3.5 w-3.5" />
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
          const count = dedupeApps(apps.filter((a) => appBelongsToTab(a, tab) && !a.archived)).length
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab)
                scrollRef.current?.scrollTo({ top: 0 })
              }}
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
          <SelectTrigger className="h-8 text-xs min-w-[8rem] flex-1">
            <SelectValue placeholder="Filter by My Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            {APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterOpenStatus} onValueChange={setFilterOpenStatus}>
          <SelectTrigger className="h-8 text-xs min-w-[8rem] flex-1">
            <SelectValue placeholder="Open Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCoverLetter} onValueChange={setFilterCoverLetter}>
          <SelectTrigger className="h-8 text-xs min-w-[8rem] flex-1">
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
          <SelectTrigger className="h-8 text-xs min-w-[8rem] flex-1">
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
          <SelectTrigger className="h-8 text-xs min-w-[8rem] flex-1">
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
            <SelectItem value="Hardware">Hardware</SelectItem>
            <SelectItem value="Consulting">Consulting</SelectItem>
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => setShowArchived((v) => !v)}
          title={showArchived ? "Back to active applications" : "View archived applications"}
          className={`h-8 px-2.5 text-xs rounded-md border flex items-center gap-1.5 shrink-0 transition-colors ${
            showArchived
              ? "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Archive className="h-3 w-3" />
          {showArchived ? "Viewing archived" : "Archived"}
        </button>

        {bulkSomeSelected && (
          <button
            type="button"
            onClick={handleBulkDelete}
            title={`Move ${bulkSelected.size} selected application${bulkSelected.size === 1 ? "" : "s"} to trash`}
            className="h-8 px-2.5 text-xs rounded-md border border-red-300 text-red-600 flex items-center gap-1.5 shrink-0 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Delete {bulkSelected.size}
          </button>
        )}
      </div>

      {/* Kanban view */}
      {view === "kanban" && (
        <div className="flex-1 overflow-auto min-h-0 px-4 pb-4 pt-3">
          <ApplicationsKanban applications={apps.filter((a) => !a.archived)} />
        </div>
      )}

      {/* Linear */}
      {view === "linear" && <LinearView />}

      {/* Timeline */}
      {view === "timeline" && (
        <TimelineView apps={apps.filter((a) => appBelongsToTab(a, activeTab) && !a.archived)} />
      )}

      {/* Salary comparison */}
      {view === "salary" && (
        <SalaryComparisonView apps={apps.filter((a) => appBelongsToTab(a, activeTab) && !a.archived)} />
      )}

      {/* Analytics - filtered to the current tab type */}
      {view === "analytics" && (
        <div className="flex-1 overflow-auto min-h-0 px-4 pb-4 pt-3">
          <ApplicationsAnalytics
            apps={apps.filter((a) => appBelongsToTab(a, activeTab) && !a.archived)}
          />
        </div>
      )}

      {/* Table */}
      {view === "table" && <div ref={scrollRef} className="flex-1 overflow-auto min-h-0 px-4 pb-4">
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
                  <th className="px-2 py-2 w-7">
                    <input type="checkbox" checked={bulkAllSelected} onChange={bulkToggleAll} title="Select all visible" className="rounded" />
                  </th>
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
                  <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Pulled At</th>
                  <th className="px-2 py-2 text-left font-semibold whitespace-nowrap sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleGroups.map(({ cat, apps }) => (
                  <CategoryGroup
                    key={cat}
                    category={cat}
                    apps={apps}
                    onEdit={setEditApp}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onReopen={handleReopen}
                    onStatusChange={handleStatusChange}
                    onPrep={setPrepApp}
                    isEvent={isEvent}
                    selectedIds={bulkSelected}
                    onToggleSelect={bulkToggle}
                  />
                ))}
              </tbody>
            </table>
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onChange={goToPage}
              totalItems={orderedApps.length}
              pageSize={PAGE_SIZE}
              itemLabel="applications"
              className="py-4"
            />
          </div>
        )}
      </div>}

      {/* Funnel - always uses non-archived apps */}
      <ApplicationsFunnel apps={apps.filter((a) => !a.archived)} />

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

      {/* Interview prep dialog */}
      {prepApp && (
        <InterviewPrepDialog
          open={!!prepApp}
          onClose={() => setPrepApp(null)}
          applicationId={prepApp.id}
          company={prepApp.company}
          role={prepApp.role}
          initialPrep={prepApp.interview_prep}
          onSave={handleSavePrep}
        />
      )}
      {confirmDialogNode}
    </div>
  )
}
