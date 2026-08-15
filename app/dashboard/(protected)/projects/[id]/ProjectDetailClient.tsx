"use client"
// Project detail: the project's own info plus a per-project Gantt chart auto-generated from its
// tasks (start/end dates), so a project with tasks logged gets a timeline for free - no separate
// Gantt-building step, just add tasks below and the chart draws itself.

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  createProjectTask, deleteProjectTask, deleteProject, updateProject,
  type Project, type ProjectTask,
} from "../../../actions"
import { savedOk } from "@/lib/save-result"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Github, Plus, Trash2, Edit2, GanttChartSquare } from "lucide-react"
import MarkdownContent from "@/components/shared/MarkdownContent"
import { Gantt, Burndown } from "@/components/analytics"
import { ProjectForm, STATUS_LABELS } from "../ProjectsClient"

const TASK_STATUSES = ["planned", "in_progress", "done", "blocked"]

const emptyTaskForm = { name: "", start_date: "", end_date: "", status: "planned" }

export default function ProjectDetailClient({ project: initial, tasks: initialTasks }: {
  project: Project
  tasks: ProjectTask[]
}) {
  const router = useRouter()
  const [project, setProject] = useState(initial)
  const [tasks, setTasks] = useState(initialTasks)
  const [editOpen, setEditOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [taskForm, setTaskForm] = useState(emptyTaskForm)
  const [, startTransition] = useTransition()

  function handleEdit(data: { name: string; description: string; category: string; status: string; repo_url: string; start_date: string; end_date: string }) {
    const prev = project
    setProject((p) => ({
      ...p,
      name: data.name,
      description: data.description || null,
      category: data.category,
      status: data.status,
      repo_url: data.repo_url || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
    }))
    setEditOpen(false)
    startTransition(async () => {
      const res = await updateProject(project.id, data)
      if (!savedOk(res, "Could not save project")) setProject(prev)
    })
  }

  function handleDeleteProject() {
    startTransition(async () => {
      const res = await deleteProject(project.id)
      if (!savedOk(res, "Could not delete project")) return
      router.push("/dashboard/projects")
    })
  }

  function handleAddTask() {
    if (!taskForm.name.trim() || !taskForm.start_date || !taskForm.end_date) return
    const prev = tasks
    const optimistic: ProjectTask = { id: crypto.randomUUID(), created_at: new Date().toISOString(), project_id: project.id, ...taskForm }
    setTasks((t) => [...t, optimistic].sort((a, b) => a.start_date.localeCompare(b.start_date)))
    setTaskOpen(false)
    setTaskForm(emptyTaskForm)
    startTransition(async () => {
      const res = await createProjectTask({ project_id: project.id, ...taskForm })
      if (!savedOk(res, "Could not save task")) setTasks(prev)
    })
  }

  function handleDeleteTask(id: string) {
    const prev = tasks
    setTasks((t) => t.filter((task) => task.id !== id))
    startTransition(async () => {
      const res = await deleteProjectTask(id, project.id)
      if (!savedOk(res, "Could not delete task")) setTasks(prev)
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <Link href="/dashboard/projects" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="h-3.5 w-3.5" /> All projects
      </Link>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="text-xl font-semibold">{project.name}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="text-xs px-2 py-0">{STATUS_LABELS[project.status]}</Badge>
            <span className="text-xs text-muted-foreground">{project.category}</span>
            {project.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-3 w-3" /> Repo / report
              </a>
            )}
          </div>
          {project.description && (
            <div className="text-sm text-muted-foreground max-w-2xl"><MarkdownContent compact>{project.description}</MarkdownContent></div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5"><Edit2 className="h-3.5 w-3.5" /> Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Edit project</DialogTitle></DialogHeader>
              <ProjectForm
                initial={{
                  name: project.name,
                  description: project.description ?? "",
                  category: project.category,
                  status: project.status,
                  repo_url: project.repo_url ?? "",
                  start_date: project.start_date ?? "",
                  end_date: project.end_date ?? "",
                }}
                onSave={handleEdit}
                onCancel={() => setEditOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={handleDeleteProject}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-xl p-4 bg-card flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GanttChartSquare className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Timeline</p>
          </div>
          <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Task <span className="text-destructive">*</span></label>
                  <Input value={taskForm.name} onChange={(e) => setTaskForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Breadboard prototype" autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Start date <span className="text-destructive">*</span></label>
                    <Input type="date" value={taskForm.start_date} onChange={(e) => setTaskForm((f) => ({ ...f, start_date: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">End date <span className="text-destructive">*</span></label>
                    <Input type="date" value={taskForm.end_date} onChange={(e) => setTaskForm((f) => ({ ...f, end_date: e.target.value }))} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={taskForm.status} onValueChange={(v) => setTaskForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="ghost" onClick={() => setTaskOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddTask} disabled={!taskForm.name.trim() || !taskForm.start_date || !taskForm.end_date}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Gantt tasks={tasks} />

        {tasks.length >= 2 && (
          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium mb-3">Burndown</p>
            <Burndown tasks={tasks} />
          </div>
        )}

        {tasks.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-border pt-3">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 text-sm py-1.5">
                <span className="flex-1 truncate">{t.name}</span>
                <span className="text-xs text-muted-foreground w-40">{t.start_date} to {t.end_date}</span>
                <Badge className="text-xs px-2 py-0 capitalize">{t.status.replace("_", " ")}</Badge>
                <button type="button" onClick={() => handleDeleteTask(t.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
