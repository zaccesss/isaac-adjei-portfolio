# Pre-Public Verification Checklist

## Public Pages to Check (Pre-Deploy)

### Core Pages
- [ ] `/` - Homepage loads, hero section visible, navigation works
- [ ] `/about` - About page loads, content readable
- [ ] `/projects` - Projects grid displays, links work
- [ ] `/resume` - Resume page loads, PDF download works
- [ ] `/cv` - CV picker page (NEW - Phase 18)
- [ ] `/cv-software.html` - Software Engineer CV (NEW - Phase 18)
- [ ] `/cv-embedded.html` - Embedded Engineer CV (NEW - Phase 18)
- [ ] `/cv-data.html` - Data/AI Engineer CV (NEW - Phase 18)
- [ ] `/cv-devops.html` - DevOps/Cloud CV (NEW - Phase 18)
- [ ] `/cv-quant.html` - Quant/Developer CV (NEW - Phase 18)
- [ ] `/cv-security.html` - Cybersecurity CV (NEW - Phase 18)

### Dynamic OG Images (Phase 19)
- [ ] `/api/og?title=Test` - OG image endpoint returns PNG
- [ ] Share any public page on social, image preview shows correctly
- [ ] OG images have correct branding/colors

### Contact & Legal
- [ ] `/contact` - Contact form loads (if exists)
- [ ] `/privacy` - Privacy policy (if exists)

### 404 & Errors
- [ ] `/nonexistent` - 404 page shows correctly

## Post-Deploy Private Dashboard Checks (After Go Live)

### Authentication
- [ ] `/dashboard/login` - Sign in works
- [ ] `/dashboard` - Redirects to login when not authenticated
- [ ] PIN gate works on protected pages

### Core Dashboard Features
- [ ] `/dashboard/me` - Me page loads
- [ ] `/dashboard/us` - Us page loads
- [ ] `/dashboard/goals` - Goals CRUD works
- [ ] `/dashboard/health` - Health & Fitness loads
- [ ] `/dashboard/diary` - Diary with 3-dot menu (hide/pin/lock)
- [ ] `/dashboard/notes` - Notes with 3-dot menu
- [ ] `/dashboard/notes/[folder]` - Folder view works
- [ ] `/dashboard/wishlist` - Wishlist works
- [ ] `/dashboard/inventory` - Inventory works
- [ ] `/dashboard/course` - Course overview
- [ ] `/dashboard/modules` - Modules list
- [ ] `/dashboard/modules/[year]` - Year view works
- [ ] `/dashboard/applications` - Applications List view
- [ ] `/dashboard/applications` - Applications Kanban view (toggle)
- [ ] `/dashboard/vault` - Vault overview
- [ ] `/dashboard/vault/[type]` - Vault type pages with 3-dot menu
- [ ] `/dashboard/streaks` - Streaks page works
- [ ] `/dashboard/habits` - Habits page works (NEW - Phase 10)
- [ ] `/dashboard/settings` - Settings loads, Data Export button works

### 3-Dot Menu Features (Phases 5-7)
- [ ] Diary: Hide/Show, Pin/Unpin, Lock/Unlock, Delete all work
- [ ] Notes: Hide/Show, Lock/Unlock, Pin/Unpin, Delete all work
- [ ] Vault: Hide/Show, Lock/Unlock, Edit, Delete all work
- [ ] Locked items require PIN to view

### Activity Log (Phase 9)
- [ ] Dashboard home shows Recent Activity section
- [ ] Last 5 actions display with timestamps

### Data Export (Phase 8)
- [ ] Settings > Data Export > Export button downloads JSON
- [ ] JSON file contains all dashboard data

### API Routes
- [ ] `/api/dashboard/trigger-scraper` - Returns 200 (if PAT configured)
- [ ] `/api/dashboard/scraper-status` - Returns status JSON
- [ ] `/api/dashboard/trigger-digest` - Returns 200 (test email sent)

## Job Scraper Improvements (Phase 20)
- [ ] GitHub Actions workflow triggers correctly
- [ ] Scraper fetches from multiple UK sources
- [ ] Duplicate detection works (URL NULL for jobs without URLs)
- [ ] Applications table unique index works correctly

## Known Issues to Verify Fixed
- [ ] Theme toggle icons don't overlap text
- [ ] No "zaccessss" typos in API routes
- [ ] Weekly digest sends from contact@isaacadjei.me

## Performance Checks
- [ ] Public pages load under 3 seconds
- [ ] Dashboard loads under 2 seconds
- [ ] No console errors on any page

## Accessibility
- [ ] All buttons have aria-labels
- [ ] Color contrast meets WCAG standards
- [ ] Keyboard navigation works

---

## Sign-off

**Pre-Public Check**: 
- Date: ___________
- Checked by: ___________
- Issues found: ___________

**Post-Deploy Check**:
- Date: ___________
- Checked by: ___________
- Issues found: ___________
