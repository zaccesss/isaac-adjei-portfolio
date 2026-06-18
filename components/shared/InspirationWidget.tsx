"use client"

import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"

export default function InspirationWidget() {
  const [quote, setQuote] = useState<{ quote: string; author: string } | null>(null)
  const [bible, setBible] = useState<{ verse: string; reference: string } | null>(null)

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await fetch("/api/quote")
        const data = await res.json()
        setQuote(data)
      } catch {}
    }
    // I defer the initial fetch slightly so it doesn't compete with the first paint
    const t = setTimeout(fetchQuote, 80)
    const interval = setInterval(fetchQuote, 30 * 60 * 1000)
    return () => { clearTimeout(t); clearInterval(interval) }
  }, [])

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const res = await fetch("/api/bible-verse")
        const data = await res.json()
        setBible(data)
      } catch {}
    }
    const t = setTimeout(fetchVerse, 80)
    const interval = setInterval(fetchVerse, 30 * 60 * 1000)
    return () => { clearTimeout(t); clearInterval(interval) }
  }, [])

  return (
    <div className="space-y-4">
      <Separator />

      <div className="rounded-lg border border-border/60 bg-muted/30 px-6 py-5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-primary uppercase tracking-widest">motivation</p>
          <button
            type="button"
            onClick={async () => {
              setQuote(null)
              const res = await fetch("/api/quote")
              const data = await res.json()
              setQuote(data)
            }}
            className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            refresh ↻
          </button>
        </div>
        {quote ? (
          <>
            <p className="text-base font-medium leading-relaxed">&ldquo;{quote.quote}&rdquo;</p>
            <p className="text-xs text-muted-foreground">- {quote.author}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground font-mono animate-pulse">loading quote...</p>
        )}
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/30 px-6 py-5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-primary uppercase tracking-widest">scripture</p>
          <button
            type="button"
            onClick={async () => {
              setBible(null)
              const res = await fetch("/api/bible-verse")
              const data = await res.json()
              setBible(data)
            }}
            className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            refresh ↻
          </button>
        </div>
        {bible ? (
          <>
            <p className="text-base font-medium leading-relaxed">&ldquo;{bible.verse}&rdquo;</p>
            <p className="text-xs text-muted-foreground">- {bible.reference}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground font-mono animate-pulse">loading verse...</p>
        )}
      </div>
    </div>
  )
}
