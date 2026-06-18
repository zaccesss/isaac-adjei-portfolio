import type { TILEntry } from "../index"

const _how_grep_works_internally: TILEntry = {
    id: "how-grep-works-internally",
    title: "`grep` uses Boyer-Moore-Horspool to skip most input without reading it character by character",
    date: "2026-06-02",
    category: "Linux",
    published: true,
    body: "GNU `grep` uses the [Boyer-Moore-Horspool](https://lists.gnu.org/archive/html/bug-grep/2010-03/msg00024.html) algorithm, not a naive left-to-right scan. For a pattern of length m, it pre-computes a skip table: for each possible byte value, how many characters it can safely skip. This lets grep skip m characters at a time in the best case, scanning far less than 100% of the input. On large files with rare or long patterns, grep is faster than mmap reads of the same data because the algorithm skips huge chunks entirely.",
    detail: [
      {
        type: "p",
        text: "This is why `grep -F` (fixed string) is often faster than `grep` with a regex: fixed strings let the algorithm compute its skip table from the literal pattern. A regex must fall back to a DFA/NFA engine which cannot skip ahead safely because the pattern can match at any position.",
      },
      {
        type: "code",
        lang: "bash",
        code: `# Fixed-string grep uses the skip table fully
grep -F "specific literal string" largefile.log

# ripgrep (rg) uses SIMD and Rust's regex engine for even faster results
rg "pattern" largefile.log

# Count matches without printing lines: faster I/O
grep -c "pattern" largefile.log`,
        caption: "grep -F is the fastest option when you have a literal string to search for",
      },
    ],
    tags: ["Linux", "algorithms", "tooling", "systems"],
  }

export default _how_grep_works_internally
