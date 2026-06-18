import type { TILEntry } from "../index"

const _typescript_satisfies: TILEntry = {
    id: "typescript-satisfies",
    title: "TypeScript's `satisfies` operator validates a type without widening it",
    date: "2026-06-20",
    category: "TypeScript",
    published: true,
    body: "Before `satisfies` (TypeScript 4.9), the only way to verify an object matched a type was to annotate it: `const x: MyType = { ... }`. But annotation widens the variable's type to `MyType`, losing the narrow literal type information. [`satisfies`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html) checks the type constraint without changing the inferred type. The variable stays narrowly typed, but TypeScript will error if the shape does not satisfy the constraint.",
    detail: [
      {
        type: "code",
        lang: "typescript",
        code: `type Palette = Record<string, [number, number, number] | string>

// With annotation: TypeScript widens 'blue' to tuple | string
// so .toUpperCase() errors because string methods do not exist on tuples
const palette1: Palette = {
  red: [255, 0, 0],
  blue: "#0000ff",
}

// With satisfies: type is validated but NOT widened
// TS knows blue is string, red is [number, number, number]
const palette2 = {
  red: [255, 0, 0],
  blue: "#0000ff",
} satisfies Palette
palette2.blue.toUpperCase()    // ✓
palette2.red.at(0)             // ✓`,
        caption: "satisfies validates the shape against Palette without losing the narrow literal types",
      },
      {
        type: "link",
        url: "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html",
        label: "TypeScript 4.9: satisfies operator",
        description: "The release note with the original motivation, examples and comparison to the annotation approach.",
      },
    ],
    tags: ["TypeScript", "types", "web"],
  }

export default _typescript_satisfies
