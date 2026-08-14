"use client"

// Hand-logged frequency-response readings from EECS lab work, plotted as a Bode plot - the
// standard EE chart for this: magnitude and phase both against a log-scale frequency axis. No
// sensor pipeline exists behind this, it is a manual entry form.
import { useMemo, useState, useTransition } from "react"
import {
  LineChart as RLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { createLabMeasurement, deleteLabMeasurement, type LabMeasurement } from "@/app/dashboard/actions"
import { savedOk } from "@/lib/save-result"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Waves } from "lucide-react"

const emptyForm = { project_label: "", measurement_set: "", frequency_hz: "", magnitude_db: "", phase_deg: "" }

export default function LabMeasurementsClient({ measurements }: { measurements: LabMeasurement[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState(emptyForm)

  const projectLabels = [...new Set(measurements.map((m) => m.project_label))].sort()
  const [projectFilter, setProjectFilter] = useState<string>("all")

  const visible = projectFilter === "all" ? measurements : measurements.filter((m) => m.project_label === projectFilter)

  // One line per measurement_set within the visible project(s), so multiple sweeps overlay for
  // comparison rather than only ever showing one at a time.
  const sets = useMemo(() => [...new Set(visible.map((m) => m.measurement_set))], [visible])
  const bySet = useMemo(() => {
    const map = new Map<string, LabMeasurement[]>()
    for (const s of sets) map.set(s, visible.filter((m) => m.measurement_set === s).sort((a, b) => a.frequency_hz - b.frequency_hz))
    return map
  }, [visible, sets])

  // recharts needs one array of points per axis value (frequency here), each carrying every
  // series' own keyed value, rather than one array per series - pivot { set -> points } into that
  // shape, keyed by frequency so every set's magnitude/phase at that frequency line up on one row.
  const frequencies = [...new Set(visible.map((m) => m.frequency_hz))].sort((a, b) => a - b)
  const magnitudeData = frequencies.map((f) => {
    const row: Record<string, number> = { frequency_hz: f }
    for (const [set, pts] of bySet) {
      const p = pts.find((p) => p.frequency_hz === f)
      if (p?.magnitude_db != null) row[set] = p.magnitude_db
    }
    return row
  })
  const phaseData = frequencies.map((f) => {
    const row: Record<string, number> = { frequency_hz: f }
    for (const [set, pts] of bySet) {
      const p = pts.find((p) => p.frequency_hz === f)
      if (p?.phase_deg != null) row[set] = p.phase_deg
    }
    return row
  })

  const colours = ["#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const frequency = Number(form.frequency_hz)
    if (!form.project_label.trim() || !form.measurement_set.trim() || !frequency) return
    startTransition(async () => {
      const res = await createLabMeasurement({
        project_label: form.project_label.trim(),
        measurement_set: form.measurement_set.trim(),
        frequency_hz: frequency,
        magnitude_db: form.magnitude_db ? Number(form.magnitude_db) : undefined,
        phase_deg: form.phase_deg ? Number(form.phase_deg) : undefined,
      })
      if (!savedOk(res, "Could not save reading")) return
      setForm((f) => ({ ...emptyForm, project_label: f.project_label, measurement_set: f.measurement_set }))
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => { savedOk(await deleteLabMeasurement(id), "Could not delete reading") })
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Waves className="h-5 w-5 text-primary" /> Lab measurements
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Frequency-response readings, logged by hand from lab work - plotted as a Bode plot.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {projectLabels.length > 1 && (
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All projects</SelectItem>
                {projectLabels.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Log reading</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log a reading</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Project</label>
                  <Input
                    placeholder="e.g. RC low-pass filter"
                    value={form.project_label}
                    onChange={(e) => setForm((f) => ({ ...f, project_label: e.target.value }))}
                    required
                    list="project-list"
                  />
                  <datalist id="project-list">
                    {projectLabels.map((p) => <option key={p} value={p} />)}
                  </datalist>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Measurement set</label>
                  <Input
                    placeholder="e.g. R=1k C=100nF"
                    value={form.measurement_set}
                    onChange={(e) => setForm((f) => ({ ...f, measurement_set: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Frequency (Hz)</label>
                    <Input type="number" step="any" min={0.001} value={form.frequency_hz} onChange={(e) => setForm((f) => ({ ...f, frequency_hz: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Magnitude (dB)</label>
                    <Input type="number" step="any" value={form.magnitude_db} onChange={(e) => setForm((f) => ({ ...f, magnitude_db: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Phase (deg)</label>
                    <Input type="number" step="any" value={form.phase_deg} onChange={(e) => setForm((f) => ({ ...f, phase_deg: e.target.value }))} />
                  </div>
                </div>
                <Button type="submit" disabled={isPending}>Save reading</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground py-16 text-center border border-dashed border-border rounded-lg">
          No readings logged yet. Log a frequency-response reading above to start plotting a Bode plot.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="border border-border rounded-lg p-4 bg-card">
            <p className="text-sm font-semibold mb-3">Magnitude (dB) vs frequency</p>
            <ResponsiveContainer width="100%" height={220}>
              <RLineChart data={magnitudeData} margin={{ top: 6, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="frequency_hz" scale="log" domain={["auto", "auto"]} type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} labelFormatter={(v) => `${v} Hz`} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                {sets.map((s, i) => (
                  <Line key={s} type="monotone" dataKey={s} stroke={colours[i % colours.length]} strokeWidth={2} dot={{ r: 2 }} connectNulls />
                ))}
              </RLineChart>
            </ResponsiveContainer>
          </div>
          <div className="border border-border rounded-lg p-4 bg-card">
            <p className="text-sm font-semibold mb-3">Phase (deg) vs frequency</p>
            <ResponsiveContainer width="100%" height={220}>
              <RLineChart data={phaseData} margin={{ top: 6, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="frequency_hz" scale="log" domain={["auto", "auto"]} type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} labelFormatter={(v) => `${v} Hz`} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                {sets.map((s, i) => (
                  <Line key={s} type="monotone" dataKey={s} stroke={colours[i % colours.length]} strokeWidth={2} dot={{ r: 2 }} connectNulls />
                ))}
              </RLineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">Readings</p>
            {visible.map((m) => (
              <div key={m.id} className="flex items-center gap-3 text-sm py-2 border-b border-border/50 last:border-0">
                <span className="w-24 tabular-nums text-muted-foreground">{m.frequency_hz} Hz</span>
                <span className="w-28 truncate">{m.measurement_set}</span>
                <span className="flex-1 text-xs text-muted-foreground truncate">{m.project_label}</span>
                <span className="tabular-nums text-xs text-muted-foreground w-20">{m.magnitude_db != null ? `${m.magnitude_db} dB` : "-"}</span>
                <span className="tabular-nums text-xs text-muted-foreground w-20">{m.phase_deg != null ? `${m.phase_deg}°` : "-"}</span>
                <button type="button" onClick={() => handleDelete(m.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
