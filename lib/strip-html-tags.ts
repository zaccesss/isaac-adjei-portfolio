// Removes anything between < and > with a single linear scan rather than a regex, so a string
// full of unclosed '<' cannot cause the quadratic backtracking a `/<[^>]*>/g` regex hits on
// adversarial input and so nested/malformed tags cannot leave a reassembled tag behind the way
// an incomplete regex-based strip can.
export function stripHtmlTags(str: string): string {
  let out = ""
  let inTag = false
  for (const ch of str) {
    if (ch === "<") inTag = true
    else if (ch === ">") inTag = false
    else if (!inTag) out += ch
  }
  return out.trim()
}
