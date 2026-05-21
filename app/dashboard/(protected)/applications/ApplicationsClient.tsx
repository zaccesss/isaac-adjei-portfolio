"use client"

import { useState, useTransition } from "react"
import { createApplication, updateApplication, deleteApplication } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Star, Trash2, Edit2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"

type Application = {
  id: string
  company: string
  role: string
  type: string
  applied_date: string | null
  deadline: string | null
  status: string
  notes: string | null
  url: string | null
  starred: boolean
  salary_range: string | null
  location: string | null
  work_mode: string | null
  source: string | null
}

const APP_TYPES = ["Internship","Summer Internship","Industrial Placement","Part-time","Full-time","Graduate","Apprenticeship","Other"]
const STATUSES = ["drafting","applied","oa","phone_screen","interview","offer","rejected","withdrawn"]
const STATUS_LABELS: Record<string, string> = {
  drafting: "Drafting", applied: "Applied", oa: "Online Assessment",
  phone_screen: "Phone Screen", interview: "Interview",
  offer: "Offer", rejected: "Rejected", withdrawn: "Withdrawn",
}
const STATUS_COLOURS: Record<string, string> = {
  drafting: "bg-muted text-muted-foreground",
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  oa: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  phone_screen: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  interview: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  offer: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  withdrawn: "bg-slate-100 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400",
}

const emptyForm = {
  company: "", role: "", type: "Internship", applied_date: "", deadline: "",
  status: "drafting", notes: "", url: "", starred: false,
  salary_range: "", location: "", work_mode: "", source: "",
}

function AppForm({ initial, onSave, onCancel }: {
  initial?: typeof emptyForm
  onSave: (data: typeof emptyForm) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial ?? emptyForm)
  const set = (k: keyof typeof emptyForm, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Company *</label>
          <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Company name" autoFocus />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Role *</label>
          <Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Job title" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Type</label>
          <Select value={form.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{APP_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Status</label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Applied date</label>
          <Input type="date" value={form.applied_date} onChange={(e) => set("applied_date", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Deadline</label>
          <Input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Location</label>
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City or Remote" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Work mode</label>
          <Select value={form.work_mode} onValueChange={(v) => set("work_mode", v)}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {["Remote","Hybrid","Onsite","Other"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Salary range</label>
          <Input value={form.salary_range} onChange={(e) => set("salary_range", e.target.value)} placeholder="e.g. £25k-£30k" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Source</label>
          <Input value={form.source} onChange={(e) => set("source", e.target.value)} placeholder="LinkedIn, Indeed, etc." />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">URL</label>
        <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://..." />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Notes</label>
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Any notes about the application..." />
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={form.starred} onChange={(e) => set("starred", e.target.checked)} />
        Star this application
      </label>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => { if (form.company.trim() && form.role.trim()) onSave(form) }} disabled={!form.company.trim() || !form.role.trim()}>Save</Button>
      </div>
    </div>
  )
}

function AppCard({ app, onEdit, onDelete, onStatusChange }: {
  app: Application
  onEdit: (a: Application) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`border border-border rounded-lg bg-card overflow-hidden ${app.starred ? "border-l-4 border-l-amber-400" : ""}`}>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {app.starred && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />}
              <p className="font-semibold text-sm">{app.company}</p>
              <span className="text-xs text-muted-foreground">{app.role}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className={`text-xs px-2 py-0 ${STATUS_COLOURS[app.status] ?? "bg-muted"}`}>{STATUS_LABELS[app.status] ?? app.status}</Badge>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{app.type}</span>
              {app.location && <span className="text-xs text-muted-foreground">{app.location}</span>}
              {app.work_mode && <span className="text-xs text-muted-foreground">{app.work_mode}</span>}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            {app.url && <a href={app.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><ExternalLink className="h-3.5 w-3.5" /></a>}
            <button type="button" onClick={() => onEdit(app)} aria-label="Edit" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => onDelete(app.id)} aria-label="Delete" className="p-1.5 rounded hover:bg-muted text-destructive/60 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => setExpanded((o) => !o)} aria-label="Expand" className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors">
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-border/50 pt-3 flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="grid grid-cols-2 gap-2">
              {app.applied_date && <span>Applied: {new Date(app.applied_date).toLocaleDateString("en-GB")}</span>}
              {app.deadline && <span>Deadline: {new Date(app.deadline).toLocaleDateString("en-GB")}</span>}
              {app.salary_range && <span>Salary: {app.salary_range}</span>}
              {app.source && <span>Found via: {app.source}</span>}
            </div>
            {app.notes && <p className="text-foreground/80 leading-relaxed">{app.notes}</p>}
            <div className="flex items-center gap-2 pt-1">
              <span className="shrink-0">Update status:</span>
              <Select value={app.status} onValueChange={(v) => onStatusChange(app.id, v)}>
                <SelectTrigger className="h-7 text-xs w-36"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs">{STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ApplicationsClient({ applications: initial }: { applications: Application[] }) {
  const [apps, setApps] = useState<Application[]>(initial)
  const [addOpen, setAddOpen] = useState(false)
  const [editApp, setEditApp] = useState<Application | null>(null)
  const [filterType, setFilterType] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [, startTransition] = useTransition()

  const total = apps.length
  const active = apps.filter((a) => !["rejected","withdrawn","drafting"].includes(a.status)).length
  const offers = apps.filter((a) => a.status === "offer").length
  const rejected = apps.filter((a) => a.status === "rejected").length

  const filtered = apps
    .filter((a) => filterType === "All" || a.type === filterType)
    .filter((a) => filterStatus === "All" || a.status === filterStatus)
    .sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0))

  function handleAdd(data: typeof emptyForm) {
    const optimistic: Application = {
      id: crypto.randomUUID(), ...data,
      applied_date: data.applied_date || null, deadline: data.deadline || null,
      notes: data.notes || null, url: data.url || null,
      salary_range: data.salary_range || null, location: data.location || null,
      work_mode: data.work_mode || null, source: data.source || null,
    }
    setApps((prev) => [optimistic, ...prev])
    setAddOpen(false)
    startTransition(() => createApplication(data))
  }

  function handleEdit(data: typeof emptyForm) {
    if (!editApp) return
    setApps((prev) => prev.map((a) => a.id === editApp.id ? { ...a, ...data } : a))
    setEditApp(null)
    startTransition(() => updateApplication(editApp.id, data))
  }

  function handleDelete(id: string) {
    setApps((prev) => prev.filter((a) => a.id !== id))
    startTransition(() => deleteApplication(id))
  }

  function handleStatusChange(id: string, status: string) {
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
    startTransition(() => updateApplication(id, { status }))
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Applications</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Internships, placements and jobs</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New application</DialogTitle></DialogHeader>
            <AppForm onSave={handleAdd} onCancel={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: total },
          { label: "In pipeline", value: active, colour: "text-blue-600 dark:text-blue-400" },
          { label: "Offers", value: offers, colour: "text-green-600 dark:text-green-400" },
          { label: "Rejected", value: rejected, colour: "text-red-600 dark:text-red-400" },
        ].map(({ label, value, colour }) => (
          <div key={label} className="border border-border rounded-lg p-3 bg-card flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className={`font-semibold text-lg ${colour ?? ""}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-8 text-xs w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All types</SelectItem>
            {APP_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 text-xs w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-2xl mb-2">💼</p>
          <p className="text-sm font-medium">No applications yet</p>
          <p className="text-xs text-muted-foreground mt-1">Track every opportunity I apply to.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((a) => (
            <AppCard key={a.id} app={a} onEdit={(app) => setEditApp(app)} onDelete={handleDelete} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      <Dialog open={!!editApp} onOpenChange={(o) => { if (!o) setEditApp(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit application</DialogTitle></DialogHeader>
          {editApp && (
            <AppForm
              initial={{ company: editApp.company, role: editApp.role, type: editApp.type, applied_date: editApp.applied_date ?? "", deadline: editApp.deadline ?? "", status: editApp.status, notes: editApp.notes ?? "", url: editApp.url ?? "", starred: editApp.starred, salary_range: editApp.salary_range ?? "", location: editApp.location ?? "", work_mode: editApp.work_mode ?? "", source: editApp.source ?? "" }}
              onSave={handleEdit}
              onCancel={() => setEditApp(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
