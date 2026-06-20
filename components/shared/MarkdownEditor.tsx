"use client"

import { useState } from "react"
import { Eye, Pencil } from "lucide-react"
import MarkdownContent from "./MarkdownContent"
import { cn } from "@/lib/utils"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
  disabled?: boolean
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write in Markdown...",
  rows = 5,
  className,
  disabled,
}: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false)

  return (
    <div className="relative rounded-lg border border-border focus-within:ring-1 focus-within:ring-primary/50 overflow-hidden bg-background">
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-1.5 bg-muted/30">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={cn(
              "text-xs px-2 py-0.5 rounded transition-colors",
              !preview ? "bg-background shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className={cn(
              "text-xs px-2 py-0.5 rounded transition-colors",
              preview ? "bg-background shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Preview
          </button>
        </div>
        <span className="text-[10px] text-muted-foreground/60">Markdown</span>
      </div>

      {preview ? (
        <div className="px-3 py-2 min-h-[80px]">
          {value.trim() ? (
            <MarkdownContent compact>{value}</MarkdownContent>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">Nothing to preview.</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={cn(
            "w-full resize-none bg-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-muted-foreground/50",
            className
          )}
        />
      )}
    </div>
  )
}
