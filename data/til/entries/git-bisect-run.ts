import type { TILEntry } from "../index"

const _git_bisect_run: TILEntry = {
    id: "git-bisect-run",
    title: "`git bisect run` automates the bug hunt with a script instead of manual yes/no",
    date: "2026-06-18",
    category: "Git",
    published: true,
    body: "`git bisect` does a binary search through commit history to find which commit introduced a bug. The interactive version asks you to mark each commit as `good` or `bad`. [`git bisect run`](https://git-scm.com/docs/git-bisect) accepts a script: if the script exits 0 the commit is good; if it exits non-zero the commit is bad. This lets the bisect run completely automatically: crucial when you need to check 50 commits and each build takes 30 seconds.",
    detail: [
      {
        type: "code",
        lang: "bash",
        code: `# I start a bisect session
git bisect start

# I mark the current HEAD as bad (bug is present here)
git bisect bad

# I mark the last known good commit
git bisect good v1.2.0

# I automate the search with a test script
# The script must exit 0 (good) or non-zero (bad)
git bisect run npm test -- --testNamePattern="the failing test"

# When done, git prints: "abc1234 is the first bad commit"
git bisect reset  # return to HEAD`,
        caption: "bisect run performs a binary search automatically: O(log n) commits to check",
      },
      {
        type: "note",
        text: "The test script must be reliable. A flaky test that occasionally returns the wrong exit code will send bisect down the wrong branch, giving you the wrong commit. Verify the script at a known good and bad commit before trusting the bisect result.",
      },
    ],
    tags: ["git", "debugging", "tooling"],
  }

export default _git_bisect_run
