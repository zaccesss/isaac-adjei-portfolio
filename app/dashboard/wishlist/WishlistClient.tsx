"use client"

import { useState, useTransition } from "react"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Check } from "lucide-react"

type WishlistItem = {
  id: string
  name: string
  category: string
  status: string
  notes: string | null
  priority: string
}

const CATEGORIES = [
  "Stationery & Essentials",
  "Books & Learning",
  "Clothes & Style",
  "Shoes",
  "Health & Fitness",
  "Grooming & Skincare",
  "Perfumes & Scents",
  "Gaming & Tech",
  "Music & Instruments",
  "Productivity & Study",
  "Room & Lifestyle",
  "Mental Health & Growth",
  "Finance",
  "Lifestyle & Travel",
  "Other",
]

const STATUS_COLOURS: Record<string, string> = {
  wanted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  saving: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  got_it: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
}

const STATUS_LABELS: Record<string, string> = {
  wanted: "Wanted",
  saving: "Saving for",
  got_it: "Got it",
}

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

const emptyForm = { name: "", category: CATEGORIES[0], status: "wanted", priority: "medium", notes: "" }

function AddForm({ onClose, onSave }: { onClose: () => void; onSave: (data: typeof emptyForm) => void }) {
  const [form, setForm] = useState(emptyForm)
  const set = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Item name</label>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Nike Air Force 1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
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
          <label className="text-sm font-medium">Priority</label>
          <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Status</label>
        <Select value={form.status} onValueChange={(v) => set("status", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Notes</label>
        <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Brand, link, size, etc." />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { if (form.name.trim()) onSave(form) }} disabled={!form.name.trim()}>Add</Button>
      </div>
    </div>
  )
}

export default function WishlistClient({ items }: { items: WishlistItem[] }) {
  const [list, setList] = useState(items)
  const [open, setOpen] = useState(false)
  const [filterCat, setFilterCat] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [, startTransition] = useTransition()

  async function handleAdd(data: typeof emptyForm) {
    const { data: inserted } = await supabase.from("wishlist").insert(data).select().single()
    if (inserted) setList((l) => [...l, inserted].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)))
    setOpen(false)
  }

  async function handleToggle(item: WishlistItem) {
    const next = item.status === "got_it" ? "wanted" : "got_it"
    await supabase.from("wishlist").update({ status: next }).eq("id", item.id)
    setList((l) => l.map((i) => i.id === item.id ? { ...i, status: next } : i))
  }

  async function handleDelete(id: string) {
    await supabase.from("wishlist").delete().eq("id", id)
    setList((l) => l.filter((i) => i.id !== id))
  }

  const filtered = list.filter((i) => {
    if (filterCat !== "all" && i.category !== filterCat) return false
    if (filterStatus !== "all" && i.status !== filterStatus) return false
    return true
  })

  const grouped = CATEGORIES.reduce<Record<string, WishlistItem[]>>((acc, cat) => {
    const catItems = filtered.filter((i) => i.category === cat)
    if (catItems.length) acc[cat] = catItems
    return acc
  }, {})

  const otherItems = filtered.filter((i) => !CATEGORIES.includes(i.category))
  if (otherItems.length) grouped["Other"] = otherItems

  const got = list.filter((i) => i.status === "got_it").length

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Wishlist</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{got} of {list.length} obtained</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New wishlist item</DialogTitle></DialogHeader>
            <AddForm onClose={() => setOpen(false)} onSave={handleAdd} />
          </DialogContent>
        </Dialog>
      </div>

      {/* filters */}
      <div className="flex gap-2 flex-wrap">
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-sm text-muted-foreground">No items match your filters.</p>
      )}

      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat} className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat}</p>
          {catItems.map((item) => (
            <div
              key={item.id}
              className={`border border-border rounded-lg p-3 bg-card flex items-center gap-3 transition-opacity ${item.status === "got_it" ? "opacity-60" : ""}`}
            >
              <button
                onClick={() => handleToggle(item)}
                className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${item.status === "got_it" ? "bg-green-500 border-green-500" : "border-muted-foreground/40 hover:border-primary"}`}
              >
                {item.status === "got_it" && <Check className="h-3 w-3 text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm ${item.status === "got_it" ? "line-through text-muted-foreground" : "font-medium"}`}>{item.name}</span>
                  <Badge className={`text-xs px-1.5 py-0 ${STATUS_COLOURS[item.status]}`}>{STATUS_LABELS[item.status]}</Badge>
                  {item.priority === "high" && <Badge className="text-xs px-1.5 py-0 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">High</Badge>}
                </div>
                {item.notes && <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="shrink-0 p-1 rounded text-muted-foreground/40 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
