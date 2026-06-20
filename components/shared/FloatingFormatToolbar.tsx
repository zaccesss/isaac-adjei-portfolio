"use client"

// Floating text formatting toolbar.
// Appears when the user selects text in any dashboard textarea or input.
// Markdown textareas (data-markdown-editor="true"): B / I / S / Link buttons.
// Plain inputs/textareas: Link button only.
// Only commits formatting when a button is clicked - does not interfere with
// normal typing or selection.

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { Bold, Italic, Strikethrough, Link } from "lucide-react"

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
    // Selected text is a URL - leave display label blank
    inserted = `[](${selected})`
    cursorAt = start + 1
  } else {
    // Selected text is a label - leave URL blank
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
  // Keep a ref to the element that was active when the toolbar appeared so
  // the format buttons can still operate on it after focus shifts to the toolbar.
  const activeElRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const hide = useCallback(() => {
    setToolbar((t) => ({ ...t, visible: false }))
    activeElRef.current = null
  }, [])

  const checkSelection = useCallback((e: Event) => {
    const el = document.activeElement
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
      return
    }
    // Ignore password and hidden fields
    if ((el as HTMLInputElement).type === "password" || (el as HTMLInputElement).type === "hidden") return

    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    if (start === end) {
      hide()
      return
    }

    const isMarkdown = el.dataset.markdownEditor === "true"
    const rect = el.getBoundingClientRect()

    // Position the toolbar centred above the input.
    // If that would clip off the top of the viewport, put it below instead.
    const TOOLBAR_H = 40
    const GAP = 6
    const rawTop = rect.top - TOOLBAR_H - GAP
    const y = rawTop < 8 ? rect.bottom + GAP : rawTop
    const x = Math.min(
      Math.max(8, rect.left + rect.width / 2 - 80),
      window.innerWidth - 168
    )

    activeElRef.current = el
    setToolbar({ visible: true, x, y, isMarkdown })
  }, [hide])

  useEffect(() => {
    document.addEventListener("mouseup", checkSelection)
    document.addEventListener("keyup", checkSelection)

    // Hide toolbar when user clicks anywhere outside it
    function onPointerDown(e: PointerEvent) {
      if (toolbarRef.current && toolbarRef.current.contains(e.target as Node)) return
      hide()
    }
    document.addEventListener("pointerdown", onPointerDown)

    // Hide on Escape
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

  if (!toolbar.visible || typeof document === "undefined") return null

  const el = activeElRef.current

  function handleFormat(type: "bold" | "italic" | "strike" | "link") {
    if (!el) return
    if (type === "bold") wrapSelection(el, "**", "**")
    else if (type === "italic") wrapSelection(el, "_", "_")
    else if (type === "strike") wrapSelection(el, "~~", "~~")
    else applyLink(el)
    // Give the focus time to settle before rechecking selection
    setTimeout(hide, 50)
  }

  const btnClass =
    "flex items-center justify-center w-7 h-7 rounded hover:bg-white/10 transition-colors text-white/90 hover:text-white disabled:opacity-40"

  return createPortal(
    <div
      ref={toolbarRef}
      style={{ position: "fixed", top: toolbar.y, left: toolbar.x, zIndex: 9999 }}
      // Stop the toolbar from stealing blur from the active element on click
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-0.5 rounded-lg bg-zinc-800 border border-zinc-700 shadow-lg px-1 py-1">
        {toolbar.isMarkdown && (
          <>
            <button type="button" title="Bold" className={btnClass} onClick={() => handleFormat("bold")}>
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button type="button" title="Italic" className={btnClass} onClick={() => handleFormat("italic")}>
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button type="button" title="Strikethrough" className={btnClass} onClick={() => handleFormat("strike")}>
              <Strikethrough className="h-3.5 w-3.5" />
            </button>
            {/* Divider */}
            <div className="w-px h-4 bg-zinc-600 mx-0.5" />
          </>
        )}
        <button type="button" title="Link" className={btnClass} onClick={() => handleFormat("link")}>
          <Link className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>,
    document.body
  )
}
