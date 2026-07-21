import type { BlogPost } from "../index"

const _git_unlocked_open_source_course: BlogPost = {
    slug: "git-unlocked-open-source-course",
    title: "Why I Built a Free Git Course with 217 Files and No Paywall",
    date: "2026-04-21",
    type: "blog",
    projectSlug: "git-unlocked",
    cover_image: "/images/projects/git-unlocked/octocat-laptop.webp",
    description:
      "The motivation behind git-unlocked, an open-source Git and version control course spanning 12 sections and every major platform, and what writing 217 files taught me about technical communication.",
    tags: ["Git", "Open Source", "Teaching", "GitHub"],
    published: true,
    content: [
      {
        type: "p",
        text: "Git is one of the most important tools in software development. It is also one of the most poorly taught. Most tutorials cover git init, git add, git commit and git push, then stop. They leave out branches, rebasing, conflict resolution, platform differences, real-world workflows and everything else that actually matters when you join a team or contribute to open source.",
      },
      {
        type: "p",
        text: "[git-unlocked](https://github.com/zaccesss/git-unlocked) is my attempt to fix that. It is a free, open-source Git and version control course covering everything from absolute zero to professional-level knowledge. 217 files. 12 sections. MIT licensed. No paywall.",
      },
      {
        type: "h2",
        text: "What the Course Covers",
      },
      {
        type: "ul",
        items: [
          "Section 01: Introduction - concepts, setup and how to navigate the course",
          "Section 02: Git - everything from git init to internals (29 files)",
          "Section 03: GitHub - full platform coverage (28 files)",
          "Section 04: GitLab - full platform coverage (16 files)",
          "Section 05: Other platforms - Bitbucket, Azure DevOps, Gitea, Forgejo and Codeberg (62 files)",
          "Section 06: IDEs and editors - VS Code, JetBrains, Neovim, Cursor and Zed",
          "Section 07: Terminal - shell setup, lazygit, delta, fzf and more",
          "Section 08: Real world - open source contribution, GitOps, monorepos and disaster recovery",
          "Section 09: Reference - cheatsheet, glossary, common mistakes and security",
          "Section 10: Resources - 120+ curated books, videos, tools and communities",
          "Section 11: First contribution - make your first open source pull request here",
        ],
      },
      {
        type: "p",
        text: "Every file covers Windows, Mac and Linux side by side. Nothing is assumed. Nothing is skipped.",
      },
      {
        type: "h2",
        text: "Why I Built It",
      },
      {
        type: "p",
        text: "I was frustrated with existing resources. Most are either too shallow or paywalled or platform-specific. I wanted something that a complete beginner could start from the beginning and an experienced developer could jump into at any section. I also wanted something that covered all the platforms people actually use, not just GitHub.",
      },
      {
        type: "p",
        text: "Teaching is also one of the best ways to learn. Writing 217 files about Git forced me to understand everything at a depth I would not have reached by just using it. When you write a glossary definition for every Git term you realise quickly which concepts you only half understand.",
      },
      {
        type: "h2",
        text: "What the CHANGELOG Shows",
      },
      {
        type: "p",
        text: "The CHANGELOG is one of the things I am most proud of in this project. Every version documents what was added, what was updated and what was fixed. Version 1.2.0 added the entire real-world section covering GitOps with ArgoCD and Flux, monorepo patterns using Nx and Turborepo, disaster recovery from force push accidents and a security reference covering gitleaks and supply chain attacks.",
      },
      {
        type: "p",
        text: "Reading the changelog from v0.1.0 to v1.2.0 tells the story of how a course outline became a comprehensive reference. It also shows that good documentation is not written once. It is maintained.",
      },
      {
        type: "h2",
        text: "What Is Still to Come",
      },
      {
        type: "ul",
        items: [
          "Interactive HTML quiz pages with instant answer checking",
          "Animated SVG diagrams for key Git concepts",
          "Accessibility review",
        ],
      },
      {
        type: "quote",
        text: "If you understand Git, you understand collaboration. That is worth teaching properly.",
        source: "My reason for starting this project",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "git-unlocked repository - the full course, MIT licensed and free", url: "https://github.com/zaccesss/git-unlocked" },
          { text: "GitHub Docs - official documentation for GitHub features, workflows and CLI", url: "https://docs.github.com" },
          { text: "Pro Git - Scott Chacon and Ben Straub (free online) - the most complete Git reference available", url: "https://git-scm.com/book/en/v2" },
          { text: "Open Source Guides - how to contribute to and maintain open source projects", url: "https://opensource.guide" },
          { text: "Conventional Commits specification - a lightweight commit message convention for structured changelogs", url: "https://www.conventionalcommits.org" },
        ],
      },
    ],
  }

export default _git_unlocked_open_source_course
