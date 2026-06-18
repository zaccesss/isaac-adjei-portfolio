import type { TILEntry } from "../index"

const _python_bytecode_cpython: TILEntry = {
    id: "python-bytecode-cpython",
    title: "Python compiles to bytecode first: the interpreter runs the bytecode, not your source",
    date: "2026-08-18",
    category: "Python",
    published: true,
    body: "When you run a Python file, CPython first compiles it to bytecode (`.pyc` files in `__pycache__/`). The bytecode is a sequence of opcodes for the CPython virtual machine: a stack machine where each opcode pushes or pops values. The GIL (Global Interpreter Lock) means only one thread runs bytecode at a time, which is why CPU-bound Python threads do not parallelise. You can inspect bytecode with [`dis.dis(func)`](https://docs.python.org/3/library/dis.html): useful for understanding why a particular line is slower than expected.",
    detail: [
      {
        type: "code",
        lang: "python",
        code: `import dis

def add(a, b):
    return a + b

dis.dis(add)
# Output:
#   2           0 RESUME                   0
#   3           2 LOAD_FAST                0 (a)
#               4 LOAD_FAST                1 (b)
#               6 BINARY_OP               0 (+)
#              10 RETURN_VALUE`,
        caption: "dis.dis() shows the actual opcodes CPython executes: LOAD_FAST, BINARY_OP, RETURN_VALUE",
      },
      {
        type: "embed",
        url: "https://open.spotify.com/embed/show/6Ol9sx1lONDxBSffLW9qcZ",
        variant: "spotify",
        caption: "Talk Python To Me: in-depth interviews on Python internals, tools and projects",
      },
      {
        type: "link",
        url: "https://docs.python.org/3/library/dis.html",
        label: "Python docs: dis: Disassembler",
        description: "Full opcode reference. Useful for understanding comprehensions, closures and generator expressions at the bytecode level.",
      },
    ],
    tags: ["Python", "CPython", "GIL", "performance"],
  }

export default _python_bytecode_cpython
