import type { TILEntry } from "../index"

const _feynman_technique: TILEntry = {
    id: "feynman-technique",
    title: "If you cannot explain it simply, you do not understand it yet",
    date: "2026-06-22",
    category: "Life",
    published: true,
    body: "The [Feynman Technique](https://fs.blog/feynman-technique/) is a four-step method: pick a concept, explain it as if teaching a child, find the gaps where your explanation breaks down, then go back to the source. The gaps are the honest map of what you actually know. I use it before any exam or technical interview: not to rehearse the right answer, but to identify where my model of a concept is shallow. The test is not 'can I recite the definition' but 'can I explain the mechanism in plain language without jargon'.",
    detail: [
      {
        type: "p",
        text: "The part that surprises people: using simple language is harder than using jargon. Jargon is a way of deferring explanation. When you force yourself to use plain English, you discover whether you actually understand the concept or just recognise the vocabulary around it.",
      },
      {
        type: "note",
        text: "This applies directly to technical writing. If a sentence in a README or a comment requires domain knowledge to parse, it is probably shallow. The goal is for a future reader (or future me) to understand the mechanism, not just recognise that one was in play.",
      },
    ],
    tags: ["learning", "life", "productivity"],
    source: { label: "Farnam Street: The Feynman Technique", url: "https://fs.blog/feynman-technique/" },
  }

export default _feynman_technique
