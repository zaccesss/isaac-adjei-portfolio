import type { TILEntry } from "../index"

const _git_rebase_onto: TILEntry = {
    id: "git-rebase-onto",
    title: "`git rebase --onto` transplants a branch from one base to another",
    date: "2026-07-23",
    category: "Git",
    published: true,
    body: "If you branch off a feature branch and then want to rebase your commits directly onto main, skipping the feature branch commits entirely, `git rebase --onto <newbase> <upstream> <branch>` is the command. It replays only the commits between `<upstream>` and `<branch>` on top of `<newbase>`, leaving everything before `<upstream>` behind.",
    detail: [
      {
        type: "code",
        lang: "bash",
        code: `# I branch off feature-a to work on feature-b
git checkout -b feature-b feature-a

# Later, feature-b is actually independent: I want it on main
# Replay commits unique to feature-b (not in feature-a) onto main
git rebase --onto main feature-a feature-b`,
        caption: "Transplanting feature-b onto main, skipping feature-a commits",
      },
      {
        type: "note",
        text: "After this, feature-b's commits appear as if they were branched from main directly. Useful when a branch grew off the wrong parent and you need a clean history before merging.",
      },
      {
        type: "link",
        url: "https://git-scm.com/docs/git-rebase",
        label: "git-scm: git rebase",
        description: "Full documentation including the --onto flag with diagrams showing the before and after commit graph.",
      },
    ],
    tags: ["git", "rebase", "tooling"],
  }

export default _git_rebase_onto
