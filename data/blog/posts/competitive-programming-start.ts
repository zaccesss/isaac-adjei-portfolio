import type { BlogPost } from "../index"

const _competitive_programming_start: BlogPost = {
    slug: "competitive-programming-start",
    title: "How I Started With Competitive Programming (and What I Got Wrong First)",
    date: "2026-09-28",
    type: "journal",
    cover_image: "/images/blog/covers/competitive-programming-start.webp",
    description:
      "A journal entry on starting competitive programming: the first few weeks on Codeforces, what Neetcode and LeetCode taught me that I could not get from coursework and the specific mistakes beginners make that I made too.",
    tags: ["Competitive Programming", "Algorithms", "Learning", "Career", "CS"],
    published: true,
    content: [
      {
        type: "p",
        text: "I started doing competitive programming seriously in late 2025. I had done [LeetCode](https://leetcode.com) sporadically for interview prep before that, but treating it as exam practice rather than skill-building meant I was grinding without developing intuition. The shift was moving to [Codeforces](https://codeforces.com) for regular contests and using [Neetcode](https://neetcode.io) to build structural understanding of algorithm patterns rather than just solving individual problems. This is what that process looked like from the beginning.",
      },
      {
        type: "h2",
        text: "Why I Started",
      },
      {
        type: "p",
        text: "Two reasons. First: I was embarrassing myself in time-pressured settings. Not in interviews specifically, but in hackathons where I needed to implement something quickly and kept reaching for brute-force approaches because I did not have the pattern library for something better. Knowing that a problem needs a sliding window or a monotonic stack is not the same as having the reflex to recognise it under pressure. That reflex requires repetition.",
      },
      {
        type: "p",
        text: "Second: the maths. My engineering degree is heavy on signals, linear algebra and complex numbers - topics that do not map directly to algorithm design. I wanted to build the discrete mathematics and combinatorics intuition that CS undergraduates develop naturally but that EE curricula skip. Competitive programming is one of the fastest ways to build that specific type of mathematical thinking.",
      },
      {
        type: "h2",
        text: "The First Few Weeks",
      },
      {
        type: "p",
        text: "The first Codeforces contest I entered seriously I solved problems A and B and got stuck on C for 40 minutes before the contest ended. This is completely normal. Codeforces problems A and B at Division 2 level are warm-up problems; C is where the actual thinking starts. At the beginning you will solve A and B comfortably and hit a wall at C. The wall is the work.",
      },
      {
        type: "p",
        text: "The mistake I made in week one was reading solutions immediately after failing. This is tempting - you are stuck, the solution is one click away, you read it and you think you understood it. But reading a solution and writing a solution from a blank page are different cognitive tasks. Read the editorial only after you have spent at least 30 minutes genuinely stuck and then close the editorial and write the solution yourself without looking at it again.",
      },
      {
        type: "h2",
        text: "Neetcode as a Structured Starting Point",
      },
      {
        type: "p",
        text: "[Neetcode](https://neetcode.io)'s 150 (and later 250) problem list is structured by pattern: two pointers, sliding window, binary search, trees, graphs, dynamic programming and so on. The value is not the problems themselves but the grouping. Seeing five sliding window problems in sequence makes the pattern obvious in a way that encountering them randomly does not. I went through each category in the Neetcode 150 before doing unstructured [Codeforces](https://codeforces.com) practice.",
      },
      {
        type: "p",
        text: "The trap in pattern-grouped practice is false confidence. You can recognise a sliding window problem when you just did ten sliding window problems. The harder skill is recognising it in a mixed set. After finishing a category in Neetcode, I would do several Codeforces problems without looking at the category first, to practice the recognition step.",
      },
      {
        type: "h2",
        text: "What Competitive Programming Does Not Teach You",
      },
      {
        type: "p",
        text: "Competitive programming problems are self-contained and have provably correct solutions with known constraints. Real engineering problems have ambiguous requirements, shifting constraints and no editorial. The skill transfer is in the problem decomposition and the comfort with uncertainty during the solving process - not in the specific algorithms. Do not assume that being good at Codeforces means you will be good at designing systems or debugging production issues. The skills overlap less than they appear to.",
      },
      {
        type: "h2",
        text: "Practical Approach",
      },
      {
        type: "ul",
        items: [
          "Codeforces Division 2 A-C is the right starting range; Division 3 is easier but less representative of real contest difficulty",
          "Virtual contests (past contests run as if live) train time pressure better than upsolving alone",
          "Keep a log of problem types you found hard; review them weekly, not when you happen to encounter the same type again",
          "Time-box solving: 30 minutes on a problem, then take a hint (not a full solution); 30 more minutes, then read the editorial",
          "LeetCode is optimised for interview prep; Codeforces is better for developing algorithmic intuition; use both for what each does well",
        ],
      },
      {
        type: "h2",
        text: "References and Resources",
      },
      {
        type: "ol-links",
        items: [
          { text: "Codeforces - competitive programming platform with rated contests", url: "https://codeforces.com/" },
          { text: "Neetcode - structured algorithm practice with video explanations", url: "https://neetcode.io/" },
          { text: "LeetCode - interview-focused algorithm practice", url: "https://leetcode.com/" },
          { text: "CP-Algorithms - high-quality explanations of common competitive programming algorithms", url: "https://cp-algorithms.com/" },
          { text: "The Algorithm Design Manual - Skiena - better than Cormen for developing problem-solving intuition", url: "https://www.algorist.com/" },
          { text: "Introduction to Algorithms (CLRS) - the standard theoretical reference", url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/" },
          { text: "Competitive Programmer's Handbook - Antti Laaksonen (free PDF from cses.fi)", url: "https://cses.fi/book/book.pdf" },
        ],
      },
    ],
  }

export default _competitive_programming_start
