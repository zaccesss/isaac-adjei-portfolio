import type { TILEntry } from "../index"

const _how_cd_works: TILEntry = {
    id: "how-cd-works",
    title: "`cd` is a shell builtin, not a program: it cannot exist as a separate process",
    date: "2026-05-20",
    category: "Linux",
    published: true,
    body: "Every process has its own working directory, inherited from its parent at fork time. If `cd` were an external program (like `ls` or `grep`), it would change the working directory of a child process and exit: the shell's own directory would remain unchanged. This is why `cd` must be a shell builtin: the shell executes it in its own process, directly calling the [`chdir()` syscall](https://man7.org/linux/man-pages/man2/chdir.2.html) on itself. There is no `/bin/cd` on a properly configured system.",
    detail: [
      {
        type: "code",
        lang: "bash",
        code: `# Confirm cd is a builtin, not an external command
type cd        # prints: cd is a shell builtin
which cd       # prints nothing: no binary on PATH

# You can verify with strace: cd calls chdir() directly in the shell process
strace -e trace=chdir bash -c "cd /tmp"
# chdir("/tmp") = 0`,
        caption: "`type cd` is the quickest way to confirm it is built into the shell",
      },
      {
        type: "note",
        text: "The same applies to other builtins: `export`, `source` (`.`), `exec`, `exit`, `umask` and `set`. These all need to affect the shell process itself, not a child process, so they cannot be implemented as external programs.",
      },
    ],
    tags: ["Linux", "bash", "shell", "systems"],
  }

export default _how_cd_works
