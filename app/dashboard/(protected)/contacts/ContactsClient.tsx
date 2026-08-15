"use client"
// I let me manage professional and personal contacts: adding names, roles, how I met them,
// contact details and follow-up flags. I surface a follow-up queue for anyone I have not
// contacted in over 30 days so important relationships do not go cold.

import { useState, useRef, useMemo, useTransition } from "react"
import { Users, Plus, X, ExternalLink, Mail, Phone, Bell, BellOff, Pencil, Github, Trash2, BarChart3 } from "lucide-react"
import type { Contact } from "@/app/dashboard/actions"
import { createContact, updateContact, deleteContact, bulkDeleteContacts } from "@/app/dashboard/actions"
import { savedOk } from "@/lib/save-result"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { useBulkSelect } from "@/hooks/useBulkSelect"
import MarkdownContent from "@/components/shared/MarkdownContent"
import MarkdownEditor from "@/components/shared/MarkdownEditor"
import PhoneField from "@/components/shared/PhoneField"
import { StatCard, BarChart } from "@/components/analytics"
import { Pagination } from "@/components/shared/Pagination"

const CONTACTS_PAGE_SIZE = 24

const HOW_MET_OPTIONS = [
  "Career fair", "LinkedIn", "Coffee chat", "Referral",
  "Internship", "Lecture / event", "Online community", "Cold outreach", "Other",
]

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso + "T00:00:00").getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

// I append T00:00:00 when parsing the date string so the browser treats it as local midnight
// rather than UTC midnight, which would cause off-by-one errors on dates near midnight
function needsFollowUp(contact: Contact): boolean {
  if (!contact.last_contact) return false
  const days = (Date.now() - new Date(contact.last_contact + "T00:00:00").getTime()) / 86400000
  return days > 30
}

type FormState = {
  name: string; company: string; role: string; how_met: string
  email: string; phone: string; linkedin_url: string; github_url: string
  last_contact: string; notes: string
}

const EMPTY: FormState = {
  name: "", company: "", role: "", how_met: "",
  email: "", phone: "", linkedin_url: "", github_url: "",
  last_contact: "", notes: "",
}

function ContactForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<FormState>
  onSave: (data: FormState) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormState>({ ...EMPTY, ...initial })
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  return (
    <div className="border border-border rounded-lg p-4 bg-card space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          placeholder="Name *"
          value={form.name}
          onChange={set("name")}
          className="border border-border rounded px-3 py-1.5 text-sm bg-background"
        />
        <input
          placeholder="Company"
          value={form.company}
          onChange={set("company")}
          className="border border-border rounded px-3 py-1.5 text-sm bg-background"
        />
        <input
          placeholder="Role / title"
          value={form.role}
          onChange={set("role")}
          className="border border-border rounded px-3 py-1.5 text-sm bg-background"
        />
        <select
          value={form.how_met}
          onChange={set("how_met")}
          title="How we met"
          className="border border-border rounded px-3 py-1.5 text-sm bg-background text-muted-foreground"
        >
          <option value="">How we met</option>
          {HOW_MET_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={set("email")}
          className="border border-border rounded px-3 py-1.5 text-sm bg-background"
        />
        <PhoneField
          value={form.phone}
          onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
        />
        <input
          placeholder="LinkedIn URL"
          value={form.linkedin_url}
          onChange={set("linkedin_url")}
          className="border border-border rounded px-3 py-1.5 text-sm bg-background"
        />
        <input
          placeholder="GitHub URL"
          value={form.github_url}
          onChange={set("github_url")}
          className="border border-border rounded px-3 py-1.5 text-sm bg-background"
        />
        <div className="flex flex-col gap-0.5">
          <label htmlFor="contact-last-contact" className="text-xs text-muted-foreground">Last contact</label>
          <input
            id="contact-last-contact"
            type="date"
            value={form.last_contact}
            onChange={set("last_contact")}
            title="Last contact date"
            className="border border-border rounded px-3 py-1.5 text-sm bg-background"
          />
        </div>
      </div>
      <MarkdownEditor
        placeholder="Notes"
        value={form.notes}
        onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
        rows={2}
      />
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => { if (form.name.trim()) onSave(form) }}
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default function ContactsClient({ initial }: { initial: Contact[] }) {
  const [contacts, setContacts] = useState(initial)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "follow-up">("all")
  const [page, setPage] = useState(1)
  const [, startTransition] = useTransition()
  const { confirm: showConfirm, dialog: confirmDialogNode } = useConfirmDialog()

  // I guard against a double-click firing two creates (and inserting the contact
  // twice) before the form closes.
  const savingRef = useRef(false)

  async function handleCreate(form: FormState) {
    if (savingRef.current) return
    savingRef.current = true
    try {
      const result = await createContact({
        name: form.name,
        company: form.company || undefined,
        role: form.role || undefined,
        how_met: form.how_met || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        linkedin_url: form.linkedin_url || undefined,
        github_url: form.github_url || undefined,
        last_contact: form.last_contact || null,
        notes: form.notes || undefined,
      })
      if (!savedOk(result, "Could not add contact")) return
      setContacts((p) => [result as Contact, ...p])
      setAdding(false)
    } finally {
      savingRef.current = false
    }
  }

  async function handleUpdate(id: string, form: FormState) {
    const res = await updateContact(id, {
      name: form.name,
      company: form.company || undefined,
      role: form.role || undefined,
      how_met: form.how_met || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      linkedin_url: form.linkedin_url || undefined,
      github_url: form.github_url || undefined,
      last_contact: form.last_contact || null,
      notes: form.notes || undefined,
    })
    if (!savedOk(res, "Could not save contact")) return
    setContacts((p) =>
      p.map((c) =>
        c.id === id
          ? {
              ...c,
              name: form.name,
              company: form.company || null,
              role: form.role || null,
              how_met: form.how_met || null,
              email: form.email || null,
              phone: form.phone || null,
              linkedin_url: form.linkedin_url || null,
              github_url: form.github_url || null,
              last_contact: form.last_contact || null,
              notes: form.notes || null,
            }
          : c
      )
    )
    setEditingId(null)
  }

  async function handleToggleFollowUp(contact: Contact) {
    const next = !contact.follow_up
    const res = await updateContact(contact.id, { follow_up: next })
    if (!savedOk(res, "Could not update contact")) return
    setContacts((p) => p.map((c) => c.id === contact.id ? { ...c, follow_up: next } : c))
  }

  async function handleDelete(id: string, name: string) {
    const ok = await showConfirm({ title: `Delete "${name}"?`, description: "Contact will be moved to trash.", destructive: true })
    if (!ok) return
    const prev = contacts
    setContacts((p) => p.filter((c) => c.id !== id))
    startTransition(async () => {
      const res = await deleteContact(id)
      if (!savedOk(res, "Could not delete contact")) setContacts(prev)
    })
  }

  const followUpQueue = contacts.filter((c) => c.follow_up || needsFollowUp(c))
  const displayed = filter === "follow-up" ? followUpQueue : contacts

  const totalPages = Math.max(1, Math.ceil(displayed.length / CONTACTS_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = displayed.slice((safePage - 1) * CONTACTS_PAGE_SIZE, safePage * CONTACTS_PAGE_SIZE)

  const resetKey = `${filter}`
  const [prevResetKey, setPrevResetKey] = useState(resetKey)
  if (resetKey !== prevResetKey) { setPrevResetKey(resetKey); setPage(1) }

  // I compute the headline stats and a "how we met" breakdown once over the contacts I already hold.
  // "Contacted this month" counts anyone whose last_contact falls in the current calendar month.
  const analytics = useMemo(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    const contactedThisMonth = contacts.filter((c) => {
      if (!c.last_contact) return false
      const d = new Date(c.last_contact + "T00:00:00")
      return d.getMonth() === month && d.getFullYear() === year
    }).length

    // Count by how_met so the chart shows where my network comes from; skip blanks
    const counts = new Map<string, number>()
    contacts.forEach((c) => {
      if (!c.how_met) return
      counts.set(c.how_met, (counts.get(c.how_met) ?? 0) + 1)
    })
    const byHowMet = [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return { contactedThisMonth, byHowMet }
  }, [contacts])

  const { selected, toggle, toggleAll, remove: removeFromSelected, allSelected, someSelected } = useBulkSelect(displayed)

  async function handleBulkDelete() {
    const ids = [...selected]
    const ok = await showConfirm({
      title: `Delete ${ids.length} contact${ids.length === 1 ? "" : "s"}?`,
      description: "Selected contacts will be moved to trash.",
      destructive: true,
    })
    if (!ok) return
    const prev = contacts
    setContacts((p) => p.filter((c) => !selected.has(c.id)))
    startTransition(async () => {
      const res = await bulkDeleteContacts(ids)
      if (!savedOk(res, "Could not delete contacts")) setContacts(prev)
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold leading-tight">Contacts</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
              {followUpQueue.length > 0 && ` · ${followUpQueue.length} need follow-up`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {someSelected && (
            <button
              type="button"
              onClick={() => void handleBulkDelete()}
              title={`Delete ${selected.size} selected contact${selected.size === 1 ? "" : "s"}`}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete {selected.size}
            </button>
          )}
          <button
            type="button"
            onClick={() => setFilter(filter === "all" ? "follow-up" : "all")}
            className={`text-xs px-3 py-1.5 rounded border transition-colors ${
              filter === "follow-up"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter === "follow-up" ? "All" : "Follow-up queue"}
            {filter !== "follow-up" && followUpQueue.length > 0 && (
              <span className="ml-1.5 bg-destructive text-destructive-foreground rounded-full px-1.5 text-[10px]">
                {followUpQueue.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Add contact
          </button>
        </div>
      </div>

      {contacts.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Contact analytics</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label="Total contacts" value={contacts.length} />
            <StatCard label="Follow-ups pending" value={followUpQueue.length} />
            <StatCard label="Contacted this month" value={analytics.contactedThisMonth} />
          </div>

          {analytics.byHowMet.length > 0 && (
            <div className="border border-border rounded-xl p-4">
              <p className="text-sm font-medium mb-3">How we met</p>
              <BarChart data={analytics.byHowMet} dataKey="count" xKey="name" />
            </div>
          )}
        </div>
      )}

      {adding && (
        <ContactForm onSave={handleCreate} onCancel={() => setAdding(false)} />
      )}

      {displayed.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          {filter === "follow-up" ? "No contacts need follow-up right now." : "No contacts yet. Add someone you met!"}
        </div>
      ) : (
        <div className="space-y-2">
          {pageItems.map((contact) => (
            <div key={contact.id}>
              {editingId === contact.id ? (
                <ContactForm
                  initial={{
                    name: contact.name,
                    company: contact.company ?? "",
                    role: contact.role ?? "",
                    how_met: contact.how_met ?? "",
                    email: contact.email ?? "",
                    phone: contact.phone ?? "",
                    linkedin_url: contact.linkedin_url ?? "",
                    github_url: contact.github_url ?? "",
                    last_contact: contact.last_contact ?? "",
                    notes: contact.notes ?? "",
                  }}
                  onSave={(form) => handleUpdate(contact.id, form)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className={`border rounded-lg p-4 bg-card transition-colors ${
                  needsFollowUp(contact) || contact.follow_up ? "border-amber-400/40" : selected.has(contact.id) ? "border-primary/40 bg-primary/5" : "border-border"
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <input
                      type="checkbox"
                      checked={selected.has(contact.id)}
                      onChange={() => toggle(contact.id)}
                      title="Select contact"
                      className="mt-1 shrink-0 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{contact.name}</span>
                        {contact.company && (
                          <span className="text-xs text-muted-foreground">@ {contact.company}</span>
                        )}
                        {contact.role && (
                          <span className="text-xs text-muted-foreground">· {contact.role}</span>
                        )}
                        {contact.how_met && (
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{contact.how_met}</span>
                        )}
                      </div>

                      {/* Row 1: email | phone */}
                      {(contact.email || contact.phone) && (
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </a>
                          )}
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </a>
                          )}
                        </div>
                      )}

                      {/* Row 2: LinkedIn | GitHub */}
                      {(contact.linkedin_url || contact.github_url) && (
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {contact.linkedin_url && (
                            <a
                              href={contact.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              LinkedIn
                            </a>
                          )}
                          {contact.github_url && (
                            <a
                              href={contact.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Github className="h-3 w-3" />
                              GitHub
                            </a>
                          )}
                        </div>
                      )}

                      {contact.last_contact && (
                        <p className={`text-xs mt-0.5 ${needsFollowUp(contact) ? "text-amber-500" : "text-muted-foreground"}`}>
                          Last contact: {relativeDate(contact.last_contact)}
                        </p>
                      )}
                      {contact.notes && (
                        <div className="mt-1.5 line-clamp-3">
                          <MarkdownContent compact>{contact.notes}</MarkdownContent>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleFollowUp(contact)}
                        title={contact.follow_up ? "Remove follow-up flag" : "Flag for follow-up"}
                        className={`p-1.5 rounded hover:bg-muted transition-colors ${
                          contact.follow_up ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"
                        }`}
                      >
                        {contact.follow_up ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(contact.id)}
                        title="Edit"
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(contact.id, contact.name)}
                        title="Delete contact"
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} totalItems={displayed.length} pageSize={CONTACTS_PAGE_SIZE} itemLabel="contacts" className="pt-4" />
        </div>
      )}
      {confirmDialogNode}
    </div>
  )
}
