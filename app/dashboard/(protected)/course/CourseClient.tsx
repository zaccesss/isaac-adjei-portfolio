"use client"

import { useState, useTransition } from "react"
import { createCourseModule, updateCourseModule, deleteCourseModule } from "../../actions"
import { savedOk } from "@/lib/save-result"
import { setConfig } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Edit2, Save, X, ExternalLink } from "lucide-react"

type CourseModule = {
  id: string
  stage: string
  section: string | null
  code: string
  title: string
  credits: number | null
  level: number | null
  core_or_option: string
  condonable: boolean
  prerequisites: string | null
  order_index: number
}

type CourseConfig = {
  programme: string
  university: string
  accreditation: string
  duration: string
  grade_thresholds: Record<string, number>
  iet_rules: string[]
  term_dates_2025_26: Record<string, string>
}

const STAGES = [
  { key: "1", label: "Stage 1 - Year 1 (Level 4)" },
  { key: "2", label: "Stage 2 - Year 2 (Level 5)" },
  { key: "placement", label: "Placement Year (Optional)" },
  { key: "final", label: "Final Year - Stage F (Level 6)" },
]

function ModuleRow({ mod, onEdit, onDelete }: {
  mod: CourseModule
  onEdit: (m: CourseModule) => void
  onDelete: (id: string) => void
}) {
  return (
    <tr className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
      <td className="py-2.5 pr-3">
        <span className="font-mono text-xs font-medium">{mod.code}</span>
      </td>
      <td className="py-2.5 pr-3 text-sm">{mod.title}</td>
      <td className="py-2.5 pr-3 text-xs text-center">{mod.credits}</td>
      <td className="py-2.5 pr-3 text-xs text-center">
        <span className={`px-2 py-0.5 rounded-full text-xs ${mod.core_or_option === "Core" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : "bg-muted text-muted-foreground"}`}>
          {mod.core_or_option}
        </span>
      </td>
      <td className="py-2.5 pr-3 text-xs text-center">
        {mod.condonable ? (
          <span className="text-amber-600 dark:text-amber-400 font-medium">Y</span>
        ) : (
          <span className="text-muted-foreground">N</span>
        )}
      </td>
      <td className="py-2.5 text-xs text-muted-foreground">{mod.prerequisites ?? "-"}</td>
      <td className="py-2.5 pl-2">
        <div className="flex gap-1 justify-end">
          <button type="button" onClick={() => onEdit(mod)} aria-label="Edit" title="Edit" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Edit2 className="h-3 w-3" /></button>
          <button type="button" onClick={() => onDelete(mod.id)} aria-label="Delete" title="Delete" className="p-1 rounded hover:bg-muted text-destructive/60 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
        </div>
      </td>
    </tr>
  )
}

const emptyModForm = { stage: "1", section: "", code: "", title: "", credits: 15, level: 4, core_or_option: "Core", condonable: false, prerequisites: "", order_index: 0 }

function ModuleForm({ initial, onSave, onCancel }: {
  initial?: typeof emptyModForm
  onSave: (data: typeof emptyModForm) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial ?? emptyModForm)
  const set = (k: keyof typeof emptyModForm, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Stage</label>
          <select value={form.stage} onChange={(e) => set("stage", e.target.value)} className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
            {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Code</label>
          <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="e.g. EI2APE" autoFocus />
        </div>
      </div>
      <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Module title" />
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Credits</label>
          <Input type="number" value={form.credits} onChange={(e) => set("credits", Number(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Type</label>
          <select value={form.core_or_option} onChange={(e) => set("core_or_option", e.target.value)} className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
            <option>Core</option><option>Option</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer pt-5">
          <input type="checkbox" checked={form.condonable} onChange={(e) => set("condonable", e.target.checked)} />
          Condonable
        </label>
      </div>
      <Input value={form.prerequisites} onChange={(e) => set("prerequisites", e.target.value)} placeholder="Prerequisites (optional)" />
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => { if (form.code.trim() && form.title.trim()) onSave(form) }} disabled={!form.code.trim() || !form.title.trim()}>Save</Button>
      </div>
    </div>
  )
}

export default function CourseClient({ modules: initial, config: initialConfig }: {
  modules: CourseModule[]
  config: CourseConfig
}) {
  const [modules, setModules] = useState<CourseModule[]>(initial)
  const [config, setConfigState] = useState<CourseConfig>(initialConfig)
  const [addOpen, setAddOpen] = useState(false)
  const [editMod, setEditMod] = useState<CourseModule | null>(null)
  const [, startTransition] = useTransition()

  function handleAdd(data: typeof emptyModForm) {
    // I add the module to local state immediately so the table row appears without waiting for the DB
    const prev = modules
    const optimistic: CourseModule = { id: crypto.randomUUID(), ...data, section: data.section || null, prerequisites: data.prerequisites || null }
    setModules((m) => [...m, optimistic])
    setAddOpen(false)
    startTransition(async () => {
      const res = await createCourseModule({ ...data, section: data.section || null, prerequisites: data.prerequisites || null })
      if (!savedOk(res, "Could not add module")) setModules(prev)
    })
  }

  function handleEdit(data: typeof emptyModForm) {
    if (!editMod) return
    const prev = modules
    const editId = editMod.id
    setModules((m) => m.map((x) => x.id === editId ? { ...x, ...data } : x))
    setEditMod(null)
    startTransition(async () => {
      const res = await updateCourseModule(editId, data)
      if (!savedOk(res, "Could not update module")) setModules(prev)
    })
  }

  function handleDelete(id: string) {
    const prev = modules
    setModules((m) => m.filter((x) => x.id !== id))
    startTransition(async () => {
      const res = await deleteCourseModule(id)
      if (!savedOk(res, "Could not delete module")) setModules(prev)
    })
  }

  function updateConfigField<K extends keyof CourseConfig>(key: K, value: CourseConfig[K]) {
    const updated = { ...config, [key]: value }
    // I update local state first so the page reflects the change while the server round-trip is in flight
    setConfigState(updated)
    // I persist the entire config object as a single blob to avoid managing multiple config keys
    startTransition(async () => { savedOk(await setConfig("course_data", updated), "Could not save changes") })
  }

  const totalCredits = modules.reduce((s, m) => s + (m.credits ?? 0), 0)

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Course</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{config.programme}</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add module</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add module</DialogTitle></DialogHeader>
            <ModuleForm onSave={handleAdd} onCancel={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Programme info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "University", value: config.university },
          { label: "Accreditation", value: config.accreditation },
          { label: "Duration", value: config.duration },
          { label: "Total credits", value: `${totalCredits} credits` },
        ].map(({ label, value }) => (
          <div key={label} className="border border-border rounded-lg p-3 bg-card flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="font-medium text-sm">{value}</span>
          </div>
        ))}
      </div>

      {/* Grade thresholds */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Grade thresholds</p>
        <div className="flex gap-px h-8 rounded-lg overflow-hidden text-xs font-semibold">
          <div className="flex items-center justify-center bg-green-500 text-white flex-1">First ≥80%</div>
          <div className="flex items-center justify-center bg-blue-500 text-white flex-1">2:1 60-79%</div>
          <div className="flex items-center justify-center bg-amber-500 text-white flex-1">2:2 40-59%</div>
          <div className="flex items-center justify-center bg-red-500 text-white flex-1">Fail &lt;40%</div>
        </div>
      </div>

      {/* IET rules */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">IET accreditation rules</p>
        <div className="border border-border rounded-xl bg-card p-4">
          <ul className="flex flex-col gap-2">
            {config.iet_rules.map((rule, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-primary shrink-0 mt-0.5">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Term dates */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Term dates 2025/26</p>
        <div className="border border-border rounded-xl bg-card divide-y divide-border/50">
          {Object.entries(config.term_dates_2025_26).map(([term, dates]) => (
            <div key={term} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium">{term}</span>
              <span className="text-sm text-muted-foreground">{dates}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Module tables per stage */}
      {STAGES.map((stage) => {
        const stageMods = modules.filter((m) => m.stage === stage.key)
        if (stageMods.length === 0) return null
        const stageCredits = stageMods.reduce((s, m) => s + (m.credits ?? 0), 0)

        return (
          <div key={stage.key} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stage.label}</p>
              <span className="text-xs text-muted-foreground">{stageCredits} credits</span>
            </div>
            <div className="border border-border rounded-xl bg-card overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30 text-xs text-muted-foreground">
                    <th className="text-left px-4 py-2.5 font-normal">Code</th>
                    <th className="text-left px-3 py-2.5 font-normal">Title</th>
                    <th className="text-center px-3 py-2.5 font-normal">Credits</th>
                    <th className="text-center px-3 py-2.5 font-normal">Type</th>
                    <th className="text-center px-3 py-2.5 font-normal">Cond.</th>
                    <th className="text-left px-3 py-2.5 font-normal">Pre-req</th>
                    <th className="px-2 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {stageMods.map((m) => (
                    <ModuleRow key={m.id} mod={m} onEdit={(mod) => setEditMod(mod)} onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      <div className="border border-border rounded-xl p-4 bg-muted/20 flex flex-col gap-2">
        <a href="https://www.aston.ac.uk/study/courses/electronic-engineering-and-computer-science-beng/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline w-fit">
          <ExternalLink className="h-4 w-4" />View course page (Aston University)
        </a>
        <a href="/documents/eecs-programme-spec.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline w-fit">
          <ExternalLink className="h-4 w-4" />View programme specification (PDF)
        </a>
      </div>

      <Dialog open={!!editMod} onOpenChange={(o) => { if (!o) setEditMod(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit module</DialogTitle></DialogHeader>
          {editMod && (
            <ModuleForm
              initial={{ stage: editMod.stage, section: editMod.section ?? "", code: editMod.code, title: editMod.title, credits: editMod.credits ?? 15, level: editMod.level ?? 4, core_or_option: editMod.core_or_option, condonable: editMod.condonable, prerequisites: editMod.prerequisites ?? "", order_index: editMod.order_index }}
              onSave={handleEdit}
              onCancel={() => setEditMod(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
