import type { TILEntry } from "../index"

const _git_worktree: TILEntry = {
    id: "git-worktree",
    title: "`git worktree` lets you check out multiple branches simultaneously in separate directories",
    date: "2026-07-04",
    category: "Git",
    published: true,
    body: "If you are working on a feature branch and need to quickly check or test the main branch without stashing everything, [`git worktree add`](https://git-scm.com/docs/git-worktree) creates a second working directory linked to the same repository, checked out at any branch or commit. Changes in one worktree do not affect the other. Each worktree gets its own `HEAD` and index. When you are done, `git worktree remove` cleans it up.",
    detail: [
      {
        type: "code",
        lang: "bash",
        code: `# I create a worktree for main alongside the current feature branch
git worktree add ../main-check main

# I can now build and test main without touching my feature branch
cd ../main-check && npm run build

# I list all active worktrees
git worktree list

# I clean up when done
git worktree remove ../main-check`,
        caption: "Two branches checked out simultaneously: the repository index is shared, the working trees are separate",
      },
      {
        type: "note",
        text: "You cannot check out the same branch in two worktrees simultaneously. If you try, git refuses with 'already checked out'. Use worktrees when you need to compare build output between branches or run tests on both simultaneously without stashing.",
      },
      {
        type: "link",
        url: "https://git-scm.com/docs/git-worktree",
        label: "git-scm: git worktree",
        description: "Full documentation including linked worktree internals and how .git/worktrees/ tracks the separate working directories.",
      },
    ],
    tags: ["git", "tooling", "workflow"],
  }

export default _git_worktree
