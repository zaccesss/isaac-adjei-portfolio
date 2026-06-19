"use client"

import { useEffect, useMemo, useState } from "react"
import { ExternalLink, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"
import type { LinearIssue } from "@/app/api/dashboard/linear/route"

type Response = { configured: boolean; issues: LinearIssue[]; error?: string; detail?: string }

const PRIORITY_LABEL: Record<number, { label: string; colour: string }> = {
  0: { label: "No priority", colour: "text-muted-foreground" },
  1: { label: "Urgent",      colour: "text-red-500" },
  2: { label: "High",        colour: "text-orange-500" },
  3: { label: "Medium",      colour: "text-yellow-500" },
  4: { label: "Low",         colour: "text-blue-400" },
}

function PriorityDot({ priority }: { priority: number }) {
  const { colour } = PRIORITY_LABEL[priority] ?? PRIORITY_LABEL[0]
  return <span className={`inline-block h-1.5 w-1.5 rounded-full bg-current ${colour}`} />
}

function StateBadge({ state }: { state: LinearIssue["state"] }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
      style={{ backgroundColor: state.color + "22", color: state.color }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: state.color }} />
      {state.name}
    </span>
  )
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export default function LinearView() {
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBacklog, setShowBacklog] = useState(false)
  // eslint-disable-next-line react-hooks/purity
  const sevenDaysFromNow = useMemo(() => new Date(Date.now() + 7 * 86400000), [])

  useEffect(() => {
    fetch("/api/dashboard/linear")
      .then((r) => r.json())
      .then((d: Response) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading Linear issues…</span>
      </div>
    )
  }

  if (!data?.configured) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-sm text-center space-y-3">
          <div className="text-3xl">⚡</div>
          <p className="text-sm font-medium">Linear not connected</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Add your Linear personal API key as{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-[10px]">LINEAR_API_KEY</code>{" "}
            in Vercel environment variables, then redeploy.
          </p>
          <p className="text-xs text-muted-foreground">
            Get your key from <span className="font-mono">linear.app → Settings → API → Personal API keys</span>
          </p>
        </div>
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-sm text-center space-y-2">
          <div className="flex justify-center"><AlertCircle className="h-6 w-6 text-destructive" /></div>
          <p className="text-sm font-medium text-destructive">{data.error}</p>
          {data.error.includes("Invalid") && (
            <p className="text-xs text-muted-foreground">
              Check that <code className="bg-muted px-1 py-0.5 rounded text-[10px]">LINEAR_API_KEY</code> is set correctly in Vercel and redeploy.
            </p>
          )}
        </div>
      </div>
    )
  }

  if (data.issues.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        No open issues in your Linear workspace.
      </div>
    )
  }

  // Exclude backlog/unstarted issues unless the toggle is on
  const visibleIssues = showBacklog
    ? data.issues
    : data.issues.filter((i) => i.state.type !== "backlog" && i.state.type !== "unstarted")

  const hiddenCount = data.issues.length - visibleIssues.length

  // Group by project (fallback to team)
  const groups = new Map<string, { colour: string; issues: LinearIssue[] }>()
  for (const issue of visibleIssues) {
    const key = issue.project?.name ?? issue.team.name
    const colour = issue.project?.color ?? "#94a3b8"
    if (!groups.has(key)) groups.set(key, { colour, issues: [] })
    groups.get(key)!.issues.push(issue)
  }

  return (
    <div className="flex-1 overflow-auto min-h-0 p-4 space-y-4">
      {/* Summary row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Active", value: visibleIssues.length },
            { label: "Urgent / High", value: visibleIssues.filter((i) => i.priority <= 2 && i.priority > 0).length },
            { label: "Due soon", value: visibleIssues.filter((i) => i.dueDate && new Date(i.dueDate) <= sevenDaysFromNow).length },
            { label: "Projects", value: groups.size },
          ].map((s) => (
            <div key={s.label} className="border border-border rounded-lg p-3 bg-card min-w-[90px]">
              <p className="text-lg font-bold tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        {hiddenCount > 0 || showBacklog ? (
          <button
            type="button"
            onClick={() => setShowBacklog((v) => !v)}
            title={showBacklog ? "Hide backlog and saved issues" : "Show backlog and saved issues"}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
          >
            {showBacklog ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {showBacklog ? "Hide backlog" : `Show backlog (${hiddenCount})`}
          </button>
        ) : null}
      </div>

      {/* Issues by project */}
      {[...groups.entries()].map(([name, { colour, issues }]) => (
        <div key={name} className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: colour }} />
            <span className="text-xs font-semibold">{name}</span>
            <span className="text-xs text-muted-foreground ml-auto">{issues.length}</span>
          </div>
          <div className="divide-y divide-border/50">
            {issues.map((issue) => (
              <div key={issue.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors group">
                <PriorityDot priority={issue.priority} />
                <span className="text-[10px] font-mono text-muted-foreground w-14 shrink-0">{issue.identifier}</span>
                <span className="text-xs flex-1 min-w-0 truncate">{issue.title}</span>
                <StateBadge state={issue.state} />
                {issue.labels.nodes.length > 0 && (
                  <div className="hidden sm:flex gap-1">
                    {issue.labels.nodes.slice(0, 2).map((l) => (
                      <span
                        key={l.name}
                        className="text-[9px] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: l.color + "22", color: l.color }}
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                )}
                <span className="text-[10px] text-muted-foreground hidden md:block shrink-0">
                  {relativeDate(issue.updatedAt)}
                </span>
                {issue.dueDate && (
                  <span className={`text-[10px] shrink-0 ${new Date(issue.dueDate) < new Date() ? "text-red-500" : "text-muted-foreground"}`}>
                    due {new Date(issue.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                )}
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
