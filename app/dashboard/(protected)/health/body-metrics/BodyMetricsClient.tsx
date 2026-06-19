"use client"

import { useState, useTransition } from "react"
import { createBodyMetric, deleteBodyMetric } from "../../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

type Metric = {
  id: string
  date: string
  metric: string
  value: number
  unit: string
  notes: string | null
}

const METRIC_TYPES = [
  { value: "weight_kg", label: "Weight", unit: "kg" },
  { value: "body_fat_pct", label: "Body fat", unit: "%" },
  { value: "chest_cm", label: "Chest", unit: "cm" },
  { value: "waist_cm", label: "Waist", unit: "cm" },
  { value: "hips_cm", label: "Hips", unit: "cm" },
  { value: "arm_cm", label: "Arm", unit: "cm" },
  { value: "thigh_cm", label: "Thigh", unit: "cm" },
  { value: "custom", label: "Custom", unit: "" },
]

function metricLabel(m: string) {
  return METRIC_TYPES.find((t) => t.value === m)?.label ?? m
}

const COLOURS = ["hsl(var(--primary))", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316"]

export default function BodyMetricsClient({ metrics }: { metrics: Metric[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [selectedMetric, setSelectedMetric] = useState<string>("weight_kg")

  const today = new Date().toISOString().split("T")[0]
  const [form, setForm] = useState({
    date: today,
    metric: "weight_kg",
    value: "",
    unit: "kg",
    notes: "",
  })

  function handleMetricTypeChange(v: string) {
    const mt = METRIC_TYPES.find((t) => t.value === v)
    setForm((f) => ({ ...f, metric: v, unit: mt?.unit ?? "" }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = parseFloat(form.value)
    if (isNaN(value)) return
    startTransition(async () => {
      await createBodyMetric({
        date: form.date,
        metric: form.metric,
        value,
        unit: form.unit,
        notes: form.notes.trim() || undefined,
      })
      setOpen(false)
      setForm({ date: today, metric: "weight_kg", value: "", unit: "kg", notes: "" })
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => { await deleteBodyMetric(id) })
  }

  const allMetricTypes = [...new Set(metrics.map((m) => m.metric))]
  const displayMetric = selectedMetric && metrics.some((m) => m.metric === selectedMetric)
    ? selectedMetric
    : allMetricTypes[0] ?? "weight_kg"

  const chartData = metrics
    .filter((m) => m.metric === displayMetric)
    .slice(0, 30)
    .reverse()
    .map((m) => ({ date: m.date.slice(5), value: m.value }))

  const latest = metrics.filter((m) => m.metric === displayMetric)[0]
  const prev = metrics.filter((m) => m.metric === displayMetric)[1]
  const trend = latest && prev ? latest.value - prev.value : null

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Body Metrics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Weight, measurements and body composition over time</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Log metric
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log body metric</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Date</label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Metric</label>
                  <Select value={form.metric} onValueChange={handleMetricTypeChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {METRIC_TYPES.map((mt) => (
                        <SelectItem key={mt.value} value={mt.value}>{mt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Value</label>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    placeholder="e.g. 75.5"
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Unit</label>
                  <Input
                    placeholder="kg, cm, %..."
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
                <Textarea
                  placeholder="Any context..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={isPending} className="flex-1">Log metric</Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {metrics.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-12 text-center text-muted-foreground text-sm">
          No metrics logged yet. Start tracking your weight and measurements above.
        </div>
      ) : (
        <>
          {/* Metric selector tabs */}
          {allMetricTypes.length > 1 && (
            <div className="flex gap-1 flex-wrap">
              {allMetricTypes.map((m, i) => (
                <button
                  key={m}
                  onClick={() => setSelectedMetric(m)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    displayMetric === m
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {metricLabel(m)}
                </button>
              ))}
            </div>
          )}

          {/* Chart for selected metric */}
          {chartData.length > 1 && (
            <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{metricLabel(displayMetric)} trend</p>
                {trend !== null && (
                  <span className={`flex items-center gap-1 text-xs font-medium ${trend < 0 ? "text-green-500" : trend > 0 ? "text-red-400" : "text-muted-foreground"}`}>
                    {trend < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : trend > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                    {trend > 0 ? "+" : ""}{trend.toFixed(1)}{latest?.unit} vs prev
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(chartData.length / 6))} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 6 }}
                    formatter={(v) => [`${v}${latest?.unit ?? ""}`, metricLabel(displayMetric)]}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Latest per metric type */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allMetricTypes.map((m, i) => {
              const latest = metrics.find((me) => me.metric === m)
              if (!latest) return null
              return (
                <div key={m} className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
                  <p className="text-xs text-muted-foreground">{metricLabel(m)}</p>
                  <p className="text-2xl font-bold" style={{ color: COLOURS[i % COLOURS.length] }}>
                    {latest.value}{latest.unit}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{latest.date}</p>
                </div>
              )
            })}
          </div>

          {/* Full log */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">All entries</p>
            {metrics.slice(0, 50).map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-2.5 hover:border-primary/30 transition-colors group">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ color: COLOURS[allMetricTypes.indexOf(m.metric) % COLOURS.length], background: "currentColor" }} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{metricLabel(m.metric)}</span>
                  <span className="text-sm text-muted-foreground ml-2">{m.value}{m.unit}</span>
                  {m.notes && <p className="text-xs text-muted-foreground truncate">{m.notes}</p>}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{m.date}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity shrink-0"
                  onClick={() => handleDelete(m.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
