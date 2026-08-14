"use client"

import { useState, useTransition, useRef } from "react"
import { motion } from "framer-motion"
import { dashboardPage } from "@/lib/animations"
import { FolderOpen, FolderPlus, Upload, File, Pencil, Trash2, Download, FolderInput, X, Check, ChevronRight, MoreHorizontal, FolderSymlink, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DashboardBreadcrumb from "@/app/dashboard/components/DashboardBreadcrumb"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import type { UserFile } from "@/app/dashboard/actions"
import { deleteFile, renameFile, moveFile, createDownloadSignedUrl } from "@/app/dashboard/actions"
import { savedOk } from "@/lib/save-result"
import { toast } from "sonner"

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`
  return `${(b / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function mimeIcon(mime: string): string {
  if (mime.startsWith("image/")) return "🖼"
  if (mime.startsWith("video/")) return "🎬"
  if (mime.startsWith("audio/")) return "🎵"
  if (mime.includes("pdf")) return "📄"
  if (mime.includes("zip") || mime.includes("tar") || mime.includes("gz")) return "📦"
  if (mime.includes("word") || mime.includes("document")) return "📝"
  if (mime.includes("sheet") || mime.includes("excel")) return "📊"
  if (mime.includes("presentation") || mime.includes("powerpoint")) return "📋"
  return "📁"
}

function loadStoredFolders(): string[] {
  try { return JSON.parse(localStorage.getItem("files:folders") ?? "[]") } catch { return [] }
}

function saveStoredFolders(folders: string[]) {
  try { localStorage.setItem("files:folders", JSON.stringify(folders)) } catch {}
}

function FileRow({
  file, allFolders, selected, onSelect, onRename, onMove, onDownload, onDelete,
}: {
  file: UserFile
  allFolders: string[]
  selected: boolean
  onSelect: () => void
  onRename: (id: string, name: string) => void
  onMove: (id: string, folder: string) => void
  onDownload: (file: UserFile) => void
  onDelete: (file: UserFile) => void
}) {
  const [editing, setEditing] = useState(false)
  const [movingTo, setMovingTo] = useState(false)
  const [nameVal, setNameVal] = useState(file.name)
  const [folderVal, setFolderVal] = useState(file.folder)

  function commitRename() {
    if (nameVal.trim() && nameVal.trim() !== file.name) onRename(file.id, nameVal.trim())
    setEditing(false)
  }

  function commitMove() {
    if (folderVal.trim() && folderVal.trim() !== file.folder) onMove(file.id, folderVal.trim())
    setMovingTo(false)
  }

  return (
    <div className={`flex items-center gap-3 px-3 py-2 transition-colors group ${selected ? "bg-primary/5" : "hover:bg-muted/50"}`}>
      <input type="checkbox" checked={selected} onChange={onSelect} aria-label={`Select ${file.name}`}
        className="h-3.5 w-3.5 shrink-0 accent-primary cursor-pointer" />
      <span className="text-lg shrink-0" aria-hidden="true">{mimeIcon(file.mime_type)}</span>
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <Input value={nameVal} onChange={(e) => setNameVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setEditing(false) }}
              className="h-7 text-sm py-0" autoFocus />
            <button type="button" onClick={commitRename} title="Save" className="text-primary hover:text-primary/80"><Check className="h-4 w-4" /></button>
            <button type="button" onClick={() => { setEditing(false); setNameVal(file.name) }} title="Cancel" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <p className="text-sm font-medium truncate">{file.name}</p>
        )}
        {movingTo ? (
          <div className="flex items-center gap-1.5 mt-1">
            <select value={folderVal} onChange={(e) => setFolderVal(e.target.value)} aria-label="Move to folder"
              className="flex-1 text-xs px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50">
              {allFolders.filter((f) => f !== "All").map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <button type="button" onClick={commitMove} title="Move" className="text-primary hover:text-primary/80"><Check className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => { setMovingTo(false); setFolderVal(file.folder) }} title="Cancel" className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{formatBytes(file.size_bytes)} · {formatDate(file.created_at)} · {file.folder}</p>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button type="button" onClick={() => onDownload(file)} title="Download" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Download className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => setEditing(true)} title="Rename" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => setMovingTo(true)} title="Move to folder" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><FolderInput className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => onDelete(file)} title="Delete" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  )
}

type NewFolderState = { parentPath: string } | null
type FolderAction = { type: "rename" | "move"; path: string } | null
type SortKey = "name" | "size" | "date"
type SortDir = "asc" | "desc"

export default function FilesClient({ initial }: { initial: UserFile[] }) {
  const [files, setFiles] = useState<UserFile[]>(initial)
  const [activeFolder, setActiveFolder] = useState<string>("All")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [extraFolders, setExtraFolders] = useState<string[]>(loadStoredFolders)
  const [newFolder, setNewFolder] = useState<NewFolderState>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [folderAction, setFolderAction] = useState<FolderAction>(null)
  const [folderActionVal, setFolderActionVal] = useState("")
  const [openMenuPath, setOpenMenuPath] = useState<string | null>(null)
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [, startTransition] = useTransition()
  const { confirm, dialog } = useConfirmDialog()
  const inputRef = useRef<HTMLInputElement>(null)

  const fileFolders = Array.from(new Set(files.map((f) => f.folder)))
  const allFolderPaths = Array.from(new Set([...fileFolders, ...extraFolders])).sort()
  const folders = ["All", ...allFolderPaths]

  const baseFiles = activeFolder === "All" ? files : files.filter((f) => f.folder === activeFolder)
  const searched = search.trim()
    ? baseFiles.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()) || f.folder.toLowerCase().includes(search.toLowerCase()))
    : baseFiles
  const visibleFiles = [...searched].sort((a, b) => {
    let cmp = 0
    if (sortKey === "name") cmp = a.name.localeCompare(b.name)
    else if (sortKey === "size") cmp = a.size_bytes - b.size_bytes
    else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return sortDir === "asc" ? cmp : -cmp
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ArrowUpDown className="h-3 w-3 opacity-30" />
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
  }

  function toggleSelect(id: string) {
    setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  function selectAll() {
    if (selected.size === visibleFiles.length) setSelected(new Set())
    else setSelected(new Set(visibleFiles.map((f) => f.id)))
  }

  async function handleBulkDelete() {
    const count = selected.size
    const ok = await confirm({
      title: `Delete ${count} file${count !== 1 ? "s" : ""}?`,
      description: "Selected files will be moved to trash and can be recovered from Trash.",
      confirmLabel: "Delete selected",
      destructive: true,
    })
    if (!ok) return
    const ids = Array.from(selected)
    const prev = files
    setFiles((p) => p.filter((f) => !ids.includes(f.id)))
    setSelected(new Set())
    startTransition(async () => {
      const results = await Promise.all(ids.map((id) => deleteFile(id)))
      if (results.some((r) => r && typeof r === "object" && "error" in r && (r as { error?: unknown }).error)) {
        setFiles(prev)
        toast.error("Could not delete some files")
      }
    })
  }

  async function handleBulkMove(folder: string) {
    const ids = Array.from(selected)
    const prev = files
    setFiles((p) => p.map((f) => ids.includes(f.id) ? { ...f, folder } : f))
    addFolder(folder)
    setSelected(new Set())
    startTransition(async () => {
      const results = await Promise.all(ids.map((id) => moveFile(id, folder)))
      if (results.some((r) => r && typeof r === "object" && "error" in r && (r as { error?: unknown }).error)) {
        setFiles(prev)
        toast.error("Could not move some files")
      }
    })
  }

  function persistFolders(next: string[]) {
    setExtraFolders(next)
    saveStoredFolders(next)
  }

  function addFolder(path: string) {
    if (!path || allFolderPaths.includes(path)) return
    persistFolders([...extraFolders, path])
  }

  function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault()
    const name = newFolderName.trim().replace(/\//g, "")
    if (!name) return
    const path = newFolder?.parentPath ? `${newFolder.parentPath}/${name}` : name
    addFolder(path)
    setActiveFolder(path)
    setNewFolder(null)
    setNewFolderName("")
  }

  // Rename a folder: update all files and all stored extra folders that use the old path prefix
  function handleRenameFolder(oldPath: string, newName: string) {
    const newLeaf = newName.trim().replace(/\//g, "")
    if (!newLeaf) return
    const parent = oldPath.includes("/") ? oldPath.split("/").slice(0, -1).join("/") : ""
    const newPath = parent ? `${parent}/${newLeaf}` : newLeaf
    if (newPath === oldPath || allFolderPaths.includes(newPath)) return

    // Rename all files whose folder starts with oldPath
    const updatedFiles = files.map((f) => {
      if (f.folder === oldPath || f.folder.startsWith(oldPath + "/")) {
        const newFolder = newPath + f.folder.slice(oldPath.length)
        return { ...f, folder: newFolder }
      }
      return f
    })
    setFiles(updatedFiles)
    // Update files in DB. Collected into one transition so a failure surfaces a single toast.
    const moves = updatedFiles.filter((f) => { const orig = files.find((o) => o.id === f.id); return orig && orig.folder !== f.folder }).map((f) => ({ id: f.id, folder: f.folder }))
    if (moves.length) startTransition(async () => {
      const results = await Promise.all(moves.map((m) => moveFile(m.id, m.folder)))
      if (results.some((r) => r && typeof r === "object" && "error" in r && (r as { error?: unknown }).error)) toast.error("Could not move some files")
    })

    // Update extraFolders
    const updatedExtra = extraFolders.map((p) => {
      if (p === oldPath || p.startsWith(oldPath + "/")) return newPath + p.slice(oldPath.length)
      return p
    })
    persistFolders(updatedExtra)
    if (activeFolder === oldPath || activeFolder.startsWith(oldPath + "/")) {
      setActiveFolder(newPath + activeFolder.slice(oldPath.length))
    }
    setFolderAction(null)
  }

  // Move a folder: prefix all its files and child folders with new parent
  function handleMoveFolder(oldPath: string, newParent: string) {
    const leaf = oldPath.split("/").pop()!
    const newPath = newParent ? `${newParent}/${leaf}` : leaf
    if (newPath === oldPath || allFolderPaths.includes(newPath)) return

    const updatedFiles = files.map((f) => {
      if (f.folder === oldPath || f.folder.startsWith(oldPath + "/")) {
        return { ...f, folder: newPath + f.folder.slice(oldPath.length) }
      }
      return f
    })
    setFiles(updatedFiles)
    const moves = updatedFiles.filter((f) => { const orig = files.find((o) => o.id === f.id); return orig && orig.folder !== f.folder }).map((f) => ({ id: f.id, folder: f.folder }))
    if (moves.length) startTransition(async () => {
      const results = await Promise.all(moves.map((m) => moveFile(m.id, m.folder)))
      if (results.some((r) => r && typeof r === "object" && "error" in r && (r as { error?: unknown }).error)) toast.error("Could not move some files")
    })

    const updatedExtra = extraFolders.map((p) => {
      if (p === oldPath || p.startsWith(oldPath + "/")) return newPath + p.slice(oldPath.length)
      return p
    })
    persistFolders(updatedExtra)
    if (activeFolder === oldPath || activeFolder.startsWith(oldPath + "/")) {
      setActiveFolder(newPath + activeFolder.slice(oldPath.length))
    }
    setFolderAction(null)
  }

  // Delete a folder: move all its files to General, remove from extraFolders
  async function handleDeleteFolder(path: string) {
    const fileCount = files.filter((f) => f.folder === path || f.folder.startsWith(path + "/")).length
    const ok = await confirm({
      title: `Delete folder "${path.split("/").pop()}"?`,
      description: fileCount > 0
        ? `${fileCount} file${fileCount !== 1 ? "s" : ""} inside will be moved to General. The folder cannot be recovered.`
        : "This empty folder will be removed.",
      confirmLabel: "Delete folder",
      destructive: true,
    })
    if (!ok) return

    const movedIds: string[] = []
    const updatedFiles = files.map((f) => {
      if (f.folder === path || f.folder.startsWith(path + "/")) {
        movedIds.push(f.id)
        return { ...f, folder: "General" }
      }
      return f
    })
    setFiles(updatedFiles)
    if (movedIds.length) startTransition(async () => {
      const results = await Promise.all(movedIds.map((id) => moveFile(id, "General")))
      if (results.some((r) => r && typeof r === "object" && "error" in r && (r as { error?: unknown }).error)) toast.error("Could not move some files")
    })

    const updatedExtra = extraFolders.filter((p) => p !== path && !p.startsWith(path + "/"))
    persistFolders(updatedExtra)
    if (activeFolder === path || activeFolder.startsWith(path + "/")) setActiveFolder("All")
    setOpenMenuPath(null)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    if (!picked.length) return
    setUploading(true)
    setUploadError(null)
    for (const file of picked) {
      const folder = activeFolder === "All" ? "General" : activeFolder
      const fd = new FormData()
      fd.append("file", file)
      fd.append("folder", folder)
      const res = await fetch("/api/files", { method: "POST", body: fd })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setUploadError((body as { error?: string }).error ?? "Upload failed. Please try again.")
        break
      }
      const inserted = await res.json() as UserFile
      setFiles((prev) => [inserted, ...prev])
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleDownload(file: UserFile) {
    const result = await createDownloadSignedUrl(file.storage_path)
    if (!result || "error" in result) return
    const a = document.createElement("a")
    a.href = result.signedUrl
    a.download = file.original_name
    a.click()
  }

  async function handleDelete(file: UserFile) {
    const ok = await confirm({
      title: `Delete "${file.name}"?`,
      description: "This file will be moved to trash. It can be recovered from Trash.",
      confirmLabel: "Delete",
      destructive: true,
    })
    if (!ok) return
    const prev = files
    setFiles((p) => p.filter((f) => f.id !== file.id))
    startTransition(async () => {
      if (!savedOk(await deleteFile(file.id), "Could not delete file")) setFiles(prev)
    })
  }

  function handleRenameFile(id: string, name: string) {
    const prev = files
    setFiles((p) => p.map((f) => (f.id === id ? { ...f, name } : f)))
    startTransition(async () => {
      if (!savedOk(await renameFile(id, name), "Could not rename file")) setFiles(prev)
    })
  }

  function handleMoveFile(id: string, folder: string) {
    const prev = files
    setFiles((p) => p.map((f) => (f.id === id ? { ...f, folder } : f)))
    addFolder(folder)
    startTransition(async () => {
      if (!savedOk(await moveFile(id, folder), "Could not move file")) setFiles(prev)
    })
  }

  const topLevel = allFolderPaths.filter((f) => !f.includes("/"))
  const children = (parent: string) =>
    allFolderPaths.filter((f) => f.startsWith(parent + "/") && f.split("/").length === parent.split("/").length + 1)

  // Move targets: all folders except the folder being moved and its descendants
  function moveCandidates(excludePath: string) {
    return ["(root)", ...allFolderPaths.filter((p) => p !== excludePath && !p.startsWith(excludePath + "/"))]
  }

  // Tailwind depth-to-padding classes (8px base + 12px per level)
  const DEPTH_PL = ["pl-2", "pl-5", "pl-8", "pl-11", "pl-14"] as const
  const DEPTH_ML = ["ml-0", "ml-3", "ml-6", "ml-9", "ml-12"] as const

  function FolderEntry({ path, depth = 0 }: { path: string; depth?: number }) {
    const subs = children(path)
    const label = path.split("/").pop()!
    const isActive = activeFolder === path
    const menuOpen = openMenuPath === path
    const isCollapsed = collapsedFolders.has(path)
    const pl = DEPTH_PL[Math.min(depth, DEPTH_PL.length - 1)]
    const childPl = DEPTH_PL[Math.min(depth + 1, DEPTH_PL.length - 1)]
    const ml = DEPTH_ML[Math.min(depth, DEPTH_ML.length - 1)]

    function toggleCollapse(e: React.MouseEvent) {
      e.stopPropagation()
      setCollapsedFolders((prev) => {
        const next = new Set(prev)
        if (next.has(path)) next.delete(path)
        else next.add(path)
        return next
      })
    }

    const isRenamingThis = folderAction?.type === "rename" && folderAction.path === path
    const isMovingThis = folderAction?.type === "move" && folderAction.path === path

    return (
      <>
        <div className="relative group/folder">
          <button
            type="button"
            onClick={() => { setActiveFolder(path); setOpenMenuPath(null) }}
            className={`flex items-center gap-1.5 w-full rounded-lg text-sm transition-colors text-left py-1.5 pr-6 ${pl} ${
              isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <FolderOpen className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate flex-1">{label}</span>
            {subs.length > 0 && (
              <span onClick={toggleCollapse} title={isCollapsed ? "Expand" : "Collapse"}
                className="p-0.5 rounded hover:bg-muted/80 transition-colors">
                <ChevronRight className={`h-3 w-3 shrink-0 opacity-50 transition-transform ${isCollapsed ? "" : "rotate-90"}`} />
              </span>
            )}
          </button>

          {/* Folder action menu trigger */}
          <button
            type="button"
            title="Folder options"
            onClick={(e) => { e.stopPropagation(); setOpenMenuPath(menuOpen ? null : path); setFolderAction(null) }}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded opacity-0 group-hover/folder:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className={`absolute left-0 right-0 top-full z-20 mt-0.5 rounded-lg border border-border bg-popover shadow-md py-1 text-xs ${ml}`}>
              <button type="button" onClick={() => { setFolderAction({ type: "rename", path }); setFolderActionVal(label); setOpenMenuPath(null) }}
                className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-muted transition-colors">
                <Pencil className="h-3 w-3" /> Rename
              </button>
              <button type="button" onClick={() => { setFolderAction({ type: "move", path }); setFolderActionVal("(root)"); setOpenMenuPath(null) }}
                className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-muted transition-colors">
                <FolderSymlink className="h-3 w-3" /> Move into folder
              </button>
              <button type="button" onClick={() => { setOpenMenuPath(null); void handleDeleteFolder(path) }}
                className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-muted transition-colors text-destructive">
                <Trash2 className="h-3 w-3" /> Delete folder
              </button>
            </div>
          )}
        </div>

        {/* Inline rename */}
        {isRenamingThis && (
          <form onSubmit={(e) => { e.preventDefault(); handleRenameFolder(path, folderActionVal) }}
            className={`flex items-center gap-1 mt-0.5 pr-1 ${pl}`}>
            <input autoFocus type="text" value={folderActionVal} onChange={(e) => setFolderActionVal(e.target.value)}
              aria-label="Rename folder"
              className="flex-1 min-w-0 text-xs px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
              onKeyDown={(e) => { if (e.key === "Escape") setFolderAction(null) }} />
            <button type="submit" title="Save" className="text-primary hover:text-primary/80"><Check className="h-3.5 w-3.5" /></button>
            <button type="button" title="Cancel" onClick={() => setFolderAction(null)} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
          </form>
        )}

        {/* Inline move */}
        {isMovingThis && (
          <div className={`flex items-center gap-1 mt-0.5 pr-1 ${pl}`}>
            <select value={folderActionVal} onChange={(e) => setFolderActionVal(e.target.value)} aria-label="Move folder into"
              className="flex-1 min-w-0 text-xs px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50">
              {moveCandidates(path).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="button" title="Move" onClick={() => handleMoveFolder(path, folderActionVal === "(root)" ? "" : folderActionVal)}
              className="text-primary hover:text-primary/80"><Check className="h-3.5 w-3.5" /></button>
            <button type="button" title="Cancel" onClick={() => setFolderAction(null)} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}

        {!isCollapsed && subs.map((sub) => <FolderEntry key={sub} path={sub} depth={depth + 1} />)}

        {/* New subfolder inline form */}
        {!isCollapsed && newFolder?.parentPath === path && (
          <form onSubmit={handleCreateFolder} className={`flex items-center gap-1 mt-0.5 pr-1 ${childPl}`}>
            <input autoFocus type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Subfolder name" aria-label="New subfolder name"
              className="flex-1 min-w-0 text-xs px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
              onKeyDown={(e) => { if (e.key === "Escape") { setNewFolder(null); setNewFolderName("") } }} />
            <button type="submit" title="Create" className="text-primary hover:text-primary/80"><Check className="h-3.5 w-3.5" /></button>
            <button type="button" title="Cancel" onClick={() => { setNewFolder(null); setNewFolderName("") }} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
          </form>
        )}
      </>
    )
  }

  return (
    <motion.div variants={dashboardPage} initial="hidden" animate="visible" className="flex flex-col gap-4 max-w-5xl"
      onClick={() => { if (openMenuPath) setOpenMenuPath(null) }}>
      {dialog}
      <DashboardBreadcrumb crumbs={[{ label: "File Manager" }]} />

      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">File Manager</h1>
          <p className="text-xs text-muted-foreground">{files.length} file{files.length !== 1 ? "s" : ""} across {allFolderPaths.length} folder{allFolderPaths.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input ref={inputRef} type="file" multiple className="hidden" onChange={handleUpload} aria-label="Upload files" />
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {uploadError && (
        <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 flex items-center justify-between">
          <span>{uploadError}</span>
          <button type="button" title="Dismiss" onClick={() => setUploadError(null)} className="ml-2"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      <div className="flex gap-4">
        {/* Folder sidebar */}
        <div className="flex flex-col gap-0.5 w-[160px] shrink-0">
          <button type="button" onClick={() => { setActiveFolder("All"); setOpenMenuPath(null) }}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors text-left ${
              activeFolder === "All" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}>
            <FolderOpen className="h-3.5 w-3.5 shrink-0" />
            <span>All files</span>
          </button>

          {topLevel.map((f) => <FolderEntry key={f} path={f} />)}

          {newFolder?.parentPath === "" && (
            <form onSubmit={handleCreateFolder} className="flex items-center gap-1 px-1 mt-0.5">
              <input autoFocus type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name" aria-label="New folder name"
                className="flex-1 min-w-0 text-xs px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
                onKeyDown={(e) => { if (e.key === "Escape") { setNewFolder(null); setNewFolderName("") } }} />
              <button type="submit" title="Create" className="text-primary hover:text-primary/80"><Check className="h-3.5 w-3.5" /></button>
              <button type="button" title="Cancel" onClick={() => { setNewFolder(null); setNewFolderName("") }} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
            </form>
          )}

          <div className="flex flex-col gap-0.5 mt-1 border-t border-border/50 pt-1">
            <button type="button" onClick={() => { setNewFolder({ parentPath: "" }); setNewFolderName(""); setOpenMenuPath(null) }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <FolderPlus className="h-3.5 w-3.5 shrink-0" /><span>New folder</span>
            </button>
            {activeFolder !== "All" && (
              <button type="button" onClick={() => { setNewFolder({ parentPath: activeFolder }); setNewFolderName(""); setOpenMenuPath(null) }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <FolderPlus className="h-3.5 w-3.5 shrink-0" /><span>New subfolder</span>
              </button>
            )}
          </div>
        </div>

        {/* File list */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Search + sort toolbar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..." aria-label="Search files"
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {(["name", "date", "size"] as SortKey[]).map((k) => (
                <button key={k} type="button" onClick={() => toggleSort(k)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs transition-colors capitalize ${sortKey === k ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  {k} <SortIcon k={k} />
                </button>
              ))}
            </div>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-xs">
              <span className="font-medium text-primary">{selected.size} selected</span>
              <span className="text-muted-foreground">-</span>
              <div className="flex items-center gap-1.5">
                <select aria-label="Move selected to folder" onChange={(e) => { if (e.target.value) { void handleBulkMove(e.target.value); e.target.value = "" } }}
                  className="text-xs px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50">
                  <option value="">Move to...</option>
                  {allFolderPaths.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <button type="button" title="Delete selected" onClick={() => void handleBulkDelete()} className="px-2 py-1 rounded text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button type="button" title="Clear selection" onClick={() => setSelected(new Set())} className="px-2 py-1 rounded text-muted-foreground hover:bg-muted transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {visibleFiles.length === 0 && baseFiles.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-10 text-center">
              <File className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">{activeFolder === "All" ? "No files yet" : `No files in ${activeFolder.split("/").pop()}`}</p>
              <p className="text-xs text-muted-foreground mb-4">Upload files to keep them organised here.</p>
              <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5 mr-1" />Upload
              </Button>
            </div>
          ) : visibleFiles.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-8 text-center">
              <Search className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No files match &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden">
              {/* Select-all header */}
              <div className="flex items-center gap-3 px-3 py-1.5 border-b border-border bg-muted/30">
                <input type="checkbox" aria-label="Select all files"
                  checked={selected.size === visibleFiles.length && visibleFiles.length > 0}
                  onChange={selectAll}
                  className="h-3.5 w-3.5 accent-primary cursor-pointer" />
                <span className="text-xs text-muted-foreground">{visibleFiles.length} file{visibleFiles.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y divide-border">
                {visibleFiles.map((file) => (
                  <FileRow key={file.id} file={file} allFolders={folders}
                    selected={selected.has(file.id)} onSelect={() => toggleSelect(file.id)}
                    onRename={handleRenameFile} onMove={handleMoveFile} onDownload={handleDownload} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
