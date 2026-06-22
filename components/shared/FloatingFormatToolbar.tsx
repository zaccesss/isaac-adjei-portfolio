"use client"

// Floating text formatting toolbar.
// Appears when the user selects text in any dashboard textarea or input.
// Markdown textareas (data-markdown-editor="true"): B / I / S / Link buttons.
// Plain inputs/textareas: Link button only.
//
// The toolbar is portaled to document.body so it can sit above anything, but that means it
// renders OUTSIDE the React root container - and React's synthetic events (onClick etc.) do
// not fire reliably for such portals. So the button press is handled with a NATIVE listener
// on the toolbar node instead: it preventDefaults (keeps the editor's selection from
// collapsing) and stopPropagations (so a Radix Dialog's dismissable layer does not treat the
// press as an outside click and close the dialog), then applies the formatting.

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { Bold, Italic, Strikethrough, Link } from "lucide-react"

type FormatType = "bold" | "italic" | "strike" | "link"

// ── helpers ──────────────────────────────────────────────────────────────────

// Trigger React's onChange for a controlled input/textarea by using the
// native prototype setter, which bypasses React's tracking of previous value.
function triggerReactChange(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set
  setter?.call(el, value)
  el.dispatchEvent(new Event("input", { bubbles: true }))
  el.dispatchEvent(new Event("change", { bubbles: true }))
}

// Wrap the current selection with before/after strings and keep the inner
// text selected so the user can immediately re-format or type over it.
function wrapSelection(el: HTMLInputElement | HTMLTextAreaElement, before: string, after: string) {
  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? 0
  const selected = el.value.slice(start, end)
  const next = el.value.slice(0, start) + before + selected + after + el.value.slice(end)
  triggerReactChange(el, next)
  // Restore selection inside the wrapping characters
  requestAnimationFrame(() => {
    el.setSelectionRange(start + before.length, end + before.length)
    el.focus()
  })
}

// Apply a markdown link. If the selected text looks like a URL, convert to
// [](url) and leave cursor between the square brackets for the user to type a
// label. Otherwise convert to [text]() and leave cursor between parentheses
// for the user to type the URL.
function applyLink(el: HTMLInputElement | HTMLTextAreaElement) {
  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? 0
  const selected = el.value.slice(start, end)

  let inserted: string
  let cursorAt: number

  if (/^https?:\/\//i.test(selected)) {
    inserted = `[](${selected})`
    cursorAt = start + 1
  } else {
    inserted = `[${selected}]()`
    cursorAt = start + selected.length + 3
  }

  const next = el.value.slice(0, start) + inserted + el.value.slice(end)
  triggerReactChange(el, next)
  requestAnimationFrame(() => {
    el.setSelectionRange(cursorAt, cursorAt)
    el.focus()
  })
}

// ── component ────────────────────────────────────────────────────────────────

interface ToolbarState {
  visible: boolean
  x: number
  y: number
  isMarkdown: boolean
}

export default function FloatingFormatToolbar() {
  const [toolbar, setToolbar] = useState<ToolbarState>({ visible: false, x: 0, y: 0, isMarkdown: false })
  // The element that was active when the toolbar appeared, so the buttons can still operate
  // on it after the press.
  const activeElRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  // The exact selection range when the toolbar appeared, restored before formatting in case
  // anything collapsed it.
  const selRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 })
  const toolbarRef = useRef<HTMLDivElement | null>(null)

  const hide = useCallback(() => {
    setToolbar((t) => ({ ...t, visible: false }))
    activeElRef.current = null
  }, [])

  const handleFormat = useCallback((type: FormatType) => {
    const el = activeElRef.current
    if (!el) return
    el.focus()
    el.selectionStart = selRef.current.start
    el.selectionEnd = selRef.current.end
    if (type === "bold") wrapSelection(el, "**", "**")
    else if (type === "italic") wrapSelection(el, "_", "_")
    else if (type === "strike") wrapSelection(el, "~~", "~~")
    else applyLink(el)
    setTimeout(hide, 50)
  }, [hide])

  const checkSelection = useCallback(() => {
    const el = document.activeElement
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return
    if ((el as HTMLInputElement).type === "password" || (el as HTMLInputElement).type === "hidden") return

    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    if (start === end) {
      hide()
      return
    }
    selRef.current = { start, end }

    const isMarkdown = el.dataset.markdownEditor === "true"
    const rect = el.getBoundingClientRect()
    const TOOLBAR_H = 40
    const GAP = 6
    const rawTop = rect.top - TOOLBAR_H - GAP
    const y = rawTop < 8 ? rect.bottom + GAP : rawTop
    const x = Math.min(Math.max(8, rect.left + rect.width / 2 - 80), window.innerWidth - 168)

    activeElRef.current = el
    setToolbar({ visible: true, x, y, isMarkdown })
  }, [hide])

  useEffect(() => {
    document.addEventListener("mouseup", checkSelection)
    document.addEventListener("keyup", checkSelection)

    // Hide when the user presses anywhere outside the toolbar (real outside click)
    function onPointerDown(e: PointerEvent) {
      if (toolbarRef.current && toolbarRef.current.contains(e.target as Node)) return
      hide()
    }
    document.addEventListener("pointerdown", onPointerDown)

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") hide()
    }
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("mouseup", checkSelection)
      document.removeEventListener("keyup", checkSelection)
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [checkSelection, hide])

  // Native press handling on the toolbar node. React synthetic events are unreliable for a
  // portal rendered to document.body, so we attach directly to the node: preventDefault keeps
  // the editor's selection alive, stopPropagation keeps the Radix Dialog from dismissing, and
  // we resolve which button was pressed via its data-format attribute.
  useEffect(() => {
    const node = toolbarRef.current
    if (!toolbar.visible || !node) return
    const onPress = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-format]")
      const fmt = btn?.dataset.format as FormatType | undefined
      if (fmt) handleFormat(fmt)
    }
    // mousedown also prevented so the press never blurs the editor on mouse devices
    const onMouseDown = (e: Event) => { e.preventDefault(); e.stopPropagation() }
    node.addEventListener("pointerdown", onPress)
    node.addEventListener("mousedown", onMouseDown)
    return () => {
      node.removeEventListener("pointerdown", onPress)
      node.removeEventListener("mousedown", onMouseDown)
    }
  }, [toolbar.visible, handleFormat])

  if (!toolbar.visible || typeof document === "undefined") return null

  const btnClass =
    "flex items-center justify-center w-7 h-7 rounded hover:bg-white/10 transition-colors text-white/90 hover:text-white disabled:opacity-40"

  return createPortal(
    <div
      ref={toolbarRef}
      // data-floating-toolbar lets the shared Dialog recognise the toolbar and not dismiss when it
      // is pressed. pointerEvents:auto overrides the pointer-events:none that a Radix modal Dialog
      // puts on <body> - without it the toolbar (portaled to body) is unhoverable and clicks fall
      // through to the overlay, closing the dialog instead of formatting.
      data-floating-toolbar=""
      style={{ position: "fixed", top: toolbar.y, left: toolbar.x, zIndex: 9999, pointerEvents: "auto" }}
    >
      <div className="flex items-center gap-0.5 rounded-lg bg-zinc-800 border border-zinc-700 shadow-lg px-1 py-1">
        {toolbar.isMarkdown && (
          <>
            <button type="button" data-format="bold" title="Bold" className={btnClass}>
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button type="button" data-format="italic" title="Italic" className={btnClass}>
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button type="button" data-format="strike" title="Strikethrough" className={btnClass}>
              <Strikethrough className="h-3.5 w-3.5" />
            </button>
            <div className="w-px h-4 bg-zinc-600 mx-0.5" />
          </>
        )}
        <button type="button" data-format="link" title="Link" className={btnClass}>
          <Link className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>,
    document.body
  )
}
