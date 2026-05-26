---
name: next-session
description: Handoff doc - what was done 2026-05-26 and what is left to do
metadata:
  type: project
---

# Next Session Handoff

Last updated: 2026-05-26
Draft file: `memory/SOCIAL-PROFILES-DRAFT.md` - all copy-paste content is in there.

---

## Rules for this session (read before starting)

- Short and direct. No padding.
- No em dashes or en dashes anywhere - use hyphens or rephrase.
- No Oxford comma. Write "x, y and z" not "x, y, and z".
- No emojis unless Isaac explicitly asks.
- UK English (colour not color, organised not organized, recognised not recognized).
- When referencing files use markdown links.
- Commit format: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:` - no AI attribution lines.
- Never commit directly to main. Always branch, PR and auto-merge.
- Branch naming: `feat/description`, `fix/description`, `content/description`.
- Workflow: branch from main, update CHANGELOG.md under [Unreleased], push, PR, auto-merge.
- CI takes ~2 minutes. Wait for it to pass before moving on.
- No KiCad anywhere in Isaac's projects - everything PCB-related was done in Proteus 11.
- Do not say "first-year project" or "aspiring" anywhere.

Full rules: `memory/RULES.md`

---

## What was done on 2026-05-26

### Code fix (committed - needs pushing via PR)
- `data/projects.ts` - audio amplifier: removed "first-year university project", replaced KiCad with Proteus 11, removed KiCad from technologies array

### LinkedIn - DONE
- Headline: finalised and updated on LinkedIn
- About section: finalised and pasted into LinkedIn
- Top 5 skills pinned to About: Embedded Systems, Python, Next.js, Machine Learning, PCB Design
- Education: all three entries reviewed and cleaned up (Aston, Stanmore, Adisadel)
- Projects: Two-Stage Audio Amplifier entry - description updated, media links added (website + GitHub), images uploaded

### LinkedIn - IN PROGRESS
- Projects: NeoPixel LED Cube entry exists but needs description updated to match draft

---

## What is left to do

### LinkedIn - Experience

**Edit existing entries:**

1. Student Representative (Aston Students' Union)
   - Remove last 2 bullets: "Communicate updates and outcomes back to students" and "Develop key skills in leadership, communication and problem solving"

2. British Airways (Engineering Operations & Maintenance Planning)
   - Delete the certificate text block entirely - it duplicates the description
   - Keep only the bullet points

3. Yunex Traffic (Virtual Work Experience)
   - Delete the certificate text block
   - Convert the paragraph description into bullet points

4. Casa do Frango
   - Rename job title from "Hospitality Staff" to "Waiter / Food Runner / Bar Back"

**Add new entries (all details in SOCIAL-PROFILES-DRAFT.md):**

5. Junior Apprentice HVAC Technician - Massive Refrigeration Services - Jul 2019 to Jul 2021 - Accra, Ghana - Part-time
6. Student Judge - targetjobs UK - Feb 2026 - Remote - Volunteer
7. Fundraising Volunteer - Cancer Research UK - Feb 2026 to Mar 2026 - United Kingdom

---

### LinkedIn - Projects

All descriptions, media links, image titles and descriptions are in `memory/SOCIAL-PROFILES-DRAFT.md`.

Status:
- [x] Two-Stage Audio Amplifier - DONE
- [ ] 4x4x4 NeoPixel LED Cube - update existing entry (description + media)
- [ ] PHAEMOS - Smart Maintenance Platform - add new
- [ ] git-unlocked - add new
- [ ] avr-zac - add new
- [ ] AstonCV - Full-Stack CV Database - add new
- [ ] CNC Milling Machine Control System - add new
- [ ] Goods Lift Control System - add new
- [ ] CAD Engineering Design Portfolio - add new
- [ ] zacess.com - Terminal Portfolio - add new

---

### LinkedIn - Still to do

- [ ] Skills section - add all skills from draft (Languages, Frontend, Backend, Embedded, AI/ML, Cloud, Cyber, Robotics, Tools, Professional)
- [ ] Featured section - add 5 items (isaacadjei.me, phaemos.com, git-unlocked, avr-zac, audio amplifier)
- [ ] Awards and Certifications - add Top 40 Finalist (Mar 2026) and Best and Most Hardworking Student (Jun 2024)
- [ ] Profile photo - currently no photo, add one before anything else

---

### GitHub - Still to do
- [ ] Update bio to: `EE & CS student @AstonUniversity | Hardware x Software | Embedded C, Next.js, Python, ML | Building PHAEMOS & avr-zac | isaacadjei.me`
- [ ] Pin these 6 repos in order: phaemos, avr-zac, git-unlocked, two-stage-audio-amplifier, neopixel-led-cube-project, astoncv

---

### Other profiles - Still to do
- [ ] Beehiiv - check bio matches LinkedIn About short version, link to isaacadjei.me
- [ ] ORCID - check name, affiliation (Aston University) and field (Electronic Engineering and Computer Science)

---

### Code - Still to do
- [ ] Commit and push the projects.ts fix (KiCad removed from audio amplifier) via proper PR workflow
- [ ] Check if any other projects.ts entries incorrectly mention KiCad

---

## Where everything is

- All LinkedIn copy: `memory/SOCIAL-PROFILES-DRAFT.md`
- Project descriptions: `data/projects.ts` (longDescription field for each project)
- Project images: `public/images/projects/[project-id]/` or grab from `isaacadjei.me/projects/[project-id]`
- Rules: `memory/RULES.md`
