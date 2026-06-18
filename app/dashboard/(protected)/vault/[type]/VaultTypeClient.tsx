"use client"
// I show vault entries of a specific type (accounts, secure notes, API keys, cards or identities).
// I render each entry as a collapsible card with secret fields masked by default and a copy button
// that never forces the user to reveal a secret just to copy it.

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { createVaultEntry, updateVaultEntry, deleteVaultEntry, toggleVaultHidden, toggleVaultLocked } from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Copy, Eye, EyeOff, Trash2, ExternalLink, Check, Search, Edit2, Key, CreditCard, User, StickyNote, Globe, MoreVertical, Lock, Unlock } from "lucide-react"
import DashboardBreadcrumb from "@/app/dashboard/components/DashboardBreadcrumb"
import { dashboardPage } from "@/lib/animations"
import MarkdownContent from "@/components/shared/MarkdownContent"

// I keep the VaultEntry type faithful to the DB schema so TypeScript catches any field name drift
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

// I centralise type metadata so adding a new vault type only requires one change
const VAULT_TYPES = [
  { value: "account", label: "Account", icon: Globe },
  { value: "secure_note", label: "Secure Note", icon: StickyNote },
  { value: "api_key", label: "API Key", icon: Key },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "identity", label: "Identity", icon: User },
]

// I isolate copy logic into its own component so every copiable field gets
// the same checkmark flash without repeating the setTimeout in each render
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    // I reset after 1.5 seconds - long enough to notice but short enough to copy again quickly
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button type="button" onClick={copy} aria-label="Copy" className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

// I render secret fields with a toggle so passwords are hidden by default
// but I still give direct access to the CopyButton so users never need to reveal the value just to copy it
function SecretField({ label, value }: { label: string; value: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <code className="text-xs bg-muted px-2 py-0.5 rounded flex-1 truncate font-mono">
        {/* I cap the bullet repeat at 24 so very long passwords do not stretch the layout */}
        {show ? value : "•".repeat(Math.min(value.length, 24))}
      </code>
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide" : "Show"} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
      <CopyButton value={value} />
    </div>
  )
}

// I use a separate Field component for non-secret values so URLs get the external link treatment
// without SecretField needing to know about it
function Field({ label, value, url }: { label: string; value: string; url?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      {url ? (
        // I prepend https:// when the stored URL lacks a scheme so the link is always absolute
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

function EntryCard({ entry, onEdit, onDelete, onToggle }: {
  entry: VaultEntry
  onEdit: (e: VaultEntry) => void
  onDelete: (id: string) => void
  onToggle: (id: string, field: "hidden" | "locked", value: boolean) => void
}) {
  // I keep expand/collapse state local so each card is independent -
  // opening one does not collapse the others
  const [open, setOpen] = useState(false)
  const typeInfo = VAULT_TYPES.find((t) => t.value === entry.type)
  // I fall back to Globe if the type is unknown (e.g. imported from an older schema version)
  const Icon = typeInfo?.icon ?? Globe
  // I use Google's favicon service as a quick way to show brand icons without self-hosting them
  // - I only attempt this when there is a URL, and onError hides the img if it fails to load
  const favicon = entry.url ? `https://www.google.com/s2/favicons?domain=${new URL(entry.url.startsWith("http") ? entry.url : `https://${entry.url}`).hostname}&sz=32` : null

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden hover:shadow-sm transition-shadow">
      {/* I make the whole header row a button so the click target is large */}
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
            {/* I show the most useful secondary identifier - username beats email beats key_name */}
            <p className="text-xs text-muted-foreground truncate">{entry.username ?? entry.email ?? entry.key_name ?? ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* I use e.stopPropagation() so clicking the dropdown does not also toggle the expand */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label="Entry options" onClick={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(entry) }}>
                <Edit2 className="h-3.5 w-3.5 mr-2" />Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggle(entry.id, "hidden", !(entry as VaultEntry & { hidden?: boolean }).hidden) }}>
                {(entry as VaultEntry & { hidden?: boolean }).hidden ? <><Eye className="h-3.5 w-3.5 mr-2" />Show</> : <><EyeOff className="h-3.5 w-3.5 mr-2" />Hide</>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggle(entry.id, "locked", !(entry as VaultEntry & { locked?: boolean }).locked) }}>
                {(entry as VaultEntry & { locked?: boolean }).locked ? <><Unlock className="h-3.5 w-3.5 mr-2" />Unlock</> : <><Lock className="h-3.5 w-3.5 mr-2" />Lock</>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }} className="text-destructive focus:text-destructive">
                <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </button>

      {open && (
        // I render the detail panel conditionally rather than hiding it with CSS
        // so secret field "show" state resets every time I close and reopen a card
        <div className="border-t border-border/50 p-4 flex flex-col gap-2">
          {entry.url && <Field label="URL" value={entry.url} url />}
          {entry.username && <Field label="Username" value={entry.username} />}
          {entry.email && <Field label="Email" value={entry.email} />}
          {/* I gate each field on truthiness so empty strings do not render blank rows */}
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
              <MarkdownContent compact>{entry.content}</MarkdownContent>
            </div>
          )}
          {entry.notes && <div className="border-t border-border/50 pt-2"><MarkdownContent compact>{entry.notes}</MarkdownContent></div>}
        </div>
      )}
    </div>
  )
}

function VaultForm({ initial, fixedType, onClose }: {
  initial?: Partial<VaultEntry>
  fixedType: string
  onClose: (saved: VaultEntry | null) => void
}) {
  // I lock the type to fixedType because this form is used within a type-specific sub-page
  const type = fixedType
  // I initialise every field from `initial` so the form doubles as an edit form with no extra logic
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
  // I use useTransition so the dialog can close optimistically while the server action runs in the background
  const [, startTransition] = useTransition()

  // I use a small helper to avoid repeating setForm spread logic for every input's onChange
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  function save() {
    if (!form.name.trim()) return
    const data = { ...form, type }
    if (initial?.id) {
      // I optimistically close with the updated entry so the list reflects the change immediately
      startTransition(() => void updateVaultEntry(initial.id!, data))
      onClose({ id: initial.id!, ...data, fields: {} } as VaultEntry)
    } else {
      // I await createVaultEntry so I get the DB-generated id back before calling onClose
      // - without it the new entry would render with a client-side uuid that mismatches the DB
      startTransition(async () => {
        const inserted = await createVaultEntry(data)
        onClose(inserted as VaultEntry)
      })
    }
  }

  return (
    // I cap the form height and scroll it so very long forms do not overflow the dialog viewport
    <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
      {/* I put name outside the type conditionals because every entry type needs a name */}
      <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Name *" autoFocus />

      {/* I conditionally render only the fields relevant to the fixed type */}
      {type === "account" && (
        <>
          <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="URL (optional)" />
          <Input value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="Username (optional)" />
          <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email (optional)" />
          <div className="flex gap-2">
            {/* I toggle input type between "password" and "text" so characters are masked by default */}
            <Input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Password" className="flex-1" />
            <Button type="button" variant="ghost" size="icon" onClick={() => setShowPass((s) => !s)}>{showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
          </div>
          <Input value={form.totp_secret} onChange={(e) => set("totp_secret", e.target.value)} placeholder="2FA secret (optional)" />
        </>
      )}

      {type === "secure_note" && (
        // I give the textarea 6 rows because secure notes tend to be multi-line
        <Textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={6} placeholder="Secure note content..." />
      )}

      {type === "api_key" && (
        <>
          <Input value={form.key_name} onChange={(e) => set("key_name", e.target.value)} placeholder="Key name (e.g. OpenAI API Key)" />
          <Input value={form.key_value} onChange={(e) => set("key_value", e.target.value)} placeholder="Key value" />
          {/* I use a date input for expiry so it is machine-parseable for future expiry-alert features */}
          <Input type="date" value={form.key_expiry} onChange={(e) => set("key_expiry", e.target.value)} />
          <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="Service URL (optional)" />
        </>
      )}

      {type === "card" && (
        <>
          <Input value={form.card_holder} onChange={(e) => set("card_holder", e.target.value)} placeholder="Cardholder name" />
          {/* I intentionally limit card_number to 4 digits - I only need the last 4 for identification,
              storing full PAN in a web app would be reckless even with RLS enabled */}
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

      {/* I always show notes at the bottom as a catch-all for any extra context */}
      <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="Notes (optional)" />

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={() => onClose(null)}>Cancel</Button>
        <Button onClick={save} disabled={!form.name.trim()}>Save</Button>
      </div>
    </div>
  )
}

export default function VaultTypeClient({
  entries: initial,
  type,
  typeSlug,
  typeLabel,
}: {
  entries: VaultEntry[]
  type: string
  typeSlug: string
  typeLabel: string
}) {
  const [entries, setEntries] = useState<VaultEntry[]>(initial)
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  // I keep editEntry as a state var rather than a boolean so the form can receive the entry to pre-populate
  const [editEntry, setEditEntry] = useState<VaultEntry | null>(null)

  const filtered = entries
    .filter((e) => {
      if (!search) return true
      const q = search.toLowerCase()
      // I also search username and email so I can find entries without knowing their display name
      return (
        e.name.toLowerCase().includes(q) ||
        (e.username ?? "").toLowerCase().includes(q) ||
        (e.email ?? "").toLowerCase().includes(q)
      )
    })
    // I sort alphabetically so I can scan the list quickly without remembering insertion order
    .sort((a, b) => a.name.localeCompare(b.name))

  function handleSaved(saved: VaultEntry | null) {
    // I treat null as "cancel" - close the dialog and do nothing to the list
    if (!saved) { setAddOpen(false); setEditEntry(null); return }
    if (editEntry) {
      // I replace the edited entry in-place so the list does not flicker or reorder
      setEntries((prev) => prev.map((e) => e.id === saved.id ? saved : e))
    } else {
      // I insert then re-sort so the new entry lands in its correct alphabetical position
      setEntries((prev) => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)))
    }
    setAddOpen(false)
    setEditEntry(null)
  }

  function handleDelete(id: string) {
    // I remove locally first so the card disappears immediately - the server call runs after
    setEntries((prev) => prev.filter((e) => e.id !== id))
    deleteVaultEntry(id)
  }

  function handleToggle(id: string, field: "hidden" | "locked", value: boolean) {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, [field]: value } as VaultEntry : e))
    if (field === "hidden") toggleVaultHidden(id, value)
    else toggleVaultLocked(id, value)
  }

  return (
    <motion.div
      className="flex flex-col gap-5 max-w-2xl"
      variants={dashboardPage}
      initial="hidden"
      animate="visible"
    >
      <DashboardBreadcrumb
        crumbs={[
          { label: "Vault", href: "/dashboard/vault" },
          { label: typeLabel },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{typeLabel}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New {typeLabel.toLowerCase().replace(/s$/, "")} entry</DialogTitle></DialogHeader>
            <VaultForm fixedType={type} onClose={handleSaved} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or username..." className="pl-8 h-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-2xl mb-2">🔐</p>
          <p className="text-sm font-medium">No {typeLabel.toLowerCase()} yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "No entries match your search." : "Add your first entry above."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((e) => (
            <EntryCard key={e.id} entry={e} onEdit={(entry) => setEditEntry(entry)} onDelete={handleDelete} onToggle={handleToggle} />
          ))}
        </div>
      )}

      {/* I use a separate Dialog for editing so the add and edit dialogs are never open simultaneously */}
      <Dialog open={!!editEntry} onOpenChange={(o) => { if (!o) setEditEntry(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit entry</DialogTitle></DialogHeader>
          {/* I only render VaultForm when editEntry is set so its state always initialises from the current entry */}
          {editEntry && <VaultForm fixedType={type} initial={editEntry} onClose={handleSaved} />}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
