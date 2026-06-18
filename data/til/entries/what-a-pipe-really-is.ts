import type { TILEntry } from "../index"

const _what_a_pipe_really_is: TILEntry = {
    id: "what-a-pipe-really-is",
    title: "A Unix pipe is a kernel-managed ring buffer, not a file or a socket",
    date: "2026-09-21",
    category: "Linux",
    published: true,
    body: "When you write `ls | grep foo`, the shell calls the [`pipe()` syscall](https://man7.org/linux/man-pages/man2/pipe.2.html). The kernel allocates a 64 KB ring buffer and hands back two file descriptors: one read end and one write end. Both processes see it as a file descriptor, but there is no file on disk. The write blocks when the buffer is full and the read blocks when it is empty. This blocking behaviour is why slow producers naturally throttle fast consumers in a pipeline.",
    detail: [
      {
        type: "code",
        lang: "bash",
        code: `# I show a pipe in action using strace to reveal the syscall
strace -e trace=pipe,read,write sh -c 'echo hello | cat' 2>&1 | head -20

# The kernel gives you two file descriptors
# pipe([3, 4]) : fd 3 is the read end, fd 4 is the write end
# The shell forks: child writes to fd 4, parent reads from fd 3`,
        caption: "strace shows the pipe() syscall creating two file descriptors",
      },
      {
        type: "p",
        text: "The blocking behaviour provides natural backpressure. If a producer writes faster than a consumer reads, the write blocks once the 64 KB buffer fills. This is why `dd if=/dev/urandom | gzip -c > /dev/null` does not fill RAM: gzip's throughput limits how fast dd can produce.",
      },
      {
        type: "link",
        url: "https://man7.org/linux/man-pages/man2/pipe.2.html",
        label: "pipe(2) man page",
        description: "Full syscall documentation including the PIPE_BUF atomicity guarantee and O_NONBLOCK behaviour.",
      },
    ],
    tags: ["Linux", "Unix", "systems"],
  }

export default _what_a_pipe_really_is
