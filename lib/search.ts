// I score a single field against a query: exact match = 3, starts-with = 2, contains = 1, no match = 0.
export function fieldScore(text: string, query: string): number {
  const t = text.toLowerCase()
  const q = query.toLowerCase()
  if (t === q) return 3
  if (t.startsWith(q)) return 2
  if (t.includes(q)) return 1
  return 0
}

// I compute a combined relevance score: title is weighted 3x over body/secondary so title
// matches always rank above body-only matches of the same kind.
// Scores: title exact (9) > title starts-with (6) > title contains (3) > body-only (0-1).
export function relevanceScore(title: string, body: string, query: string): number {
  return fieldScore(title, query) * 3 + fieldScore(body, query)
}
