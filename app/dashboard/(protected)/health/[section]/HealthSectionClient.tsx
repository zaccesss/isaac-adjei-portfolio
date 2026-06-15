// I render a specific health section (gym, running or nutrition) within the dashboard.
// A single component handles all three because the data shapes are similar enough
// that splitting them would create more duplication than it saves.
"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import {
  createHealthSection, deleteHealthSection,
  createHealthWorkout, updateHealthWorkout, deleteHealthWorkout,
  updateHealthNutrition, createHealthNutrition, deleteHealthNutrition,
} from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Edit2, Dumbbell, Salad, Footprints, X } from "lucide-react"
import DashboardBreadcrumb from "@/app/dashboard/components/DashboardBreadcrumb"
import { dashboardPage } from "@/lib/animations"
import MarkdownContent from "@/components/shared/MarkdownContent"

type Section = {
  id: string
  name: string
  type: string
  icon: string
  color: string
  order_index: number
}

type Workout = {
  id: string
  section_id: string
  day_label: string
  exercises: { name: string; sets: string }[]
  notes: string | null
  order_index: number
}

type Nutrition = {
  id: string
  category: string
  items: string[]
  rules: string[]
  order_index: number
}

// I map section slugs to default icon emojis so new sections get a sensible default
const SECTION_TYPE_ICONS: Record<string, string> = { gym: "🏋️", running: "🏃", nutrition: "🥗", cardio: "❤️", other: "⚡" }
const SECTION_TYPES = ["gym", "running", "nutrition", "cardio", "other"]

function SectionCard({ section, onClick, onDelete }: {
  section: Section
  onClick: () => void
  onDelete: (id: string) => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full text-left border border-border rounded-xl p-5 bg-card hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{section.icon}</span>
          <div>
            <p className="font-semibold text-sm">{section.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{section.type}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(section.id) }}
          aria-label="Delete section"
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted text-destructive/60 hover:text-destructive transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </button>
  )
}

function WorkoutDayCard({ workout, onEdit, onDelete }: {
  workout: Workout
  onEdit: () => void
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <p className="font-medium text-sm">{workout.day_label}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {workout.exercises.length} exercise{workout.exercises.length !== 1 ? "s" : ""}
          </span>
        </div>
      </button>
      {open && (
        <div className="border-t border-border/50 p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            {workout.exercises.map((ex, i) => (
              <div key={i} className="flex items-center justify-between gap-3 text-sm">
                <span>{ex.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">{ex.sets}</span>
              </div>
            ))}
          </div>
          {workout.notes && <div className="border-t border-border/50 pt-2"><MarkdownContent compact>{workout.notes}</MarkdownContent></div>}
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onEdit}><Edit2 className="h-3 w-3" />Edit</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => onDelete(workout.id)}><Trash2 className="h-3 w-3" />Delete</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function NutritionCard({ item, onUpdate, onDelete }: {
  item: Nutrition
  onUpdate: (id: string, data: Partial<Nutrition>) => void
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState("")
  const [editRule, setEditRule] = useState("")

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <p className="font-medium text-sm">{item.category}</p>
        <span className="text-xs text-muted-foreground">{item.items.length} item{item.items.length !== 1 ? "s" : ""}</span>
      </button>
      {open && (
        <div className="border-t border-border/50 p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">Items</p>
            {item.items.map((food, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm flex-1">{food}</span>
                <button type="button" aria-label="Remove item" onClick={() => onUpdate(item.id, { items: item.items.filter((_, j) => j !== i) })} className="p-1 text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={editItem}
                onChange={(e) => setEditItem(e.target.value)}
                placeholder="Add food item"
                className="h-7 text-xs flex-1"
                onKeyDown={(e) => { if (e.key === "Enter" && editItem.trim()) { onUpdate(item.id, { items: [...item.items, editItem.trim()] }); setEditItem("") } }}
              />
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { if (editItem.trim()) { onUpdate(item.id, { items: [...item.items, editItem.trim()] }); setEditItem("") } }}>Add</Button>
            </div>
          </div>
          {item.rules.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">Rules</p>
              {item.rules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1"><MarkdownContent compact>{rule}</MarkdownContent></div>
                  <button type="button" aria-label="Remove rule" onClick={() => onUpdate(item.id, { rules: item.rules.filter((_, j) => j !== i) })} className="p-1 text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={editRule}
              onChange={(e) => setEditRule(e.target.value)}
              placeholder="Add rule"
              className="h-7 text-xs flex-1"
              onKeyDown={(e) => { if (e.key === "Enter" && editRule.trim()) { onUpdate(item.id, { rules: [...item.rules, editRule.trim()] }); setEditRule("") } }}
            />
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { if (editRule.trim()) { onUpdate(item.id, { rules: [...item.rules, editRule.trim()] }); setEditRule("") } }}>Add rule</Button>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs text-destructive hover:text-destructive w-fit gap-1" onClick={() => onDelete(item.id)}><Trash2 className="h-3 w-3" />Delete category</Button>
        </div>
      )}
    </div>
  )
}

// I use a discriminated union so the section icon type is clear
const SECTION_ICONS: Record<string, React.ElementType> = {
  gym: Dumbbell,
  nutrition: Salad,
  running: Footprints,
}

export default function HealthSectionClient({
  sections: initSections,
  workouts: initWorkouts,
  nutrition: initNutrition,
  activeSection,
  sectionLabel,
}: {
  sections: Section[]
  workouts: Workout[]
  nutrition: Nutrition[]
  activeSection: string
  sectionLabel: string
}) {
  const [sections, setSections] = useState<Section[]>(initSections)
  const [workouts, setWorkouts] = useState<Workout[]>(initWorkouts)
  const [nutrition, setNutrition] = useState<Nutrition[]>(initNutrition)
  // I keep selectedSection as state so clicking a gym section card shows its workouts inline
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [addSectionOpen, setAddSectionOpen] = useState(false)
  const [newSection, setNewSection] = useState({ name: "", type: activeSection, icon: SECTION_TYPE_ICONS[activeSection] ?? "💪", color: "#6366f1" })
  const [addWorkoutOpen, setAddWorkoutOpen] = useState(false)
  const [editWorkout, setEditWorkout] = useState<Workout | null>(null)
  const [workoutForm, setWorkoutForm] = useState({ day_label: "", exercises: [{ name: "", sets: "" }], notes: "" })
  const [addNutritionCat, setAddNutritionCat] = useState("")
  const [, startTransition] = useTransition()

  // I filter sections relevant to the active dashboard section
  const relevantSections = sections.filter((s) => {
    if (activeSection === "gym") {
      return s.type !== "nutrition" && !s.name.toLowerCase().includes("running") && !s.type.toLowerCase().includes("running")
    }
    if (activeSection === "running") {
      return s.name.toLowerCase().includes("running") || s.type.toLowerCase().includes("running")
    }
    return false
  })

  function handleAddSection() {
    if (!newSection.name.trim()) return
    const optimistic: Section = { id: crypto.randomUUID(), ...newSection, order_index: sections.length }
    setSections((s) => [...s, optimistic])
    setAddSectionOpen(false)
    setNewSection({ name: "", type: activeSection, icon: SECTION_TYPE_ICONS[activeSection] ?? "💪", color: "#6366f1" })
    startTransition(() => void createHealthSection({ ...newSection, order_index: sections.length }))
  }

  function handleDeleteSection(id: string) {
    setSections((s) => s.filter((x) => x.id !== id))
    if (selectedSection?.id === id) setSelectedSection(null)
    startTransition(() => void deleteHealthSection(id))
  }

  function handleAddWorkout() {
    if (!selectedSection || !workoutForm.day_label.trim()) return
    const exercises = workoutForm.exercises.filter((e) => e.name.trim())
    const optimistic: Workout = {
      id: crypto.randomUUID(),
      section_id: selectedSection.id,
      day_label: workoutForm.day_label,
      exercises,
      notes: workoutForm.notes || null,
      order_index: workouts.filter((w) => w.section_id === selectedSection.id).length,
    }
    setWorkouts((w) => [...w, optimistic])
    setAddWorkoutOpen(false)
    setWorkoutForm({ day_label: "", exercises: [{ name: "", sets: "" }], notes: "" })
    startTransition(() => void createHealthWorkout({
      section_id: selectedSection.id,
      day_label: workoutForm.day_label,
      exercises,
      notes: workoutForm.notes,
      order_index: optimistic.order_index,
    }))
  }

  function handleDeleteWorkout(id: string) {
    setWorkouts((w) => w.filter((x) => x.id !== id))
    startTransition(() => void deleteHealthWorkout(id))
  }

  function handleUpdateNutrition(id: string, data: Partial<Nutrition>) {
    setNutrition((n) => n.map((x) => x.id === id ? { ...x, ...data } : x))
    startTransition(() => void updateHealthNutrition(id, data))
  }

  function handleDeleteNutrition(id: string) {
    setNutrition((n) => n.filter((x) => x.id !== id))
    startTransition(() => void deleteHealthNutrition(id))
  }

  function handleAddNutritionCat() {
    if (!addNutritionCat.trim()) return
    const optimistic: Nutrition = { id: crypto.randomUUID(), category: addNutritionCat, items: [], rules: [], order_index: nutrition.length }
    setNutrition((n) => [...n, optimistic])
    setAddNutritionCat("")
    startTransition(() => void createHealthNutrition({ category: addNutritionCat, items: [], rules: [], order_index: optimistic.order_index }))
  }

  const SectionIcon = SECTION_ICONS[activeSection] ?? Dumbbell

  // I show the selected gym section detail when one is chosen
  if (activeSection === "gym" && selectedSection) {
    const sectionWorkouts = workouts.filter((w) => w.section_id === selectedSection.id)
    return (
      <motion.div className="flex flex-col gap-5 max-w-3xl" variants={dashboardPage} initial="hidden" animate="visible">
        <DashboardBreadcrumb
          crumbs={[
            { label: "Health and Fitness", href: "/dashboard/health" },
            { label: sectionLabel, href: "/dashboard/health/gym" },
            { label: selectedSection.name },
          ]}
        />
        <div className="flex items-center gap-2">
          <span className="text-xl">{selectedSection.icon}</span>
          <h1 className="text-xl font-semibold">{selectedSection.name}</h1>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Workouts</p>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => { setWorkoutForm({ day_label: "", exercises: [{ name: "", sets: "" }], notes: "" }); setAddWorkoutOpen(true) }}>
              <Plus className="h-3 w-3" />Add day
            </Button>
          </div>
          {sectionWorkouts.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground">No workouts added yet.</p>
              <button type="button" onClick={() => setAddWorkoutOpen(true)} className="text-sm text-primary hover:underline mt-1">Add my first workout day</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sectionWorkouts.map((w) => (
                <WorkoutDayCard
                  key={w.id}
                  workout={w}
                  onEdit={() => {
                    setEditWorkout(w)
                    setWorkoutForm({ day_label: w.day_label, exercises: w.exercises.length ? w.exercises : [{ name: "", sets: "" }], notes: w.notes ?? "" })
                    setAddWorkoutOpen(true)
                  }}
                  onDelete={handleDeleteWorkout}
                />
              ))}
            </div>
          )}
        </div>
        <Dialog open={addWorkoutOpen} onOpenChange={(o) => { if (!o) { setAddWorkoutOpen(false); setEditWorkout(null) } }}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editWorkout ? "Edit workout day" : "New workout day"}</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Day label</label>
                <Input value={workoutForm.day_label} onChange={(e) => setWorkoutForm((f) => ({ ...f, day_label: e.target.value }))} placeholder="e.g. Monday - Chest and Triceps" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Exercises</label>
                  <Button type="button" size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => setWorkoutForm((f) => ({ ...f, exercises: [...f.exercises, { name: "", sets: "" }] }))}>
                    <Plus className="h-3 w-3" />Add row
                  </Button>
                </div>
                {workoutForm.exercises.map((ex, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={ex.name} onChange={(e) => setWorkoutForm((f) => ({ ...f, exercises: f.exercises.map((x, j) => j === i ? { ...x, name: e.target.value } : x) }))} placeholder="Exercise name" className="flex-1 text-sm" />
                    <Input value={ex.sets} onChange={(e) => setWorkoutForm((f) => ({ ...f, exercises: f.exercises.map((x, j) => j === i ? { ...x, sets: e.target.value } : x) }))} placeholder="Sets (e.g. 4x8)" className="w-28 text-sm" />
                    {workoutForm.exercises.length > 1 && (
                      <button type="button" aria-label="Remove exercise" onClick={() => setWorkoutForm((f) => ({ ...f, exercises: f.exercises.filter((_, j) => j !== i) }))} className="p-1 text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Notes</label>
                <Textarea value={workoutForm.notes} onChange={(e) => setWorkoutForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Optional notes" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => { setAddWorkoutOpen(false); setEditWorkout(null) }}>Cancel</Button>
                <Button onClick={() => {
                  if (!workoutForm.day_label.trim()) return
                  const exercises = workoutForm.exercises.filter((e) => e.name.trim())
                  if (editWorkout) {
                    setWorkouts((w) => w.map((x) => x.id === editWorkout.id ? { ...x, day_label: workoutForm.day_label, exercises, notes: workoutForm.notes || null } : x))
                    startTransition(() => void updateHealthWorkout(editWorkout.id, { day_label: workoutForm.day_label, exercises, notes: workoutForm.notes }))
                    setEditWorkout(null)
                  } else {
                    handleAddWorkout()
                  }
                  setAddWorkoutOpen(false)
                }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="flex flex-col gap-6 max-w-3xl"
      variants={dashboardPage}
      initial="hidden"
      animate="visible"
    >
      <DashboardBreadcrumb
        crumbs={[
          { label: "Health and Fitness", href: "/dashboard/health" },
          { label: sectionLabel },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SectionIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold">{sectionLabel}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeSection === "nutrition" ? `${nutrition.length} categor${nutrition.length !== 1 ? "ies" : "y"}` : `${relevantSections.length} section${relevantSections.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        {activeSection !== "nutrition" && (
          <Button size="sm" className="gap-1" onClick={() => setAddSectionOpen(true)}>
            <Plus className="h-4 w-4" />Add section
          </Button>
        )}
      </div>

      {/* Gym view: show section cards that link to their workout detail */}
      {activeSection === "gym" && (
        relevantSections.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-10 text-center">
            <p className="text-sm text-muted-foreground">No gym sections yet. Add your first one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relevantSections.map((s) => (
              <SectionCard key={s.id} section={s} onClick={() => setSelectedSection(s)} onDelete={handleDeleteSection} />
            ))}
          </div>
        )
      )}

      {/* Nutrition view: show nutrition plan categories */}
      {activeSection === "nutrition" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plans</p>
            <div className="flex gap-2">
              <Input
                value={addNutritionCat}
                onChange={(e) => setAddNutritionCat(e.target.value)}
                placeholder="New category"
                className="h-7 text-xs w-36"
                onKeyDown={(e) => { if (e.key === "Enter") handleAddNutritionCat() }}
              />
              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={handleAddNutritionCat}><Plus className="h-3 w-3" />Add</Button>
            </div>
          </div>
          {nutrition.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground">No nutrition categories yet. Add one above.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {nutrition.map((item) => (
                <NutritionCard key={item.id} item={item} onUpdate={handleUpdateNutrition} onDelete={handleDeleteNutrition} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Running view: show running-tagged sections or empty state */}
      {activeSection === "running" && (
        relevantSections.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-10 text-center">
            <Footprints className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium">No running logs yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add a section with &quot;running&quot; in its name or type to track runs here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relevantSections.map((s) => (
              <SectionCard key={s.id} section={s} onClick={() => setSelectedSection(s)} onDelete={handleDeleteSection} />
            ))}
          </div>
        )
      )}

      {/* Add section dialog - shared between gym and running */}
      <Dialog open={addSectionOpen} onOpenChange={setAddSectionOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New section</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Name</label>
              <Input value={newSection.name} onChange={(e) => setNewSection((s) => ({ ...s, name: e.target.value }))} placeholder="e.g. 5K Training, Pull Day" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Type</label>
                <select
                  aria-label="Section type"
                  value={newSection.type}
                  onChange={(e) => setNewSection((s) => ({ ...s, type: e.target.value, icon: SECTION_TYPE_ICONS[e.target.value] ?? "⚡" }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  {SECTION_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Icon (emoji)</label>
                <Input value={newSection.icon} onChange={(e) => setNewSection((s) => ({ ...s, icon: e.target.value }))} placeholder="💪" className="text-lg" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => setAddSectionOpen(false)}>Cancel</Button>
              <Button onClick={handleAddSection} disabled={!newSection.name.trim()}>Add section</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
