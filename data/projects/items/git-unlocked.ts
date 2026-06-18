import type { Project } from "../index"

const _git_unlocked: Project = {
    id: "git-unlocked",
    title: "git-unlocked",
    description:
      "Free, MIT-licensed open source course taking anyone from absolute zero to industry-level Git proficiency across every major platform and tool",
    longDescription:
      "git-unlocked is a free, MIT-licensed, community-built course designed to take anyone from never having heard of version control all the way to using Git, GitHub, GitLab and every major platform confidently in real teams. v1.2.0 ships 217 topic files organised across 12 sections and 8 platforms: Git core, GitHub, GitLab, Bitbucket, Azure DevOps, Gitea, Forgejo and Codeberg, each tagged with difficulty levels (beginner / intermediate / advanced) and OS labels (Windows, Mac, Linux) so every reader knows exactly where they stand.\n\nThe motivation for building this came from watching people in university struggle not with the concepts of version control but with the sheer fragmentation of documentation across platforms. Every platform has its own docs, every tutorial picks a different starting point and almost none of them cover what actually happens when things go wrong. git-unlocked was built to be the single resource I wished had existed: opinionated, progressive, honest about the hard parts and free without any paywall or account requirement.\n\nThe course is structured into three progressive learning paths. Platform sections cover everything from account setup, repositories and branching strategy through to CI/CD pipelines, branch protection rules, security features, CLI tooling and cross-platform comparisons. Advanced Git topics include rebase strategies, bisect, worktrees, signing commits with GPG/SSH, monorepo patterns, GitOps workflows and a complete command reference. The IDE and editor section covers VS Code, JetBrains, Neovim, Cursor and Zed. The terminal tools section covers lazygit, git-delta, fzf, bat and tig.\n\nThe repo ships with GitHub Actions CI for automated markdownlint checking and link validation on every push, a HALL_OF_FAME.md for contributors, a full CONTRIBUTING guide, CODE_OF_CONDUCT, CHANGELOG, SECURITY policy, ROADMAP and a first-contribution sandbox designed to let anyone make their first open source pull request in under 10 minutes. A curated resource collection of 120+ links rounds out the reference section. MIT licensed, public template. Everything free, forever.",
    technologies: [
      "Git",
      "GitHub",
      "GitLab",
      "Bitbucket",
      "Azure DevOps",
      "Markdown",
      "GitHub Actions",
      "Open Source",
    ],
    category: "academic",
    featured: true,
    images: [
      "/images/projects/git-unlocked/github-logo-3d.webp",
      "/images/projects/git-unlocked/git_unlocked_banner.svg",
      "/images/projects/git-unlocked/octocat-laptop.webp",
      "/images/projects/git-unlocked/octocat-groot.webp",
      "/images/projects/git-unlocked/octocat-closeup.webp",
    ],
    github: "https://github.com/zaccesss/git-unlocked",
    date: "2026",
    highlights: [
      "v1.2.0 ships 217 topic files across 12 sections: Git, GitHub, GitLab, Bitbucket, Azure DevOps, Gitea, Forgejo and Codeberg",
      "Three learning paths: beginner, intermediate and advanced, tagged per file and structured end to end",
      "Every command and workflow shown on Windows, Mac and Linux side by side - nothing assumed, nothing skipped",
      "Real-world section: GitOps with ArgoCD and Flux, monorepos with Nx and Turborepo, disaster recovery from force push accidents and accidental secrets",
      "Security reference: gitleaks, TruffleHog, push protection, commit signing, SLSA and supply chain attack prevention",
      "IDE section: VS Code, JetBrains, Neovim, Cursor and Zed; terminal section: lazygit, delta, fzf, bat and tig",
      "Curated resource index of 120+ books, videos, tools, courses and communities with recommended learning paths by level",
      "GitHub Actions CI for automated markdownlint and link checking on every push",
      "First-contribution sandbox: make your first open source pull request in under 10 minutes",
    ],
  }

export default _git_unlocked
