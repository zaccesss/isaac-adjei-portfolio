// Generalises the status taxonomy and progress-percentage handling that used to live only in
// GoalsClient.tsx, so Study/Faith goal-like entities reuse the same status labels/colours and
// progress-bar maths instead of redefining their own copy.

export const GOAL_STATUSES = ["not_started", "in_progress", "done", "abandoned"] as const
export type GoalStatus = (typeof GOAL_STATUSES)[number]

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
  abandoned: "Abandoned",
}

export const GOAL_STATUS_COLOURS: Record<GoalStatus, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  abandoned: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
}

export function useGoalProgress(goal: { status: string; progress: number }): {
  percent: number
  statusLabel: string
  statusColourClass: string
} {
  const status = goal.status as GoalStatus
  return {
    percent: Math.max(0, Math.min(100, goal.progress)),
    statusLabel: GOAL_STATUS_LABELS[status] ?? goal.status,
    statusColourClass: GOAL_STATUS_COLOURS[status] ?? GOAL_STATUS_COLOURS.not_started,
  }
}
