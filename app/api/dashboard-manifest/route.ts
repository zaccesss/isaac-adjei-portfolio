// I serve the dashboard PWA manifest separately from the public portfolio manifest.
// The dashboard layout references this route so browsers offer a distinct "Install Dashboard"
// prompt when on /dashboard, independent of the public site install prompt.

export function GET() {
  const manifest = {
    name: "Dashboard | Isaac Adjei",
    short_name: "DIA",
    description: "Isaac Adjei's personal dashboard",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    orientation: "portrait",
    icons: [
      {
        src: "/images/avatar.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/avatar.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
