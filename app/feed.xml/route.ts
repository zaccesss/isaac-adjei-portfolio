// I permanently redirect /feed.xml to /blog/feed.xml for backwards compatibility.
// Existing subscribers who bookmarked or added the old URL are forwarded automatically.

export function GET(request: Request) {
  const url = new URL(request.url)
  const dest = new URL("/blog/feed.xml", url)
  dest.search = url.search
  return Response.redirect(dest.toString(), 301)
}
