"use client"

import { useState, useTransition } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Copy, Eye, EyeOff, Trash2, ExternalLink, Check } from "lucide-react"

type VaultEntry = {
  id: string
  name: string
  username: string | null
  password: string
  url: string | null
  notes: string | null
}

const emptyForm = {
  name: "",
  username: "",
  password: "",
  url: "",
  notes: "",
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={copy}
      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      title="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function EntryRow({ entry, onDelete }: { entry: VaultEntry; onDelete: (id: string) => void }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="border border-border rounded-lg p-4 bg-card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="font-medium text-sm">{entry.name}</p>
          {entry.url && (
            <a
              href={entry.url.startsWith("http") ? entry.url : `https://${entry.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />{entry.url}
            </a>
          )}
        </div>
        <button
          onClick={() => onDelete(entry.id)}
          className="p-1.5 rounded hover:bg-muted text-destructive/60 hover:text-destructive transition-colors shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {entry.username && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-20 shrink-0">Username</span>
          <code className="text-xs bg-muted px-2 py-0.5 rounded flex-1 truncate">{entry.username}</code>
          <CopyButton value={entry.username} />
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-20 shrink-0">Password</span>
        <code className="text-xs bg-muted px-2 py-0.5 rounded flex-1 truncate">
          {showPassword ? entry.password : "•".repeat(Math.min(entry.password.length, 20))}
        </code>
        <button
          onClick={() => setShowPassword((s) => !s)}
          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title={showPassword ? "Hide" : "Show"}
        >
          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <CopyButton value={entry.password} />
      </div>

      {entry.notes && (
        <p className="text-xs text-muted-foreground border-t border-border/50 pt-2">{entry.notes}</p>
      )}
    </div>
  )
}

function AddForm({ onClose, onSave }: { onClose: () => void; onSave: (data: typeof emptyForm) => void }) {
  const [form, setForm] = useState(emptyForm)
  const [showPw, setShowPw] = useState(false)
  const set = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. GitHub, Vercel, Supabase" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Username / Email</label>
        <Input value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="Optional" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Password <span className="text-destructive">*</span></label>
        <div className="flex gap-2">
          <Input
            type={showPw ? "text" : "password"}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Enter password"
            className="flex-1"
          />
          <Button variant="ghost" size="icon" type="button" onClick={() => setShowPw((s) => !s)}>
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">URL</label>
        <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://..." />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Notes</label>
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="Optional notes" />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => { if (form.name.trim() && form.password.trim()) onSave(form) }}
          disabled={!form.name.trim() || !form.password.trim()}
        >
          Save
        </Button>
      </div>
    </div>
  )
}

export default function VaultClient({ entries }: { entries: VaultEntry[] }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [list, setList] = useState<VaultEntry[]>(entries)
  const [, startTransition] = useTransition()
  const router = useRouter()

  async function handleSave(data: typeof emptyForm) {
    const { data: inserted } = await supabase.from("vault").insert(data).select().single()
    if (inserted) setList((l) => [...l, inserted].sort((a, b) => a.name.localeCompare(b.name)))
    setOpen(false)
  }

  async function handleDelete(id: string) {
    await supabase.from("vault").delete().eq("id", id)
    setList((l) => l.filter((e) => e.id !== id))
  }

  const filtered = search
    ? list.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.username?.toLowerCase().includes(search.toLowerCase()))
    : list

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vault</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Private password store - only visible to you</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New entry</DialogTitle></DialogHeader>
            <AddForm onClose={() => setOpen(false)} onSave={handleSave} />
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Search by name or username..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9"
      />

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">{search ? "No matching entries." : "No entries yet. Add one above."}</p>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((entry) => (
          <EntryRow key={entry.id} entry={entry} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  )
}
