# styles/

Global CSS not handled by Tailwind's utility classes, imported once in `app/layout.tsx` alongside `app/globals.css`.

## Files

| File | Description |
| --- | --- |
| `animations.css` | Keyframe animations referenced by class name across components: `animate-float`, `animate-float-slow`, `animate-float-slower`, `animate-shimmer`, `animate-pulse-glow`. None of these are currently used on `/` or `/projects` - confirmed during the 2026-06-18 mobile crash investigation as not part of that bug. |
