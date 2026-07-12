import { supabase } from "@/lib/supabase"

// Tables that "delete" by flipping is_deleted=true (the row stays) rather than removing it.
// Trash restore and purge treat them specially: re-inserting their original id would hit a
// PK conflict, and purging their trash entry must also remove the hidden row (and blob).
export const SOFT_DELETE_TABLES = new Set(["calendar_events", "user_files"])

// Hard-deletes the hidden row behind a soft-deleted trash item, plus the Storage blob for
// files. Shared by permanentlyDelete, emptyTrash and the trash-cleanup cron so all three
// purge paths behave identically. Returns an error message, or null on success.
export async function purgeSoftDeleted(item: {
  table_name: string
  original_id: string
  data: unknown
}): Promise<string | null> {
  if (!SOFT_DELETE_TABLES.has(item.table_name)) return null
  const { error } = await supabase.from(item.table_name).delete().eq("id", item.original_id)
  if (error) return error.message
  if (item.table_name === "user_files") {
    const path = (item.data as Record<string, unknown> | null)?.storage_path
    if (typeof path === "string" && path) {
      try {
        await supabase.storage.from("user-files").remove([path])
      } catch {
        // The blob is unreachable without its metadata row anyway; the row delete above is
        // what prevents the permanent hidden-row orphan.
      }
    }
  }
  return null
}
