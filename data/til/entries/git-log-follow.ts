import type { TILEntry } from "../index"

const _git_log_follow: TILEntry = {
    id: "git-log-follow",
    title: "git log --follow keeps history across file renames",
    date: "2026-09-12",
    category: "Git",
    published: true,
    body: "By default git log only shows commits made to the current file path. If the file was renamed at some point, history before that rename disappears. git log --follow detects renames using a similarity score and continues history through them. Essential when you want to understand the full evolution of a file that has been refactored or moved.",
    detail: [
      {
        type: "code",
        lang: "bash",
        code: `# Without --follow: only shows commits since the rename
git log -- src/components/Button.tsx

# With --follow: shows full history through the rename
git log --follow -- src/components/Button.tsx

# Add -p to show patches (diffs) alongside the log
git log --follow -p -- src/components/Button.tsx

# Find when a rename happened across the whole repo
git log --diff-filter=R --summary --find-renames`,
        caption: "The --follow flag uses a similarity threshold to detect renames",
      },
      {
        type: "p",
        text: "The similarity score is how git decides whether a deletion and an addition are actually the same file renamed, rather than two unrelated changes. The default threshold is 50%: if more than half the content matches, git treats it as a rename. You can tune this with --find-renames=NUM (e.g. --find-renames=80 for stricter matching). If a file was heavily rewritten at the same time it was moved, git may not detect the rename at all.",
      },
      {
        type: "note",
        text: "git log --follow only works for a single file path. There is no equivalent for directories. For a renamed directory you have to trace the rename manually using git log --diff-filter=R --summary.",
      },
    ],
    tags: ["git", "history", "rename", "log"],
    source: { label: "git-log documentation", url: "https://git-scm.com/docs/git-log" },
  }

export default _git_log_follow
