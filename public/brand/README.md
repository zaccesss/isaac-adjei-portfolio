# Brand kit - isaacadjei.me

The IA mark set as static SVG sources. The live site renders these as React components
(`components/shared/marks/`, `components/shared/ScriptMark.tsx`, `app/icon.svg`); the files
here are the portable exports for everywhere else.

## Colours (hue 225)

| Role | Light context | Dark context |
| --- | --- | --- |
| Accent | `#2445A8` | `#5778DB` |
| Background | `#FFFFFF` | `#121212` |
| Foreground | `#05070D` | `#FAFAFA` |

## Naming

- `*-on-dark.svg` - white mark, transparent background, for **dark** surfaces.
- `*-on-light.svg` - near-black mark, transparent background, for **light** surfaces.
- Tiles (`favicon*`, `app-icon`, `type-tile-*`) carry their own background.

## The marks and where they ship

| File | What | Ships as |
| --- | --- | --- |
| `favicon.svg` | knockout "ia" tile, flips with device light/dark | `app/icon.svg` (browser favicon) |
| `favicon-on-light.svg` / `-on-dark.svg` | the two fixed favicon modes | favicon renders |
| `app-icon.svg` | solid dark tile, white "ia", blue dot | iOS icon + social share card |
| `signature-*.svg` | the cursive signature | site header (top-left) |
| `standby-*.svg` | the "ia" mark | avatar, dashboard sidebar, page loaders |
| `constellation-*.svg` | node-and-edge net | the 404 |
| `copper-*.svg` | PCB traces | /lab loading |
| `braille-*.svg` | "ia" in braille (dots 2+4, then 1) | /lab divider |
| `segment-clock-*.svg` | "I:A" seven-segment | dashboard home |
| `header-lockup-*.svg` | mark + "isaac adjei" wordmark | wide/email/banner contexts |
| `italic-*.svg` | italic ligature | alternate wordmark |
| `type-tile-*.svg` | earlier concept tile | alternate (favicon supersedes it) |

## Formats

SVG is the master. `png/` holds the handful of ready rasters worth linking or uploading
directly:

- `png/app-icon-1000.png` / `-512.png` (+ `.webp`) - avatars, social share, status-page logo, newsletter logo.
- `png/favicon-180.png` / `-32.png` - apple-touch and small favicon fallbacks.
- `png/standby-on-dark-1000.png` / `-512.png`, `standby-on-light-512.png` - the mark as an avatar on dark or light.

For any other size or format, render from the SVGs. The full multi-size, multi-format
export (every mark, every variant, PNG/WebP/JPEG at every size) lives outside the repo in
the owner's local logo kit, whose README carries the per-platform upload cheat-sheet
(GitHub, X, LinkedIn, Discord, Better Stack, beehiiv, favicons).
