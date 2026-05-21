"use client"

import { useState, useTransition } from "react"
import { createWishlistItem, updateWishlistItem, deleteWishlistItem } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Edit2, ChevronLeft, Check } from "lucide-react"

type Item = {
  id: string
  name: string
  category: string
  status: string
  priority: string
  notes: string | null
}

const PRIORITIES = ["low", "medium", "high"]
const STATUSES = ["wanted", "saving", "got_it"]
const STATUS_LABELS: Record<string, string> = { wanted: "Wanted", saving: "Saving", got_it: "Got it" }

const PRIORITY_COLOURS: Record<string, string> = {
  low: "border-l-slate-300 dark:border-l-slate-600",
  medium: "border-l-amber-400",
  high: "border-l-red-500",
}

const emptyForm = { name: "", category: "", status: "wanted", priority: "medium", notes: "" }

function ItemForm({ initial, categories, onSave, onCancel }: {
  initial?: typeof emptyForm
  categories: string[]
  onSave: (data: typeof emptyForm) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial ?? emptyForm)
  const [customCat, setCustomCat] = useState(!categories.includes(initial?.category ?? "") && !!initial?.category)
  const set = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-3">
      <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Item name *" autoFocus />
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Category</label>
        {customCat ? (
          <div className="flex gap-2">
            <Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Category name" className="flex-1" />
            <Button type="button" variant="ghost" size="sm" onClick={() => setCustomCat(false)}>Presets</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Button type="button" variant="ghost" size="sm" onClick={() => setCustomCat(true)}>Custom</Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Priority</label>
          <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Status</label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="Notes (optional)" />
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => { if (form.name.trim() && form.category.trim()) onSave(form) }} disabled={!form.name.trim() || !form.category.trim()}>Save</Button>
      </div>
    </div>
  )
}

function ItemCard({ item, onEdit, onDelete, onToggleGotIt }: {
  item: Item
  onEdit: (i: Item) => void
  onDelete: (id: string) => void
  onToggleGotIt: (id: string, current: string) => void
}) {
  const gotIt = item.status === "got_it"
  return (
    <div className={`border border-border border-l-4 rounded-lg p-3 bg-card flex items-start gap-3 hover:shadow-sm transition-all ${PRIORITY_COLOURS[item.priority]} ${gotIt ? "opacity-60" : ""}`}>
      <button
        type="button"
        onClick={() => onToggleGotIt(item.id, item.status)}
        aria-label={gotIt ? "Mark as wanted" : "Mark as got it"}
        className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-all ${gotIt ? "bg-green-500 border-green-500 text-white" : "border-border hover:border-primary"}`}
      >
        {gotIt && <Check className="h-3 w-3" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${gotIt ? "line-through text-muted-foreground" : ""}`}>{item.name}</p>
        {item.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.notes}</p>}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-xs capitalize px-1.5 py-0.5 rounded ${item.priority === "high" ? "text-red-600 dark:text-red-400" : item.priority === "medium" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
            {item.priority} priority
          </span>
          {item.status === "saving" && <span className="text-xs text-blue-600 dark:text-blue-400">Saving for this</span>}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <button type="button" onClick={() => onEdit(item)} aria-label="Edit" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Edit2 className="h-3 w-3" /></button>
        <button type="button" onClick={() => onDelete(item.id)} aria-label="Delete" className="p-1 rounded hover:bg-muted text-destructive/60 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
      </div>
    </div>
  )
}

function CategorySection({ category, items, categories, onAdd, onEdit, onDelete, onToggleGotIt }: {
  category: string
  items: Item[]
  categories: string[]
  onAdd: (cat: string) => void
  onEdit: (i: Item) => void
  onDelete: (id: string) => void
  onToggleGotIt: (id: string, current: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const gotCount = items.filter((i) => i.status === "got_it").length
  const total = items.length

  if (expanded) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setExpanded(false)} aria-label="Back" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-semibold text-sm">{category}</h2>
          <span className="text-xs text-muted-foreground">{gotCount}/{total}</span>
          <button type="button" onClick={() => onAdd(category)} className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus className="h-3 w-3" />Add
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {items.map((i) => <ItemCard key={i.id} item={i} onEdit={onEdit} onDelete={onDelete} onToggleGotIt={onToggleGotIt} />)}
          {items.length === 0 && (
            <div className="border border-dashed border-border rounded-lg p-5 text-center">
              <button type="button" onClick={() => onAdd(category)} className="text-sm text-primary hover:underline">Add my first item</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const progress = total > 0 ? (gotCount / total) * 100 : 0
  return (
    <button type="button" onClick={() => setExpanded(true)} className="w-full text-left border border-border rounded-xl p-4 bg-card hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-sm">{category}</span>
        <span className="text-xs text-muted-foreground">{gotCount}/{total}</span>
      </div>
      {total > 0 && (
        <div className="mt-3 bg-muted rounded-full h-1.5 overflow-hidden">
          <div className="h-1.5 bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </button>
  )
}

export default function WishlistClient({ items: initial }: { items: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial)
  const [addOpen, setAddOpen] = useState(false)
  const [addCategory, setAddCategory] = useState("")
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [, startTransition] = useTransition()

  const categories = Array.from(new Set(items.map((i) => i.category)))
  const totalGot = items.filter((i) => i.status === "got_it").length

  function openAdd(cat: string) { setAddCategory(cat); setAddOpen(true) }

  function handleAdd(data: typeof emptyForm) {
    const optimistic: Item = { id: crypto.randomUUID(), ...data, category: addCategory || data.category, notes: data.notes || null }
    setItems((prev) => [...prev, optimistic])
    setAddOpen(false)
    startTransition(() => createWishlistItem({ ...data, category: addCategory || data.category }))
  }

  function handleEdit(data: typeof emptyForm) {
    if (!editItem) return
    setItems((prev) => prev.map((i) => i.id === editItem.id ? { ...i, ...data, notes: data.notes || null } : i))
    setEditItem(null)
    startTransition(() => updateWishlistItem(editItem.id, data))
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    startTransition(() => deleteWishlistItem(id))
  }

  function handleToggleGotIt(id: string, current: string) {
    const newStatus = current === "got_it" ? "wanted" : "got_it"
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: newStatus } : i))
    startTransition(() => updateWishlistItem(id, { status: newStatus }))
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Wishlist</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{totalGot} of {items.length} obtained</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1" onClick={() => setAddCategory("")}><Plus className="h-4 w-4" />Add item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New wishlist item</DialogTitle></DialogHeader>
            <ItemForm initial={{ ...emptyForm, category: addCategory }} categories={categories} onSave={handleAdd} onCancel={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <CategorySection
            key={cat}
            category={cat}
            items={items.filter((i) => i.category === cat)}
            categories={categories}
            onAdd={openAdd}
            onEdit={(i) => setEditItem(i)}
            onDelete={handleDelete}
            onToggleGotIt={handleToggleGotIt}
          />
        ))}
      </div>

      <Dialog open={!!editItem} onOpenChange={(o) => { if (!o) setEditItem(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit item</DialogTitle></DialogHeader>
          {editItem && (
            <ItemForm
              initial={{ name: editItem.name, category: editItem.category, status: editItem.status, priority: editItem.priority, notes: editItem.notes ?? "" }}
              categories={categories}
              onSave={handleEdit}
              onCancel={() => setEditItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
