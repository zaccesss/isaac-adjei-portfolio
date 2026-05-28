"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { deleteInventoryItem, updateInventoryItem } from "@/app/dashboard/actions"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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

// I convert a category slug back to a display-friendly title
function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// I format an ISO date string as "Month Year" (e.g. "March 2026")
function formatMonthYear(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  })
}

// I check whether a date falls within 90 days of today
function isWithin90Days(dateStr: string): boolean {
  const target = new Date(dateStr).getTime()
  const now = Date.now()
  const ninetyDays = 90 * 24 * 60 * 60 * 1000
  return target > now && target - now <= ninetyDays
}

type EditForm = {
  name: string
  category: string
  quantity: number
  description: string
  purchase_date: string
  price_paid: string
  serial_number: string
  notes: string
  warranty_expiry: string
}

function EditDialog({
  item,
  open,
  onClose,
  onSaved,
}: {
  item: Item
  open: boolean
  onClose: () => void
  onSaved: (updated: Item) => void
}) {
  const [form, setForm] = useState<EditForm>({
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    description: item.description ?? "",
    purchase_date: item.purchase_date ?? "",
    price_paid: item.price_paid ?? "",
    serial_number: item.serial_number ?? "",
    notes: item.notes ?? "",
    warranty_expiry: item.warranty_expiry ?? "",
  })
  const [, startTransition] = useTransition()

  const set = (k: keyof EditForm, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }))

  function handleSave() {
    if (!form.name.trim()) return
    onSaved({
      ...item,
      ...form,
      description: form.description || null,
      purchase_date: form.purchase_date || null,
      price_paid: form.price_paid || null,
      serial_number: form.serial_number || null,
      notes: form.notes || null,
      warranty_expiry: form.warranty_expiry || null,
    })
    startTransition(() => void updateInventoryItem(item.id, form))
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit item</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-1">
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Item name *"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Quantity</label>
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => set("quantity", Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Price paid</label>
              <Input
                value={form.price_paid}
                onChange={(e) => set("price_paid", e.target.value)}
                placeholder="e.g. £1,299"
              />
            </div>
          </div>
          <Input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Description (optional)"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Purchase date</label>
              <Input
                type="date"
                value={form.purchase_date}
                onChange={(e) => set("purchase_date", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Warranty expiry</label>
              <Input
                type="date"
                value={form.warranty_expiry}
                onChange={(e) => set("warranty_expiry", e.target.value)}
              />
            </div>
          </div>
          <Input
            value={form.serial_number}
            onChange={(e) => set("serial_number", e.target.value)}
            placeholder="Serial / model number (optional)"
          />
          <Textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            placeholder="Notes (optional)"
          />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function InventoryItemClient({
  item: initial,
  category,
}: {
  item: Item
  category: string
}) {
  const router = useRouter()
  const [item, setItem] = useState<Item>(initial)
  const [editOpen, setEditOpen] = useState(false)
  const [, startTransition] = useTransition()

  const categoryName = slugToTitle(category)

  function handleDelete() {
    startTransition(async () => {
      await deleteInventoryItem(item.id)
      router.push(`/dashboard/inventory/${category}`)
    })
  }

  const rows: { label: string; value: React.ReactNode }[] = []

  if (item.description) rows.push({ label: "Description", value: item.description })
  if (item.serial_number) rows.push({ label: "Serial", value: <span className="font-mono">{item.serial_number}</span> })
  if (item.quantity > 1) rows.push({ label: "Quantity", value: item.quantity })
  if (item.price_paid) rows.push({ label: "Price paid", value: item.price_paid })
  if (item.purchase_date)
    rows.push({ label: "Purchase date", value: formatMonthYear(item.purchase_date) })
  if (item.warranty_expiry) {
    const expiring = isWithin90Days(item.warranty_expiry)
    rows.push({
      label: "Warranty until",
      value: (
        <span className={expiring ? "text-red-500" : undefined}>
          {formatMonthYear(item.warranty_expiry)}
        </span>
      ),
    })
  }
  if (item.notes) rows.push({ label: "Notes", value: item.notes })

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/dashboard/inventory/${category}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {categoryName}
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setEditOpen(true)}
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="gap-1"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <hr className="border-border" />

      {/* Item name and category badge */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{item.name}</h1>
        <span className="inline-flex w-fit text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
          {item.category}
        </span>
      </div>

      {/* Detail rows */}
      {rows.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
          {rows.map(({ label, value }) => (
            <>
              <dt key={`dt-${label}`} className="text-muted-foreground font-medium whitespace-nowrap">
                {label}
              </dt>
              <dd key={`dd-${label}`} className="text-foreground">
                {value}
              </dd>
            </>
          ))}
        </dl>
      )}

      <EditDialog
        item={item}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={(updated) => setItem(updated)}
      />
    </div>
  )
}
