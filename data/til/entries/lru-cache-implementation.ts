import type { TILEntry } from "../index"

const _lru_cache_implementation: TILEntry = {
    id: "lru-cache-implementation",
    title: "An LRU cache needs a hashmap and a doubly-linked list to get O(1) get and put",
    date: "2026-05-27",
    category: "Algorithms & Data Structures",
    published: true,
    body: "A Least Recently Used (LRU) cache evicts the least recently accessed item when capacity is full. To get O(1) `get` and `put`, you need two structures together: a hashmap for O(1) lookup by key and a doubly-linked list where the head is the most recently used and the tail is the least recently used. On access or update, remove the node and move it to the head. On insert at capacity, remove the tail node and insert the new node at the head.",
    detail: [
      {
        type: "code",
        lang: "typescript",
        code: `// I use a Map (ordered by insertion in JS) for a clean LRU implementation
class LRUCache {
  private capacity: number
  private cache: Map<number, number>

  constructor(capacity: number) {
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key: number): number {
    if (!this.cache.has(key)) return -1
    // I move to most-recently-used by deleting and re-inserting
    const val = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, val)
    return val
  }

  put(key: number, value: number): void {
    if (this.cache.has(key)) this.cache.delete(key)
    else if (this.cache.size >= this.capacity) {
      // I delete the first (least-recently-used) entry
      this.cache.delete(this.cache.keys().next().value)
    }
    this.cache.set(key, value)
  }
}`,
        caption: "JavaScript Map preserves insertion order so delete + re-insert gives O(1) LRU in one structure",
      },
      {
        type: "link",
        url: "https://leetcode.com/problems/lru-cache/",
        label: "LeetCode 146: LRU Cache",
        description: "The canonical interview problem. The editorial explains the doubly-linked list approach in detail.",
      },
    ],
    tags: ["algorithms", "data structures", "TypeScript", "competitive programming"],
  }

export default _lru_cache_implementation
