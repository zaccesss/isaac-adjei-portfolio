import type { BlogPost } from "../index"

const _typescript_patterns_that_actually_matter: BlogPost = {
    slug: "typescript-patterns-that-actually-matter",
    title: "TypeScript Patterns That Actually Matter in Production",
    date: "2026-04-15",
    type: "blog",
    cover_image: "/images/blog/covers/typescript-patterns-that-actually-matter.webp",
    description:
      "The TypeScript features and patterns that have made the biggest practical difference in real codebases: discriminated unions, the satisfies operator, branded types, const assertions and when strict mode actually catches bugs.",
    tags: ["TypeScript", "Software Engineering", "Web", "Best Practices"],
    published: true,
    content: [
      {
        type: "p",
        text: "[TypeScript](https://www.typescriptlang.org) is not just JavaScript with types sprinkled on top. Used well, it changes how you design code and catches entire categories of bugs before they reach production. Used poorly, it becomes a type annotation layer that everyone works around with any and type assertions. The difference is in which features you reach for and when.",
      },
      {
        type: "p",
        text: "This post covers the patterns I have found most practically useful in real codebases - not theoretical correctness, but genuine reduction in bugs and improvement in maintainability. All examples are drawn from actual code.",
      },
      {
        type: "h2",
        text: "Discriminated Unions Over Boolean Flags",
      },
      {
        type: "p",
        text: "Boolean flags on objects compose badly. An object with isLoading, isError and isSuccess flags can theoretically be in seven states, four of which are invalid. TypeScript cannot help you if you set isLoading: true and isSuccess: true at the same time - both are valid booleans. A discriminated union makes invalid states unrepresentable.",
      },
      {
        type: "code",
        lang: "typescript",
        text: `// I avoid this - 4 invalid states are representable
type BadState = {
  isLoading: boolean
  isError: boolean
  data: User | null
  error: Error | null
}

// I use this instead - only valid states exist
type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: Error }

// TypeScript now narrows correctly in exhaustive switch
function render(state: FetchState) {
  switch (state.status) {
    case "loading": return <Spinner />
    case "success": return <UserCard user={state.data} />  // data is User, not User | null
    case "error":   return <ErrorMessage error={state.error} />
    case "idle":    return null
  }
}`,
      },
      {
        type: "h2",
        text: "The satisfies Operator",
      },
      {
        type: "p",
        text: "Introduced in TypeScript 4.9, satisfies validates that a value matches a type without widening the inferred type. This is useful when you want type checking on an object literal but also want TypeScript to infer the precise literal types of each value.",
      },
      {
        type: "code",
        lang: "typescript",
        text: `type Routes = Record<string, { path: string; auth: boolean }>

// With 'as': loses the literal type, path is string not "/dashboard"
const routes1 = {
  dashboard: { path: "/dashboard", auth: true },
} as Routes

// With 'satisfies': validates shape AND preserves literal types
const routes2 = {
  dashboard: { path: "/dashboard", auth: true },
} satisfies Routes

// routes2.dashboard.path is "/dashboard", not string
// routes1.dashboard.path is string`,
      },
      {
        type: "h2",
        text: "Branded Types for Domain Primitives",
      },
      {
        type: "p",
        text: "TypeScript's structural type system means string is string everywhere. A function that takes a UserId accepts any string. A function that takes an Email accepts any string. Swapping them at the call site is a silent bug that TypeScript cannot catch without branded types.",
      },
      {
        type: "code",
        lang: "typescript",
        text: `// I brand primitive types so they are not interchangeable
type UserId = string & { readonly __brand: "UserId" }
type Email  = string & { readonly __brand: "Email"  }

// I provide type-safe constructors that validate before branding
function toUserId(id: string): UserId {
  if (!id.match(/^user_[a-z0-9]{16}$/)) throw new Error("Invalid UserId")
  return id as UserId
}

// Now TypeScript prevents accidentally passing an Email where a UserId is expected
function getUser(id: UserId): Promise<User> { /* ... */ }

const email = "user@example.com" as Email
getUser(email)  // Error: Argument of type 'Email' is not assignable to 'UserId'`,
      },
      {
        type: "h2",
        text: "const Assertions for Literal Inference",
      },
      {
        type: "p",
        text: "When you assign an array or object literal without a type annotation, TypeScript widens the types: [1, 2, 3] becomes number[], not [1, 2, 3]. Adding as const prevents widening and makes the value deeply readonly with literal types inferred throughout.",
      },
      {
        type: "code",
        lang: "typescript",
        text: `const ROLES = ["admin", "editor", "viewer"] as const
type Role = typeof ROLES[number]  // "admin" | "editor" | "viewer"

// I use as const for lookup tables to get precise key/value types
const STATUS_CODES = {
  ok:        200,
  created:   201,
  not_found: 404,
} as const

type StatusCode = typeof STATUS_CODES[keyof typeof STATUS_CODES]  // 200 | 201 | 404`,
      },
      {
        type: "h2",
        text: "Exhaustiveness Checking with never",
      },
      {
        type: "p",
        text: "When switching on a discriminated union, TypeScript can verify you have handled every case if you add a default branch that assigns to never. If a new variant is added to the union and the switch is not updated, the compiler reports an error.",
      },
      {
        type: "code",
        lang: "typescript",
        text: `function assertNever(x: never): never {
  throw new Error("Unhandled case: " + JSON.stringify(x))
}

type Shape = { kind: "circle"; r: number } | { kind: "rect"; w: number; h: number }

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.r ** 2
    case "rect":   return s.w * s.h
    default:       return assertNever(s)  // Error if a new Shape variant is added
  }
}`,
      },
      {
        type: "h2",
        text: "When strict Mode Actually Catches Bugs",
      },
      {
        type: "p",
        text: "strictNullChecks is the single most valuable flag in the strict suite. It catches null/undefined access that would be a runtime TypeError. With it enabled, TypeScript forces you to handle the nullable case: user?.name instead of user.name, the ?. operator becomes not just a convenience but a compiler-enforced contract.",
      },
      {
        type: "p",
        text: "noUncheckedIndexedAccess is not in strict by default but is worth enabling. Without it, array[0] has type T even if the array is empty. With it, array[0] has type T | undefined, forcing you to handle the out-of-bounds case. This catches a surprisingly common class of bugs in loops and data transformations.",
      },
      {
        type: "quote",
        text: "A type system is most valuable not when it helps you write code but when it stops you writing bad code.",
        source: "TypeScript engineering principle",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "TypeScript official documentation and language reference", url: "https://www.typescriptlang.org/docs/" },
          { text: "TypeScript Handbook - the primary guide to TypeScript features", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
          { text: "TypeScript 4.9 release notes: the satisfies operator", url: "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html" },
          { text: "Zod - TypeScript-first schema validation library", url: "https://zod.dev" },
          { text: "Matt Pocock: Total TypeScript - advanced TypeScript patterns in depth", url: "https://www.totaltypescript.com/" },
          { text: "TypeScript Deep Dive - Basarat Ali Syed (free online)", url: "https://basarat.gitbook.io/typescript/" },
          { text: "MDN: TypeScript in Svelte - introductory TypeScript in a framework context", url: "https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/Svelte_TypeScript" },
        ],
      },
    ],
  }

export default _typescript_patterns_that_actually_matter
