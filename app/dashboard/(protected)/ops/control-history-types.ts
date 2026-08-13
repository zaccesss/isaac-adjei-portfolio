// Mirrors the response shape of GET /api/dashboard/control-history, shared between OpsClient (which
// only reads the first 3 fields) and OpsAnalyticsClient (which reads all of them).
export interface SankeyChartData {
  nodes: { name: string }[]
  links: { source: number; target: number; value: number }[]
}

export interface ControlHistory {
  dailySuccess: { date: string; total: number; success: number }[]
  perJobSuccess: { jobId: string; label: string; total: number; success: number }[]
  statusBreakdown: { up: number; grace: number; down: number; paused: number }
  uptimeGrid: { slug: string; label: string; days: { date: string; status: string }[] }[]
  durationTrend: { date: string; avgDurationS: number }[]
  repoBreakdown: { repo: string; repoLabel: string; total: number; success: number }[]
  jobOutcomeFlow: SankeyChartData
}
