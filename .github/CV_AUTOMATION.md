# CV Automation System

## How I Automated My CV Generation

I got tired of manually updating 7 different CV files every time I wanted to tweak my experience or add a new project. So I built this automation system that generates all my role-specific CVs from a single YAML file.

## The Problem I Solved

Before this system, I had:
- `cv.html` - My main CV
- `cv-software.html` - Software Engineering focus
- `cv-embedded.html` - Embedded Systems focus
- `cv-data.html` - Data/AI focus
- `cv-devops.html` - DevOps focus
- `cv-quant.html` - Quantitative Developer focus
- `cv-security.html` - Cybersecurity focus

Every time I updated my skills, projects, or experience, I had to manually edit all 7 files. This was tedious and error-prone. I'd often forget to update one, or they'd get out of sync.

## My Solution

I created a single source of truth: `data/cv.yml`. This YAML file contains:
- My personal information (name, contact, etc.)
- Education details
- Skills organised by role (software, embedded, data, devops, quant, security)
- Projects with role tags (each project specifies which CVs it should appear on)
- Experience entries with role tags
- Role-specific profile summaries
- Custom section ordering for each role

Then I wrote a generator script (`scripts/generate-cvs.js`) that reads this YAML and generates all 7 CV HTML files automatically.

## How I Use It

### During Development (Watch Mode)

When I'm actively updating my CV, I run the watch mode:

```bash
npm run watch-cvs
```

This watches `data/cv.yml` and automatically regenerates all CVs every time I save the file. I keep this running in one terminal while I edit the YAML in another. It's like live reload for CVs.

### Before Building (Pre-build Hook)

I added a pre-build hook to `package.json`:

```json
"build": "npm run generate-cvs && next build"
```

This ensures CVs are always regenerated before deploying to production. I never have to worry about stale CVs being deployed.

### On Git Push (CI/CD)

I also set up a GitHub Actions workflow (`.github/workflows/generate-cvs.yml`) that:
1. Triggers whenever `data/cv.yml` or `scripts/generate-cvs.js` is pushed to main
2. Runs the generator script
3. Commits the updated CV HTML files back to the repo

This means I can edit `cv.yml` directly on GitHub's web interface, and the CVs will auto-update without me touching my local machine.

## The Role-Specific Magic

Each CV is tailored to a specific engineering role. Here's how I control what appears on each:

### Skills by Role

In `cv.yml`, I define skills separately for each role:

```yaml
skills:
  software:
    languages: ["TypeScript", "JavaScript", "Python", "SQL", "C", "C++", "Java"]
    frontend: ["React", "Next.js", "Tailwind CSS", "HTML5", "CSS3"]
    # ... more categories
  
  embedded:
    languages: ["C", "C++", "Embedded C", "Assembly (ARM)"]
    microcontrollers: ["Arduino", "STM32", "ESP32", "AVR"]
    # ... different categories
```

### Projects with Role Tags

Each project specifies which CVs it should appear on:

```yaml
projects:
  - name: "PHAEMOS: Smart Maintenance Platform"
    role_tags: ["software", "embedded", "data", "devops"]
    # This project appears on 4 different CVs
```

### Section Ordering

I reorder sections based on role priority. For technical roles, Skills and Projects come before Education:

```yaml
role_section_order:
  software: ["profile", "education", "skills", "projects", "experience"]
  embedded: ["profile", "skills", "projects", "education", "experience"]
  # Embedded puts skills first since that's what recruiters care about most
```

## The Three Automation Methods

### Method 1: Build-time Generation

Every time I run `npm run build`, CVs are regenerated first. This ensures production always has the latest versions.

### Method 2: Watch Mode

During development, I run `npm run watch-cvs` which provides live reload for CVs. Edit YAML → Save → CVs update instantly.

### Method 3: GitHub Actions CI/CD

When I push changes to `cv.yml` on GitHub, the Actions workflow automatically regenerates and commits the updated CVs. No manual intervention needed.

## Why This Works for Me

1. **Single source of truth** - One YAML file controls everything
2. **No manual syncing** - Edit once, update everywhere
3. **Role-appropriate content** - Each CV only shows relevant skills/projects
4. **Consistent formatting** - All CVs use the same CSS and structure
5. **Version controlled** - Every change is tracked in git
6. **Flexible** - I can easily add new roles or rearrange sections

## Files in This System

- `data/cv.yml` - The master data file (edit this!)
- `scripts/generate-cvs.js` - Generator script
- `scripts/watch-cvs.js` - File watcher for development
- `.github/workflows/generate-cvs.yml` - CI/CD workflow
- `public/resume/cv*.html` - Generated CVs (don't edit these directly!)

## My Workflow

1. **Edit** `data/cv.yml` with new experience, skills, or projects
2. **Save** - If in watch mode, CVs auto-regenerate
3. **Preview** - Open `http://localhost:3000/cv` to see changes
4. **Commit** - Push to GitHub triggers CI/CD which updates the rest
5. **Deploy** - `npm run build` ensures production has latest CVs

## Adding a New Role

If I want to add a "Machine Learning Engineer" CV:

1. Add `ml_engineer` section to `skills` in `cv.yml`
2. Add `ml_engineer` to `role_tags` on relevant projects
3. Add `ml_engineer` to `role_profiles` with a tailored summary
4. Add `ml_engineer` section order to `role_section_order`
5. Run `npm run generate-cvs` or let watch mode handle it
6. Add new API routes: `/api/cv-ml-pdf` and `/api/cv-ml-word`
7. Add to CV picker page

The generator will automatically create `cv-ml-engineer.html` with all the right content in the right order.

## Tips for Using This System

- **Don't edit the HTML files directly** - they'll be overwritten
- **Use the watch mode during CV updates** - it's much faster
- **Test print-to-PDF from the browser** - the HTML is optimised for this
- **Keep projects tagged with relevant roles** - this controls CV content
- **Use YAML anchors for repeated content** - reduces duplication

## Future Improvements

I'm considering adding:
- Automatic PDF generation via Puppeteer (currently I print-to-PDF manually)
- Cover letter generation from the same YAML
- Auto-updating LinkedIn via API when CV changes
- Skills analytics (track which skills appear on most CVs)

For now, this system saves me hours every time I need to update my CVs.
