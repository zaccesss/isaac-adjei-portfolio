import type { Metadata } from "next"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ExternalLink } from "lucide-react"
import ShareButton from "@/components/shared/ShareButton"

export const metadata: Metadata = {
  title: "Notes | Auto-Push Competitive Programming Solutions to GitHub",
  description: "The landscape of tools for automatically pushing accepted solutions from Codeforces, AtCoder, LeetCode and TryHackMe to GitHub - what exists, what is missing and what I want to build.",
  alternates: {
    canonical: "https://www.isaacadjei.me/notes/codeforces-auto-push",
  },
  openGraph: {
    images: ["/api/og?title=Auto-Push%20CP%20Solutions%20to%20GitHub&description=The%20landscape%20of%20tools%20for%20syncing%20competitive%20programming%20solutions%20to%20GitHub."],
  },
}

const references = [
  {
    text: "Chrome Extensions Manifest V3 - service workers, content scripts and permissions",
    url: "https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3",
  },
  {
    text: "GitHub REST API - creating and updating file contents",
    url: "https://docs.github.com/en/rest/repos/contents",
  },
  {
    text: "Codeforces API - official method reference (user.status, contest.standings, problem.statistics)",
    url: "https://codeforces.com/apiHelp/methods",
  },
  {
    text: "CFPusher - Chrome extension that auto-pushes accepted Codeforces submissions to GitHub (SarJ2004)",
    url: "https://github.com/SarJ2004/cf-pusher",
  },
  {
    text: "CFPusher - Chrome Web Store listing",
    url: "https://chromewebstore.google.com/detail/cfpusher-codeforces-to-gi/eiffefcjnaanflbhcmgjlaoilhpkbael",
  },
  {
    text: "LeetHub - original extension that auto-syncs LeetCode solutions to GitHub (QasimWani)",
    url: "https://github.com/QasimWani/LeetHub",
  },
  {
    text: "LeetHub 3.0 - actively maintained fork for current LeetCode (raphaelheinz)",
    url: "https://github.com/raphaelheinz/LeetHub-3.0",
  },
  {
    text: "LeetSync - Chrome extension for syncing LeetCode submissions to GitHub",
    url: "https://github.com/LeetSync/LeetSync",
  },
  {
    text: "AtCommitter - auto GitHub commit tool for AtCoder",
    url: "https://github.com/kult0922/AtCommitter",
  },
  {
    text: "AtCoderProblems - the main community tool for tracking AtCoder progress",
    url: "https://github.com/kenkoooo/AtCoderProblems",
  },
  {
    text: "UpCode - Python tool for bulk-uploading accepted solutions from Codeforces, AtCoder and CodeChef to GitHub",
    url: "https://github.com/CrapTheCoder/UpCode",
  },
  {
    text: "CodeSync - similar multi-platform solution uploader (Codeforces, AtCoder, CodeChef)",
    url: "https://github.com/VaiibhavThatai/CodeSync",
  },
]

export default function CodeforcesAutoPushPage() {
  return (
    <div className="container max-w-3xl py-24 space-y-12">
      <div>
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to notes
        </Link>
        <div className="flex flex-wrap gap-2 mb-4">
          {["Chrome Extension", "Competitive Programming", "GitHub", "Codeforces", "AtCoder", "Automation"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Auto-Push CP Solutions to GitHub
          </h1>
          <ShareButton title="Notes | Auto-Push CP Solutions to GitHub" />
        </div>
        <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
          Every accepted solution on Codeforces, AtCoder or TryHackMe is worth keeping. It
          documents your progression, gives you a searchable reference for techniques and signals
          genuine practice. This note maps out what tools already exist, where the gaps are and
          what I want to build or contribute to.
        </p>
      </div>

      <Separator />

      <section className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mt-0 [&_p]:leading-relaxed [&_p]:text-[0.95rem]">
        <h2>What already exists</h2>

        <h2 className="text-base font-semibold text-foreground/80 !mt-2">LeetCode</h2>
        <p>
          LeetCode has the most mature tooling. The original <strong>LeetHub</strong> extension
          (QasimWani) started the pattern: a Manifest V2 Chrome extension that injects a content
          script into the submission result page, detects an accepted verdict and pushes the
          solution to GitHub via a stored PAT. LeetCode has since changed its frontend enough
          that the original is partially broken, so the community maintains forks.
          <strong> LeetHub 3.0</strong> (raphaelheinz) is the actively maintained version as of
          2025. <strong>LeetSync</strong> takes a different approach - it uses the LeetCode API
          directly to fetch submission data rather than scraping the DOM, then writes to GitHub.
          LeetCode does not have any official built-in GitHub integration of its own; all sync
          tools are community-built extensions.
        </p>

        <h2 className="text-base font-semibold text-foreground/80 !mt-2">Codeforces</h2>
        <p>
          <strong>CFPusher</strong> (SarJ2004) already solves this for Codeforces. It is a
          Manifest V3 Chrome extension on the Chrome Web Store that automatically pushes accepted
          submissions to a GitHub repo. It includes a streak tracker, a problem rating chart and
          GitHub OAuth integration. It uses the Codeforces API (<code>user.status</code> endpoint
          at <code>codeforces.com/apiHelp/methods</code>) for metadata and a content script to
          capture the source code from the submission page (since the API does not return source
          code). CFPusher is open source - if there are missing features or bugs, contributing
          directly makes more sense than building from scratch.
        </p>
        <p>
          There is also <strong>UpCode</strong> (CrapTheCoder), a Python CLI tool that
          bulk-uploads all historical accepted submissions from Codeforces, AtCoder and CodeChef
          to GitHub. It scrapes submission pages (which requires an authenticated session for
          Codeforces). Useful for an initial backfill but not real-time.
        </p>

        <h2 className="text-base font-semibold text-foreground/80 !mt-2">AtCoder</h2>
        <p>
          <strong>AtCommitter</strong> (kult0922) is a tool that auto-commits accepted AtCoder
          solutions to GitHub. <strong>AtCoderProblems</strong> (kenkoooo) is the main community
          platform for tracking AtCoder progress - it shows which problems you have solved, heat
          maps and language breakdowns, but does not push to GitHub. The auto-push tooling for
          AtCoder is less mature and less actively maintained than the LeetCode equivalents.
          There is no well-maintained Chrome extension for AtCoder equivalent to CFPusher.
        </p>

        <h2 className="text-base font-semibold text-foreground/80 !mt-2">TryHackMe</h2>
        <p>
          TryHackMe has no equivalent tooling. There is no API for programmatically fetching
          room completion data or writeup content, and no extension or script that auto-pushes
          writeups to GitHub. People maintain their THM repos manually. This is the biggest gap
          in the space. The closest workflow anyone uses is writing notes in Obsidian or a local
          folder during a room and then pushing manually. A browser extension that detected room
          completion and triggered a structured commit (with a templated README per room: category,
          difficulty, tags, notes) would be genuinely useful.
        </p>

        <h2>What I want to build</h2>
        <p>
          CFPusher already exists for Codeforces and LeetHub 3.0 covers LeetCode, so rebuilding
          those from scratch makes no sense. The gaps worth filling - each as its own dedicated
          extension since these are completely separate platforms with separate use cases, separate
          repos and separate audiences:
        </p>
        <ul className="list-none space-y-3">
          {[
            "An AtCoder extension: AtCommitter exists but appears unmaintained. A Manifest V3 port with GitHub OAuth (same pattern as CFPusher) would be a clean project. AtCoder submissions are public and the HTML structure is stable, so DOM scraping is reliable. Target repo would be separate from the Codeforces one.",
            "A TryHackMe extension: on room completion (detect the 'You have completed this room' banner), prompt for optional notes and push a structured markdown file to a dedicated THM writeups repo. TryHackMe has no API so the content script approach is the only option. Completely unrelated to competitive programming - different repo, different audience, different format.",
          ].map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2>Architecture for the AtCoder extension</h2>
        <p>
          Manifest V3 extension, same pattern as CFPusher:
        </p>
        <ul className="list-none space-y-2">
          {[
            "content-script.js - watches atcoder.jp/contests/*/submissions/* for AC verdict; reads submission code from the page DOM",
            "background/worker.js - receives payload from content script; calls GitHub Contents API to create/update file; stores PAT and repo config in chrome.storage.sync",
            "options/index.html - AtCoder handle, GitHub PAT or OAuth, target repo, folder structure preferences",
          ].map((item) => (
            <li key={item} className="flex gap-2 text-sm font-mono">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span className="text-xs">{item}</span>
            </li>
          ))}
        </ul>

        <h2>Architecture for the TryHackMe extension</h2>
        <p>
          Manifest V3 extension, simpler since there is no API:
        </p>
        <ul className="list-none space-y-2">
          {[
            "content-script.js - watches tryhackme.com/r/* for room completion banner; extracts room name, category and difficulty from the page; prompts for optional personal notes",
            "background/worker.js - constructs a markdown writeup file and pushes to the dedicated THM writeups repo via GitHub Contents API",
            "options/index.html - GitHub PAT, target writeups repo, default note template",
          ].map((item) => (
            <li key={item} className="flex gap-2 text-sm font-mono">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span className="text-xs">{item}</span>
            </li>
          ))}
        </ul>

        <h2>Repo structures</h2>
        <p>Each platform gets its own dedicated repo:</p>
        <pre className="rounded-lg bg-muted/40 p-4 text-xs font-mono leading-relaxed overflow-x-auto">{`# codeforces-solutions (managed by CFPusher)
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
    notes.md   ← category, difficulty, tools, key learnings`}</pre>

        <h2>If I open-source them</h2>
        <p>
          If the AtCoder extension works well, publishing it makes sense - the AtCoder community
          actively wants this and nothing well-maintained exists. The TryHackMe extension would
          appeal to the CTF and security learner community who are already manually pushing
          writeups. The main maintenance burden for both is keeping up with DOM changes when the
          platforms update their frontends - the same problem LeetHub has faced through v1 to v3.
        </p>

        <h2>Next steps</h2>
        <ul className="list-none space-y-2">
          {[
            "Install CFPusher and use it on Codeforces - understand the UX and what could be better",
            "Build a minimal AtCoder content script proof of concept - detect AC verdict and log the submission payload",
            "Wire up the GitHub Contents API call from a Manifest V3 background service worker",
            "Test the TryHackMe completion detection - identify the DOM element that signals room completion",
            "Build and publish the AtCoder extension first, then the THM extension as a separate project",
          ].map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">References and resources</h2>
        <ul className="space-y-3">
          {references.map((ref) => (
            <li key={ref.text}>
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-2 text-sm text-primary hover:underline group"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-70 group-hover:opacity-100" />
                <span>{ref.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      <Link
        href="/notes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to notes
      </Link>
    </div>
  )
}
