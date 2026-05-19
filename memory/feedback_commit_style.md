---
name: feedback-commit-style
description: Commit message rules and writing conventions for this repo
metadata:
  type: feedback
---

No AI attribution or Co-Authored-By lines in any commit message — the git hooks strip them and will reject commits that include them.

Commit message format must use conventional prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`

No em dashes (—) or en dashes (–) in commit messages — use a hyphen (-) instead. The commit-msg hook rejects these.

No Oxford comma in commit messages — write "x, y and z" not "x, y, and z". The hook rejects this too.

**Why:** The `.githooks/commit-msg` hook enforces all of the above and will hard-reject non-compliant commits. These rules apply everywhere in the project — code comments, responses and documentation too, not just commits.

**How to apply:** Before every commit, check the message against these rules. If the hook rejects it, fix the message and try again — do not use `--no-verify`.
