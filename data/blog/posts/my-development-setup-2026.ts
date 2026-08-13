import type { BlogPost } from "../index"

const _my_development_setup_2026: BlogPost = {
    slug: "my-development-setup-2026",
    title: "My Development Setup in 2026: Everything I Use to Build, Learn and Ship",
    date: "2026-06-29",
    type: "article",
    cover_image: "/images/blog/covers/my-development-setup-2026.webp",
    description:
      "A full tour of my hardware, editor configuration, terminal setup, dotfiles and the tools I reach for when building embedded systems and web applications. What I use, why I use it and what I changed my mind about.",
    tags: ["Tools", "Productivity", "Terminal", "Setup", "Dotfiles"],
    published: true,
    content: [
  {
    type: "p",
    text: "Every developer has opinions about their setup. Mine has changed significantly over the past two years - from a Windows-only workflow to a split across three machines, with the right tool for each context. This is what I actually use, verified against what is documented on the /uses page of this site, with notes on what I tried and abandoned.",
  },
  {
    type: "h2",
    text: "Hardware",
  },
  {
    type: "p",
    text: "I run three machines with distinct purposes. The main development and gaming machine (ZACCESS-GPC) is a custom Windows desktop with an NVIDIA GeForce RTX 4060 and an Intel CPU. This is where embedded tooling lives: STM32CubeIDE, ST-Link utilities, Proteus for circuit simulation and the GPC daemon that handles game presence detection for the portfolio dashboard. STM32CubeIDE and most manufacturer programming tools are Windows-first and either do not exist on macOS or are awkward enough to make the jump not worth it.",
  },
  {
    type: "p",
    text: "For portable development and anything Unix-native I use a MacBook (ZACCESS-MBK). The split is practical: web development, scripting, Next.js, Python and command-line work all run better in a Unix environment. The Mac runs a launchd-managed Python daemon (mac-daemon.py) that writes battery level, charging state, timezone and weather to Redis every 30 seconds for the live status widget on the portfolio site. The Lenovo laptop (ZACCESS-LNV) is a secondary Windows machine with its own daemon doing the same for battery and charging state.",
  },
  {
    type: "p",
    text: "The three-machine setup sounds complicated but in practice it works because the [dotfiles](https://github.com/zaccesss/dotfiles) are cross-platform. Shell aliases, tool configuration and git hooks are identical across all three. Switching machines is switching keyboards, not relearning muscle memory.",
  },
  {
    type: "h2",
    text: "Terminal and Shell",
  },
  {
    type: "p",
    text: "My prompt is [Starship](https://starship.rs) - a cross-shell Rust-based prompt configured once in ~/.config/starship.toml and working identically on macOS (zsh), Linux (bash) and Windows (PowerShell 7). It shows git branch and status, active language version and the exit code of the last command. Loaded last in the dotfiles at topic file 59, so all aliases and environment variables are already in place before the prompt hooks in.",
  },
  {
    type: "p",
    text: "On macOS and Linux I use zsh/bash with a custom shell configuration rather than Oh My Zsh. Oh My Zsh adds startup time and features I do not use. The .zshrc does: nvm lazy-loading (so Node does not slow down every shell open), path management, aliases and a small set of functions. On Windows I use PowerShell 7, primarily for NSSM service management, setting up Python virtual environments and running builds.",
  },
  {
    type: "p",
    text: "The dotfiles repository covers 59 numbered topic files loaded in order - from git aliases and navigation shortcuts through to Docker, Kubernetes, cloud platforms and 30+ language toolchains. Every alias has the same name on all three platforms. The colour scheme was chosen deliberately: I lost sight in my right eye at age two and colour does the depth-cue job that binocular vision usually handles. Cyan, magenta, green and yellow were chosen for contrast and tested under deuteranopia and protanopia simulations.",
  },
  {
    type: "h2",
    text: "Editors",
  },
  {
    type: "p",
    text: "VS Code is my primary editor for web and TypeScript work. The TypeScript language server integration is significantly better than what I had in Vim and the debug adapter protocol means the same debugger interface works for TypeScript, Python and C without switching tools. Key extensions: ESLint, Prettier, Tailwind IntelliSense, GitLens, Error Lens and the Cortex-Debug extension for STM32 work.",
  },
  {
    type: "p",
    text: "For projects that benefit from vendor tooling I switch to JetBrains: IntelliJ IDEA for Java coursework, PyCharm for the Phaemos FastAPI backend and system daemons, CLion for C/C++ embedded development. The refactoring support in IntelliJ and the database tooling in DataGrip are still better than VS Code for complex codebases. I switch based on what the project needs rather than picking one permanently.",
  },
  {
    type: "ul",
    items: [
      "Font: JetBrains Mono - monospace with ligatures; arrow and comparison operator ligatures are useful in TypeScript",
      "Version control view: VS Code source control panel for side-by-side diffs; git command line for everything else",
      "Linting: ESLint on pre-commit via a git hook; was annoying when I set it up, would not remove it now",
      "I use git add -p (patch mode) for staging individual hunks rather than entire files - makes commit messages easier to write accurately",
    ],
  },
  {
    type: "h2",
    text: "Hardware Lab",
  },
  {
    type: "p",
    text: "For embedded work I use an oscilloscope, a logic analyser and a bench power supply alongside the microcontroller boards. The oscilloscope is essential for verifying signal timing, debugging UART and SPI communication and measuring ADC input waveforms on the ATmega644P and ESP32. A cheap USB logic analyser with [PulseView](https://sigrok.org/wiki/PulseView) captures and decodes protocol traces when the oscilloscope alone is not enough.",
  },
  {
    type: "p",
    text: "[Proteus](https://www.labcenter.com) is my primary PCB design and simulation tool. I used it for the [two-stage audio amplifier](/blog/two-stage-audio-amplifier) PCB in my EE coursework - designing the schematic, running the simulation and laying out the board all within the same environment before committing to fabrication. The built-in circuit simulator and firmware simulation for microcontrollers are genuinely useful: you can verify timing-critical embedded logic and analogue behaviour before soldering anything. KiCad is my secondary option for projects where open Gerber export or community footprint libraries are a better fit.",
  },
  {
    type: "h2",
    text: "Note-Taking and Organisation",
  },
  {
    type: "p",
    text: "[Notion](https://www.notion.so) for structured reference material and anything collaborative: project planning, research threads, meeting notes and project briefs. [Obsidian](https://obsidian.md) for long-form research and personal knowledge management where I want to keep plain Markdown files I actually own. The bidirectional linking between notes in Obsidian makes it easy to build context over time without a managed database. [Figma](https://www.figma.com) before starting any frontend work - thinking visually before writing CSS saves time. [Excalidraw](https://excalidraw.com) for quick system design sketches that do not need Figma-level polish.",
  },
  {
    type: "h2",
    text: "Version Control",
  },
  {
    type: "p",
    text: "Git on the command line for everything. I have tried GitKraken and Sourcetree and went back within a week each time. The mental model is clearer in the terminal because you can see exactly what each command does. The dotfiles repository uses a bare git repo approach: `git --git-dir=$HOME/.dotfiles --work-tree=$HOME` treats home as the work tree without cloning into it. Every config file lives in home, tracked by the bare repo and pushed to all three remotes (GitHub, GitLab, Codeberg) simultaneously via push URLs.",
  },
  {
    type: "h2",
    text: "What I Changed My Mind About",
  },
  {
    type: "ul",
    items: [
      "Windows for development: WSL2 is good, not great; the file system performance across the boundary is noticeable and half of the hardware tools I use do not work in WSL anyway",
      "Tabs vs spaces: spaces everywhere; the tab-width ambiguity across editors and terminals caused too many display inconsistencies",
      "Linters as blockers: running ESLint on pre-commit was frustrating at first; now I would not work on a codebase that does not do this",
      "Branch-per-feature: I was too conservative with branching early on; I branch for everything including small fixes now, the PR history is the documentation",
      "AI coding assistants: useful for boilerplate and API reference; I do not use them for architectural decisions or debugging subtle bugs, the confidence on unfamiliar APIs is too high relative to accuracy",
    ],
  },
  {
    type: "h2",
    text: "Further Reading",
  },
  {
    type: "ol-links",
    items: [
      { text: "Dotfiles repository (GitHub) - the actual config files behind most of this post", url: "https://github.com/zaccesss/dotfiles" },
      { text: "Uses page on this site - the full list of tools, hardware and services I use", url: "/uses" },
      { text: "Starship - cross-shell prompt configuration documentation", url: "https://starship.rs/config/" },
      { text: "Proteus Design Suite - PCB design and circuit simulation tool", url: "https://www.labcenter.com/" },
      { text: "PulseView / sigrok - open-source logic analyser software", url: "https://sigrok.org/wiki/PulseView" },
      { text: "git-unlocked - my open-source Git course covering advanced workflows", url: "https://github.com/zaccesss/git-unlocked" },
    ],
  },
],
  }

export default _my_development_setup_2026
