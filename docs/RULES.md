# Project Rules

All rules that apply to every session. No exceptions.

---

## Communication

- Short and direct. No padding, no summaries of what you just did.
- No em dashes (—) or en dashes (–). Use a hyphen (-) instead.
- No Oxford comma. Write "x, y and z" not "x, y, and z".
- No emojis unless Isaac explicitly asks.
- When referencing files use markdown links.
- One or two sentence updates while working. Never silent.

---

## Commit rules

- Format: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- No em dashes or en dashes in commit messages - use hyphens
- No Oxford comma in commit messages
- No AI attribution lines, Co-Authored-By lines or Cursor footers (e.g. Made with Cursor) anywhere
- The `.githooks/commit-msg` hook enforces all of the above and hard-rejects violations

---

## Workflow

1. Always branch from latest main: `git checkout main && git pull`
2. Update CHANGELOG.md under `[Unreleased]` BEFORE committing (public changes only)
3. Private dashboard changes go in `docs/LOG.md` only, never CHANGELOG.md
4. Branch naming: `feat/description`, `fix/description`, `chore/description`, `content/description`
5. Push branch, create PR and enable auto-merge:
   ```
   git push -u origin branch-name
   gh pr create --title "..." --body "..."
   gh pr merge --squash --delete-branch --auto
   ```
6. CI (Lint and Build) takes ~2 minutes. Wait for it to pass.
7. After merge: `git checkout main && git pull && git branch -d branch-name && git remote prune origin`
8. Never commit directly to main. Never force push. Never skip hooks.

## Session end cleanup

Delete all local branches except main:
```bash
git branch | grep -v main | xargs git branch -D
git branch -r | grep -v main | grep -v HEAD | sed 's/origin\///' | xargs -I {} git push origin --delete {}
```

---

## Code rules

- TypeScript strict mode - no `any`, no untyped variables
- No unused imports - CI fails on lint errors
- Tailwind only for styles. Exception: genuinely dynamic values like `style={{ width: \`${pct}%\` }}`
- The `Github` icon from lucide-react is deprecated but intentionally kept - do not replace it
- `react-hooks/set-state-in-effect` - never call setState synchronously at the top level of a useEffect body
- All API routes return `{ headers: { "Cache-Control": "no-store" } }`
- Redis key pattern: `resource:type` e.g. `macbook:status`, `spotify:last_played`

---

## Code comment rules

- Write comments in first person: "I use..." not "Uses..."
- Add comments only where the WHY is non-obvious
- Be detailed where the reasoning is complex or the decision was deliberate
- No multi-line block comments for simple things
- No auto-generated docstrings

---

## Writing style

- UK English (colour not color, organised not organized, etc.)
- No em dashes or en dashes anywhere in code or prose - use hyphens or rephrase
- No Oxford commas
- First person in comments: "I drive..." not "This drives..."

---

## What NOT to do

- Do not store credentials in any committed file
- Do not replace the Github lucide icon
- Do not show city in weather card - country only, always
- Do not show Spotify data in device cards
- Do not commit directly to main
- Do not push without a PR
- Do not add error handling for impossible scenarios
- Do not over-abstract
- Do not skip updating LOG.md at session end
- Do not touch public pages when working on dashboard tasks
