import type { NoteEntry } from "../index"

const codeforcesAutoPush: NoteEntry = {
  slug: "codeforces-auto-push",
  title: "Auto-Push CP Solutions to GitHub",
  description:
    "The landscape of tools for automatically pushing accepted solutions from Codeforces, AtCoder, LeetCode and TryHackMe to GitHub - what exists, what is missing and what I want to build.",
  ogTitle: "Auto-Push%20CP%20Solutions%20to%20GitHub",
  ogDescription:
    "The%20landscape%20of%20tools%20for%20syncing%20competitive%20programming%20solutions%20to%20GitHub.",
  tags: ["Chrome Extension", "Competitive Programming", "GitHub", "Codeforces", "AtCoder", "Automation"],
  lead:
    "Every accepted solution on Codeforces, AtCoder or TryHackMe is worth keeping. It documents your progression, gives you a searchable reference for techniques and signals genuine practice. This note maps out what tools already exist, where the gaps are and what I want to build or contribute to.",
  body: [
    { type: "h2", text: "What already exists" },
    { type: "h3", text: "LeetCode" },
    {
      type: "p",
      text: "LeetCode has the most mature tooling. The original **LeetHub** extension (QasimWani) started the pattern: a Manifest V2 Chrome extension that injects a content script into the submission result page, detects an accepted verdict and pushes the solution to GitHub via a stored PAT. LeetCode has since changed its frontend enough that the original is partially broken, so the community maintains forks. **LeetHub 3.0** (raphaelheinz) is the actively maintained version as of 2025. **LeetSync** takes a different approach - it uses the LeetCode API directly to fetch submission data rather than scraping the DOM, then writes to GitHub. LeetCode does not have any official built-in GitHub integration of its own; all sync tools are community-built extensions.",
    },
    { type: "h3", text: "Codeforces" },
    {
      type: "p",
      text: "**CFPusher** (SarJ2004) already solves this for Codeforces. It is a Manifest V3 Chrome extension on the Chrome Web Store that automatically pushes accepted submissions to a GitHub repo. It includes a streak tracker, a problem rating chart and GitHub OAuth integration. It uses the Codeforces API (`user.status` endpoint at `codeforces.com/apiHelp/methods`) for metadata and a content script to capture the source code from the submission page (since the API does not return source code). CFPusher is open source - if there are missing features or bugs, contributing directly makes more sense than building from scratch.",
    },
    {
      type: "p",
      text: "There is also **UpCode** (CrapTheCoder), a Python CLI tool that bulk-uploads all historical accepted submissions from Codeforces, AtCoder and CodeChef to GitHub. It scrapes submission pages (which requires an authenticated session for Codeforces). Useful for an initial backfill but not real-time.",
    },
    { type: "h3", text: "AtCoder" },
    {
      type: "p",
      text: "**AtCommitter** (kult0922) is a tool that auto-commits accepted AtCoder solutions to GitHub. **AtCoderProblems** (kenkoooo) is the main community platform for tracking AtCoder progress - it shows which problems you have solved, heat maps and language breakdowns, but does not push to GitHub. The auto-push tooling for AtCoder is less mature and less actively maintained than the LeetCode equivalents. There is no well-maintained Chrome extension for AtCoder equivalent to CFPusher.",
    },
    { type: "h3", text: "TryHackMe" },
    {
      type: "p",
      text: "TryHackMe has no equivalent tooling. There is no API for programmatically fetching room completion data or writeup content, and no extension or script that auto-pushes writeups to GitHub. People maintain their THM repos manually. This is the biggest gap in the space. The closest workflow anyone uses is writing notes in Obsidian or a local folder during a room and then pushing manually. A browser extension that detected room completion and triggered a structured commit (with a templated README per room: category, difficulty, tags, notes) would be genuinely useful.",
    },
    { type: "h2", text: "What I want to build" },
    {
      type: "p",
      text: "CFPusher already exists for Codeforces and LeetHub 3.0 covers LeetCode, so rebuilding those from scratch makes no sense. The gaps worth filling - each as its own dedicated extension since these are completely separate platforms with separate use cases, separate repos and separate audiences:",
    },
    {
      type: "list",
      items: [
        "An AtCoder extension: AtCommitter exists but appears unmaintained. A Manifest V3 port with GitHub OAuth (same pattern as CFPusher) would be a clean project. AtCoder submissions are public and the HTML structure is stable, so DOM scraping is reliable. Target repo would be separate from the Codeforces one.",
        "A TryHackMe extension: on room completion (detect the 'You have completed this room' banner), prompt for optional notes and push a structured markdown file to a dedicated THM writeups repo. TryHackMe has no API so the content script approach is the only option. Completely unrelated to competitive programming - different repo, different audience, different format.",
      ],
    },
    { type: "h2", text: "Architecture for the AtCoder extension" },
    { type: "p", text: "Manifest V3 extension, same pattern as CFPusher:" },
    {
      type: "list",
      items: [
        "content-script.js - watches atcoder.jp/contests/*/submissions/* for AC verdict; reads submission code from the page DOM",
        "background/worker.js - receives payload from content script; calls GitHub Contents API to create/update file; stores PAT and repo config in chrome.storage.sync",
        "options/index.html - AtCoder handle, GitHub PAT or OAuth, target repo, folder structure preferences",
      ],
    },
    { type: "h2", text: "Architecture for the TryHackMe extension" },
    { type: "p", text: "Manifest V3 extension, simpler since there is no API:" },
    {
      type: "list",
      items: [
        "content-script.js - watches tryhackme.com/r/* for room completion banner; extracts room name, category and difficulty from the page; prompts for optional personal notes",
        "background/worker.js - constructs a markdown writeup file and pushes to the dedicated THM writeups repo via GitHub Contents API",
        "options/index.html - GitHub PAT, target writeups repo, default note template",
      ],
    },
    { type: "h2", text: "Repo structures" },
    { type: "p", text: "Each platform gets its own dedicated repo:" },
    {
      type: "pre",
      text: `# codeforces-solutions (managed by CFPusher)
1234A-diverse-strings/
  solution.cpp
  README.md    ← rating, tags, contest, problem URL

# atcoder-solutions (managed by the AtCoder extension)
abc300-c-vaccine/
  solution.cpp
  README.md    ← contest, task, difficulty

# tryhackme-writeups (managed by the THM extension)
rooms/
  advent-of-cyber-2024/
    notes.md   ← category, difficulty, tools, key learnings`,
    },
    { type: "h2", text: "If I open-source them" },
    {
      type: "p",
      text: "If the AtCoder extension works well, publishing it makes sense - the AtCoder community actively wants this and nothing well-maintained exists. The TryHackMe extension would appeal to the CTF and security learner community who are already manually pushing writeups. The main maintenance burden for both is keeping up with DOM changes when the platforms update their frontends - the same problem LeetHub has faced through v1 to v3.",
    },
    { type: "h2", text: "Next steps" },
    {
      type: "list",
      items: [
        "Install CFPusher and use it on Codeforces - understand the UX and what could be better",
        "Build a minimal AtCoder content script proof of concept - detect AC verdict and log the submission payload",
        "Wire up the GitHub Contents API call from a Manifest V3 background service worker",
        "Test the TryHackMe completion detection - identify the DOM element that signals room completion",
        "Build and publish the AtCoder extension first, then the THM extension as a separate project",
      ],
    },
  ],
  references: [
    { text: "Chrome Extensions Manifest V3 - service workers, content scripts and permissions", url: "https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3" },
    { text: "GitHub REST API - creating and updating file contents", url: "https://docs.github.com/en/rest/repos/contents" },
    { text: "Codeforces API - official method reference (user.status, contest.standings, problem.statistics)", url: "https://codeforces.com/apiHelp/methods" },
    { text: "CFPusher - Chrome extension that auto-pushes accepted Codeforces submissions to GitHub (SarJ2004)", url: "https://github.com/SarJ2004/cf-pusher" },
    { text: "CFPusher - Chrome Web Store listing", url: "https://chromewebstore.google.com/detail/cfpusher-codeforces-to-gi/eiffefcjnaanflbhcmgjlaoilhpkbael" },
    { text: "LeetHub - original extension that auto-syncs LeetCode solutions to GitHub (QasimWani)", url: "https://github.com/QasimWani/LeetHub" },
    { text: "LeetHub 3.0 - actively maintained fork for current LeetCode (raphaelheinz)", url: "https://github.com/raphaelheinz/LeetHub-3.0" },
    { text: "LeetSync - Chrome extension for syncing LeetCode submissions to GitHub", url: "https://github.com/LeetSync/LeetSync" },
    { text: "AtCommitter - auto GitHub commit tool for AtCoder", url: "https://github.com/kult0922/AtCommitter" },
    { text: "AtCoderProblems - the main community tool for tracking AtCoder progress", url: "https://github.com/kenkoooo/AtCoderProblems" },
    { text: "UpCode - Python tool for bulk-uploading accepted solutions from Codeforces, AtCoder and CodeChef to GitHub", url: "https://github.com/CrapTheCoder/UpCode" },
    { text: "CodeSync - similar multi-platform solution uploader (Codeforces, AtCoder, CodeChef)", url: "https://github.com/VaiibhavThatai/CodeSync" },
  ],
}

export default codeforcesAutoPush
