import type { BlogPost } from "../index"

const _resources_engineering_and_technology: BlogPost = {
    slug: "resources-engineering-and-technology",
    title: "Resources for Engineering and Technology",
    date: "2026-02-20",
    type: "resources",
    cover_image: "/images/blog/covers/resources-engineering-and-technology.webp",
    description:
      "A curated list of books, courses, documentation, tools and videos I have found genuinely useful for learning embedded systems, software engineering, computer science and the craft of building things. Updated as I find new things worth recommending.",
    tags: ["Resources", "Embedded", "Software Engineering", "Learning", "Tools"],
    published: true,
    featured: true,
    content: [
      {
        type: "p",
        text: "These are resources I have actually used, not lists compiled from other lists. Each one is here because it changed how I understood something or how I work. I have grouped them by area with a short note on why each one is worth your time. For a broader view of what I am currently reading and watching, check the consumed page on this site.",
      },
      {
        type: "h2",
        text: "Embedded Systems and Hardware",
      },
      {
        type: "ol-links",
        items: [
          { text: "The Art of Electronics - Horowitz and Hill (3rd ed.) - the definitive electronics reference. Dense but readable. Buy it.", url: "https://www.amazon.co.uk/Art-Electronics-Paul-Horowitz/dp/0521809266" },
          { text: "Microchip AVR datasheets - reading a real datasheet is the best embedded systems education available. Free.", url: "https://ww1.microchip.com/downloads/en/DeviceDoc/ATmega644P-Datasheet.pdf" },
          { text: "FreeRTOS: Mastering the FreeRTOS Real Time Kernel - the official FreeRTOS book. Free PDF, genuinely good.", url: "https://www.freertos.org/Documentation/RTOS_book.html" },
          { text: "Making Embedded Systems - Elecia White - practical and well-written. Better than most university courses on the topic.", url: "https://www.oreilly.com/library/view/making-embedded-systems/9781449308889/" },
          { text: "Embedded.fm podcast - long-running show covering embedded engineering professionally. Good while soldering.", url: "https://embedded.fm" },
          { text: "NXP I2C specification UM10204 - the definitive I2C protocol reference. Free PDF.", url: "https://www.nxp.com/docs/en/user-guide/UM10204.pdf" },
          { text: "Compiler Explorer (Godbolt) - paste C/C++ and see the assembly output. Invaluable for understanding what the compiler actually does.", url: "https://godbolt.org/" },
        ],
      },
      {
        type: "h2",
        text: "Computer Science Fundamentals",
      },
      {
        type: "ol-links",
        items: [
          { text: "Computer Systems: A Programmer's Perspective - Bryant and O'Hallaron - the best single book on how computers actually work. Covers memory, caching, linking, concurrency.", url: "https://csapp.cs.cmu.edu/" },
          { text: "Structure and Interpretation of Computer Programs (SICP) - Abelson and Sussman - builds real conceptual foundations. Free online.", url: "https://mitp-content-server.mit.edu/books/content/sectbyfn/books_pres_0/6515/sicp.zip/full-text/book/book.html" },
          { text: "The Algorithm Design Manual - Skiena - practical algorithms with real problems, not just theory. Better than Cormen for most engineers.", url: "https://www.algorist.com/" },
          { text: "MIT OpenCourseWare 6.004: Computation Structures - digital logic to a working processor from first principles. Free.", url: "https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/" },
          { text: "Nand2Tetris - build a computer from logic gates to a working OS. One of the best learning experiences available online. Free.", url: "https://www.nand2tetris.org/" },
        ],
      },
      {
        type: "h2",
        text: "Software Engineering and Systems Design",
      },
      {
        type: "ol-links",
        items: [
          { text: "Designing Data-Intensive Applications - Martin Kleppmann - essential reading for understanding distributed systems. Dense with substance.", url: "https://dataintensive.net/" },
          { text: "The Pragmatic Programmer - Hunt and Thomas - timeless engineering philosophy more than a technical manual. Re-read it every year.", url: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/" },
          { text: "High Performance Browser Networking - Grigorik - the most useful reference for understanding the web's underlying protocols. Free online.", url: "https://hpbn.co/" },
          { text: "TypeScript Handbook - official documentation, well written and comprehensive. Free.", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
          { text: "ByteByteGo newsletter and YouTube channel - system design breakdowns that are both accurate and approachable.", url: "https://bytebytego.com/" },
          { text: "Total TypeScript - Matt Pocock - the best TypeScript learning resource available. Goes far beyond the basics.", url: "https://www.totaltypescript.com/" },
        ],
      },
      {
        type: "h2",
        text: "Security",
      },
      {
        type: "ol-links",
        items: [
          { text: "OWASP Top 10 - the standard reference for web application security vulnerabilities. Free.", url: "https://owasp.org/www-project-top-ten/" },
          { text: "OWASP IoT Top 10 - same rigour applied to connected devices. Free.", url: "https://owasp.org/www-project-internet-of-things/" },
          { text: "Cryptopals crypto challenges - learn cryptography by breaking intentionally weak implementations. Free and genuinely fun.", url: "https://cryptopals.com/" },
          { text: "LiveOverflow (YouTube) - security concepts explained with real CTF challenges. One of the best security educators on the platform.", url: "https://www.youtube.com/@LiveOverflow" },
        ],
      },
      {
        type: "h2",
        text: "YouTube Channels Worth Your Time",
      },
      {
        type: "ol-links",
        items: [
          { text: "3Blue1Brown - mathematics visualised better than any textbook. Essence of Linear Algebra and Calculus series are essential.", url: "https://www.youtube.com/@3blue1brown" },
          { text: "Fireship - short, dense tech explainers and news. Good for staying across what is happening in the industry.", url: "https://www.youtube.com/@Fireship" },
          { text: "Theo (t3.gg) - web engineering opinions, TypeScript, Next.js and the full-stack JavaScript ecosystem.", url: "https://www.youtube.com/@t3dotgg" },
          { text: "TechLead - ByteByteGo YouTube channel on system design at scale. Architecture decisions explained clearly.", url: "https://www.youtube.com/@ByteByteGo" },
          { text: "Low Level TV - embedded systems, C programming, memory and how hardware-adjacent software actually works.", url: "https://www.youtube.com/@LowLevelTV" },
          { text: "Computerphile - academic computer science concepts made accessible. Good depth without oversimplifying.", url: "https://www.youtube.com/@Computerphile" },
          { text: "Reducible - algorithms and CS theory with some of the best visual explanations anywhere online.", url: "https://www.youtube.com/@Reducible" },
        ],
      },
      {
        type: "h2",
        text: "Tools I Use and Recommend",
      },
      {
        type: "ol-links",
        items: [
          { text: "VS Code - primary editor for most projects. Fast, extensible, excellent TypeScript support.", url: "https://code.visualstudio.com" },
          { text: "JetBrains IDEs - IntelliJ for Java, PyCharm for Python, CLion for C/C++. Better refactoring than VS Code for large codebases.", url: "https://www.jetbrains.com" },
          { text: "Obsidian - local-first notes with bidirectional linking. My second brain for research and learning logs.", url: "https://obsidian.md" },
          { text: "Notion - project planning, meeting notes and anything collaborative. Good for structured reference material.", url: "https://notion.so" },
          { text: "Figma - wireframing and UI design before writing frontend code. Thinking visually before committing saves time.", url: "https://figma.com" },
          { text: "Excalidraw - fast whiteboard diagrams for system design sketches. No account needed.", url: "https://excalidraw.com/" },
          { text: "Regex101 - build and test regular expressions with step-by-step explanation of each match.", url: "https://regex101.com/" },
          { text: "Codeforces - competitive programming practice. Consistent practice here builds algorithm intuition faster than anything else.", url: "https://codeforces.com/" },
          { text: "MDN Web Docs - the authoritative web platform reference. Go here before Stack Overflow.", url: "https://developer.mozilla.org/" },
        ],
      },
      {
        type: "p",
        text: "For a broader view of what I am currently reading, watching and working through, visit the consumed page.",
      },
      {
        type: "ol-links",
        items: [
          { text: "Consumed - what I am currently reading, watching and working through", url: "/consumed" },
        ],
      },
      {
        type: "h2",
        text: "Must Watch",
      },
      {
        type: "video",
        youtubeId: "iE7YRHxwoDs",
        title: "From Nand to Tetris - Shimon Schocken (TED)",
        description: "Building a computer from first principles - logic gates to a working OS. The best introduction to how computers actually work.",
      },
      {
        type: "video",
        youtubeId: "UF8uR6Z6KLc",
        title: "Stay Hungry, Stay Foolish - Steve Jobs Stanford 2005",
        description: "The most important 15 minutes of career advice ever given. Watch this when you need reminding why you build things.",
      },
    ],
  }

export default _resources_engineering_and_technology
