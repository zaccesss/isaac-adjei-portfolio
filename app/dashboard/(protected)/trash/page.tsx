// I use server actions for restore and delete here so I can call revalidatePath
// without a round-trip to an API route. Items are soft-deleted elsewhere and hard-
// deleted either here manually or by the daily trash-cleanup cron after 7 days.
import { getTrash, restoreFromTrash, permanentlyDelete } from "@/app/dashboard/actions"
import { revalidatePath } from "next/cache"
import { Trash2, RotateCcw, X } from "lucide-react"
import EmptyTrashButton from "./EmptyTrashButton"

export const dynamic = "force-dynamic"
export const metadata = { title: "Trash", robots: "noindex, nofollow" }

const TABLE_LABELS: Record<string, string> = {
  goals: "Goal",
  applications: "Application",
  vault: "Vault entry",
  diary: "Diary entry",
  notes: "Note",
  streaks: "Streak",
  wishlist: "Wishlist item",
  inventory_items: "Inventory item",
  opensource_contributions: "Open source contribution",
  contacts: "Contact",
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function daysUntilExpiry(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

function getDisplayName(item: { display_name: string | null; table_name: string; data: Record<string, unknown> }): string {
  if (item.display_name) return item.display_name
  const d = item.data
  return (
    (d.title as string) ??
    (d.name as string) ??
    (d.company ? `${d.company} - ${d.role ?? ""}` : null) ??
    (d.pr_title as string) ??
    "Untitled"
  )
}

async function handleRestore(formData: FormData) {
  "use server"
  const id = formData.get("id") as string
  await restoreFromTrash(id)
  revalidatePath("/dashboard/trash")
}

async function handleDelete(formData: FormData) {
  "use server"
  const id = formData.get("id") as string
  await permanentlyDelete(id)
  revalidatePath("/dashboard/trash")
}


export default async function TrashPage() {
  const items = await getTrash()

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trash2 className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold leading-tight">Trash</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Deleted items are kept for 7 days then permanently removed.
            </p>
          </div>
        </div>
        {items.length > 0 && <EmptyTrashButton count={items.length} />}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Trash2 className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">Trash is empty.</p>
        </div>
      ) : (
        <ol className="space-y-1">
          {items.map((item) => {
            const days = daysUntilExpiry(item.expires_at)
            return (
              <li key={item.id} className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {TABLE_LABELS[item.table_name] ?? item.table_name}
                    </span>
                    <span className="font-medium text-sm truncate">{getDisplayName(item)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{relativeTime(item.deleted_at)}</span>
                    <span className="text-xs text-muted-foreground/60">
                      · expires in {days} day{days !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <form action={handleRestore}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      title="Restore"
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </form>
                  <form action={handleDelete}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      title="Delete permanently"
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
