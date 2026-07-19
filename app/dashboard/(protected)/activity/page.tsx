// I show every dashboard action here so I can audit what changed and when. Paginated server-side so I can
// page through the whole history while only one page of rows is ever fetched and rendered.
import { getActivityLogPage } from "../../actions"
import { Pagination } from "@/components/shared/Pagination"

export const dynamic = "force-dynamic"
export const metadata = { title: "Activity Log", robots: "noindex, nofollow" }

const PAGE_SIZE = 50

function formatAction(action: string): string {
  // I handle dynamic restore actions here since the prefix varies by table name
  if (action.endsWith(".restore")) {
    const resource = action.replace(".restore", "")
    return `Restored ${resource} item`
  }
  const labels: Record<string, string> = {
    // Goals
    "goal.create": "Created goal",
    "goal.update": "Updated goal",
    "goal.delete": "Deleted goal",
    // Diary
    "diary.create": "New diary entry",
    "diary.update": "Updated diary entry",
    "diary.delete": "Deleted diary entry",
    // Notes
    "note.create": "Created note",
    "note.update": "Updated note",
    "note.delete": "Deleted note",
    // Applications
    "application.create": "Added application",
    "application.update": "Updated application",
    "application.delete": "Deleted application",
    "application.cleared": "Cleared all applications",
    // Vault
    "vault.create": "Added vault entry",
    "vault.update": "Updated vault entry",
    "vault.delete": "Removed vault entry",
    // Wishlist
    "wishlist.create": "Added to wishlist",
    "wishlist.update": "Updated wishlist item",
    "wishlist.delete": "Removed from wishlist",
    // Inventory
    "inventory.create": "Added inventory item",
    "inventory.update": "Updated inventory item",
    "inventory.delete": "Removed inventory item",
    // Streaks
    "streak.checkin": "Streak check-in",
    "streak.undo_checkin": "Undone streak check-in",
    "streak.create": "Created streak",
    "streak.update": "Updated streak",
    "streak.delete": "Deleted streak",
    // Habits
    "habit.checkin": "Habit check-in",
    "habit.undo_checkin": "Undone habit check-in",
    "habit.create": "Created habit",
    "habit.update": "Updated habit",
    "habit.delete": "Deleted habit",
    // Study
    "study.create": "Logged study session",
    "study.delete": "Deleted study session",
    // Faith
    "faith.create": "Logged faith entry",
    "faith.delete": "Deleted faith entry",
    // University
    "deadline.create": "Added deadline",
    "deadline.update": "Updated deadline",
    "book.create": "Borrowed library book",
    "book.update": "Returned library book",
    "submission.create": "Logged submission",
    // Open source
    "opensource.create": "Added open source contribution",
    "opensource.update": "Updated contribution",
    "opensource.delete": "Removed contribution",
    "opensource.bulk_delete": "Bulk deleted contributions",
    // Modules and course
    "module.create": "Added module",
    "module.update": "Updated module",
    "module.delete": "Removed module",
    "grade.create": "Added grade",
    "grade.update": "Updated grade",
    "grade.delete": "Removed grade",
    // Health
    "health.create": "Logged health entry",
    "health.update": "Updated health entry",
    "health.delete": "Deleted health entry",
    "nutrition.create": "Logged a meal",
    "nutrition.delete": "Deleted a meal",
    "workout.create": "Logged a workout",
    "workout.delete": "Deleted a workout",
    "medication.taken": "Marked medication taken",
    "medication.undo": "Unmarked medication",
    // Contacts
    "contact.create": "Added contact",
    "contact.update": "Updated contact",
    "contact.delete": "Removed contact",
    // Calendar
    "calendar.create": "Added calendar event",
    "calendar.delete": "Removed calendar event",
    // Reminders
    "reminder.create": "Set a reminder",
    "reminder.update": "Completed a reminder",
    "reminder.delete": "Deleted a reminder",
    // Trash
    "trash.empty": "Emptied trash",
    "trash.permanent_delete": "Permanently deleted item",
    // Job scraper
    "scraper.cleared": "Cleared all scraped jobs",
    // Settings and system
    "pin.change": "Changed PIN",
    "settings.update": "Updated settings",
    "auth.login": "Signed in",
    // Workflow triggers (manual)
    "workflow.wakatime": "Triggered WakaTime sync",
    "workflow.scraper": "Triggered job scraper",
    "workflow.cv": "Triggered CV regeneration",
    "workflow.digest": "Triggered weekly digest",
    "workflow.discord": "Triggered Discord digest",
    // Automated sends (logged by cron routes)
    "digest.sent": "Weekly digest sent",
    "discord.sent": "Discord digest sent",
    "wakatime.synced": "WakaTime sync completed",
    "scraper.completed": "Job scraper completed",
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

function absoluteTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams
  const requestedPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)
  const { rows: logs, total } = await getActivityLogPage(requestedPage, PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-1">Activity log</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Every action taken on the dashboard{total > 0 ? ` - ${total.toLocaleString()} in total` : ""}.
      </p>

      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
      ) : (
        <>
          <ol className="space-y-1">
            {logs.map((log) => (
              <li key={log.id} className="flex items-start gap-3 text-sm py-2.5 border-b border-border/50 last:border-0">
                <div className="flex flex-col items-end shrink-0 w-28">
                  <span className="text-muted-foreground text-xs tabular-nums">{relativeTime(log.created_at)}</span>
                  <span className="text-muted-foreground/60 text-[10px] tabular-nums">{absoluteTime(log.created_at)}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium">{formatAction(log.action)}</span>
                  {log.detail && (
                    <span className="text-muted-foreground text-xs truncate">{log.detail}</span>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <Pagination
            page={page}
            totalPages={totalPages}
            baseHref="/dashboard/activity"
            totalItems={total}
            pageSize={PAGE_SIZE}
            itemLabel="actions"
            className="pt-6"
          />
        </>
      )}
    </div>
  )
}
