"use client"

import { useState, useTransition } from "react"
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Edit2, ChevronLeft, Package, Cpu, Dumbbell, Gamepad2, Music, Tag } from "lucide-react"

type Item = {
  id: string
  name: string
  category: string
  quantity: number
  description: string | null
  purchase_date: string | null
  price_paid: string | null
  serial_number: string | null
  notes: string | null
  warranty_expiry: string | null
}

const DEFAULT_CATEGORIES = [
  "Tech and Devices",
  "Engineering and Components",
  "Health and Fitness Equipment",
  "Gaming",
  "Music and Instruments",
  "Other",
]

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Tech and Devices": Cpu,
  "Engineering and Components": Cpu,
  "Health and Fitness Equipment": Dumbbell,
  "Gaming": Gamepad2,
  "Music and Instruments": Music,
  "Other": Package,
}

const emptyForm = {
  name: "", category: "Tech and Devices", quantity: 1,
  description: "", purchase_date: "", price_paid: "",
  serial_number: "", notes: "", warranty_expiry: "",
}

function ItemForm({ initial, onSave, onCancel }: {
  initial?: typeof emptyForm
  onSave: (data: typeof emptyForm) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial ?? emptyForm)
  const [customCat, setCustomCat] = useState(false)
  const set = (k: keyof typeof emptyForm, v: string | number) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-1">
      <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Item name *" autoFocus />
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Category</label>
        {customCat ? (
          <div className="flex gap-2">
            <Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Custom category" className="flex-1" />
            <Button type="button" variant="ghost" size="sm" onClick={() => setCustomCat(false)}>Presets</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <select value={DEFAULT_CATEGORIES.includes(form.category) ? form.category : "Other"} onChange={(e) => set("category", e.target.value)} className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
              {DEFAULT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <Button type="button" variant="ghost" size="sm" onClick={() => setCustomCat(true)}>Custom</Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Quantity</label>
          <Input type="number" min={1} value={form.quantity} onChange={(e) => set("quantity", Number(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Price paid</label>
          <Input value={form.price_paid} onChange={(e) => set("price_paid", e.target.value)} placeholder="e.g. £1,299" />
        </div>
      </div>
      <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Description (optional)" />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Purchase date</label>
          <Input type="date" value={form.purchase_date} onChange={(e) => set("purchase_date", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Warranty expiry</label>
          <Input type="date" value={form.warranty_expiry} onChange={(e) => set("warranty_expiry", e.target.value)} />
        </div>
      </div>
      <Input value={form.serial_number} onChange={(e) => set("serial_number", e.target.value)} placeholder="Serial / model number (optional)" />
      <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="Notes (optional)" />
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => { if (form.name.trim()) onSave(form) }} disabled={!form.name.trim()}>Save</Button>
      </div>
    </div>
  )
}

function ItemCard({ item, onEdit, onDelete }: {
  item: Item
  onEdit: (i: Item) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="border border-border rounded-lg p-4 bg-card flex flex-col gap-2 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{item.name}</p>
          {item.description && <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>}
        </div>
        <div className="flex gap-1 shrink-0">
          <button type="button" onClick={() => onEdit(item)} aria-label="Edit" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Edit2 className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => onDelete(item.id)} aria-label="Delete" className="p-1 rounded hover:bg-muted text-destructive/60 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {item.quantity > 1 && <span className="bg-muted px-2 py-0.5 rounded-full">x{item.quantity}</span>}
        {item.price_paid && <span>{item.price_paid}</span>}
        {item.warranty_expiry && <span>Warranty: {new Date(item.warranty_expiry).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>}
        {item.serial_number && <span className="font-mono">{item.serial_number}</span>}
      </div>
      {item.notes && <p className="text-xs text-muted-foreground border-t border-border/50 pt-1">{item.notes}</p>}
    </div>
  )
}

function CategorySection({ category, items, onAdd, onEdit, onDelete }: {
  category: string
  items: Item[]
  onAdd: (cat: string) => void
  onEdit: (i: Item) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const Icon = CATEGORY_ICONS[category] ?? Package

  if (expanded) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setExpanded(false)} aria-label="Back" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">{category}</h2>
          <span className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</span>
          <button type="button" onClick={() => onAdd(category)} className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus className="h-3 w-3" />Add
          </button>
        </div>
        {items.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">No items in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((i) => <ItemCard key={i.id} item={i} onEdit={onEdit} onDelete={onDelete} />)}
          </div>
        )}
      </div>
    )
  }

  return (
    <button type="button" onClick={() => setExpanded(true)} className="w-full text-left border border-border rounded-xl p-4 bg-card hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-sm">{category}</span>
        </div>
        <span className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</span>
      </div>
    </button>
  )
}

export default function InventoryClient({ items: initial }: { items: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial)
  const [addOpen, setAddOpen] = useState(false)
  const [addCategory, setAddCategory] = useState("Tech and Devices")
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [, startTransition] = useTransition()

  const categories = Array.from(new Set([...DEFAULT_CATEGORIES, ...items.map((i) => i.category)]))

  function openAdd(cat: string) {
    setAddCategory(cat)
    setAddOpen(true)
  }

  function handleAdd(data: typeof emptyForm) {
    const optimistic: Item = {
      id: crypto.randomUUID(), ...data, category: addCategory,
      description: data.description || null, purchase_date: data.purchase_date || null,
      price_paid: data.price_paid || null, serial_number: data.serial_number || null,
      notes: data.notes || null, warranty_expiry: data.warranty_expiry || null,
    }
    setItems((prev) => [...prev, optimistic])
    setAddOpen(false)
    startTransition(() => createInventoryItem({ ...data, category: addCategory }))
  }

  function handleEdit(data: typeof emptyForm) {
    if (!editItem) return
    setItems((prev) => prev.map((i) => i.id === editItem.id ? { ...i, ...data } : i))
    setEditItem(null)
    startTransition(() => updateInventoryItem(editItem.id, data))
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    startTransition(() => deleteInventoryItem(id))
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Inventory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""} across {categories.filter((c) => items.some((i) => i.category === c)).length} categories</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1" onClick={() => setAddCategory("Tech and Devices")}>
              <Plus className="h-4 w-4" />Add item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New item</DialogTitle></DialogHeader>
            <ItemForm initial={{ ...emptyForm, category: addCategory }} onSave={handleAdd} onCancel={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3">
        {categories.map((cat) => (
          <CategorySection
            key={cat}
            category={cat}
            items={items.filter((i) => i.category === cat)}
            onAdd={openAdd}
            onEdit={(i) => setEditItem(i)}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <Dialog open={!!editItem} onOpenChange={(o) => { if (!o) setEditItem(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit item</DialogTitle></DialogHeader>
          {editItem && (
            <ItemForm
              initial={{ name: editItem.name, category: editItem.category, quantity: editItem.quantity, description: editItem.description ?? "", purchase_date: editItem.purchase_date ?? "", price_paid: editItem.price_paid ?? "", serial_number: editItem.serial_number ?? "", notes: editItem.notes ?? "", warranty_expiry: editItem.warranty_expiry ?? "" }}
              onSave={handleEdit}
              onCancel={() => setEditItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
