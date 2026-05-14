"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

interface CodeBlockProps {
  lang: string
  text: string
}

export default function CodeBlock({ lang, text }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <button
        onClick={copy}
        aria-label="Copy code"
        className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-md border border-border/60 bg-background/80 px-2 py-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground hover:border-border"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-green-500" />
            <span className="text-green-500">Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            <span>Copy</span>
          </>
        )}
      </button>
      <pre className="rounded-lg bg-muted/50 border border-border/60 p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <code className={lang ? `language-${lang}` : undefined}>{text}</code>
      </pre>
    </div>
  )
}
