# data/

Static data files that drive the portfolio's public-facing pages. Edited directly in TypeScript or YAML — no CMS.

## Files

| File | Description |
| --- | --- |
| `blog.ts` | Blog post metadata (slug, title, date, tags, summary) — one entry per published post |
| `cv.yml` | Structured CV data parsed by `scripts/generate-role-cvs.js` to assemble role-specific CVs |
| `education.ts` | Degree, A-levels, awards and academic achievements |
| `experience.ts` | Work experience, internships and virtual programmes — drives the `/experience` timeline |
| `links.ts` | Social and professional links shown on `/links` |
| `projects.ts` | 11 engineering and software projects — drives `/projects` cards and detail pages |
| `skills.ts` | Tech stack grouped by category — drives the `/skills` page |
| `social.ts` | Social profile URLs used across the site |
| `societies.ts` | University societies and committees |
