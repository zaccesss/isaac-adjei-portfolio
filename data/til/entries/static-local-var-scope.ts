import type { TILEntry } from "../index"

const _static_local_var_scope: TILEntry = {
    id: "static-local-var-scope",
    title: "A `static` local variable in C keeps its value between function calls",
    date: "2026-05-08",
    category: "C",
    published: true,
    body: "A local variable declared `static` inside a function has local scope (only visible inside that function) but static storage duration: it is allocated once for the lifetime of the programme and retains its value between calls. This is useful for counters and memoisation inside a function without exposing the state to the rest of the codebase. It is very different from `static` at file scope, which restricts linkage to the current translation unit.",
    detail: [
      {
        type: "code",
        lang: "c",
        code: `/* I count how many times this function has been called without a global */
int get_next_id(void) {
    static int counter = 0;   /* initialised once; value persists across calls */
    return ++counter;
}

int a = get_next_id();  /* a = 1 */
int b = get_next_id();  /* b = 2 */
int c = get_next_id();  /* c = 3 */

/* Thread safety: incrementing a static local is not atomic.
   Use _Atomic or a mutex if called from multiple threads. */`,
        caption: "static local vars are initialised exactly once at programme start, not on each call",
      },
      {
        type: "note",
        text: "Embedded firmware uses static locals for state machines inside polling functions: the function is called every tick, checks the static state variable, acts on it and updates it. This pattern avoids global variables while keeping the state hidden from the rest of the firmware.",
      },
    ],
    tags: ["C", "embedded", "systems"],
  }

export default _static_local_var_scope
