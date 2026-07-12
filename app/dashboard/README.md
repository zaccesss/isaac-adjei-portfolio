# app/dashboard/

Private dashboard - requires a valid NextAuth session (GitHub OAuth). All protected pages live under `(protected)/`.

## Key files

| File | Description |
| --- | --- |
| `actions.ts` | Supabase server actions shared across dashboard pages |
| `components/DashboardSidebar.tsx` | Sidebar nav with keyboard shortcut badges |
| `components/DashboardHeader.tsx` | Dashboard top bar |
| `(protected)/page.tsx` | Dashboard home page |
| `(protected)/layout.tsx` | Protected layout wrapping all dashboard routes |

## Routes

For the full route list see [docs/DASHBOARD.md](../../docs/DASHBOARD.md).

Key routes: `applications`, `activity`, `post-analytics`, `coding`, `diary`, `goals`, `gym`, `habits`, `health`, `internships`, `inventory`, `me`, `modules`, `notes`, `opensource`, `settings`, `streaks`, `tech`, `vault`, `wishlist`.
