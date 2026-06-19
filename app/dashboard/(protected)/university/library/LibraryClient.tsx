"use client"

import { useState, useTransition } from "react"
import { createLibraryBook, returnLibraryBook, deleteLibraryBook } from "../../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Check, BookOpen } from "lucide-react"

type Module = { id: string; code: string; name: string }
type Book = {
  id: string; title: string; author: string | null; isbn: string | null
  borrowed_at: string; due_date: string; returned_at: string | null; notes: string | null
  uni_modules: { code: string; color: string } | null
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

export default function LibraryClient({ books, modules }: { books: Book[]; modules: Module[] }) {
  const [open, setOpen] = useState(false)
  const [showReturned, setShowReturned] = useState(false)
  const [isPending, startTransition] = useTransition()
  const today = new Date().toISOString().split("T")[0]
  const [form, setForm] = useState({ title: "", author: "", isbn: "", module_id: "", borrowed_at: today, due_date: "", notes: "" })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await createLibraryBook({ title: form.title, author: form.author || undefined, isbn: form.isbn || undefined, module_id: form.module_id || undefined, borrowed_at: form.borrowed_at, due_date: form.due_date, notes: form.notes || undefined })
      setOpen(false)
      setForm({ title: "", author: "", isbn: "", module_id: "", borrowed_at: today, due_date: "", notes: "" })
    })
  }

  const active = books.filter((b) => !b.returned_at)
  const returned = books.filter((b) => b.returned_at)
  const display = showReturned ? returned : active

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Books borrowed from the university library</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add book</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log borrowed book</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <Input placeholder="Book title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Author</label>
                  <Input placeholder="Author" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Module</label>
                  <Select value={form.module_id} onValueChange={(v) => setForm((f) => ({ ...f, module_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.code}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Borrowed</label>
                  <Input type="date" value={form.borrowed_at} onChange={(e) => setForm((f) => ({ ...f, borrowed_at: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Due date</label>
                  <Input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} required />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={isPending} className="flex-1">Add book</Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        {[["active", `On loan (${active.length})`], ["returned", `Returned (${returned.length})`]].map(([v, l]) => (
          <button key={v} onClick={() => setShowReturned(v === "returned")} className={`text-xs px-3 py-1 rounded-full border transition-colors ${(v === "returned") === showReturned ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>{l}</button>
        ))}
      </div>

      {display.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-muted-foreground text-sm">
          {showReturned ? "No returned books logged." : "No books currently on loan."}
        </div>
      ) : (
        <div className="space-y-2">
          {display.map((b) => {
            const days = daysUntil(b.due_date)
            const isOverdue = days < 0 && !b.returned_at
            return (
              <div key={b.id} className={`flex items-start gap-3 rounded-xl border bg-card px-4 py-3 group hover:border-primary/30 transition-colors ${isOverdue ? "border-red-500/30" : "border-border/60"}`}>
                <BookOpen className={`h-4 w-4 shrink-0 mt-0.5 ${isOverdue ? "text-red-500" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{b.title}</span>
                    {b.uni_modules && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{b.uni_modules.code}</span>}
                  </div>
                  {b.author && <p className="text-xs text-muted-foreground">{b.author}</p>}
                  <p className={`text-xs mt-0.5 ${isOverdue ? "text-red-500 font-medium" : days <= 7 ? "text-yellow-600" : "text-muted-foreground"}`}>
                    {b.returned_at ? `Returned ${new Date(b.returned_at).toLocaleDateString("en-GB")}` : isOverdue ? `${Math.abs(days)}d overdue` : `Due ${new Date(b.due_date).toLocaleDateString("en-GB")} (${days}d)`}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!b.returned_at && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => startTransition(() => returnLibraryBook(b.id))} disabled={isPending}>
                      <Check className="h-3 w-3" />Return
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity" onClick={() => startTransition(() => deleteLibraryBook(b.id))} disabled={isPending}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
