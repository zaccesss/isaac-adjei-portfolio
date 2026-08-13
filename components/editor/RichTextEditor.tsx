"use client"
// I provide one shared TipTap rich text editor for notes and diary. It reads and writes markdown
// (via tiptap-markdown) so existing markdown content needs no migration and the markdown viewer
// (MarkdownContent) and the .md export keep working unchanged. The content classes mirror
// MarkdownContent's prose styling so the editor and the rendered note look the same.

import { useEffect, useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Placeholder from "@tiptap/extension-placeholder"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { Markdown } from "tiptap-markdown"
import { common, createLowlight } from "lowlight"
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, ListChecks, Code, Quote, Link as LinkIcon, Image as ImageIcon, Undo, Redo,
} from "lucide-react"

const lowlight = createLowlight(common)

function Tb({ onClick, active, disabled, title, children }: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 ${active ? "bg-muted text-foreground" : ""}`}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({ value, onChange, placeholder }: {
  value: string
  onChange: (markdown: string) => void
  placeholder?: string
}) {
  // I track the last markdown I synced so an external value change (switching notes) resets the
  // document, while my own keystrokes never trigger a reset - this avoids a caret jump and the
  // re-sync loop that markdown normalisation would otherwise cause.
  const lastSynced = useRef(value)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: placeholder ?? "Start writing..." }),
      CodeBlockLowlight.configure({ lowlight }),
      Markdown.configure({ html: false, linkify: true, breaks: true, transformPastedText: true }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert prose-sm max-w-none focus:outline-none min-h-[280px] py-2",
      },
    },
    onUpdate: ({ editor }) => {
      const md = editor.storage.markdown.getMarkdown()
      lastSynced.current = md
      onChange(md)
    },
  })

  // I sync an external value change (switching to a different note) without disturbing the caret while
  // typing: my own keystrokes set lastSynced in onUpdate, so value already matches and nothing resets.
  // false = do not emit an update, so this external sync never re-triggers onChange.
  useEffect(() => {
    if (!editor) return
    if (value !== lastSynced.current) {
      lastSynced.current = value
      editor.commands.setContent(value || "", false)
    }
  }, [value, editor])

  if (!editor) return null

  const addLink = () => {
    const url = window.prompt("Link URL")
    if (url === null) return
    if (url === "") { editor.chain().focus().unsetLink().run(); return }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }
  // I upload the chosen image to the private bucket and insert the auth-gated proxy URL, so images in
  // notes and diary entries stay private rather than living at a public storage URL.
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/dashboard/upload-note-image", { method: "POST", body: form })
      const json = await res.json()
      if (res.ok && json.url) editor.chain().focus().setImage({ src: json.url }).run()
      else window.alert(json.error || "Image upload failed")
    } catch {
      window.alert("Image upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col border border-border rounded-lg overflow-hidden flex-1 min-h-0">
      <div className="flex items-center gap-0.5 flex-wrap border-b border-border px-1.5 py-1 bg-muted/30 shrink-0">
        <Tb title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-3.5 w-3.5" /></Tb>
        <Tb title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-3.5 w-3.5" /></Tb>
        <Tb title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-3.5 w-3.5" /></Tb>
        <span className="w-px h-4 bg-border mx-0.5" />
        <Tb title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-3.5 w-3.5" /></Tb>
        <Tb title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-3.5 w-3.5" /></Tb>
        <Tb title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-3.5 w-3.5" /></Tb>
        <span className="w-px h-4 bg-border mx-0.5" />
        <Tb title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-3.5 w-3.5" /></Tb>
        <Tb title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-3.5 w-3.5" /></Tb>
        <Tb title="Checklist" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}><ListChecks className="h-3.5 w-3.5" /></Tb>
        <span className="w-px h-4 bg-border mx-0.5" />
        <Tb title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code className="h-3.5 w-3.5" /></Tb>
        <Tb title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-3.5 w-3.5" /></Tb>
        <Tb title="Link" active={editor.isActive("link")} onClick={addLink}><LinkIcon className="h-3.5 w-3.5" /></Tb>
        <Tb title={uploading ? "Uploading..." : "Image"} disabled={uploading} onClick={() => fileInputRef.current?.click()}><ImageIcon className="h-3.5 w-3.5" /></Tb>
        <span className="w-px h-4 bg-border mx-0.5" />
        <Tb title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo className="h-3.5 w-3.5" /></Tb>
        <Tb title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo className="h-3.5 w-3.5" /></Tb>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" aria-label="Upload image" className="hidden" onChange={handleImageFile} />
      <EditorContent editor={editor} className="px-3 overflow-y-auto flex-1 min-h-0" />
    </div>
  )
}
