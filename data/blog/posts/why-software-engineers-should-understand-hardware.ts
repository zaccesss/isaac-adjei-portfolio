import type { BlogPost } from "../index"

const _why_software_engineers_should_understand_hardware: BlogPost = {
    slug: "why-software-engineers-should-understand-hardware",
    title: "Why Every Software Engineer Should Understand Hardware",
    date: "2026-03-10",
    type: "article",
    cover_image: "/images/blog/covers/why-software-engineers-should-understand-hardware.webp",
    description:
      "An argument for why understanding hardware - registers, memory, timing, power - makes you a significantly better software engineer, regardless of whether you ever write firmware.",
    tags: ["Opinion", "Embedded", "Software Engineering", "Career"],
    published: true,
    featured: true,
    content: [
      {
        type: "p",
        text: "There is a common split in engineering education between software and hardware. Software engineers learn data structures, algorithms, systems design and distributed computing. Hardware engineers learn circuits, signal processing, digital logic and microarchitecture. The two disciplines have different curricula, different job titles and, increasingly, different cultures. This split is artificial and the software engineers who cross it are meaningfully better at their jobs.",
      },
      {
        type: "p",
        text: "I study Electronic Engineering and Computer Science, which means I do not have the option of staying on one side. I have spent semesters writing bare metal C on a custom PCB and semesters building full-stack web applications with [TypeScript](https://www.typescriptlang.org) and [React](https://react.dev). The crossover has changed how I think about software in ways that are hard to explain but easy to demonstrate.",
      },
      {
        type: "h2",
        text: "Abstraction Has a Cost",
      },
      {
        type: "p",
        text: "Every layer of abstraction hides complexity from the layer above it. The CPU hides transistors. The operating system hides the CPU. The programming language hides the operating system. The framework hides the language. This is useful. It is what allows a web developer to build a product without understanding MOSFET physics. But it creates engineers who have no mental model of what is happening below their level and no ability to reason about performance, reliability or correctness when something breaks through the abstraction.",
      },
      {
        type: "p",
        text: "A software engineer who understands memory allocation, cache behaviour and system call overhead writes fundamentally different code than one who does not. Not because they are manually optimising every line, but because their intuitions about what is expensive, what is safe and what will fail under load are calibrated to reality rather than to the abstraction. They know when a mutex is necessary and when it is not. They know why a tight loop that polls a flag can spin a CPU core to 100% even when the workload is minimal. They know why memory-mapped I/O is not the same as regular memory.",
      },
      {
        type: "h2",
        text: "Debugging Goes One Layer Deeper",
      },
      {
        type: "p",
        text: "The most useful debugging skill is the ability to go one layer deeper than the problem. If your web application has a memory leak, the framework is not lying to you: something in your code is holding a reference. If your system call is taking 40ms instead of 4ms, the OS is not broken: your process is probably being preempted or your data is causing a page fault. If your network request is timing out intermittently, the protocol is not at fault: your retry logic is probably not handling the connection reset correctly.",
      },
      {
        type: "p",
        text: "Hardware engineers develop this instinct early because they have to. If an LED is not lighting up, the register configuration, the clock source, the power supply and the physical connection are all plausible causes. You cannot use printf debugging when your firmware crashes before the UART initialises. You learn to think systematically about what layer the problem is at and what evidence would distinguish between them. That discipline transfers directly to software debugging.",
      },
      {
        type: "h2",
        text: "Performance Is Not Magic",
      },
      {
        type: "p",
        text: "Performance optimisation in software is often treated as a specialised skill: something you do after the product is built, handled by engineers with specific expertise. This framing is backwards. Most performance problems are caused by design decisions made early in development by people who did not have a clear model of what was expensive. Fixing them later is significantly harder than making better decisions initially.",
      },
      {
        type: "p",
        text: "Understanding hardware makes the costs visible. A function call crosses a cache line boundary? A context switch happens on every lock acquisition? A string comparison reads character by character when a hash would be O(1)? None of these are hardware problems. But they are visible as hardware problems to someone who thinks in terms of memory hierarchies, CPU pipelines and branch prediction. The abstraction did not remove the cost. It hid it.",
      },
      {
        type: "h2",
        text: "The Argument for Full-Stack Engineering",
      },
      {
        type: "p",
        text: "The most impactful engineers I have encountered in the literature are not specialists who know one thing deeply. They are people who can reason comfortably across levels of abstraction: from the silicon up to the application and back down again. They designed systems that worked because they understood the constraints at every layer, not just the layer they were working in.",
      },
      {
        type: "p",
        text: "You do not need to design PCBs to benefit from understanding hardware. You need to understand what a CPU actually does when it executes your code, what the operating system does when it runs your process and what the network stack does when you make a request. That knowledge is available in textbooks, datasheets and open source implementations. It is not esoteric. It is foundational.",
      },
      {
        type: "quote",
        text: "The programmer, like the poet, works only slightly removed from pure thought-stuff. He builds his castles in the air, from air, creating by exertion of the imagination.",
        source: "Frederick P. Brooks Jr., The Mythical Man-Month (1975)",
      },
      {
        type: "p",
        text: "The castles are real. The foundations matter. Know what yours are built on.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "PHAEMOS project - the predictive maintenance platform referenced in this article", url: "/projects/phaemos" },
          { text: "avr-zac repository - bare-metal AVR programming referenced in this article", url: "https://github.com/zaccesss/avr-zac" },
          { text: "Embedded.fm podcast - long-running podcast on embedded engineering, career and hardware", url: "https://embedded.fm" },
          { text: "CSE351: The Hardware/Software Interface - University of Washington (the Coursera version was retired; this is the course itself)", url: "https://courses.cs.washington.edu/courses/cse351/" },
          { text: "Wikipedia: Computer architecture - overview of the abstractions between hardware and software", url: "https://en.wikipedia.org/wiki/Computer_architecture" },
          { text: "Computer Systems: A Programmer's Perspective - Bryant and O'Hallaron - the best single book on how software meets hardware", url: "https://csapp.cs.cmu.edu/" },
        ],
      },
    ],
  }

export default _why_software_engineers_should_understand_hardware
