"use client"

import { useState, useTransition } from "react"
import { createVaultEntry, updateVaultEntry, deleteVaultEntry } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Copy, Eye, EyeOff, Trash2, ExternalLink, Check, Search, Edit2, Key, CreditCard, User, StickyNote, Globe } from "lucide-react"

type VaultEntry = {
  id: string
  name: string
  type: string
  username: string | null
  email: string | null
  password: string | null
  url: string | null
  totp_secret: string | null
  card_number: string | null
  card_holder: string | null
  card_expiry: string | null
  phone: string | null
  address: string | null
  key_name: string | null
  key_value: string | null
  key_expiry: string | null
  content: string | null
  notes: string | null
  fields: Record<string, unknown>
}

const VAULT_TYPES = [
  { value: "account", label: "Account", icon: Globe },
  { value: "secure_note", label: "Secure Note", icon: StickyNote },
  { value: "api_key", label: "API Key", icon: Key },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "identity", label: "Identity", icon: User },
]

const TYPE_COLOURS: Record<string, string> = {
  account: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  secure_note: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  api_key: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  card: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  identity: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button type="button" onClick={copy} aria-label="Copy" className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function SecretField({ label, value }: { label: string; value: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <code className="text-xs bg-muted px-2 py-0.5 rounded flex-1 truncate font-mono">
        {show ? value : "•".repeat(Math.min(value.length, 24))}
      </code>
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide" : "Show"} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
      <CopyButton value={value} />
    </div>
  )
}

function Field({ label, value, url }: { label: string; value: string; url?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      {url ? (
        <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1 flex-1 truncate">
          <ExternalLink className="h-3 w-3 shrink-0" />{value}
        </a>
      ) : (
        <span className="text-xs flex-1 truncate">{value}</span>
      )}
      <CopyButton value={value} />
    </div>
  )
}

function EntryCard({ entry, onEdit, onDelete }: {
  entry: VaultEntry
  onEdit: (e: VaultEntry) => void
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const typeInfo = VAULT_TYPES.find((t) => t.value === entry.type)
  const Icon = typeInfo?.icon ?? Globe
  const favicon = entry.url ? `https://www.google.com/s2/favicons?domain=${new URL(entry.url.startsWith("http") ? entry.url : `https://${entry.url}`).hostname}&sz=32` : null

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden hover:shadow-sm transition-shadow">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          {favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={favicon} alt="" width={16} height={16} className="rounded-sm shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
          ) : (
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{entry.name}</p>
            <p className="text-xs text-muted-foreground truncate">{entry.username ?? entry.email ?? entry.key_name ?? ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={`text-xs px-2 py-0 ${TYPE_COLOURS[entry.type] ?? "bg-muted"}`}>{typeInfo?.label ?? entry.type}</Badge>
          <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(entry) }} aria-label="Edit" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Edit2 className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }} aria-label="Delete" className="p-1 rounded hover:bg-muted text-destructive/60 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </button>

      {open && (
        <div className="border-t border-border/50 p-4 flex flex-col gap-2">
          {entry.url && <Field label="URL" value={entry.url} url />}
          {entry.username && <Field label="Username" value={entry.username} />}
          {entry.email && <Field label="Email" value={entry.email} />}
          {entry.password && <SecretField label="Password" value={entry.password} />}
          {entry.totp_secret && <SecretField label="2FA secret" value={entry.totp_secret} />}
          {entry.card_holder && <Field label="Cardholder" value={entry.card_holder} />}
          {entry.card_number && <SecretField label="Card number" value={entry.card_number} />}
          {entry.card_expiry && <Field label="Expiry" value={entry.card_expiry} />}
          {entry.phone && <Field label="Phone" value={entry.phone} />}
          {entry.address && <Field label="Address" value={entry.address} />}
          {entry.key_name && <Field label="Key name" value={entry.key_name} />}
          {entry.key_value && <SecretField label="Key value" value={entry.key_value} />}
          {entry.key_expiry && <Field label="Expires" value={entry.key_expiry} />}
          {entry.content && (
            <div className="flex flex-col gap-1 pt-1">
              <span className="text-xs text-muted-foreground">Content</span>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{entry.content}</p>
            </div>
          )}
          {entry.notes && <p className="text-xs text-muted-foreground border-t border-border/50 pt-2">{entry.notes}</p>}
        </div>
      )}
    </div>
  )
}

function VaultForm({ initial, onClose }: {
  initial?: Partial<VaultEntry>
  onClose: (saved: VaultEntry | null) => void
}) {
  const [type, setType] = useState(initial?.type ?? "account")
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    username: initial?.username ?? "",
    email: initial?.email ?? "",
    password: initial?.password ?? "",
    url: initial?.url ?? "",
    totp_secret: initial?.totp_secret ?? "",
    card_holder: initial?.card_holder ?? "",
    card_number: initial?.card_number ?? "",
    card_expiry: initial?.card_expiry ?? "",
    phone: initial?.phone ?? "",
    address: initial?.address ?? "",
    key_name: initial?.key_name ?? "",
    key_value: initial?.key_value ?? "",
    key_expiry: initial?.key_expiry ?? "",
    content: initial?.content ?? "",
    notes: initial?.notes ?? "",
  })
  const [showPass, setShowPass] = useState(false)
  const [, startTransition] = useTransition()

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  function save() {
    if (!form.name.trim()) return
    const data = { ...form, type }
    if (initial?.id) {
      startTransition(() => updateVaultEntry(initial.id!, data))
      onClose({ id: initial.id!, ...data, fields: {} } as VaultEntry)
    } else {
      startTransition(async () => {
        const inserted = await createVaultEntry(data)
        onClose(inserted as VaultEntry)
      })
    }
  }

  return (
    <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
      <div className="flex gap-2 flex-wrap">
        {VAULT_TYPES.map((t) => (
          <button key={t.value} type="button" onClick={() => setType(t.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${type === t.value ? "border-primary bg-primary/5 font-medium" : "border-border text-muted-foreground hover:border-primary/40"}`}>
            <t.icon className="h-3.5 w-3.5" />{t.label}
          </button>
        ))}
      </div>

      <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Name *" autoFocus />

      {(type === "account") && (
        <>
          <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="URL (optional)" />
          <Input value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="Username (optional)" />
          <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email (optional)" />
          <div className="flex gap-2">
            <Input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Password" className="flex-1" />
            <Button type="button" variant="ghost" size="icon" onClick={() => setShowPass((s) => !s)}>{showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
          </div>
          <Input value={form.totp_secret} onChange={(e) => set("totp_secret", e.target.value)} placeholder="2FA secret (optional)" />
        </>
      )}

      {type === "secure_note" && (
        <Textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={6} placeholder="Secure note content..." />
      )}

      {type === "api_key" && (
        <>
          <Input value={form.key_name} onChange={(e) => set("key_name", e.target.value)} placeholder="Key name (e.g. OpenAI API Key)" />
          <Input value={form.key_value} onChange={(e) => set("key_value", e.target.value)} placeholder="Key value" />
          <Input type="date" value={form.key_expiry} onChange={(e) => set("key_expiry", e.target.value)} />
          <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="Service URL (optional)" />
        </>
      )}

      {type === "card" && (
        <>
          <Input value={form.card_holder} onChange={(e) => set("card_holder", e.target.value)} placeholder="Cardholder name" />
          <Input value={form.card_number} onChange={(e) => set("card_number", e.target.value)} placeholder="Card number (last 4 digits)" maxLength={4} />
          <Input value={form.card_expiry} onChange={(e) => set("card_expiry", e.target.value)} placeholder="Expiry (MM/YY)" />
        </>
      )}

      {type === "identity" && (
        <>
          <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email" />
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone" />
          <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Address" />
        </>
      )}

      <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="Notes (optional)" />

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={() => onClose(null)}>Cancel</Button>
        <Button onClick={save} disabled={!form.name.trim()}>Save</Button>
      </div>
    </div>
  )
}

export default function VaultClient({ entries: initial }: { entries: VaultEntry[] }) {
  const [entries, setEntries] = useState<VaultEntry[]>(initial)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [addOpen, setAddOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<VaultEntry | null>(null)

  const filtered = entries.filter((e) => {
    if (typeFilter !== "all" && e.type !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return e.name.toLowerCase().includes(q) || (e.username ?? "").toLowerCase().includes(q) || (e.email ?? "").toLowerCase().includes(q)
    }
    return true
  }).sort((a, b) => a.name.localeCompare(b.name))

  function handleSaved(saved: VaultEntry | null) {
    if (!saved) { setAddOpen(false); setEditEntry(null); return }
    if (editEntry) {
      setEntries((prev) => prev.map((e) => e.id === saved.id ? saved : e))
    } else {
      setEntries((prev) => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)))
    }
    setAddOpen(false)
    setEditEntry(null)
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    deleteVaultEntry(id)
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vault</h1>
          <p className="text-xs text-muted-foreground mt-0.5">My passwords and secrets</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New vault entry</DialogTitle></DialogHeader>
            <VaultForm onClose={handleSaved} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or username..." className="pl-8 h-9" />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {[{ value: "all", label: "All" }, ...VAULT_TYPES].map((t) => (
          <button key={t.value} type="button" onClick={() => setTypeFilter(t.value)}
            className={`px-3 py-1 rounded-full text-xs border transition-all ${typeFilter === t.value ? "bg-primary text-primary-foreground border-transparent" : "border-border text-muted-foreground hover:border-primary/40"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-2xl mb-2">🔐</p>
          <p className="text-sm font-medium">My vault is empty</p>
          <p className="text-xs text-muted-foreground mt-1">Store accounts, API keys, secure notes and more.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((e) => (
            <EntryCard key={e.id} entry={e} onEdit={(entry) => setEditEntry(entry)} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Dialog open={!!editEntry} onOpenChange={(o) => { if (!o) setEditEntry(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit vault entry</DialogTitle></DialogHeader>
          {editEntry && <VaultForm initial={editEntry} onClose={handleSaved} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
