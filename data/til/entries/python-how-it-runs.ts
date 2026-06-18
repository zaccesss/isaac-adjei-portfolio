import type { TILEntry } from "../index"

const _python_how_it_runs: TILEntry = {
    id: "python-how-it-runs",
    title: "Python is compiled to bytecode before it runs: the `.pyc` files are the compiled output",
    date: "2026-07-21",
    category: "Python",
    published: true,
    body: "CPython compiles your `.py` source to bytecode (`.pyc` in `__pycache__/`) on first import. This is not machine code: it is a sequence of opcodes for the CPython stack-based virtual machine. The VM interprets these opcodes one by one. This is why CPython is slower than compiled languages: every operation goes through the interpreter loop. Tools like [Cython](https://cython.org/), [Numba](https://numba.pydata.org/) and [PyPy](https://www.pypy.org/) bypass this by compiling to actual machine code.",
    detail: [
      {
        type: "code",
        lang: "python",
        code: `import dis

# I inspect the bytecode of a list comprehension
def squares(n):
    return [x * x for x in range(n)]

dis.dis(squares)
# Shows: GET_ITER, FOR_ITER, LOAD_FAST, BINARY_OP, LIST_APPEND
# The comprehension creates an inner code object visible in the output`,
        caption: "dis.dis() reveals how Python compiles comprehensions, closures and generators",
      },
      {
        type: "embed",
        url: "https://open.spotify.com/embed/show/6Ol9sx1lONDxBSffLW9qcZ",
        variant: "spotify",
        caption: "Talk Python To Me: expert interviews on Python internals, tools and the ecosystem",
      },
    ],
    tags: ["Python", "CPython", "bytecode", "performance"],
  }

export default _python_how_it_runs
