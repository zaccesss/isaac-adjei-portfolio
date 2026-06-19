"use client"

// Shared confirmation dialog, replacing the inconsistent native confirm()/window.confirm()
// used today by Settings and OpenSource. Two modes:
//  - plain confirm: Cancel / Confirm buttons
//  - typed confirm: reserved for the highest-blast-radius actions ("Clear all jobs",
//    "Clear all applications") - the user must type the exact confirmation phrase before
//    the Confirm button enables.
//
// Use the useConfirmDialog() hook rather than rendering <ConfirmDialog> directly - it gives
// you an async confirm() function so call sites read the same way the old confirm() did:
//
//   const { confirm, dialog } = useConfirmDialog()
//   ...
//   if (!(await confirm({ title: "Delete this item?" }))) return
//   ...
//   return <>{dialog}{...rest of component}</>

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type ConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  /** If set, the user must type this exact phrase before Confirm enables. */
  typedConfirmation?: string
}

function ConfirmDialog({
  open,
  onOpenChange,
  options,
  onResult,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  options: ConfirmOptions | null
  onResult: (confirmed: boolean) => void
}) {
  const [typed, setTyped] = React.useState("")

  if (!options) return null
  const requiresTyping = !!options.typedConfirmation
  const canConfirm = !requiresTyping || typed === options.typedConfirmation

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{options.title}</DialogTitle>
          {options.description && <DialogDescription>{options.description}</DialogDescription>}
        </DialogHeader>

        {requiresTyping && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">
              Type <span className="font-semibold text-foreground">{options.typedConfirmation}</span> to confirm
            </p>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={options.typedConfirmation}
              autoFocus
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onResult(false)}>
            {options.cancelLabel ?? "Cancel"}
          </Button>
          <Button
            variant={options.destructive === false ? "default" : "destructive"}
            disabled={!canConfirm}
            onClick={() => onResult(true)}
          >
            {options.confirmLabel ?? "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function useConfirmDialog(): {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  dialog: React.ReactNode
} {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null)
  const [nonce, setNonce] = React.useState(0)
  const resolverRef = React.useRef<((confirmed: boolean) => void) | null>(null)

  const confirm = React.useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    setOpen(true)
    // Bumping the key forces ConfirmDialog to remount so its typed-confirmation
    // input always starts empty, without needing an effect to reset it.
    setNonce((n) => n + 1)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const handleResult = React.useCallback((confirmed: boolean) => {
    setOpen(false)
    resolverRef.current?.(confirmed)
    resolverRef.current = null
  }, [])

  const dialog = (
    <ConfirmDialog
      key={nonce}
      open={open}
      onOpenChange={(next) => {
        if (!next) handleResult(false)
      }}
      options={options}
      onResult={handleResult}
    />
  )

  return { confirm, dialog }
}
