// The IA signature mark (concept 14 "script"): one continuous cursive stroke that
// signs itself, an accent swash underlining it, and the i-dot popping in as an accent
// tittle. The stroke reads as currentColor so it inherits the header text colour; the
// swash and tittle use the site --primary token. Bumping `signKey` remounts the drawn
// group, which restarts the sign animation, so the header can re-sign on navigation.

import { cn } from "@/lib/utils"

const SIGN_D =
  "M15 63 C21 62 25 57 27 50 C27.6 47.6 28 46 28.2 45 C27.4 52 27.4 58 28.6 61.6 C29.4 63.8 31.8 63.8 33.8 61.8 C36 59.6 38 56 39.6 52.6 C42 48.4 46.4 45.6 50.8 45.4 C54.4 45.2 57 46.4 58.2 48.2 C54.6 45.8 49 46.4 45.8 50 C42.6 53.6 42.2 58.8 45 61.6 C47.8 64.4 52.6 63.6 55.4 60.4 C57.4 58.2 58.4 54.6 58.6 50.6 C58.2 55 58.2 59 59 61.8 C59.8 64 62.6 64 65 62 C67 60.4 68.6 58 70 55.4"
const SWASH_D = "M24 73 C38 76.5 56 75.5 76 70.5"

interface ScriptMarkProps {
  signKey?: number
  size?: number
  className?: string
  title?: string
}

export default function ScriptMark({ signKey = 0, size = 30, className, title = "Isaac Adjei" }: ScriptMarkProps) {
  return (
    <svg
      width={size * 1.7}
      height={size}
      viewBox="12 33 68 48"
      fill="none"
      role="img"
      aria-label={title}
      className={cn("text-foreground", className)}
    >
      <g key={signKey} className="script-mark">
        <path className="script-swash" d={SWASH_D} pathLength={100} />
        <path className="script-sign" d={SIGN_D} pathLength={100} />
        <circle className="script-tittle" cx="31" cy="37.5" r="2.7" />
      </g>
    </svg>
  )
}
