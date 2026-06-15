// I use this component anywhere user-authored text should render markdown - links always open in a new tab.
// The compact prop switches between prose-sm (default) and prose-xs for tighter dashboard cards.
"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

interface MarkdownContentProps {
  children: string
  className?: string
  compact?: boolean
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
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
