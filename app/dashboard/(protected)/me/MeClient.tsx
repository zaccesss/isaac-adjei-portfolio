"use client"
// I provide an editable profile page for my personal details - name, DOB, faith, university info,
// values and interests. Every field is click-to-edit and saves automatically on blur or Enter.
// I store all fields as a single config blob rather than separate rows to keep the schema simple.

import { useState, useTransition } from "react"
import { setConfig } from "@/app/dashboard/actions"
import { savedOk } from "@/lib/save-result"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Edit2, Save, X, Plus, Trash2, ExternalLink, Github, Linkedin, Globe } from "lucide-react"
import MarkdownContent from "@/components/shared/MarkdownContent"

type Profile = {
  name: string
  dob: string
  nationality: string
  location: string
  university: string
  course: string
  year: number
  student_number: string
  faith: string
  bio: string
  values: string[]
  interests: string[]
  personality: string
  github: string
  linkedin: string
  website: string
  height: string
  weight: string
  phone: string
  email: string
}

function EditableText({ value, onSave, multiline, className }: {
  value: string
  onSave: (v: string) => void
  multiline?: boolean
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function save() {
    onSave(draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex gap-2 items-start">
        {multiline
          ? <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} className="flex-1 text-sm" autoFocus />
          : <Input value={draft} onChange={(e) => setDraft(e.target.value)} className="flex-1 h-7 text-sm" autoFocus onKeyDown={(e) => { if (e.key === "Enter") save() }} />
        }
        <button type="button" onClick={save} className="p-1 text-green-600 hover:text-green-700"><Save className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => { setDraft(value); setEditing(false) }} className="p-1 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
      </div>
    )
  }

  if (multiline && value) {
    return (
      <div
        className={`cursor-pointer hover:ring-1 hover:ring-border rounded px-1 -mx-1 ${className ?? ""}`}
        onClick={() => { setDraft(value); setEditing(true) }}
      >
        <MarkdownContent compact>{value}</MarkdownContent>
      </div>
    )
  }

  return (
    <span
      className={`cursor-pointer hover:underline hover:decoration-dotted underline-offset-2 ${className ?? ""}`}
      onClick={() => { setDraft(value); setEditing(true) }}
    >
      {value || <span className="text-muted-foreground italic">Click to add</span>}
    </span>
  )
}

function EditableList({ items, onSave }: { items: string[]; onSave: (items: string[]) => void }) {
  const [draft, setDraft] = useState<string[]>(items)
  const [newItem, setNewItem] = useState("")
  const [editing, setEditing] = useState(false)

  function save() {
    onSave(draft.filter(Boolean))
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
        ))}
        <button type="button" onClick={() => { setDraft(items); setEditing(true) }} className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">edit</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {draft.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input value={item} onChange={(e) => setDraft((d) => d.map((x, j) => j === i ? e.target.value : x))} className="h-7 text-xs flex-1" />
          <button type="button" onClick={() => setDraft((d) => d.filter((_, j) => j !== i))} className="p-1 text-destructive/60 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add item" className="h-7 text-xs flex-1"
          onKeyDown={(e) => { if (e.key === "Enter" && newItem.trim()) { setDraft((d) => [...d, newItem.trim()]); setNewItem("") } }} />
        <button type="button" onClick={() => { if (newItem.trim()) { setDraft((d) => [...d, newItem.trim()]); setNewItem("") } }} className="p-1 text-primary"><Plus className="h-4 w-4" /></button>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
        <Button size="sm" onClick={save}>Save</Button>
      </div>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground w-28 shrink-0 pt-0.5">{label}</span>
      <div className="flex-1 text-sm">{children}</div>
    </div>
  )
}

export default function MeClient({ profile: initial }: { profile: Profile }) {
  const [profile, setProfile] = useState<Profile>(initial)
  const [, startTransition] = useTransition()

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    const updated = { ...profile, [key]: value }
    // I update local state first so the UI responds immediately without waiting for the server
    setProfile(updated)
    // I persist the whole profile object as one config blob rather than having a separate row per field
    startTransition(async () => { savedOk(await setConfig("me_profile", updated), "Could not save changes") })
  }

  // I use 365.25 days per year to account for leap years in the age calculation
  const age = profile.dob
    ? Math.floor((new Date().getTime() - new Date(profile.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">
            <EditableText value={profile.name} onSave={(v) => update("name", v)} className="text-2xl font-bold" />
          </h1>
          <p className="text-sm text-muted-foreground">
            {age ? `${age} years old` : ""}{age && profile.nationality ? " · " : ""}{profile.nationality}
            {profile.location ? ` · ${profile.location}` : ""}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <a href="/cv" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs">
              <ExternalLink className="h-3.5 w-3.5" />View CV
            </a>
            {profile.github && (
              <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs">
                <Github className="h-3.5 w-3.5" />{profile.github}
              </a>
            )}
            {profile.linkedin && (
              <a href={`https://www.linkedin.com/in/${profile.linkedin}/`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs">
                <Linkedin className="h-3.5 w-3.5" />{profile.linkedin}
              </a>
            )}
            {profile.website && (
              <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs">
                <Globe className="h-3.5 w-3.5" />{profile.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="border border-border rounded-lg p-4 bg-card flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">About me</p>
          <Edit2 className="h-3 w-3 text-muted-foreground" />
        </div>
        <p className="text-sm leading-relaxed">
          <EditableText value={profile.bio} onSave={(v) => update("bio", v)} multiline className="text-sm leading-relaxed" />
        </p>
      </div>

      {/* Personal details */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Personal details</p>
        </div>
        <div className="px-4">
          <InfoRow label="Date of birth">
            <EditableText value={profile.dob} onSave={(v) => update("dob", v)} />
          </InfoRow>
          <InfoRow label="Nationality">
            <EditableText value={profile.nationality} onSave={(v) => update("nationality", v)} />
          </InfoRow>
          <InfoRow label="Location">
            <EditableText value={profile.location} onSave={(v) => update("location", v)} />
          </InfoRow>
          <InfoRow label="Faith">
            <EditableText value={profile.faith} onSave={(v) => update("faith", v)} />
          </InfoRow>
          <InfoRow label="Height">
            <EditableText value={profile.height} onSave={(v) => update("height", v)} />
          </InfoRow>
          <InfoRow label="Weight">
            <EditableText value={profile.weight} onSave={(v) => update("weight", v)} />
          </InfoRow>
          <InfoRow label="Phone">
            <EditableText value={profile.phone} onSave={(v) => update("phone", v)} />
          </InfoRow>
          <InfoRow label="Email">
            <EditableText value={profile.email} onSave={(v) => update("email", v)} />
          </InfoRow>
        </div>
      </div>

      {/* University */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">University</p>
        </div>
        <div className="px-4">
          <InfoRow label="University">
            <EditableText value={profile.university} onSave={(v) => update("university", v)} />
          </InfoRow>
          <InfoRow label="Course">
            <EditableText value={profile.course} onSave={(v) => update("course", v)} />
          </InfoRow>
          <InfoRow label="Year">
            <EditableText value={String(profile.year)} onSave={(v) => update("year", Number(v))} />
          </InfoRow>
          <InfoRow label="Student number">
            <EditableText value={profile.student_number} onSave={(v) => update("student_number", v)} />
          </InfoRow>
        </div>
      </div>

      {/* Values */}
      <div className="border border-border rounded-lg p-4 bg-card flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">My values</p>
        <EditableList items={profile.values} onSave={(v) => update("values", v)} />
      </div>

      {/* Interests */}
      <div className="border border-border rounded-lg p-4 bg-card flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Interests</p>
        <EditableList items={profile.interests} onSave={(v) => update("interests", v)} />
      </div>

      {/* Personality */}
      <div className="border border-border rounded-lg p-4 bg-card flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Personality</p>
        <p className="text-sm leading-relaxed">
          <EditableText value={profile.personality} onSave={(v) => update("personality", v)} multiline className="text-sm leading-relaxed" />
        </p>
      </div>

      {/* Links */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Links</p>
        </div>
        <div className="px-4">
          <InfoRow label="GitHub">
            <EditableText value={profile.github} onSave={(v) => update("github", v)} />
          </InfoRow>
          <InfoRow label="LinkedIn">
            <EditableText value={profile.linkedin} onSave={(v) => update("linkedin", v)} />
          </InfoRow>
          <InfoRow label="Website">
            <EditableText value={profile.website} onSave={(v) => update("website", v)} />
          </InfoRow>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Click any field to edit. Changes save automatically.</p>
    </div>
  )
}
