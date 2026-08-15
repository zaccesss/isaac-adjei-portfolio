# components/

Shared React components. Organised by concern - import from the most specific subdirectory.

## Subdirectories

| Directory | Description |
| --- | --- |
| `analytics/` | Shared themed chart set for the dashboard's analytics pages: recharts wrappers (`charts.tsx` - LineChart/BarChart/PieChart/Treemap/Sankey/Radar/Composed/Bubble/StackedArea), bespoke primitives with no library equivalent (`Funnel.tsx`, `Waterfall.tsx`, `Bullet.tsx`, `BoxPlot.tsx`), ECharts-backed views (`echarts-theme.ts`, `CalendarHeatmap.tsx`, `GridHeatmap.tsx`, `RadialClock.tsx`, `Gauge.tsx`), `WordCloud.tsx` (`@visx/wordcloud`), `ApplicationsMap.tsx` (MapLibre GL JS + OpenFreeMap), plus `StatCard.tsx`, `ProgressBar.tsx`, `TrendIndicator.tsx` and the shared `AnalyticsPeriod` context/selector. `index.ts` re-exports the full public surface |
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
