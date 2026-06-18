# data/

Static data files that drive the portfolio's public-facing pages. All content is TypeScript.

## Structure

| Path | Description |
| --- | --- |
| `blog/index.ts` | Blog helpers and type exports. Import from `@/data/blog`. |
| `blog/posts/*.ts` | One file per blog post (38 files). Each exports a default `BlogPost`. |
| `til/index.ts` | TIL helpers: `getPublishedTILEntries()`, `getTILBySlug()` and type exports. Import from `@/data/til`. |
| `til/entries/*.ts` | One file per TIL entry (63 files). Each exports a default `TILEntry`. |
| `projects/index.ts` | Project helpers and type exports. Import from `@/data/projects`. |
| `projects/items/*.ts` | One file per project (11 files). Each exports a default `Project`. |
| `respub/index.ts` | Publications array and type exports. Import from `@/data/respub`. |
| `respub/items/*.ts` | One file per publication. |
| `consumed/index.ts` | Re-exports from all consumed category files. Import from `@/data/consumed`. |
| `consumed/types.ts` | Shared types: `Month`, `Video`, `Podcast`, `Book`, `Article`, `Resource`, `MusicEntry`. |
| `consumed/videos.ts` | YouTube video entries |
| `consumed/podcasts.ts` | Podcast episode entries |
| `consumed/books.ts` | Book entries |
| `consumed/music.ts` | Spotify playlist entries |
| `consumed/articles.ts` | Web article and essay entries |
| `consumed/resources.ts` | Documentation, course and tool entries |
| `consumed/others.ts` | Other consumed content entries |
| `cv.yml` | Structured CV data parsed by `scripts/generate-role-cvs.js` |
| `education.ts` | Degree, A-levels, awards and academic achievements |
| `experience.ts` | Work experience, internships and virtual programmes |
| `links.ts` | Social and professional links shown on `/links` |
| `skills.ts` | Tech stack grouped by category |
| `social.ts` | Social profile URLs used across the site |
| `societies.ts` | University societies and committees |

## Adding content

All imports resolve to the `index.ts` barrel file so nothing outside `data/` needs to change when adding entries.

To add a blog post: create `data/blog/posts/your-slug.ts` exporting a default `BlogPost` object and add a line to `data/blog/index.ts`.

To add a TIL entry: create `data/til/entries/your-id.ts` and add to `data/til/index.ts`.

To add a project: create `data/projects/items/your-slug.ts` and add to `data/projects/index.ts`.
