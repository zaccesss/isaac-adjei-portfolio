"use client"
// I show the detail view for a single inventory item with editable fields and a warranty warning.
// I live at /dashboard/inventory/[category]/[id] so each item has a bookmarkable URL.

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Edit2, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { deleteInventoryItem, updateInventoryItem } from "@/app/dashboard/actions"
import { Input } from "@/components/ui/input"
import MarkdownContent from "@/components/shared/MarkdownContent"
import MarkdownEditor from "@/components/shared/MarkdownEditor"

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

type SpecRow = { key: string; value: string }

// I try to parse the description as a key-value spec table (one "Key: Value" pair per line).
// I require at least half the lines to be valid pairs before switching to the table layout -
// this prevents normal prose descriptions from being incorrectly rendered as specs.
function parseSpecs(description: string): SpecRow[] | null {
  const lines = description.trim().split("\n").filter(Boolean)
  if (lines.length < 2) return null
  const pairs = lines.map((l) => {
    const idx = l.indexOf(":")
    if (idx === -1) return null
    return { key: l.slice(0, idx).trim(), value: l.slice(idx + 1).trim() }
  })
  if (pairs.filter(Boolean).length < lines.length / 2) return null
  return pairs.filter(Boolean) as SpecRow[]
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
  url: string
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
    url: item.url ?? "",
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
      url: form.url || null,
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
          <Input
            value={form.url}
            onChange={(e) => set("url", e.target.value)}
            placeholder="Product URL (optional)"
            type="url"
          />
          <MarkdownEditor
            value={form.notes}
            onChange={(v) => set("notes", v)}
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

  const warrantyExpiring = item.warranty_expiry ? isWithin90Days(item.warranty_expiry) : false

  const detailFields: { label: string; value: React.ReactNode }[] = [
    ...(item.quantity > 1 ? [{ label: "Quantity", value: String(item.quantity) }] : []),
    ...(item.price_paid ? [{ label: "Price paid", value: item.price_paid }] : []),
    ...(item.purchase_date ? [{ label: "Purchased", value: formatMonthYear(item.purchase_date) }] : []),
    ...(item.warranty_expiry ? [{
      label: "Warranty",
      value: <span className={warrantyExpiring ? "text-amber-500 font-medium" : undefined}>{formatMonthYear(item.warranty_expiry)}{warrantyExpiring ? ": expiring soon" : ""}</span>
    }] : []),
    ...(item.serial_number ? [{ label: "Serial / model", value: <span className="font-mono text-xs">{item.serial_number}</span> }] : []),
  ]

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Nav */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/dashboard/inventory/${category}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {categoryName}
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditOpen(true)}>
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="destructive" size="sm" className="gap-1" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Title block */}
      <div className="border border-border rounded-xl p-5 bg-card flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold leading-tight">{item.name}</h1>
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-2.5 py-1.5 transition-colors">
              <ExternalLink className="h-3 w-3" /> Product page
            </a>
          )}
        </div>
        <span className="inline-flex w-fit text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
          {item.category}
        </span>
        {item.description && (() => {
          const specs = parseSpecs(item.description)
          return specs ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm border-t border-border/50 pt-3 mt-1">
              {specs.map(({ key, value }) => (
                <>
                  <dt key={`dt-${key}`} className="text-muted-foreground/70 whitespace-nowrap">{key}</dt>
                  <dd key={`dd-${key}`} className="text-muted-foreground">{value}</dd>
                </>
              ))}
            </dl>
          ) : (
            <div className="border-t border-border/50 pt-3 mt-1">
              <MarkdownContent>{item.description}</MarkdownContent>
            </div>
          )
        })()}
      </div>

      {/* Detail fields */}
      {detailFields.length > 0 && (
        <div className="border border-border rounded-xl p-5 bg-card">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Details</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
            {detailFields.map(({ label, value }) => (
              <>
                <dt key={`dt-${label}`} className="text-muted-foreground whitespace-nowrap">{label}</dt>
                <dd key={`dd-${label}`} className="text-foreground">{value}</dd>
              </>
            ))}
          </dl>
        </div>
      )}

      {/* Notes */}
      {item.notes && (
        <div className="border border-border rounded-xl p-5 bg-card">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
          <MarkdownContent>{item.notes}</MarkdownContent>
        </div>
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
