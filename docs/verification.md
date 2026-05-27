# Pre-Deploy Verification Checklist

Run through this before pushing a release or after a big batch of changes.

---

## Public pages

- [ ] `/` - Homepage loads, hero visible, navigation works
- [ ] `/about` - Loads, content readable
- [ ] `/projects` - Grid displays, filters work, links work
- [ ] `/projects/audio-amplifier` - Detail page loads, gallery works, highlights visible
- [ ] `/projects/led-cube` - Detail page loads, video player visible
- [ ] `/projects/astoncv` - Detail page loads
- [ ] `/projects/zacess-pages` - Detail page loads
- [ ] `/projects/cnc-control` - Detail page loads
- [ ] `/projects/goods-lift` - Detail page loads
- [ ] `/projects/cad-portfolio` - Detail page loads
- [ ] `/projects/git-unlocked` - Detail page loads
- [ ] `/projects/phaemos` - Detail page loads
- [ ] `/projects/avr-zac` - Detail page loads
- [ ] `/experience` - Loads correctly, timeline renders
- [ ] `/skills` - Skills grid renders, icons load
- [ ] `/cv` - CV page loads, PDF preview works, download buttons work
- [ ] `/blog` - Loads, published posts visible
- [ ] `/blog/[slug]` - A published post loads and renders correctly
- [ ] `/notes` - Loads, note articles accessible
- [ ] `/lab` - Loads
- [ ] `/now` - Loads
- [ ] `/consumed` - Loads, tabs work, media cards render
- [ ] `/newsletter` - Loads, subscribe form visible
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
- [ ] Share button - Present on project detail, blog post, experience, skills, about, notes, newsletter, now, consumed, colophon, uses, hall-of-fame, notes sub-pages; click on desktop shows "Copied!" for ~2s; mobile share sheet opens
- [ ] OG thumbnails - View source of any public page and confirm `<meta property="og:image">` present with `/api/og?title=...` URL
- [ ] OG image renders - Visit `/api/og?title=Test&description=Hello` directly and confirm image renders correctly

## CV downloads

- [ ] PDF download - Downloads correct Isaac_Adjei_CV.pdf (not stale)
- [ ] Word download - Downloads Isaac_Adjei_CV.docx (not JSON error)
- [ ] Role PDFs - cv-software.pdf, cv-embedded.pdf, cv-devops.pdf, cv-quant.pdf, cv-security.pdf, cv-data.pdf all open correctly
- [ ] Role DOCX - Each role-specific Word file downloads with the correct filename
- [ ] Print button - Opens new tab and triggers print dialog
- [ ] CV preview iframe - Renders inline on /cv page

## Dashboard - authentication

- [ ] `/dashboard/login` - Sign in with GitHub works, redirects to /dashboard on success
- [ ] `/dashboard` when logged out - Redirects to login
- [ ] PIN gate - Prompts for PIN on Diary, Notes and Vault; correct PIN grants access
- [ ] PIN cookie - Confirm cookie is httpOnly and SameSite=Strict in DevTools > Application
- [ ] Inactivity logout - Auto-logs out after 1 hour of inactivity

## Dashboard - features

- [ ] `/dashboard/me` - Bio, stats and links load
- [ ] `/dashboard/us` - Content loads
- [ ] `/dashboard/goals` - List renders, add/edit/delete CRUD works
- [ ] `/dashboard/goals/[category]` - Category filter pages load
- [ ] `/dashboard/health` - Overview loads
- [ ] `/dashboard/health/[section]` - Gym, nutrition and running sub-pages load
- [ ] `/dashboard/diary` - Entries show, mood chart renders, write/edit/delete work
- [ ] `/dashboard/notes` - Notes list, PIN gate, folder view work
- [ ] `/dashboard/notes/[folder]` - Folder-filtered view loads
- [ ] `/dashboard/applications` - Internships and Jobs tabs load, status dropdown works
- [ ] `/dashboard/vault` - PIN gate, entries list, CRUD work
- [ ] `/dashboard/streaks` - Cards show, 90-day heatmap renders, activity line chart renders, check-in works
- [ ] `/dashboard/settings` - PIN change, theme toggle, scraper trigger, test digest button all work
- [ ] `/dashboard/course` - Course module list loads
- [ ] `/dashboard/modules` - Module overview loads
- [ ] `/dashboard/modules/[year]` - Year-filtered module pages load
- [ ] `/dashboard/wishlist` - List loads, CRUD works
- [ ] `/dashboard/wishlist/[category]` - Category pages load
- [ ] `/dashboard/inventory` - List loads, CRUD works
- [ ] `/dashboard/inventory/[category]` - Category pages load

## Dashboard - widgets

- [ ] Quick Capture FAB - Opens dialog on click, all 4 tabs (Diary/Note/Goal/Job) save correctly, toast confirms success
- [ ] Keyboard shortcuts - g+d navigates to Diary, g+n to Notes, g+g to Goals, g+a to Applications, g+h to Health, g+s to Streaks, g+v to Vault, g+x to Settings
- [ ] Keyboard shortcut help - ? key opens help dialog listing all shortcuts
- [ ] Ctrl+K global search - Opens command palette, typing filters goals/notes/diary/applications, Enter navigates
- [ ] Dark mode - Toggle in Settings persists on page reload and across different browsers/tabs

## Security

- [ ] `/api/dashboard/*` routes return 401 when called without a valid session
- [ ] PIN cookie is httpOnly and SameSite=Strict (no JavaScript access, no cross-site send)
- [ ] No secrets visible in client-side bundle (check Network tab, confirm no .env values in JS files)
- [ ] CSP headers present on public pages (check Response headers for Content-Security-Policy)
- [ ] X-Frame-Options: SAMEORIGIN on CV page (iframe preview works, but page cannot be embedded externally)
- [ ] robots.txt disallows /dashboard and /api/dashboard
- [ ] Contact and newsletter API responses include `Cache-Control: no-store` header (check Network tab)
- [ ] Newsletter rate limit - submit 4 times from the same IP; 4th returns HTTP 429
- [ ] OG route strips non-ASCII - visit `/api/og?title=test%C3%A9` and confirm `é` not rendered in the image
- [ ] Dashboard server actions reject invalid input - call a write action with a 501-char string and confirm `{ error: "Invalid input" }` returned

## Performance

- [ ] Public pages load in under 3 seconds on simulated slow 3G (Chrome DevTools throttling)
- [ ] No console errors on any public page
- [ ] No console errors on any dashboard page
- [ ] No hydration warnings in the browser console on any page

---

## Sign-off

**Date:** ___________
**Issues found:** ___________
