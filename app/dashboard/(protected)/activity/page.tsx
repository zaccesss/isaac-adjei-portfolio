import { getActivityLog } from "../../actions"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

function formatAction(action: string): string {
  const labels: Record<string, string> = {
    "goal.create": "Created goal",
    "goal.delete": "Deleted goal",
    "diary.create": "New diary entry",
    "diary.delete": "Deleted diary entry",
    "note.create": "Created note",
    "note.delete": "Deleted note",
    "application.create": "Added application",
    "application.delete": "Deleted application",
  }
  return labels[action] ?? action
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default async function ActivityPage() {
  const logs = await getActivityLog(100)

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-1">Activity log</h1>
      <p className="text-sm text-muted-foreground mb-6">Last 100 actions taken on the dashboard.</p>

      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet. Start using the dashboard and actions will appear here.</p>
      ) : (
        <ol className="space-y-1">
          {logs.map((log) => (
            <li key={log.id} className="flex items-baseline gap-3 text-sm py-2 border-b border-border/50 last:border-0">
              <span className="text-muted-foreground text-xs w-16 shrink-0 tabular-nums">{relativeTime(log.created_at)}</span>
              <span className="font-medium">{formatAction(log.action)}</span>
              {log.detail && (
                <span className="text-muted-foreground truncate">{log.detail}</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
