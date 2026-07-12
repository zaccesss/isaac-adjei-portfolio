"use client"
// Google Analytics + the Cloudflare beacon load on the public site only. The dashboard is my
// own traffic, so counting it skews the visitor stats, and the beacons were the source of the
// CSP violations in the dashboard console.
import Script from "next/script"
import { usePathname } from "next/navigation"

export default function Analytics({ gaId, cfToken }: { gaId?: string; cfToken?: string }) {
  const pathname = usePathname()
  if (pathname?.startsWith("/dashboard")) return null
  return (
    <>
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}
      {/* Cloudflare Web Analytics - privacy-friendly, cookieless. Loads only when the token is set. */}
      {cfToken && (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon={`{"token": "${cfToken}"}`}
        />
      )}
    </>
  )
}
