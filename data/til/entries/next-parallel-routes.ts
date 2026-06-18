import type { TILEntry } from "../index"

const _next_parallel_routes: TILEntry = {
    id: "next-parallel-routes",
    title: "Next.js parallel routes let you render multiple pages in the same layout simultaneously",
    date: "2026-09-26",
    category: "Next.js",
    published: true,
    body: "Parallel routes in [Next.js App Router](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes) use the `@slot` folder convention. You can render two independent route segments side by side in the same layout: each with its own loading, error and not-found states. Useful any time you want a main panel and a sidebar to navigate independently without wrapping everything in one client component.",
    detail: [
      {
        type: "p",
        text: "Each slot creates a named prop that the layout receives automatically. A layout at `app/shop/layout.tsx` with folders `app/shop/@cart/page.tsx` and `app/shop/@filters/page.tsx` receives `{ children, cart, filters }` as props.",
      },
      {
        type: "code",
        lang: "tsx",
        code: `// app/shop/layout.tsx
export default function ShopLayout({
  children,
  cart,
  filters,
}: {
  children: React.ReactNode
  cart: React.ReactNode
  filters: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[1fr_300px] gap-4">
      <div>{children}</div>
      <aside>
        {cart}
        {filters}
      </aside>
    </div>
  )
}`,
        caption: "Each @slot folder becomes a prop: no extra wiring needed",
      },
      {
        type: "note",
        text: "Slots do not affect the URL. `/shop/products` still works; each slot falls back to its `default.tsx` if the current URL has no matching segment for that slot.",
      },
      {
        type: "link",
        url: "https://nextjs.org/docs/app/building-your-application/routing/parallel-routes",
        label: "Next.js: Parallel Routes",
        description: "Official docs with diagrams showing the @slot folder convention and intercepting routes.",
      },
    ],
    tags: ["Next.js", "routing", "web"],
    source: { label: "Next.js docs: Parallel Routes", url: "https://nextjs.org/docs/app/building-your-application/routing/parallel-routes" },
  }

export default _next_parallel_routes
