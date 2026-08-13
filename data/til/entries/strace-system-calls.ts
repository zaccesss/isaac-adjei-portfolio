import type { TILEntry } from "../index"

const _strace_system_calls: TILEntry = {
    id: "strace-system-calls",
    title: "`strace` traces every system call a process makes: invaluable for debugging black boxes",
    date: "2026-08-08",
    category: "Linux",
    published: true,
    body: "Running `strace ./myprogram` prints every [syscall](https://man7.org/linux/man-pages/man1/strace.1.html) the program makes: file opens, network calls, mmap allocations, signals received. This works even for programs you have no source for. Useful patterns: `strace -e trace=file` to see only file-related calls, `strace -p <pid>` to attach to a running process and `strace -c` to get a summary of call counts and time. On a recent project I used it to find that a tool was trying to open a config file in the wrong directory: the error message was misleading but `strace` showed the exact path being probed.",
    detail: [
      {
        type: "code",
        lang: "bash",
        code: `# I trace only file-related syscalls to find config file issues
strace -e trace=openat,access,stat ./myprogram 2>&1 | grep ENOENT

# I attach to a running process by PID
strace -p 12345

# I summarise syscall counts and time
strace -c ./myprogram

# I follow child processes (useful for shell scripts)
strace -f bash myscript.sh`,
        caption: "Common strace patterns for different debugging scenarios",
      },
      {
        type: "link",
        url: "https://man7.org/linux/man-pages/man1/strace.1.html",
        label: "strace man page",
        description: "Full flag reference including filtering expressions, output formatting and process following options.",
      },
    ],
    tags: ["Linux", "debugging", "systems", "tooling"],
  }

export default _strace_system_calls
