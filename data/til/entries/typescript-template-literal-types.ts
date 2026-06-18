import type { TILEntry } from "../index"

const _typescript_template_literal_types: TILEntry = {
    id: "typescript-template-literal-types",
    title: "TypeScript template literal types let you build string union types from other unions",
    date: "2026-05-25",
    category: "TypeScript",
    published: true,
    body: "Template literal types (TypeScript 4.1+) work like template literals but at the type level. `type EventName<T extends string> = \\`${T}Changed\\`` produces a string type with the suffix appended. When the type parameter is a union, TypeScript distributes: `EventName<'color' | 'size'>` produces `'colorChanged' | 'sizeChanged'`. Combined with mapped types this generates typed event handler objects automatically.",
    detail: [
      {
        type: "code",
        lang: "typescript",
        code: `type Props = 'color' | 'size' | 'position'

// I generate event handler names from a union of prop names at the type level
type ChangeHandlers = {
  [K in Props as \`on\${Capitalize<K>}Change\`]: (value: string) => void
}
// Equivalent to:
// { onColorChange: (value: string) => void;
//   onSizeChange:  (value: string) => void;
//   onPositionChange: (value: string) => void }

// Generating CSS custom property names
type CSSVar<T extends string> = \`--\${T}\`
type ThemeVar = CSSVar<'primary' | 'secondary'>
// type ThemeVar = '--primary' | '--secondary'`,
        caption: "Template literal types distribute over unions automatically: no manual enumeration needed",
      },
      {
        type: "link",
        url: "https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html",
        label: "TypeScript: Template Literal Types",
        description: "The handbook section covering Capitalize, Lowercase and Uppercase utility types used with template literals.",
      },
    ],
    tags: ["TypeScript", "types", "web"],
  }

export default _typescript_template_literal_types
