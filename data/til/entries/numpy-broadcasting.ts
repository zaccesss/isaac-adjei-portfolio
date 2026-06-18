import type { TILEntry } from "../index"

const _numpy_broadcasting: TILEntry = {
    id: "numpy-broadcasting",
    title: "NumPy broadcasting aligns shapes right-to-left and stretches size-1 dimensions",
    date: "2026-06-06",
    category: "Python",
    published: true,
    body: "When you operate on two NumPy arrays with different shapes, [broadcasting](https://numpy.org/doc/stable/user/basics.broadcasting.html) determines what happens. The rule: align shapes right-to-left; a dimension is compatible if it is equal or one of them is 1. Size-1 dimensions are stretched to match the other without copying memory. A `(3, 1)` column vector and a `(1, 4)` row vector broadcast to `(3, 4)`. This is not a loop: it is a zero-copy view processed with SIMD instructions.",
    detail: [
      {
        type: "code",
        lang: "python",
        code: `import numpy as np

# I demonstrate broadcasting without any explicit loops
col = np.array([[1], [2], [3]])     # shape (3, 1)
row = np.array([[10, 20, 30, 40]])  # shape (1, 4)

result = col + row
# shape (3, 4): col stretched across 4 columns, row across 3 rows
# [[11, 21, 31, 41],
#  [12, 22, 32, 42],
#  [13, 23, 33, 43]]

# Broadcasting a scalar: simplest case
arr = np.arange(12).reshape(3, 4)
normalised = arr / arr.max()  # scalar broadcasts to (3, 4)`,
        caption: "Broadcasting avoids explicit loops and achieves C-level SIMD performance",
      },
      {
        type: "embed",
        url: "https://open.spotify.com/embed/show/6Ol9sx1lONDxBSffLW9qcZ",
        variant: "spotify",
        caption: "Talk Python To Me: expert interviews on Python internals, tools and the ecosystem",
      },
      {
        type: "link",
        url: "https://numpy.org/doc/stable/user/basics.broadcasting.html",
        label: "NumPy: Broadcasting",
        description: "The official guide with visual diagrams of how shapes are aligned and stretched.",
      },
    ],
    tags: ["Python", "NumPy", "data", "performance"],
  }

export default _numpy_broadcasting
