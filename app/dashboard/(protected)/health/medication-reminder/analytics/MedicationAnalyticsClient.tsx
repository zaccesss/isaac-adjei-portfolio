"use client"

import { useRouter } from "next/navigation"
import {
  AnalyticsPeriodProvider,
  PeriodSelector,
  useAnalyticsPeriod,
  filterByPeriod,
  periodStartDate,
  StatCard,
  LineChart,
  BarChart,
  Gauge,
} from "@/components/analytics"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Pill } from "lucide-react"

export type Dose = {
  id: string
  reminder_id: string | null
  label: string
  name: string
  channel: string
  sent_at: string
  status: string
  taken_at: string | null
}

export type ReminderLite = { id: string; active: boolean; label: string; name: string }

export default function MedicationAnalyticsClient({ reminders, doses }: { reminders: ReminderLite[]; doses: Dose[] }) {
  return (
    <AnalyticsPeriodProvider defaultPeriod="30d">
      <Inner reminders={reminders} doses={doses} />
    </AnalyticsPeriodProvider>
  )
}

function Inner({ reminders, doses }: { reminders: ReminderLite[]; doses: Dose[] }) {
  const router = useRouter()
  const { period } = useAnalyticsPeriod()
  const inPeriod = filterByPeriod(doses, period, (d) => d.sent_at)

  const sent = inPeriod.length
  const taken = inPeriod.filter((d) => d.status === "taken").length
  const adherence = sent > 0 ? Math.round((taken / sent) * 100) : 0
  const activeCount = reminders.filter((r) => r.active).length

  // Reminders sent per day, oldest to newest. Zero-fill every day from the period start (or the
  // first dose when the period is "all") through to today so the line spans the whole selected
  // period and days with no doses show as a 0 point rather than being dropped.
  const byDay = new Map<string, number>()
  for (const d of inPeriod) {
    const day = d.sent_at.slice(0, 10)
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }
  const firstDay = [...byDay.keys()].sort()[0]
  const startDay = periodStartDate(period) ?? (firstDay ? new Date(firstDay) : null)
  const perDay: { name: string; count: number }[] = []
  if (startDay) {
    // Walk one UTC day at a time so the day keys line up with the UTC dates built above.
    const cursor = new Date(Date.UTC(startDay.getUTCFullYear(), startDay.getUTCMonth(), startDay.getUTCDate()))
    const todayKey = new Date().toISOString().slice(0, 10)
    for (let i = 0; i < 400; i++) {
      const key = cursor.toISOString().slice(0, 10)
      perDay.push({ name: `${cursor.getUTCDate()}/${cursor.getUTCMonth() + 1}`, count: byDay.get(key) ?? 0 })
      if (key >= todayKey) break
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
  }

  // Sent count per medication, busiest first.
  const byMed = new Map<string, number>()
  for (const d of inPeriod) byMed.set(d.name, (byMed.get(d.name) ?? 0) + 1)
  const perMed = [...byMed.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Pill className="h-6 w-6" /> Medication analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Reminders sent and taken over time.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/health/medication-reminder")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Reminders
        </Button>
      </header>

      <PeriodSelector />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Active reminders" value={activeCount} scope="current" />
        <StatCard label="Sent" value={sent} />
        <StatCard label="Taken" value={taken} />
        <StatCard label="Adherence" value={`${adherence}%`} />
      </div>

      <div className="border border-border rounded-lg p-4 bg-card">
        <p className="text-sm font-medium mb-1 text-center">Adherence</p>
        {sent > 0 ? <Gauge value={adherence} height={140} /> : <p className="text-sm text-muted-foreground py-8 text-center">No reminders sent in this period yet.</p>}
      </div>

      <div className="border border-border rounded-lg p-4 bg-card">
        <p className="text-sm font-medium mb-3">Reminders sent per day</p>
        {perDay.length > 0 ? (
          <LineChart data={perDay} dataKey="count" dots />
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">No reminders sent in this period yet.</p>
        )}
      </div>

      <div className="border border-border rounded-lg p-4 bg-card">
        <p className="text-sm font-medium mb-3">By medication</p>
        {perMed.length > 0 ? (
          <BarChart data={perMed} dataKey="count" />
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">No data yet.</p>
        )}
      </div>
    </div>
  )
}
