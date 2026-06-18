import type { TILEntry } from "../index"

const _binary_search_on_answer: TILEntry = {
    id: "binary-search-on-answer",
    title: "Binary search works on any monotone predicate, not just sorted arrays",
    date: "2026-05-06",
    category: "Algorithms & Data Structures",
    published: true,
    body: "The classic binary search finds a value in a sorted array. But the deeper insight: binary search works on any monotone predicate. If the predicate is false for small values and true for large values (or vice versa) with no non-monotone region in between, you can binary search for the boundary. Problems like 'find the minimum speed such that all packages are delivered in D days' fit this pattern: the predicate is 'is it possible at this value?' and binary search finds the threshold.",
    detail: [
      {
        type: "code",
        lang: "python",
        code: `# I binary search on the answer for "minimum capacity to ship packages in D days"
def can_ship(weights, D, W):
    days, current = 1, 0
    for w in weights:
        if current + w > W:
            days += 1
            current = 0
        current += w
    return days <= D

def min_capacity(weights, D):
    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if can_ship(weights, D, mid):
            hi = mid        # try smaller
        else:
            lo = mid + 1    # need more capacity
    return lo`,
        caption: "Binary search on the answer reduces 'find the minimum X' to O(log(search_space)) checks",
      },
      {
        type: "link",
        url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
        label: "LeetCode 1011: Capacity to Ship Packages",
        description: "A classic binary search on answer problem. The editorial explains the monotone predicate pattern in detail.",
      },
    ],
    tags: ["algorithms", "binary search", "competitive programming"],
  }

export default _binary_search_on_answer
