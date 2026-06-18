# components/

Shared React components. Organised by concern - import from the most specific subdirectory.

## Subdirectories

| Directory | Description |
| --- | --- |
| `blog/` | Blog-specific components: `PostCard.tsx` (post listing card), `ScrollDepthTracker.tsx` (fires scroll-depth events to `/api/blog/read-event`) |
| `cv/` | CV viewer component used on the `/cv` page |
| `dashboard/` | Dashboard widgets, stat cards and data display components |
| `forms/` | Contact form and newsletter signup form with Turnstile CAPTCHA |
| `layout/` | Site-wide layout: header, footer, mobile nav |
| `projects/` | Project cards and detail page components |
| `providers/` | React context providers (theme, session) |
| `sections/` | Homepage sections: hero, live status grid, social links |
| `consumed/` | Consumed item card components: BookCard, VideoCard, PodcastsContent, LinkCard, ResourceCard, SpotifyNowPlaying |
| `search/` | `SearchClient.tsx` - full-text search client component |
| `shared/` | Cross-page reusable components: breadcrumbs, badges, section wrappers |
| `tags/` | `TagsClient.tsx` - tag cloud client component with search |
| `til/` | `TILList.tsx` - TIL list with search, category filter and pagination |
| `ui/` | shadcn/ui primitives (button, card, dialog, etc.) - auto-generated, do not edit by hand |
