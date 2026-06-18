import type { TILEntry } from "../index"

const _segment_tree_lazy_propagation: TILEntry = {
    id: "segment-tree-lazy-propagation",
    title: "Lazy propagation defers segment tree updates so range updates stay O(log n)",
    date: "2026-08-01",
    category: "Algorithms & Data Structures",
    published: true,
    body: "A standard segment tree supports point updates and range queries in O(log n). But range updates (add 5 to every element in [l, r]) naively require O(n log n) individual point updates. [Lazy propagation](https://cp-algorithms.com/data_structures/segment_tree.html) adds a lazy array alongside the tree: when you update a range, you mark the node's lazy field and only propagate the update to children when you actually need to query them. This keeps range updates at O(log n). The trick is the `push_down()` function: before descending into a child, flush any pending lazy value from the parent.",
    detail: [
      {
        type: "code",
        lang: "cpp",
        code: `// I push pending lazy values down before descending into children
void push_down(int node) {
    if (lazy[node] != 0) {
        int left = 2 * node, right = 2 * node + 1;
        tree[left]  += lazy[node] * size[left];
        tree[right] += lazy[node] * size[right];
        lazy[left]  += lazy[node];
        lazy[right] += lazy[node];
        lazy[node] = 0;
    }
}

void update(int node, int start, int end, int l, int r, int val) {
    if (r < start || end < l) return;
    if (l <= start && end <= r) {
        tree[node] += val * (end - start + 1);
        lazy[node] += val;
        return;
    }
    push_down(node);
    int mid = (start + end) / 2;
    update(2*node, start, mid, l, r, val);
    update(2*node+1, mid+1, end, l, r, val);
    tree[node] = tree[2*node] + tree[2*node+1];
}`,
        caption: "push_down() is the heart of lazy propagation: flush the deferred work before going deeper",
      },
      {
        type: "link",
        url: "https://cp-algorithms.com/data_structures/segment_tree.html",
        label: "CP-Algorithms: Segment Tree",
        description: "Covers basic, lazy propagation and more advanced variants with worked competitive programming examples.",
      },
    ],
    tags: ["algorithms", "data structures", "competitive programming"],
  }

export default _segment_tree_lazy_propagation
