import type { TILEntry } from "../index"

const _css_logical_properties_rtl: TILEntry = {
    id: "css-logical-properties-rtl",
    title: "CSS logical properties make layout direction-agnostic without media queries",
    date: "2026-09-15",
    category: "CSS",
    published: true,
    body: "Instead of `margin-left` and `padding-right`, [CSS logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values) use `margin-inline-start` and `padding-inline-end`. These automatically flip in right-to-left layouts (Arabic, Hebrew, Persian) without any extra CSS. `block` maps to the vertical axis and `inline` to the horizontal. For projects that need RTL support, switching to logical properties eliminates an entire class of directional bug.",
    detail: [
      {
        type: "code",
        lang: "css",
        code: `/* Physical properties: break in RTL */
.card {
  margin-left: 1rem;
  padding-right: 1.5rem;
  border-left: 2px solid;
}

/* Logical properties: work in both LTR and RTL */
.card {
  margin-inline-start: 1rem;
  padding-inline-end: 1.5rem;
  border-inline-start: 2px solid;
}`,
        caption: "Logical properties flip automatically when dir='rtl' is set on the html element",
      },
      {
        type: "note",
        text: "Browser support is excellent as of 2025. Tailwind v3+ ships logical property utilities: `ms-4` (margin-inline-start), `pe-6` (padding-inline-end) and `border-s` (border-inline-start).",
      },
      {
        type: "link",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values",
        label: "MDN: CSS Logical Properties",
        description: "Full reference with all physical-to-logical property mappings and browser compatibility table.",
      },
    ],
    tags: ["CSS", "RTL", "i18n", "web"],
  }

export default _css_logical_properties_rtl
