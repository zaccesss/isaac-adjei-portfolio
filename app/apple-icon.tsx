// Apple touch icon for the iOS home screen. iOS does not support SVG favicons, so
// I render the "ia." type tile (concept 24) to a PNG via Satori at build time.
// A solid dark tile keeps the mark legible on whatever wallpaper it lands on.

import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#05070D",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            fontSize: 104,
            fontWeight: 800,
            letterSpacing: -8,
            color: "#FFFFFF",
          }}
        >
          ia
          <span style={{ color: "#5778DB" }}>.</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
