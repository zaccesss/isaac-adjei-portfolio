"use client"

// The status-page-style uptime view: one row per service, one small coloured cell per day, in the
// same visual language status.claude.com and my own status.isaacadjei.me (Better Stack) already use.
// Reuses STATUS_COLOURS from status-ui.tsx so the colour language matches the rest of Ops exactly -
// this is not a new palette, just a new shape for the same data.
import { STATUS_COLOURS } from "@/app/dashboard/components/status-ui"

interface UptimeGridRow {
  slug: string
  label: string
  days: { date: string; status: string }[]
}

function cellColour(status: string | undefined): string {
  if (!status) return "hsl(var(--muted))"
  return STATUS_COLOURS[status as keyof typeof STATUS_COLOURS] ?? STATUS_COLOURS.paused
}

export function UptimeGrid({ rows }: { rows: UptimeGridRow[] }) {
  if (!rows.length) {
    return <p className="text-xs text-muted-foreground">No check history recorded yet for this period.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const upDays = row.days.filter((d) => d.status === "up").length
        const uptimePct = row.days.length > 0 ? Math.round((upDays / row.days.length) * 1000) / 10 : null
        return (
          <div key={row.slug} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{row.label}</span>
              {uptimePct != null && <span className="text-muted-foreground tabular-nums">{uptimePct}% up</span>}
            </div>
            <div className="flex gap-[2px]">
              {row.days.map((d) => (
                <div
                  key={d.date}
                  className="h-4 flex-1 rounded-[2px] min-w-[2px]"
                  style={{ backgroundColor: cellColour(d.status) }}
                  title={`${d.date}: ${d.status}`}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
