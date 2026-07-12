import { supabase } from "@/lib/supabase"

// Tables that "delete" by flipping is_deleted=true (the row stays) rather than removing it.
// Trash restore and purge treat them specially: re-inserting their original id would hit a
// PK conflict, and purging their trash entry must also remove the hidden row (and blob).
export const SOFT_DELETE_TABLES = new Set(["calendar_events", "user_files"])

export type TrashChildSpec = { table: string; fk: string }

// Recoverable delete shared by the dashboard actions and the Discord bot: back the row up into the
// trash table (with any child rows nested under _children so a restore brings history with it), then
// remove it - soft-delete tables keep the row and flip is_deleted instead. Returns an error message,
// or null on success. On any backup failure it returns BEFORE deleting, so a row is never lost with no
// way back. The dashboard keeps its own thin moveToTrash (backup only, delete done per-action); this
// is the all-in-one the bot needs since it deletes outside a server action.
export async function trashAndDelete(
  tableName: string,
  id: string,
  displayName?: string,
  children?: TrashChildSpec[],
): Promise<string | null> {
  const { data, error } = await supabase.from(tableName).select("*").eq("id", id).maybeSingle()
  if (error) return `could not read ${tableName}: ${error.message}`
  if (!data) return null

  const snapshot: Record<string, unknown> = { ...data }
  if (children && children.length > 0) {
    const all: Record<string, unknown[]> = {}
    for (const child of children) {
      const rows: unknown[] = []
      for (let from = 0; ; from += 1000) {
        const { data: page, error: childErr } = await supabase.from(child.table).select("*").eq(child.fk, id).range(from, from + 999)
        if (childErr) return `could not read ${child.table}: ${childErr.message}`
        if (!page || page.length === 0) break
        rows.push(...page)
        if (page.length < 1000) break
      }
      if (rows.length > 0) all[child.table] = rows
    }
    if (Object.keys(all).length > 0) snapshot._children = all
  }

  const { error: insErr } = await supabase.from("trash").insert({
    table_name: tableName,
    original_id: id,
    display_name: displayName ?? (typeof data.name === "string" ? data.name : null),
    data: snapshot,
  })
  if (insErr) return `trash backup failed: ${insErr.message}`

  if (SOFT_DELETE_TABLES.has(tableName)) {
    const { error: delErr } = await supabase.from(tableName).update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", id)
    return delErr ? delErr.message : null
  }
  const { error: delErr } = await supabase.from(tableName).delete().eq("id", id)
  return delErr ? delErr.message : null
}

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
