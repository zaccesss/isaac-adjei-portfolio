"use client"

import { useState, useTransition } from "react"
import { setConfig } from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Save, X } from "lucide-react"

type Pledge = { text: string; status: string }
type RoutineItem = { time: string; activity: string }

type UsData = {
  vision: string
  mission: string
  notes: string
  isaac_routine: RoutineItem[]
  pam_routine: RoutineItem[]
  pledges: Pledge[]
  things_to_remember: string[]
  things_she_dislikes: string[]
  rules: Pledge[]
  traditions: string[]
}

const STATUS_COLOURS: Record<string, string> = {
  yes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  no: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  maybe: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  tbd: "bg-muted text-muted-foreground",
}
const STATUS_OPTIONS = ["yes", "no", "maybe", "tbd"]

function EditableText({ value, onSave, multiline }: { value: string; onSave: (v: string) => void; multiline?: boolean }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  if (editing) {
    return (
      <div className="flex gap-2 items-start">
        {multiline
          ? <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} className="flex-1 text-sm" autoFocus />
          : <Input value={draft} onChange={(e) => setDraft(e.target.value)} className="flex-1 h-7 text-sm" autoFocus onKeyDown={(e) => { if (e.key === "Enter") { onSave(draft); setEditing(false) } }} />
        }
        <button type="button" onClick={() => { onSave(draft); setEditing(false) }} className="p-1 text-green-600"><Save className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => { setDraft(value); setEditing(false) }} className="p-1 text-muted-foreground"><X className="h-3.5 w-3.5" /></button>
      </div>
    )
  }
  return <p className="text-sm cursor-pointer hover:underline hover:decoration-dotted underline-offset-2" onClick={() => { setDraft(value); setEditing(true) }}>{value || <span className="text-muted-foreground italic">Click to add</span>}</p>
}

function EditableList({ items, onSave }: { items: string[]; onSave: (items: string[]) => void }) {
  const [list, setList] = useState<string[]>(items)
  const [newItem, setNewItem] = useState("")

  function update(i: number, v: string) { const n = [...list]; n[i] = v; setList(n); onSave(n) }
  function remove(i: number) { const n = list.filter((_, j) => j !== i); setList(n); onSave(n) }
  function add() { if (!newItem.trim()) return; const n = [...list, newItem.trim()]; setList(n); onSave(n); setNewItem("") }

  return (
    <div className="flex flex-col gap-2">
      {list.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-foreground/30 shrink-0 mt-1">-</span>
          <Input value={item} onChange={(e) => update(i, e.target.value)} className="flex-1 h-7 text-sm" />
          <button type="button" onClick={() => remove(i)} aria-label="Remove" className="p-1 text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add item" className="flex-1 h-7 text-sm"
          onKeyDown={(e) => { if (e.key === "Enter") add() }} />
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={add}><Plus className="h-3 w-3" /></Button>
      </div>
    </div>
  )
}

function EditablePledgeList({ items, onSave }: { items: Pledge[]; onSave: (items: Pledge[]) => void }) {
  const [list, setList] = useState<Pledge[]>(items)
  const [newText, setNewText] = useState("")

  function update(i: number, field: keyof Pledge, v: string) { const n = list.map((x, j) => j === i ? { ...x, [field]: v } : x); setList(n); onSave(n) }
  function remove(i: number) { const n = list.filter((_, j) => j !== i); setList(n); onSave(n) }
  function add() { if (!newText.trim()) return; const n = [...list, { text: newText.trim(), status: "yes" }]; setList(n); onSave(n); setNewText("") }

  return (
    <div className="flex flex-col gap-2">
      {list.map((item, i) => (
        <div key={i} className="flex gap-2 items-start border border-border rounded-lg p-3">
          <div className="flex-1 flex flex-col gap-1.5">
            <Input value={item.text} onChange={(e) => update(i, "text", e.target.value)} className="h-7 text-sm" />
            <div className="flex gap-1 flex-wrap">
              {STATUS_OPTIONS.map((s) => (
                <button key={s} type="button" onClick={() => update(i, "status", s)}
                  className={`px-2 py-0.5 rounded-full text-xs border capitalize transition-all ${item.status === s ? STATUS_COLOURS[s] + " border-transparent" : "border-border text-muted-foreground"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => remove(i)} aria-label="Remove" className="p-1 text-muted-foreground hover:text-destructive shrink-0 mt-1"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Add pledge or rule" className="flex-1 h-7 text-sm"
          onKeyDown={(e) => { if (e.key === "Enter") add() }} />
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={add}><Plus className="h-3 w-3" /></Button>
      </div>
    </div>
  )
}

function EditableRoutine({ items, onSave }: { items: RoutineItem[]; onSave: (items: RoutineItem[]) => void }) {
  const [list, setList] = useState<RoutineItem[]>(items)
  const [newTime, setNewTime] = useState("")
  const [newActivity, setNewActivity] = useState("")

  function update(i: number, field: keyof RoutineItem, v: string) { const n = list.map((x, j) => j === i ? { ...x, [field]: v } : x); setList(n); onSave(n) }
  function remove(i: number) { const n = list.filter((_, j) => j !== i); setList(n); onSave(n) }
  function add() {
    if (!newTime.trim() || !newActivity.trim()) return
    const n = [...list, { time: newTime.trim(), activity: newActivity.trim() }]
    setList(n); onSave(n); setNewTime(""); setNewActivity("")
  }

  return (
    <div className="flex flex-col gap-2">
      {list.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input value={item.time} onChange={(e) => update(i, "time", e.target.value)} className="w-20 h-7 text-xs" />
          <Input value={item.activity} onChange={(e) => update(i, "activity", e.target.value)} className="flex-1 h-7 text-sm" />
          <button type="button" onClick={() => remove(i)} aria-label="Remove" className="p-1 text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="h-3 w-3" /></button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="Time" className="w-20 h-7 text-xs" />
        <Input value={newActivity} onChange={(e) => setNewActivity(e.target.value)} placeholder="Activity" className="flex-1 h-7 text-sm"
          onKeyDown={(e) => { if (e.key === "Enter") add() }} />
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={add}><Plus className="h-3 w-3" /></Button>
      </div>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export default function UsClient({ data: initial }: { data: UsData }) {
  const [data, setData] = useState<UsData>(initial)
  const [, startTransition] = useTransition()

  function update<K extends keyof UsData>(key: K, value: UsData[K]) {
    const updated = { ...data, [key]: value }
    // I update local state first so edits feel instant without waiting for Supabase
    setData(updated)
    // I store the entire UsData object as a single config key rather than one row per field
    startTransition(() => setConfig("us_data", updated))
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Us</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Our relationship covenant - click any field to edit</p>
      </div>

      <SectionCard title="Our vision">
        <EditableText value={data.vision} onSave={(v) => update("vision", v)} multiline />
      </SectionCard>

      <SectionCard title="Our mission">
        <EditableText value={data.mission} onSave={(v) => update("mission", v)} multiline />
      </SectionCard>

      <SectionCard title="Notes">
        <EditableText value={data.notes} onSave={(v) => update("notes", v)} multiline />
      </SectionCard>

      <SectionCard title="Isaac's daily routine">
        <EditableRoutine items={data.isaac_routine} onSave={(v) => update("isaac_routine", v)} />
      </SectionCard>

      <SectionCard title="Pam's daily routine">
        <EditableRoutine items={data.pam_routine} onSave={(v) => update("pam_routine", v)} />
      </SectionCard>

      <SectionCard title="Things to remember about Pam">
        <EditableList items={data.things_to_remember} onSave={(v) => update("things_to_remember", v)} />
      </SectionCard>

      <SectionCard title="Things Pam doesn't like">
        <EditableList items={data.things_she_dislikes} onSave={(v) => update("things_she_dislikes", v)} />
      </SectionCard>

      <SectionCard title="Our pledges">
        <EditablePledgeList items={data.pledges} onSave={(v) => update("pledges", v)} />
      </SectionCard>

      <SectionCard title="Our rules">
        <EditablePledgeList items={data.rules} onSave={(v) => update("rules", v)} />
      </SectionCard>

      <SectionCard title="Our traditions">
        <EditableList items={data.traditions} onSave={(v) => update("traditions", v)} />
      </SectionCard>
    </div>
  )
}
