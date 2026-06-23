"use client"
// I use this component anywhere user-authored or AI text should render markdown - links always open in a
// new tab, and fenced code blocks render in a styled box with a one-click Copy button.
// The compact prop switches between prose-sm (default) and prose-xs for tighter dashboard cards.

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useState, useRef, type ReactNode } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface MarkdownContentProps {
  children: string
  className?: string
  compact?: boolean
}

// A fenced code block with a hover Copy button. I read the rendered text off the <pre> so it copies the
// raw code exactly, without the surrounding markdown.
function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLPreElement>(null)
  function copy() {
    const text = ref.current?.innerText ?? ""
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div className="relative group not-prose my-3">
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md border border-border bg-background/80 px-1.5 py-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:text-foreground"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre ref={ref} className="overflow-x-auto rounded-lg border border-border bg-muted p-3 text-xs leading-relaxed">
        {children}
      </pre>
    </div>
  )
}

export default function MarkdownContent({ children, className, compact = false }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        "prose dark:prose-invert max-w-none",
        compact ? "prose-xs" : "prose-sm",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:opacity-80"
            >
              {children}
            </a>
          ),
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
