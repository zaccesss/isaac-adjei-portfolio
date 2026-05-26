# Pre-Deploy Verification Checklist

Run through this before pushing a release or after a big batch of changes.

---

## Public pages

- [ ] `/` - Homepage loads, hero visible, navigation works
- [ ] `/about` - Loads, content readable
- [ ] `/projects` - Grid displays, links work
- [ ] `/experience` - Loads correctly
- [ ] `/skills` - Skills grid renders, icons load
- [ ] `/cv` - CV page loads, PDF preview works, download buttons work
- [ ] `/blog` - Loads, published posts visible
- [ ] `/notes` - Loads, note articles accessible
- [ ] `/lab` - Loads
- [ ] `/now` - Loads
- [ ] `/changelog` - Loads, entries visible
- [ ] `/uses` - Loads
- [ ] `/colophon` - Loads
- [ ] `/links` - Loads
- [ ] `/all-pages` - Lists public pages only, no dashboard entries
- [ ] `/privacy` - Loads
- [ ] `/security-policy` - Loads
- [ ] `/sitemap.xml` - Lists public routes only, no /dashboard paths
- [ ] `/robots.txt` - Disallows /dashboard/ and /api/dashboard/
- [ ] `404` - Custom 404 page shows on unknown route
- [ ] Contact form - Submits successfully, email arrives

## CV downloads

- [ ] PDF download - Downloads correct Isaac_Adjei_CV.pdf (not stale)
- [ ] Word download - Downloads Isaac_Adjei_CV.docx (not JSON error)
- [ ] Role-specific PDFs - cv-software.pdf, cv-embedded.pdf etc. open correctly
- [ ] Print button - Opens new tab and triggers print dialog

## Dashboard - authentication

- [ ] `/dashboard/login` - Sign in with GitHub works
- [ ] `/dashboard` when logged out - Redirects to login
- [ ] PIN gate - Prompts for PIN on Diary, Notes, Vault
- [ ] Inactivity logout - Auto-logs out after 1 hour of inactivity

## Dashboard - features

- [ ] `/dashboard` - Home stat cards load
- [ ] `/dashboard/goals` - CRUD works
- [ ] `/dashboard/diary` - Entries show, mood chart renders, write/edit/delete work
- [ ] `/dashboard/notes` - Notes CRUD, folder view works
- [ ] `/dashboard/applications` - List and kanban views work
- [ ] `/dashboard/streaks` - Cards show, heatmap (90 days), activity chart renders, check-in works
- [ ] `/dashboard/habits` - Loads and functions
- [ ] `/dashboard/vault` - Loads
- [ ] `/dashboard/settings` - PIN change, theme toggle persists, scraper trigger, digest test
- [ ] Quick Capture FAB - Opens dialog, all 4 tabs save correctly, toast appears
- [ ] Keyboard shortcuts - g+d/n/g/a/h/s/v/x navigate, ? opens help dialog
- [ ] Ctrl+K search - Opens command palette, filters results, Enter navigates
- [ ] Dark mode - Toggle in settings persists on reload and other browsers

## Security

- [ ] `/dashboard` routes return 401/redirect when not authenticated
- [ ] `/api/dashboard/*` routes return 401 when not authenticated
- [ ] No secrets in client-side bundle (check Network tab, no .env values)
- [ ] CSP headers present on public pages
- [ ] X-Frame-Options: SAMEORIGIN on CV page (iframe preview works)

## Performance

- [ ] Public pages load under 3 seconds on slow 3G
- [ ] No console errors on any public page
- [ ] No console errors on any dashboard page

---

## Sign-off

**Date:** ___________
**Issues found:** ___________
