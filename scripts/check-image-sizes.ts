// I scan public/images for source files large enough to break Vercel's image optimizer.
// Run: npx tsx scripts/check-image-sizes.ts
//
// Vercel's image optimizer silently falls back to serving the original file untouched when
// it fails to resize a source image, instead of erroring. A 14467x9744px (140 megapixel) file
// once made it into public/images this way and crashed every mobile visitor's browser - the
// _next/image endpoint returned the full original image regardless of the requested width,
// decoding to ~537MB in browser memory for a single thumbnail. This script catches that class
// of bug before it reaches production.

import * as fs from "fs"
import * as path from "path"
import sizeOf from "image-size"

const IMAGES_DIR = path.join(__dirname, "..", "public", "images")
const MAX_MEGAPIXELS = 50
const EXTENSIONS = new Set([".webp", ".jpg", ".jpeg", ".png", ".avif"])

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(fullPath, files)
    else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(fullPath)
  }
  return files
}

const offenders: { file: string; width: number; height: number; megapixels: number }[] = []

for (const file of walk(IMAGES_DIR)) {
  const { width, height } = sizeOf(fs.readFileSync(file))
  if (!width || !height) continue
  const megapixels = (width * height) / 1_000_000
  if (megapixels > MAX_MEGAPIXELS) {
    offenders.push({ file: path.relative(process.cwd(), file), width, height, megapixels })
  }
}

if (offenders.length > 0) {
  console.error(`Found ${offenders.length} image(s) over ${MAX_MEGAPIXELS} megapixels - these can break Vercel's image optimizer and crash mobile browsers:\n`)
  for (const o of offenders) {
    console.error(`  ${o.file}  ${o.width}x${o.height}  (${o.megapixels.toFixed(1)} MP)`)
  }
  console.error("\nDownscale these before committing - a project thumbnail rarely needs more than 2000px on the long edge.")
  process.exit(1)
} else {
  console.log(`All images under ${MAX_MEGAPIXELS} megapixels.`)
}
