"use client"

import { useState, useCallback } from "react"

// Reusable bulk-select state for lists that support multi-row deletion or actions.
// Pass the current visible (filtered) items so selectAll works correctly when a search
// filter is active - it selects only the rows the user can see, not the full dataset.
export function useBulkSelect<T extends { id: string }>(visibleItems: T[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelected(new Set(visibleItems.map((i) => i.id)))
  }, [visibleItems])

  const selectNone = useCallback(() => setSelected(new Set()), [])

  const toggleAll = useCallback(() => {
    if (selected.size === visibleItems.length && visibleItems.length > 0) {
      setSelected(new Set())
    } else {
      setSelected(new Set(visibleItems.map((i) => i.id)))
    }
  }, [selected.size, visibleItems])

  const remove = useCallback((id: string) => {
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n })
  }, [])

  const allSelected = visibleItems.length > 0 && selected.size === visibleItems.length
  const someSelected = selected.size > 0

  return { selected, toggle, selectAll, selectNone, toggleAll, remove, allSelected, someSelected }
}
