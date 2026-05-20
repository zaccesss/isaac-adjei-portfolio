"use client"

import { useState, useTransition } from "react"
import { createApplication, updateApplication, deleteApplication } from "../../actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Star, ExternalLink, Trash2 } from "lucide-react"

type Application = {
  id: string
  company: string
  role: string
  applied_date: string | null
  deadline: string | null
  status: string
  notes: string | null
  url: string | null
  starred: boolean
}

const STATUS_OPTS = [
  "drafting", "applied", "oa", "phone_screen", "interview", "offer", "rejected", "withdrawn",
]

const STATUS_LABELS: Record<string, string> = {
  drafting: "Drafting",
  applied: "Applied",
  oa: "OA",
  phone_screen: "Phone Screen",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
}

const STATUS_COLOURS: Record<string, string> = {
  drafting: "bg-muted text-muted-foreground",
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  oa: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  phone_screen: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  interview: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  offer: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  withdrawn: "bg-muted text-muted-foreground",
}

const emptyForm = {
  company: "",
  role: "",
  applied_date: "",
  deadline: "",
  status: "drafting",
  notes: "",
  url: "",
  starred: false,
}

function AppForm({
  initial,
  onSave,
  onClose,
}: {
  initial: typeof emptyForm
  onSave: (data: typeof emptyForm) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const set = <K extends keyof typeof emptyForm>(k: K, v: (typeof emptyForm)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Company</label>
          <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="e.g. Google" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Role</label>
          <Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Software Engineer Intern" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Status</label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTS.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Applied date</label>
          <Input type="date" value={form.applied_date} onChange={(e) => set("applied_date", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Deadline</label>
          <Input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Job URL</label>
          <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Notes</label>
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Recruiter contact, interview feedback, etc." />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { if (form.company.trim() && form.role.trim()) onSave(form) }}>Save</Button>
      </div>
    </div>
  )
}

function AppRow({ app }: { app: Application }) {
  const [detail, setDetail] = useState(false)
  const [editing, setEditing] = useState(false)
  const [, startTransition] = useTransition()

  function handleEdit(data: typeof emptyForm) {
    startTransition(() => updateApplication(app.id, data))
    setEditing(false)
    setDetail(false)
  }

  function handleDelete() {
    startTransition(() => deleteApplication(app.id))
  }

  function toggleStar() {
    startTransition(() => updateApplication(app.id, { starred: !app.starred }))
  }

  return (
    <>
      <tr
        className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors text-sm"
        onClick={() => setDetail(true)}
      >
        <td className="py-3 pr-3">
          <button
            className="p-0 bg-transparent border-none"
            onClick={(e) => { e.stopPropagation(); toggleStar() }}
          >
            <Star className={`h-4 w-4 ${app.starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
          </button>
        </td>
        <td className="py-3 pr-4 font-medium">{app.company}</td>
        <td className="py-3 pr-4 text-muted-foreground">{app.role}</td>
        <td className="py-3 pr-4 text-muted-foreground text-xs">
          {app.applied_date ? new Date(app.applied_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "-"}
        </td>
        <td className="py-3 pr-4 text-muted-foreground text-xs">
          {app.deadline ? new Date(app.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "-"}
        </td>
        <td className="py-3">
          <Select
            value={app.status}
            onValueChange={(v) => { startTransition(() => updateApplication(app.id, { status: v })) }}
          >
            <SelectTrigger
              className="h-7 text-xs border-0 p-0 bg-transparent w-auto gap-1 focus:ring-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Badge className={`text-xs px-2 py-0 cursor-pointer ${STATUS_COLOURS[app.status] ?? STATUS_COLOURS.drafting}`}>
                {STATUS_LABELS[app.status] ?? app.status}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTS.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </td>
      </tr>

      {/* Detail dialog */}
      <Dialog open={detail && !editing} onOpenChange={(o) => { if (!o) setDetail(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{app.company} - {app.role}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Badge className={`self-start text-xs px-2 py-0.5 ${STATUS_COLOURS[app.status]}`}>{STATUS_LABELS[app.status]}</Badge>
            {app.applied_date && <p className="text-sm text-muted-foreground">Applied: {new Date(app.applied_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>}
            {app.deadline && <p className="text-sm text-muted-foreground">Deadline: {new Date(app.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>}
            {app.url && (
              <a href={app.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5" />Job posting
              </a>
            )}
            {app.notes && <p className="text-sm whitespace-pre-wrap">{app.notes}</p>}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" size="sm" className="gap-1 text-destructive" onClick={handleDelete}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
              <Button size="sm" onClick={() => { setDetail(false); setEditing(true) }}>Edit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editing} onOpenChange={(o) => { if (!o) setEditing(false) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit application</DialogTitle></DialogHeader>
          <AppForm
            initial={{
              company: app.company,
              role: app.role,
              applied_date: app.applied_date ?? "",
              deadline: app.deadline ?? "",
              status: app.status,
              notes: app.notes ?? "",
              url: app.url ?? "",
              starred: app.starred,
            }}
            onSave={handleEdit}
            onClose={() => setEditing(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function InternshipsClient({ applications }: { applications: Application[] }) {
  const [open, setOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [, startTransition] = useTransition()

  function handleCreate(data: typeof emptyForm) {
    startTransition(() => createApplication(data))
    setOpen(false)
  }

  const filtered = filterStatus === "all"
    ? applications
    : applications.filter((a) => a.status === filterStatus)

  const starred = filtered.filter((a) => a.starred)
  const rest = filtered.filter((a) => !a.starred)
  const sorted = [...starred, ...rest]

  // I derive stats from the full list, not the filtered one, so totals are always accurate
  const total = applications.length
  const inProgress = applications.filter((a) => ["oa","phone_screen","interview"].includes(a.status)).length
  const offers = applications.filter((a) => a.status === "offer").length
  const rejected = applications.filter((a) => a.status === "rejected").length

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Internships</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add application</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New application</DialogTitle></DialogHeader>
            <AppForm initial={emptyForm} onSave={handleCreate} onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total applied", value: total },
          { label: "In progress", value: inProgress },
          { label: "Offers", value: offers },
          { label: "Rejections", value: rejected },
        ].map(({ label, value }) => (
          <div key={label} className="border border-border rounded-lg p-3 bg-card flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="font-semibold text-lg">{value}</span>
          </div>
        ))}
      </div>

      {/* filter */}
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUS_OPTS.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
        </SelectContent>
      </Select>

      {sorted.length === 0 && (
        <p className="text-sm text-muted-foreground">No applications yet. Add one above.</p>
      )}

      {sorted.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="py-2 pl-4 w-8"></th>
                <th className="py-2 pr-4 text-left font-normal">Company</th>
                <th className="py-2 pr-4 text-left font-normal">Role</th>
                <th className="py-2 pr-4 text-left font-normal">Applied</th>
                <th className="py-2 pr-4 text-left font-normal">Deadline</th>
                <th className="py-2 pr-4 text-left font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((app) => <AppRow key={app.id} app={app} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
