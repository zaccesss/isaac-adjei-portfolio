// Vercel's CDN caches a route-handler response when it sees s-maxage, but Next.js rewrites the
// plain Cache-Control header on dynamic route handlers (ones that read Redis or fetch) and strips
// s-maxage before it ever reaches the edge - so with only Cache-Control the response is never
// cached (no x-vercel-cache header). CDN-Cache-Control and Vercel-CDN-Cache-Control are NOT
// touched by Next, and Vercel reads them for its edge cache, so they are what actually makes the
// caching work. Cache-Control is kept for the browser, telling it to always revalidate against the
// shared edge copy rather than holding its own. See https://vercel.com/docs/edge-network/caching
export function cdnCache(sMaxage: number, swr: number = sMaxage * 2): Record<string, string> {
  const cdn = `public, s-maxage=${sMaxage}, stale-while-revalidate=${swr}`
  return {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "CDN-Cache-Control": cdn,
    "Vercel-CDN-Cache-Control": cdn,
  }
}
