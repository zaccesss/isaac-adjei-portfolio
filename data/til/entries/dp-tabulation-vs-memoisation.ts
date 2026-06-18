import type { TILEntry } from "../index"

const _dp_tabulation_vs_memoisation: TILEntry = {
    id: "dp-tabulation-vs-memoisation",
    title: "Tabulation and memoisation both solve DP problems but differ in call-stack risk",
    date: "2026-07-28",
    category: "Algorithms & Data Structures",
    published: true,
    body: "Memoisation (top-down DP) writes the recursive solution first and caches results. It is easier to write because the order of subproblem evaluation is handled by the recursion, but each subproblem adds a stack frame: deep recursion overflows the call stack. Tabulation (bottom-up DP) builds a table starting from the base cases and fills it in a predetermined order. It uses O(1) stack space and is usually faster in practice because there is no function-call overhead.",
    detail: [
      {
        type: "code",
        lang: "python",
        code: `# Memoisation (top-down): recursion + cache
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_memo(n):
    if n <= 1: return n
    return fib_memo(n - 1) + fib_memo(n - 2)

# Tabulation (bottom-up): iterative table
def fib_tab(n):
    if n <= 1: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]

# Space-optimised tabulation
def fib_opt(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
        caption: "Three approaches to Fibonacci: memoisation, tabulation and space-optimised tabulation",
      },
      {
        type: "note",
        text: "For most competitive programming problems I default to tabulation. Memoisation is useful when the subproblem space is sparse and you want to avoid computing states you never reach: e.g. 2D DP on a grid where many cells are unreachable.",
      },
    ],
    tags: ["algorithms", "dynamic programming", "competitive programming"],
  }

export default _dp_tabulation_vs_memoisation
