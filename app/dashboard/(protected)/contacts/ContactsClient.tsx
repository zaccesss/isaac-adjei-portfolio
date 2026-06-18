"use client"
// I let me manage professional and personal contacts: adding names, roles, how I met them,
// contact details and follow-up flags. I surface a follow-up queue for anyone I have not
// contacted in over 30 days so important relationships do not go cold.

import { useState } from "react"
import { Users, Plus, X, ExternalLink, Mail, Phone, Bell, BellOff, Pencil, Github } from "lucide-react"
import type { Contact } from "@/app/dashboard/actions"
import { createContact, updateContact, deleteContact } from "@/app/dashboard/actions"
import MarkdownContent from "@/components/shared/MarkdownContent"
import PhoneField from "@/components/shared/PhoneField"

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
      <textarea
        placeholder="Notes"
        value={form.notes}
        onChange={set("notes")}
        rows={2}
        className="w-full border border-border rounded px-3 py-1.5 text-sm bg-background resize-none"
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

  async function handleCreate(form: FormState) {
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
    if (result && !("error" in result)) {
      setContacts((p) => [result as Contact, ...p])
    }
    setAdding(false)
  }

  async function handleUpdate(id: string, form: FormState) {
    await updateContact(id, {
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
    await updateContact(contact.id, { follow_up: next })
    setContacts((p) => p.map((c) => c.id === contact.id ? { ...c, follow_up: next } : c))
  }

  async function handleDelete(id: string) {
    await deleteContact(id)
    setContacts((p) => p.filter((c) => c.id !== id))
  }

  const followUpQueue = contacts.filter((c) => c.follow_up || needsFollowUp(c))
  const displayed = filter === "follow-up" ? followUpQueue : contacts

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
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

      {adding && (
        <ContactForm onSave={handleCreate} onCancel={() => setAdding(false)} />
      )}

      {displayed.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          {filter === "follow-up" ? "No contacts need follow-up right now." : "No contacts yet. Add someone you met!"}
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((contact) => (
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
                  needsFollowUp(contact) || contact.follow_up ? "border-amber-400/40" : "border-border"
                }`}>
                  <div className="flex items-start justify-between gap-3">
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
                        onClick={() => handleDelete(contact.id)}
                        title="Delete"
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
        </div>
      )}
    </div>
  )
}
