"use client"

import { useState, useTransition, useMemo, Fragment } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/app/dashboard/actions"
import { savedOk } from "@/lib/save-result"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Edit2, Package, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import DashboardBreadcrumb from "@/app/dashboard/components/DashboardBreadcrumb"
import { dashboardPage } from "@/lib/animations"

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
  url: string | null
}

const emptyForm = {
  name: "", category: "", quantity: 1,
  description: "", purchase_date: "", price_paid: "",
  serial_number: "", notes: "", warranty_expiry: "", url: "",
}

type SpecRow = { key: string; value: string }

function parseSpecs(description: string): SpecRow[] | null {
  const lines = description.trim().split("\n").filter(Boolean)
  if (lines.length === 0) return null
  const pairs = lines.map((l) => {
    const idx = l.indexOf(":")
    if (idx === -1) return null
    return { key: l.slice(0, idx).trim(), value: l.slice(idx + 1).trim() }
  })
  if (pairs.filter(Boolean).length < lines.length / 2) return null
  return pairs.filter(Boolean) as SpecRow[]
}

function SpecsDisplay({ description, maxRows = 4 }: { description: string; maxRows?: number }) {
  const specs = parseSpecs(description)
  if (specs) {
    return (
      <div className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
        {specs.slice(0, maxRows).map(({ key, value }) => (
          <Fragment key={key}>
            <span className="text-muted-foreground/60 whitespace-nowrap">{key}</span>
            <span className="text-muted-foreground truncate">{value}</span>
          </Fragment>
        ))}
        {specs.length > maxRows && (
          <span className="text-muted-foreground/40 col-span-2 text-[10px]">+{specs.length - maxRows} more</span>
        )}
      </div>
    )
  }
  return <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{description}</p>
}

function ItemForm({ initial, category, allCategories, onSave, onCancel }: {
  initial?: typeof emptyForm
  category: string
  allCategories: string[]
  onSave: (data: typeof emptyForm) => void
  onCancel: () => void
}) {
  // I always pre-fill the category with the current page's category
  const [form, setForm] = useState(initial ?? { ...emptyForm, category })
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
            <select
              value={allCategories.includes(form.category) ? form.category : category}
              onChange={(e) => set("category", e.target.value)}
              className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
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
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Specs / description</label>
        <Textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          placeholder={"Product Type: Laptop\nCPU: Apple M5\nRAM: 24GB\nStorage: 512GB SSD"}
          className="font-mono text-xs leading-relaxed"
        />
        <p className="text-[10px] text-muted-foreground/50">One spec per line in Key: Value format for table display</p>
      </div>
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
      <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="Product URL (optional)" type="url" />
      <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="Notes (optional)" />
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => { if (form.name.trim()) onSave(form) }} disabled={!form.name.trim()}>Save</Button>
      </div>
    </div>
  )
}

function ItemCard({ item, categorySlug, onEdit, onDelete }: {
  item: Item
  categorySlug: string
  onEdit: (i: Item) => void
  onDelete: (id: string) => void
}) {
  return (
    <Link href={`/dashboard/inventory/${categorySlug}/${item.id}`} className="block group">
      <div className="border border-border rounded-xl p-5 bg-card flex flex-col gap-3 hover:shadow-md hover:border-border/80 transition-all">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-base leading-snug truncate">{item.name}</p>
            {item.description && <SpecsDisplay description={item.description} />}
          </div>
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                aria-label="Product page" title="Product page" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(item) }} aria-label="Edit" title="Edit"
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(item.id) }} aria-label="Delete" title="Delete"
              className="p-1.5 rounded-md hover:bg-muted text-destructive/60 hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Metadata chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          {item.quantity > 1 && (
            <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full">x{item.quantity}</span>
          )}
          {item.price_paid && (
            <span className="bg-muted text-foreground px-2 py-0.5 rounded-full font-medium">{item.price_paid}</span>
          )}
          {item.purchase_date && (
            <span className="text-muted-foreground">
              Bought {new Date(item.purchase_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
            </span>
          )}
          {item.warranty_expiry && (
            <span className="text-muted-foreground">
              Warranty {new Date(item.warranty_expiry).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
            </span>
          )}
        </div>

        {/* Serial number */}
        {item.serial_number && (
          <p className="font-mono text-xs text-muted-foreground/70 border-t border-border/40 pt-2.5">
            S/N {item.serial_number}
          </p>
        )}
      </div>
    </Link>
  )
}

export default function InventoryCategoryClient({
  items: initial,
  allCategories,
  category,
  categorySlug,
}: {
  items: Item[]
  allCategories: string[]
  category: string
  categorySlug: string
}) {
  const PAGE_SIZE = 50
  const [items, setItems] = useState<Item[]>(initial)
  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [page, setPage] = useState(0)
  const [, startTransition] = useTransition()

  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const pageItems = useMemo(
    () => items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [items, page]
  )

  // I include the current category in allCategories in case it is new and not yet in the list
  const categories = Array.from(new Set([category, ...allCategories])).sort()

  function handleAdd(data: typeof emptyForm) {
    const optimistic: Item = {
      id: crypto.randomUUID(),
      ...data,
      category: data.category || category,
      description: data.description || null,
      purchase_date: data.purchase_date || null,
      price_paid: data.price_paid || null,
      serial_number: data.serial_number || null,
      notes: data.notes || null,
      warranty_expiry: data.warranty_expiry || null,
      url: data.url || null,
    }
    const prevItems = items
    setItems((prev) => [...prev, optimistic])
    setAddOpen(false)
    setPage(0)
    startTransition(async () => {
      const res = await createInventoryItem({ ...data, category: data.category || category })
      if (!savedOk(res, "Could not add item")) setItems(prevItems)
    })
  }

  function handleEdit(data: typeof emptyForm) {
    if (!editItem) return
    const prev = items
    const editId = editItem.id
    setItems((p) => p.map((i) => i.id === editId ? { ...i, ...data } : i))
    setEditItem(null)
    startTransition(async () => {
      try {
        const res = await updateInventoryItem(editId, data)
        if (res && (res as { error?: string }).error) throw new Error((res as { error?: string }).error)
      } catch {
        setItems(prev)
        toast.error("Could not save item")
      }
    })
  }

  function handleDelete(id: string) {
    const prev = items
    setItems((p) => p.filter((i) => i.id !== id))
    startTransition(async () => {
      try {
        const res = await deleteInventoryItem(id)
        if (res && (res as { error?: string }).error) throw new Error((res as { error?: string }).error)
      } catch {
        setItems(prev)
        toast.error("Could not delete item")
      }
    })
  }

  return (
    <motion.div
      className="flex flex-col gap-6 max-w-6xl"
      variants={dashboardPage}
      initial="hidden"
      animate="visible"
    >
      <DashboardBreadcrumb
        crumbs={[
          { label: "Inventory", href: "/dashboard/inventory" },
          { label: category },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{category}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {items.length > PAGE_SIZE
              ? `${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, items.length)} of ${items.length} items`
              : `${items.length} item${items.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New item</DialogTitle></DialogHeader>
            <ItemForm
              initial={{ ...emptyForm, category }}
              category={category}
              allCategories={categories}
              onSave={handleAdd}
              onCancel={() => setAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium">No items yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add your first item above.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pageItems.map((item) => (
              <ItemCard key={item.id} item={item} categorySlug={categorySlug} onEdit={(i) => setEditItem(i)} onDelete={handleDelete} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={!!editItem} onOpenChange={(o) => { if (!o) setEditItem(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit item</DialogTitle></DialogHeader>
          {editItem && (
            <ItemForm
              initial={{
                name: editItem.name,
                category: editItem.category,
                quantity: editItem.quantity,
                description: editItem.description ?? "",
                purchase_date: editItem.purchase_date ?? "",
                price_paid: editItem.price_paid ?? "",
                serial_number: editItem.serial_number ?? "",
                notes: editItem.notes ?? "",
                warranty_expiry: editItem.warranty_expiry ?? "",
                url: editItem.url ?? "",
              }}
              category={category}
              allCategories={categories}
              onSave={handleEdit}
              onCancel={() => setEditItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
