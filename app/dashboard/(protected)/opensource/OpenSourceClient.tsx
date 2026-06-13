"use client"

import { useState, useTransition, useRef } from "react"
import {
  addOpenSourceContribution,
  updateOpenSourceContribution,
  deleteOpenSourceContribution,
  bulkDeleteOpenSourceContributions,
  type OpenSourceContribution,
} from "@/app/dashboard/actions"
import { Github, ExternalLink, Plus, Trash2, Download, Pencil } from "lucide-react"

// I define the valid status values and their badge colours in one place
// so the table cells and the add-row select are always in sync.
const STATUSES = ["draft", "open", "merged", "closed"] as const
type Status = (typeof STATUSES)[number]

const STATUS_COLOURS: Record<Status, string> = {
  draft:  "bg-muted text-muted-foreground",
  open:   "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  merged: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  closed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
}

// I track which column is sorted and in which direction for client-side sorting.
type SortKey = keyof OpenSourceContribution
type SortDir = "asc" | "desc" | null

// I keep the add-row form state in its own type for clarity.
type NewRow = {
  repo: string
  pr_title: string
  pr_url: string
  pr_number: string
  status: Status
  language: string
  notes: string
  submitted_at: string
}

const EMPTY_NEW_ROW: NewRow = {
  repo: "",
  pr_title: "",
  pr_url: "",
  pr_number: "",
  status: "open",
  language: "",
  notes: "",
  submitted_at: new Date().toISOString().slice(0, 16),
}

export default function OpenSourceClient({
  initial,
}: {
  initial: OpenSourceContribution[]
}) {
  // I keep a local copy of the rows so mutations are reflected immediately
  // without waiting for a server round-trip.
  const [rows, setRows] = useState<OpenSourceContribution[]>(initial)
  const [, startTransition] = useTransition()

  // I track editing state: null = no cell being edited
  const [editCell, setEditCell] = useState<{ id: string; field: string } | null>(null)
  const editRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>(null)

  // I track sort state: null direction means no sort applied (original order).
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  // I keep search and status filter as controlled inputs.
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all")

  // I track selected rows for bulk delete.
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // I show the add-row form when the user clicks "+ Add contribution".
  const [adding, setAdding] = useState(false)
  const [newRow, setNewRow] = useState<NewRow>(EMPTY_NEW_ROW)

  // I surface errors and success messages inline rather than using a toast library.
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null)

  // ── Derived values ────────────────────────────────────────────────────────

  // I compute the three stat cards from the current rows array.
  const total = rows.length
  const mergedCount = rows.filter((r) => r.status === "merged").length
  const thisMonthCount = rows.filter((r) => {
    const now = new Date()
    const d = new Date(r.submitted_at)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length

  // I apply search and status filter, then optional sort.
  const filtered = rows
    .filter((r) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        r.repo.toLowerCase().includes(q) ||
        r.pr_title.toLowerCase().includes(q) ||
        (r.notes ?? "").toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (!sortKey || !sortDir) return 0
      const va = a[sortKey] ?? ""
      const vb = b[sortKey] ?? ""
      const cmp = String(va).localeCompare(String(vb))
      return sortDir === "asc" ? cmp : -cmp
    })

  // ── Helpers ──────────────────────────────────────────────────────────────

  function flash(kind: "ok" | "err", text: string) {
    setMessage({ kind, text })
    setTimeout(() => setMessage(null), 3000)
  }

  function handleSort(key: SortKey) {
    // I cycle through: asc → desc → null (clear) on repeated clicks.
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir("asc")
    } else if (sortDir === "asc") {
      setSortDir("desc")
    } else {
      setSortKey(null)
      setSortDir(null)
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return null
    return sortDir === "asc" ? " ↑" : " ↓"
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((r) => r.id)))
    }
  }

  // ── Mutations ────────────────────────────────────────────────────────────

  async function handleAdd() {
    if (!newRow.repo.trim() || !newRow.pr_title.trim()) {
      flash("err", "Repository and PR title are required.")
      return
    }
    const payload = {
      repo: newRow.repo.trim(),
      pr_title: newRow.pr_title.trim(),
      pr_url: newRow.pr_url.trim() || null,
      pr_number: newRow.pr_number ? Number(newRow.pr_number) : null,
      status: newRow.status,
      language: newRow.language.trim() || null,
      notes: newRow.notes.trim() || null,
      submitted_at: newRow.submitted_at,
    }
    // I add an optimistic row immediately so the UI feels instant.
    const optimistic: OpenSourceContribution = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pr_url: payload.pr_url ?? null,
      pr_number: payload.pr_number ?? null,
      language: payload.language ?? null,
      notes: payload.notes ?? null,
      status: payload.status as Status,
    }
    setRows((prev) => [optimistic, ...prev])
    setAdding(false)
    setNewRow(EMPTY_NEW_ROW)
    startTransition(async () => {
      const result = await addOpenSourceContribution(payload)
      if (result && "error" in result) {
        // I revert the optimistic row on failure.
        setRows((prev) => prev.filter((r) => r.id !== optimistic.id))
        flash("err", "Failed to save contribution.")
      } else if (result) {
        // I replace the optimistic row with the real DB row.
        setRows((prev) => prev.map((r) => (r.id === optimistic.id ? (result as OpenSourceContribution) : r)))
        flash("ok", "Contribution added.")
      }
    })
  }

  async function handleCellSave(id: string, field: string, value: string) {
    setEditCell(null)
    const patch: Record<string, unknown> = {}
    // I coerce numeric fields back to numbers before sending the patch.
    if (field === "pr_number") {
      patch[field] = value ? Number(value) : null
    } else {
      patch[field] = value || null
    }
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    )
    startTransition(async () => {
      const result = await updateOpenSourceContribution(id, patch as Parameters<typeof updateOpenSourceContribution>[1])
      if (result && "error" in result) flash("err", "Failed to update.")
    })
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this contribution?")) return
    setRows((prev) => prev.filter((r) => r.id !== id))
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n })
    startTransition(async () => {
      await deleteOpenSourceContribution(id)
    })
  }

  async function handleBulkDelete() {
    const ids = [...selected]
    if (!ids.length) return
    if (!window.confirm(`Delete ${ids.length} contribution${ids.length === 1 ? "" : "s"}?`)) return
    setRows((prev) => prev.filter((r) => !selected.has(r.id)))
    setSelected(new Set())
    startTransition(async () => {
      await bulkDeleteOpenSourceContributions(ids)
    })
  }

  // ── Export ───────────────────────────────────────────────────────────────

  function handleExportCSV() {
    // I generate the CSV client-side and trigger a download via a blob URL.
    const headers = ["repo", "pr_title", "pr_url", "pr_number", "status", "language", "notes", "submitted_at"]
    const csvRows = [
      headers.join(","),
      ...filtered.map((r) =>
        headers.map((h) => {
          const v = String((r as Record<string, unknown>)[h] ?? "")
          // I quote fields that contain commas or newlines.
          return v.includes(",") || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v
        }).join(",")
      ),
    ]
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "opensource-contributions.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <Github className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold leading-tight">Open Source</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track pull requests and contributions to open source projects.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold mt-1">{total}</p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">Merged</p>
          <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{mergedCount}</p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">This month</p>
          <p className="text-2xl font-bold mt-1">{thisMonthCount}</p>
        </div>
      </div>

      {/* Flash message */}
      {message && (
        <div
          className={`text-sm rounded-md px-4 py-2 ${
            message.kind === "ok"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="search"
          placeholder="Search repo, title, notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-border rounded-md px-3 py-1.5 text-sm bg-background flex-1 min-w-[180px]"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as Status | "all")}
          className="border border-border rounded-md px-3 py-1.5 text-sm bg-background"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {selected.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete {selected.size}
          </button>
        )}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted"
        >
          <Download className="h-3.5 w-3.5" />
          CSV
        </button>
        <button
          onClick={() => { setAdding(true); setNewRow(EMPTY_NEW_ROW) }}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          Add contribution
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground uppercase tracking-wide">
              <th className="px-3 py-2 w-8">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              {(["repo", "pr_title", "pr_number", "status", "language", "submitted_at"] as SortKey[]).map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 cursor-pointer select-none hover:text-foreground whitespace-nowrap"
                  onClick={() => handleSort(col)}
                >
                  {col.replace(/_/g, " ")}
                  {sortIndicator(col)}
                </th>
              ))}
              <th className="px-3 py-2">Notes</th>
              <th className="px-3 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {/* Add row */}
            {adding && (
              <tr className="border-b border-border bg-muted/30">
                <td className="px-3 py-2" />
                <td className="px-3 py-2">
                  <input
                    autoFocus
                    value={newRow.repo}
                    onChange={(e) => setNewRow((p) => ({ ...p, repo: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="org/repo"
                    className="w-full border border-border rounded px-2 py-1 text-sm bg-background"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={newRow.pr_title}
                    onChange={(e) => setNewRow((p) => ({ ...p, pr_title: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="PR title"
                    className="w-full border border-border rounded px-2 py-1 text-sm bg-background"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={newRow.pr_number}
                    onChange={(e) => setNewRow((p) => ({ ...p, pr_number: e.target.value }))}
                    placeholder="#"
                    className="w-20 border border-border rounded px-2 py-1 text-sm bg-background"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={newRow.status}
                    onChange={(e) => setNewRow((p) => ({ ...p, status: e.target.value as Status }))}
                    className="border border-border rounded px-2 py-1 text-sm bg-background"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    value={newRow.language}
                    onChange={(e) => setNewRow((p) => ({ ...p, language: e.target.value }))}
                    placeholder="TypeScript"
                    className="w-28 border border-border rounded px-2 py-1 text-sm bg-background"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="datetime-local"
                    value={newRow.submitted_at}
                    onChange={(e) => setNewRow((p) => ({ ...p, submitted_at: e.target.value }))}
                    className="border border-border rounded px-2 py-1 text-sm bg-background"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={newRow.notes}
                    onChange={(e) => setNewRow((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Notes"
                    className="w-full border border-border rounded px-2 py-1 text-sm bg-background"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button onClick={handleAdd} className="px-2 py-0.5 text-xs rounded bg-primary text-primary-foreground">Save</button>
                    <button onClick={() => setAdding(false)} className="px-2 py-0.5 text-xs rounded border border-border hover:bg-muted">Cancel</button>
                  </div>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {filtered.length === 0 && !adding ? (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-muted-foreground text-sm">
                  No contributions yet. Add your first one above.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="group border-b border-border even:bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="rounded"
                    />
                  </td>

                  {/* repo */}
                  <EditCell
                    id={row.id}
                    field="repo"
                    value={row.repo}
                    editCell={editCell}
                    setEditCell={setEditCell}
                    onSave={handleCellSave}
                    editRef={editRef}
                  />

                  {/* pr_title with optional link */}
                  <td className="px-3 py-2">
                    {editCell?.id === row.id && editCell.field === "pr_title" ? (
                      <input
                        autoFocus
                        ref={editRef as React.RefObject<HTMLInputElement>}
                        defaultValue={row.pr_title}
                        onBlur={(e) => handleCellSave(row.id, "pr_title", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCellSave(row.id, "pr_title", (e.target as HTMLInputElement).value)
                          if (e.key === "Escape") setEditCell(null)
                        }}
                        className="w-full border border-border rounded px-2 py-0.5 text-sm bg-background"
                      />
                    ) : (
                      <span
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => setEditCell({ id: row.id, field: "pr_title" })}
                      >
                        <span className="group-hover:underline">{row.pr_title}</span>
                        {row.pr_url && (
                          <a
                            href={row.pr_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </span>
                    )}
                  </td>

                  {/* pr_number */}
                  <EditCell
                    id={row.id}
                    field="pr_number"
                    value={row.pr_number != null ? String(row.pr_number) : ""}
                    editCell={editCell}
                    setEditCell={setEditCell}
                    onSave={handleCellSave}
                    editRef={editRef}
                    inputType="number"
                    className="w-16"
                    display={row.pr_number != null ? `#${row.pr_number}` : ""}
                  />

                  {/* status badge */}
                  <td className="px-3 py-2">
                    {editCell?.id === row.id && editCell.field === "status" ? (
                      <select
                        autoFocus
                        ref={editRef as React.RefObject<HTMLSelectElement>}
                        defaultValue={row.status}
                        onBlur={(e) => handleCellSave(row.id, "status", e.target.value)}
                        onChange={(e) => handleCellSave(row.id, "status", e.target.value)}
                        className="border border-border rounded px-2 py-0.5 text-sm bg-background"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${STATUS_COLOURS[row.status as Status] ?? STATUS_COLOURS.open}`}
                        onClick={() => setEditCell({ id: row.id, field: "status" })}
                      >
                        {row.status}
                      </span>
                    )}
                  </td>

                  {/* language */}
                  <EditCell
                    id={row.id}
                    field="language"
                    value={row.language ?? ""}
                    editCell={editCell}
                    setEditCell={setEditCell}
                    onSave={handleCellSave}
                    editRef={editRef}
                    className="w-24"
                  />

                  {/* submitted_at */}
                  <EditCell
                    id={row.id}
                    field="submitted_at"
                    value={row.submitted_at.slice(0, 16)}
                    editCell={editCell}
                    setEditCell={setEditCell}
                    onSave={handleCellSave}
                    editRef={editRef}
                    inputType="datetime-local"
                    display={new Date(row.submitted_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  />

                  {/* notes */}
                  <EditCell
                    id={row.id}
                    field="notes"
                    value={row.notes ?? ""}
                    editCell={editCell}
                    setEditCell={setEditCell}
                    onSave={handleCellSave}
                    editRef={editRef}
                    className="w-40"
                  />

                  {/* actions */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setEditCell({ id: row.id, field: "notes" })}
                        title="Edit"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        title="Delete"
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// I extract the generic inline-edit cell into a small component so the table
// body stays readable without sacrificing the per-cell edit behaviour.
function EditCell({
  id,
  field,
  value,
  editCell,
  setEditCell,
  onSave,
  editRef,
  inputType = "text",
  className = "w-32",
  display,
}: {
  id: string
  field: string
  value: string
  editCell: { id: string; field: string } | null
  setEditCell: (v: { id: string; field: string } | null) => void
  onSave: (id: string, field: string, value: string) => void
  editRef: React.RefObject<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>
  inputType?: string
  className?: string
  display?: string
}) {
  const isEditing = editCell?.id === id && editCell.field === field
  return (
    <td className="px-3 py-2">
      {isEditing ? (
        <input
          autoFocus
          ref={editRef as React.RefObject<HTMLInputElement>}
          type={inputType}
          defaultValue={value}
          onBlur={(e) => onSave(id, field, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave(id, field, (e.target as HTMLInputElement).value)
            if (e.key === "Escape") setEditCell(null)
          }}
          className={`${className} border border-border rounded px-2 py-0.5 text-sm bg-background`}
        />
      ) : (
        <span
          className="cursor-pointer hover:underline text-sm"
          onClick={() => setEditCell({ id, field })}
        >
          {display ?? value ?? <span className="text-muted-foreground">-</span>}
        </span>
      )}
    </td>
  )
}
