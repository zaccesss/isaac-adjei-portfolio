// I generate the Open Graph preview image shown when the site is shared on social media.
// I use Next.js ImageResponse which renders JSX to a PNG via the 'tw' prop
// for Tailwind-like inline styles (processed by @vercel/og, not the regular Tailwind build).
// I run on the edge runtime to keep generation fast.

import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Isaac Adjei | EECS"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div tw="h-full w-full flex flex-col justify-between bg-slate-950 text-slate-50 p-16">
      <div tw="flex justify-between items-center text-[28px] tracking-[1px] uppercase text-slate-300">
        <span>Portfolio</span>
        <span>isaacadjei.me</span>
      </div>

      <div tw="flex flex-col gap-4">
        <div tw="text-[88px] font-extrabold leading-[1.05]">Isaac Adjei</div>
        <div tw="text-[44px] font-semibold text-blue-300">
          Electronic Engineering and Computer Science
        </div>
      </div>

      <div tw="flex justify-between items-center text-[30px] text-slate-300">
        <span>Full-Stack Software • Embedded Systems • IoT</span>
        <span tw="font-bold text-slate-200">EECS</span>
      </div>
    </div>,
    {
      ...size,
    }
  )
}
