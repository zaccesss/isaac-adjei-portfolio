"use client"

import { useState, useTransition, useRef } from "react"
import { motion } from "framer-motion"
import { dashboardPage } from "@/lib/animations"
import { FolderOpen, FolderPlus, Upload, File, Pencil, Trash2, Download, FolderInput, X, Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DashboardBreadcrumb from "@/app/dashboard/components/DashboardBreadcrumb"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import type { UserFile } from "@/app/dashboard/actions"
import { deleteFile, renameFile, moveFile, createDownloadSignedUrl } from "@/app/dashboard/actions"

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
  file, allFolders, onRename, onMove, onDownload, onDelete,
}: {
  file: UserFile
  allFolders: string[]
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
    <div className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors group">
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
            <select
              value={folderVal}
              onChange={(e) => setFolderVal(e.target.value)}
              aria-label="Move to folder"
              className="flex-1 text-xs px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
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

export default function FilesClient({ initial }: { initial: UserFile[] }) {
  const [files, setFiles] = useState<UserFile[]>(initial)
  const [activeFolder, setActiveFolder] = useState<string>("All")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [extraFolders, setExtraFolders] = useState<string[]>(loadStoredFolders)
  const [newFolder, setNewFolder] = useState<NewFolderState>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [, startTransition] = useTransition()
  const { confirm, dialog } = useConfirmDialog()
  const inputRef = useRef<HTMLInputElement>(null)

  const fileFolders = Array.from(new Set(files.map((f) => f.folder)))
  const allFolderPaths = Array.from(new Set([...fileFolders, ...extraFolders])).sort()
  const folders = ["All", ...allFolderPaths]

  const visibleFiles = activeFolder === "All" ? files : files.filter((f) => f.folder === activeFolder)

  function addFolder(path: string) {
    if (!path || allFolderPaths.includes(path)) return
    const next = [...extraFolders, path]
    setExtraFolders(next)
    saveStoredFolders(next)
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
    setFiles((prev) => prev.filter((f) => f.id !== file.id))
    startTransition(() => void deleteFile(file.id))
  }

  function handleRename(id: string, name: string) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)))
    startTransition(() => void renameFile(id, name))
  }

  function handleMove(id: string, folder: string) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, folder } : f)))
    addFolder(folder)
    startTransition(() => void moveFile(id, folder))
  }

  // Build tree: top-level folders + their children
  const topLevel = allFolderPaths.filter((f) => !f.includes("/"))
  const children = (parent: string) => allFolderPaths.filter((f) => f.startsWith(parent + "/") && f.split("/").length === parent.split("/").length + 1)

  function FolderEntry({ path, depth = 0 }: { path: string; depth?: number }) {
    const subs = children(path)
    const label = path.split("/").pop()!
    return (
      <>
        <button
          type="button"
          onClick={() => setActiveFolder(path)}
          className={`flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg text-sm transition-colors text-left ${
            activeFolder === path ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
        >
          <FolderOpen className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate flex-1">{label}</span>
          {subs.length > 0 && <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />}
        </button>
        {subs.map((sub) => <FolderEntry key={sub} path={sub} depth={depth + 1} />)}
        {newFolder?.parentPath === path && (
          <form onSubmit={handleCreateFolder} className="flex items-center gap-1 mt-0.5" style={{ paddingLeft: `${8 + (depth + 1) * 12}px` }}>
            <input autoFocus type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Subfolder name"
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
    <motion.div variants={dashboardPage} initial="hidden" animate="visible" className="flex flex-col gap-4 max-w-4xl">
      {dialog}
      <DashboardBreadcrumb crumbs={[{ label: "Files" }]} />

      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Files</h1>
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
        <div className="flex flex-col gap-0.5 w-[150px] shrink-0">
          <button
            type="button"
            onClick={() => setActiveFolder("All")}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors text-left ${
              activeFolder === "All" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <FolderOpen className="h-3.5 w-3.5 shrink-0" />
            <span>All</span>
          </button>

          {topLevel.map((f) => <FolderEntry key={f} path={f} />)}

          {/* Root-level new folder form */}
          {newFolder?.parentPath === "" && (
            <form onSubmit={handleCreateFolder} className="flex items-center gap-1 px-1 mt-0.5">
              <input autoFocus type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="flex-1 min-w-0 text-xs px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
                onKeyDown={(e) => { if (e.key === "Escape") { setNewFolder(null); setNewFolderName("") } }} />
              <button type="submit" title="Create" className="text-primary hover:text-primary/80"><Check className="h-3.5 w-3.5" /></button>
              <button type="button" title="Cancel" onClick={() => { setNewFolder(null); setNewFolderName("") }} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
            </form>
          )}

          <div className="flex flex-col gap-0.5 mt-1 border-t border-border/50 pt-1">
            <button type="button" onClick={() => { setNewFolder({ parentPath: "" }); setNewFolderName("") }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <FolderPlus className="h-3.5 w-3.5 shrink-0" /><span>New folder</span>
            </button>
            {activeFolder !== "All" && (
              <button type="button" onClick={() => { setNewFolder({ parentPath: activeFolder }); setNewFolderName("") }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <FolderPlus className="h-3.5 w-3.5 shrink-0" /><span>New subfolder</span>
              </button>
            )}
          </div>
        </div>

        {/* File list */}
        <div className="flex-1 min-w-0">
          {visibleFiles.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-10 text-center">
              <File className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">{activeFolder === "All" ? "No files yet" : `No files in ${activeFolder}`}</p>
              <p className="text-xs text-muted-foreground mb-4">Upload files to keep them organised here.</p>
              <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5 mr-1" />Upload
              </Button>
            </div>
          ) : (
            <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
              {visibleFiles.map((file) => (
                <FileRow key={file.id} file={file} allFolders={folders} onRename={handleRename} onMove={handleMove} onDownload={handleDownload} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
