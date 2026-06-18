// I split flat data files into one-file-per-entry with barrel index.ts files.
// Run: npx tsx scripts/split-data.ts
// This was a one-time migration script - kept for reference in case new flat files need splitting.
//
// Usage: add a call to splitFile() at the bottom for any new flat data file,
// then run this script once and delete the original flat file.

import * as fs from "fs"
import * as path from "path"

// I use a brace-aware parser to find top-level object boundaries inside an array.
// Simple regex splits fail on nested objects and template literals with ${} inside strings.
function extractEntries(src: string, arrayOpenIdx: number): string[] {
  const results: string[] = []
  let i = arrayOpenIdx + 1
  const len = src.length

  while (i < len) {
    // Skip whitespace and commas between entries
    while (i < len && /[\s,]/.test(src[i])) i++
    if (i >= len || src[i] === "]") break

    if (src[i] !== "{") {
      i++
      continue
    }

    // Track brace depth to find the end of this object
    let depth = 0
    let inSingleStr = false
    let inDoubleStr = false
    let inTemplate = 0
    const start = i

    while (i < len) {
      const ch = src[i]

      if (inSingleStr) {
        if (ch === "\\" ) { i += 2; continue }
        if (ch === "'") inSingleStr = false
      } else if (inDoubleStr) {
        if (ch === "\\") { i += 2; continue }
        if (ch === '"') inDoubleStr = false
      } else if (inTemplate > 0) {
        if (ch === "\\") { i += 2; continue }
        if (ch === "`") { inTemplate--; i++; continue }
        if (ch === "$" && src[i + 1] === "{") {
          // Nested expression inside template literal - just track braces
          depth++
          i += 2
          continue
        }
      } else {
        if (ch === "'") { inSingleStr = true; i++; continue }
        if (ch === '"') { inDoubleStr = true; i++; continue }
        if (ch === "`") { inTemplate++; i++; continue }
        if (ch === "{") depth++
        if (ch === "}") {
          depth--
          if (depth === 0) {
            results.push(src.slice(start, i + 1).trim())
            i++
            break
          }
        }
      }
      i++
    }
  }
  return results
}

function findArrayOpen(src: string, varDecl: string): number {
  const declIdx = src.indexOf(varDecl)
  if (declIdx === -1) throw new Error(`Cannot find "${varDecl}" in source`)
  const bracketIdx = src.indexOf("[", declIdx)
  if (bracketIdx === -1) throw new Error(`Cannot find opening [ after "${varDecl}"`)
  return bracketIdx
}

function findArrayClose(src: string, openIdx: number): number {
  let depth = 0
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === "[") depth++
    if (src[i] === "]") { depth--; if (depth === 0) return i }
  }
  throw new Error("No matching ] found")
}

interface SplitOptions {
  /** Source file path (flat data file) */
  srcFile: string
  /** Variable declaration to find the array, e.g. "const posts: BlogPost[] = [" */
  varDecl: string
  /** Directory to write individual entry files into */
  outDir: string
  /** Import type to add at the top of each entry file, e.g. 'import type { BlogPost } from "../index"' */
  importLine: string
  /** Function to derive the const name and filename from the parsed entry string */
  entryName: (raw: string, index: number) => { constName: string; filename: string }
  /** TypeScript type annotation for the const, e.g. "BlogPost" */
  typeName: string
}

function splitFile(opts: SplitOptions): void {
  const src = fs.readFileSync(opts.srcFile, "utf8")
  const arrayOpen = findArrayOpen(src, opts.varDecl)
  const arrayClose = findArrayClose(src, arrayOpen)
  const entries = extractEntries(src, arrayOpen)

  fs.mkdirSync(opts.outDir, { recursive: true })

  for (let i = 0; i < entries.length; i++) {
    const raw = entries[i]
    const { constName, filename } = opts.entryName(raw, i)
    const content = `${opts.importLine}\nconst ${constName}: ${opts.typeName} = ${raw}\nexport default ${constName}\n`
    fs.writeFileSync(path.join(opts.outDir, filename), content)
    console.log(`  wrote ${filename}`)
  }

  console.log(`\nSplit ${entries.length} entries from ${path.basename(opts.srcFile)} into ${opts.outDir}`)
}

// ─── Example usage (uncomment and adapt for new flat files) ────────────────────
//
// splitFile({
//   srcFile: "data/blog.ts",
//   varDecl: "export const posts: BlogPost[] = [",
//   outDir: "data/blog/posts",
//   importLine: 'import type { BlogPost } from "../index"',
//   typeName: "BlogPost",
//   entryName: (raw, i) => {
//     const match = raw.match(/slug:\s*["']([^"']+)["']/)
//     const slug = match?.[1] ?? `post_${i}`
//     const constName = `_${slug.replace(/-/g, "_")}`
//     return { constName, filename: `${slug}.ts` }
//   },
// })
