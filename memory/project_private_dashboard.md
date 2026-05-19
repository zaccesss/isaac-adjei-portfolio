---
name: project-private-dashboard
description: Full spec for the private /dashboard section of isaacadjei.me — NextAuth.js GitHub OAuth, Supabase, Goals tracker, Module tracker and Internship tracker. Discussed 2026-05-20.
metadata:
  type: project
---

# Private dashboard

A private section of the portfolio accessible only to Isaac. Not linked from the public nav. Discussed and fully planned in the session of 2026-05-20.

**Why:** Isaac wants a personal productivity layer inside the portfolio — goals, uni module tracking and internship applications — all in one place he already visits and maintains.

**How to apply:** Dedicate a full session to this. Do not start mid-session. Auth layer must be confirmed working before building any of the three sections.

---

## Route and access

- Route: `/dashboard` (protected layout, not in public nav or sitemap)
- Any unauthenticated visit redirects to `/dashboard/login`
- Login page: single "Sign in with GitHub" button, no username/password
- After login, only Isaac's GitHub account is allowed in — all other GitHub accounts hit an "Access denied" page
- Isaac's GitHub username: `zaccesss` (3 s's). Use the numeric GitHub user ID (not username) in the allow-list so a username change cannot break access.

---

## Auth stack

- **NextAuth.js v5** (also called Auth.js v5) — App Router compatible, uses the new `auth()` helper
- GitHub OAuth provider
- Session stored as a JWT (no database needed for the session itself)
- Middleware (`middleware.ts`) guards all `/dashboard/**` routes — redirects to `/dashboard/login` if no valid session
- Allow-list: hardcode Isaac's GitHub numeric user ID in an env var `ALLOWED_GITHUB_ID`
- New env vars required:
  - `NEXTAUTH_SECRET` — random 32-byte secret, generate with `openssl rand -hex 32`
  - `AUTH_GITHUB_ID` — GitHub OAuth app client ID
  - `AUTH_GITHUB_SECRET` — GitHub OAuth app client secret
  - `ALLOWED_GITHUB_ID` — Isaac's GitHub numeric user ID (find at `api.github.com/users/zaccesss`)

### Session start checklist for this feature
1. Ask Isaac to go to github.com/settings/developers and create a new OAuth App
   - Application name: "Isaac Portfolio Dashboard"
   - Homepage URL: `https://isaacadjei.me`
   - Callback URL: `https://isaacadjei.me/api/auth/callback/github` (and `http://localhost:3000/api/auth/callback/github` for dev)
2. Ask Isaac to create a Supabase project at supabase.com and provide the Project URL and anon key
3. Ask Isaac to provide his GitHub numeric user ID (check `https://api.github.com/users/zaccesss`)
4. Add all env vars to `.env.local` for dev and to Vercel project settings for production

---

## Database — Supabase

- Supabase (PostgreSQL) for all dashboard data
- Client: `@supabase/supabase-js`
- Server-side only — no direct Supabase calls from client components; use server actions or route handlers
- New env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (anon key is safe for server-side use with RLS)
- Row Level Security (RLS): enable on all tables; policy: `auth.uid() = user_id` or just leave open since only one user will ever exist

### Tables

```sql
-- Goals tracker
create table goals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  title text not null,
  description text,
  category text, -- Academic, Career, Personal, Health, Finance
  status text default 'not_started', -- not_started, in_progress, done, abandoned
  target_date date,
  progress int default 0 -- 0-100 percent
);

-- Module tracker
create table modules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  code text,
  credits int,
  year int, -- 1, 2, 3
  semester int, -- 1 or 2
  status text default 'ongoing' -- ongoing, complete, resit
);

create table assessments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete cascade,
  name text not null, -- "Coursework 1", "Final Exam"
  type text, -- coursework, exam, lab, project
  weight_percent int, -- contribution to module mark
  mark_achieved numeric, -- actual mark out of max
  mark_max numeric default 100,
  target_mark numeric
);

-- Internship tracker
create table applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  company text not null,
  role text not null,
  applied_date date,
  deadline date,
  status text default 'drafting', -- drafting, applied, oa, phone_screen, interview, offer, rejected, withdrawn
  notes text,
  url text,
  starred boolean default false
);
```

---

## Dashboard layout

- Sidebar navigation on desktop (collapsible), bottom tab bar on mobile
- Three sections: Goals, Modules, Internships
- Top bar: Isaac's GitHub avatar + name, Sign out button
- Uses existing shadcn/ui components: Table, Dialog, Badge, Select, Textarea, Button, Input, Card

### Goals section
- Card grid or table of all goals
- Status badge (colour-coded: not started = muted, in progress = blue, done = green, abandoned = red)
- Add new goal via Dialog (title, description, category, target date, status)
- Edit/delete inline
- Filter by status and category

### Modules section
- Module cards grouped by year/semester
- Expand a module to see assessments and grades
- Weighted average auto-calculated from `(sum of mark_achieved/mark_max * weight_percent)` across assessments
- Colour: green if >= target, amber if close, red if below

### Internships section
- Table view: Company | Role | Applied | Deadline | Status | Starred
- Filter row by status
- Stats bar at top: Total applied | In progress | Offers | Rejections
- Click row to open a side panel / dialog with full notes and URL
- Add new row via dialog
- Status changes via Select dropdown inline in the table

---

## What NOT to do

- Do not expose any Supabase writes through public API routes — server actions only
- Do not link `/dashboard` from the public nav, footer, sitemap or command menu
- Do not add a public-facing profile for the dashboard data
- Do not use `any` types — strict TypeScript throughout
