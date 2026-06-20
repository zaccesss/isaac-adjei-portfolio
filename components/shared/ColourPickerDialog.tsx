"use client"

// Reusable colour picker. Trigger: coloured circle + palette icon.
// Opens a dialog with preset swatches, a native colour input and a hex text field.
// Only the Apply button propagates the change - Cancel discards and restores the
// previous value. This avoids live colour changes landing on the item while the
// dialog is still open.

import { useState } from "react"
import { Palette } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Default preset palette shared across dashboard sections.
const DEFAULT_PRESETS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ec4899",
  "#14b8a6", "#ef4444", "#8b5cf6", "#f97316",
]

interface ColourPickerDialogProps {
  value: string
  onChange: (colour: string) => void
  /** Override the preset swatch grid. Defaults to DEFAULT_PRESETS. */
  presets?: string[]
  /** Extra class on the trigger button. */
  triggerClassName?: string
}

export function ColourPickerDialog({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  triggerClassName = "",
}: ColourPickerDialogProps) {
  const [open, setOpen] = useState(false)
  // Draft holds the in-progress selection; only committed on Apply.
  const [draft, setDraft] = useState(value)

  function handleApply() {
    onChange(draft)
    setOpen(false)
  }

  function handleCancel() {
    setDraft(value)
    setOpen(false)
  }

  return (
    <>
      {/* Trigger: coloured circle + palette icon. Initialise draft from current value on open. */}
      <button
        type="button"
        title="Change colour"
        onClick={() => { setDraft(value); setOpen(true) }}
        className={`flex items-center gap-1 p-1 rounded-md hover:bg-muted transition-colors group ${triggerClassName}`}
      >
        <span
          className="w-4 h-4 rounded-full ring-1 ring-border block shrink-0"
          style={{ backgroundColor: value }}
        />
        <Palette className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>

      <Dialog
        open={open}
        onOpenChange={(o) => { if (!o) handleCancel() }}
      >
        <DialogContent className="max-w-xs">
          <DialogTitle className="text-sm font-semibold">Choose colour</DialogTitle>

          <div className="flex flex-col gap-4 pt-1">
            {/* Preset swatch grid */}
            <div className="flex flex-wrap gap-2">
              {presets.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => setDraft(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    draft === c
                      ? "scale-125 ring-2 ring-offset-2 ring-foreground"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Native colour wheel + editable hex field */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                title="Custom colour"
                className="w-9 h-9 rounded-lg cursor-pointer border border-border bg-transparent p-0.5 appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 shrink-0"
              />
              <Input
                value={draft}
                onChange={(e) => {
                  const v = e.target.value
                  // Only update if it looks like a valid hex fragment
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setDraft(v)
                }}
                placeholder="#6366f1"
                className="h-9 text-sm font-mono"
                maxLength={7}
              />
            </div>

            {/* Cancel discards; Apply commits */}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
