# Private Dashboard Log

Private session log for dashboard changes. Never referenced from public pages.
See CHANGELOG.md for public site changes only.

---

## 2026-05-20 - Nexus Dashboard Overhaul (IN PROGRESS)

### Branch: `feat/nexus-dashboard-overhaul`

### RESUME PROMPT (copy this if context runs out)

```
We are in the middle of a full overhaul of the private dashboard on branch
`feat/nexus-dashboard-overhaul`. The plan is at:
/Users/isaacadjei/.claude/plans/the-mopdule-pahge-needs-snoopy-hoare.md

Read the plan fully before continuing. Then check the progress list in LOG.md
at the repo root to see what is done and what still needs building.

Key rules:
- UK English, no em/en dashes, no Oxford commas, no AI co-author in commits
- Everything must pass `npm run build` with zero errors before committing
- Commit message format: feat: nexus dashboard overhaul
- Push, then: gh pr create and gh pr merge --squash --delete-branch --auto

Outstanding known bug (already fixed in new code, just needs deploying):
Vault and Diary entries do not save on production because the old code called
Supabase directly from the browser using server-only env vars. The new code
uses server actions everywhere - this is fixed once this branch is merged.

Continue from where this session left off using the progress checklist below.
All files written so far are committed (check git status first).
```

### What was agreed
- Rename section display to **Nexus** (URL stays /dashboard)
- Shared PIN: hybrid env var `AUTH_SECONDARY_PIN` + bcrypt hash in `config` DB table
- Charts: Recharts. Date picker: react-day-picker. Markdown: react-markdown + remark-gfm. PIN: bcryptjs
- Streaks: LeetCode, NeetCode, GitHub, LinkedIn, Puzzle Games, Bible, Mimo, Python App, Codeforces
- "Other" on every dropdown throughout the entire dashboard
- Inactivity auto-logout after 1 hour
- Collapsible sidebar
- Nav order: Me, Us, Goals, Health and Fitness, Diary, Notes, Wishlist, Inventory, Course, Modules, Applications, Vault, Streaks

### Known bugs fixed in this branch (not yet deployed)
- Vault entries not saving on production - fixed by switching from client-side Supabase to `createVaultEntry` server action in VaultClient.tsx
- Diary entries not saving on production - fixed by rewriting DiaryClient.tsx to use `createDiaryEntry` server action
- Auth redirect loop on /dashboard/login - fixed in PR #139 (already merged)

### Session progress

#### DONE
- [x] Create branch feat/nexus-dashboard-overhaul
- [x] Install packages: recharts, react-day-picker, react-markdown, remark-gfm, bcryptjs, @radix-ui/react-popover, @radix-ui/react-checkbox, @radix-ui/react-switch, @types/bcryptjs
- [x] Update WORKFLOW.md with new rules (no private changes in CHANGELOG, session end rules, UK English, no AI attribution)
- [x] Create LOG.md (this file)
- [x] Rewrite supabase-setup.sql (all new tables, full seed data)
- [x] Rewrite app/dashboard/actions.ts (all actions for all new tables)
- [x] Build lib/pin.ts (PIN hash/verify utilities)
- [x] Build app/api/dashboard/verify-pin/route.ts
- [x] Build app/api/dashboard/change-pin/route.ts
- [x] Build components/dashboard/PinGate.tsx
- [x] Build components/dashboard/InactivityGuard.tsx
- [x] Rewrite app/dashboard/components/DashboardSidebar.tsx (collapsible, Nexus label, new nav order, mobile hamburger)
- [x] Update app/dashboard/(protected)/layout.tsx (InactivityGuard added)
- [x] Build app/dashboard/(protected)/me/page.tsx and MeClient.tsx
- [x] Rewrite app/dashboard/(protected)/goals/GoalsClient.tsx (category cards, first-person)
- [x] Build app/dashboard/(protected)/health/page.tsx and HealthClient.tsx
- [x] Update app/dashboard/(protected)/diary/page.tsx (PIN gate via DiaryWrapper)
- [x] Build app/dashboard/(protected)/diary/DiaryWrapper.tsx
- [x] Rewrite app/dashboard/(protected)/diary/DiaryClient.tsx (creative redesign, server actions)
- [x] Build app/dashboard/(protected)/notes/page.tsx
- [x] Build app/dashboard/(protected)/notes/NotesWrapper.tsx
- [x] Build app/dashboard/(protected)/notes/NotesClient.tsx (markdown, folders, tags, pin, lock)

#### STILL TO DO
- [ ] Overhaul Modules page (Excel-like with Recharts, year cards, module detail, assessment dates/weeks)
- [ ] Build Applications page (combined internships + jobs at /dashboard/applications)
- [ ] Rebuild Vault as Bitwarden-like with PIN gate (Account, SecureNote, APIKey, Card, Identity types)
- [ ] Build Streaks page at /dashboard/streaks
- [ ] Make Us page fully editable (routines, rules, pledges editable - ALSO separate "things to remember about her" from "things she doesn't like" in the last table)
- [ ] Make Course page dynamic and editable (uses course_modules DB table)
- [ ] Redesign Wishlist with category cards
- [ ] Build Inventory page at /dashboard/inventory
- [ ] Add route redirects: /dashboard/gym -> /dashboard/health, /dashboard/internships -> /dashboard/applications, /dashboard/tech -> /dashboard/inventory
- [ ] Update next.config.mjs remotePatterns (add www.google.com for vault favicons, already has avatars.githubusercontent.com)
- [ ] Run npm run build and fix all TypeScript and lint errors
- [ ] Commit, push, create PR, enable auto-merge

### SQL to run in Supabase after deployment
Run the entire supabase-setup.sql file in Supabase SQL Editor.
Also run: `UPDATE modules SET year = 4 WHERE year = 3;` to migrate Final Year modules.
Add env var in Vercel: `AUTH_SECONDARY_PIN` = your chosen PIN (plain text, hashed server-side on first use).

### Files created/modified in this session
- .github/WORKFLOW.md (updated with new rules)
- LOG.md (this file)
- supabase-setup.sql (full rewrite)
- package.json (new deps)
- app/dashboard/actions.ts (full rewrite with all new actions)
- lib/pin.ts (new)
- app/api/dashboard/verify-pin/route.ts (new)
- app/api/dashboard/change-pin/route.ts (new)
- components/dashboard/PinGate.tsx (new)
- components/dashboard/InactivityGuard.tsx (new)
- app/dashboard/components/DashboardSidebar.tsx (full rewrite)
- app/dashboard/(protected)/layout.tsx (updated)
- app/dashboard/(protected)/me/page.tsx (new)
- app/dashboard/(protected)/me/MeClient.tsx (new)
- app/dashboard/(protected)/goals/GoalsClient.tsx (full rewrite)
- app/dashboard/(protected)/health/page.tsx (new)
- app/dashboard/(protected)/health/HealthClient.tsx (new)
- app/dashboard/(protected)/diary/page.tsx (updated)
- app/dashboard/(protected)/diary/DiaryWrapper.tsx (new)
- app/dashboard/(protected)/diary/DiaryClient.tsx (full rewrite - uses server actions now)
- app/dashboard/(protected)/notes/page.tsx (new)
- app/dashboard/(protected)/notes/NotesWrapper.tsx (new)
- app/dashboard/(protected)/notes/NotesClient.tsx (new)
