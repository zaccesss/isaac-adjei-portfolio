"use client"
// A dedicated tracker for my actual projects (hardware builds, personal software, coursework
// projects like the audio amplifier) - distinct from Goals (aspirations) and University/Study/
// Modules (coursework marks and time). Mini analytics sit right on this page rather than a
// separate analytics page, same pattern Goals already uses.

import { useState, useMemo, useTransition } from "react"
import Link from "next/link"
import { createProject, type Project } from "../../actions"
import { savedOk } from "@/lib/save-result"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import MarkdownEditor from "@/components/shared/MarkdownEditor"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, FolderKanban, Github, BarChart3, Cpu, Code2, GraduationCap, Wrench } from "lucide-react"
import MarkdownContent from "@/components/shared/MarkdownContent"
import { StatCard, BarChart, PieChart, Gauge, DEFAULT_CHART_COLOURS } from "@/components/analytics"

export const CATEGORIES = ["Hardware", "Software", "Coursework", "Personal", "Other"]
export const STATUSES = ["planning", "in_progress", "on_hold", "done"]

export const STATUS_LABELS: Record<string, string> = {
  planning: "Planning",
  in_progress: "In progress",
  on_hold: "On hold",
  done: "Done",
}

const STATUS_COLOURS: Record<string, string> = {
  planning: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  on_hold: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Hardware: Cpu,
  Software: Code2,
  Coursework: GraduationCap,
  Personal: FolderKanban,
  Other: Wrench,
}

const emptyForm = {
  name: "",
  description: "",
  category: "Personal",
  status: "planning",
  repo_url: "",
  start_date: "",
  end_date: "",
}

export function ProjectForm({ initial, onSave, onCancel }: {
  initial?: typeof emptyForm
  onSave: (data: typeof emptyForm) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial ?? emptyForm)
  const set = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Two-Stage Audio Amplifier" autoFocus />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Description</label>
        <MarkdownEditor value={form.description} onChange={(v) => set("description", v)} rows={2} placeholder="What is it, what does it do..." />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Category</label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Status</label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Repo / report link</label>
        <Input value={form.repo_url} onChange={(e) => set("repo_url", e.target.value)} placeholder="https://github.com/..." />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Start date</label>
          <Input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">End date</label>
          <Input type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => { if (form.name.trim()) onSave(form) }} disabled={!form.name.trim()}>Save</Button>
      </div>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const Icon = CATEGORY_ICONS[project.category] ?? FolderKanban
  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="block border border-border rounded-xl p-4 bg-card hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium text-sm truncate">{project.name}</span>
        </div>
        {project.repo_url && <Github className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
      </div>
      {project.description && (
        <div className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          <MarkdownContent compact>{project.description}</MarkdownContent>
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap mt-3">
        <Badge className={`text-xs px-2 py-0 ${STATUS_COLOURS[project.status]}`}>{STATUS_LABELS[project.status]}</Badge>
        <span className="text-xs text-muted-foreground">{project.category}</span>
      </div>
    </Link>
  )
}

export default function ProjectsClient({ projects: initial }: { projects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initial)
  const [addOpen, setAddOpen] = useState(false)
  const [, startTransition] = useTransition()

  const total = projects.length
  const done = projects.filter((p) => p.status === "done").length

  const stats = useMemo(() => {
    const inProgress = projects.filter((p) => p.status === "in_progress").length
    const completion = total > 0 ? Math.round((done / total) * 100) : 0

    const byCategory = CATEGORIES
      .map((cat) => ({ name: cat, count: projects.filter((p) => p.category === cat).length }))
      .filter((d) => d.count > 0)

    const byStatus = STATUSES
      .map((s) => ({ name: STATUS_LABELS[s], value: projects.filter((p) => p.status === s).length }))
      .filter((d) => d.value > 0)

    return { inProgress, completion, byCategory, byStatus }
  }, [projects, total, done])

  function handleAdd(data: typeof emptyForm) {
    const prev = projects
    const optimistic: Project = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: data.name,
      description: data.description || null,
      category: data.category,
      status: data.status,
      repo_url: data.repo_url || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
    }
    setProjects((p) => [optimistic, ...p])
    setAddOpen(false)
    startTransition(async () => {
      const res = await createProject(data)
      if (!savedOk(res, "Could not save project")) setProjects(prev)
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" /> Projects
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{done} of {total} done</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New project</DialogTitle></DialogHeader>
            <ProjectForm onSave={handleAdd} onCancel={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {total > 0 && (
        <div className="flex flex-col gap-4 border-t border-border pt-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Project analytics</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total projects" value={total} />
            <StatCard label="Done" value={done} />
            <StatCard label="In progress" value={stats.inProgress} />
            <StatCard label="Completion" value={`${stats.completion}%`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.byCategory.length > 0 && (
              <div className="border border-border rounded-xl p-4">
                <p className="text-sm font-medium mb-3">By category</p>
                <BarChart data={stats.byCategory} dataKey="count" xKey="name" />
              </div>
            )}
            {stats.byStatus.length > 0 && (
              <div className="border border-border rounded-xl p-4">
                <p className="text-sm font-medium mb-3 text-center">By status</p>
                <PieChart data={stats.byStatus} colours={DEFAULT_CHART_COLOURS} height={180} />
              </div>
            )}
            <div className="border border-border rounded-xl p-4">
              <p className="text-sm font-medium mb-1 text-center">Overall completion</p>
              <Gauge value={stats.completion} height={160} />
            </div>
          </div>
        </div>
      )}

      {total === 0 ? (
        <p className="text-sm text-muted-foreground py-16 text-center border border-dashed border-border rounded-lg">
          No projects logged yet. Add a project above to start tracking it.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  )
}
