import type { TILEntry } from "../index"

const _claude_mythos_restricted_model: TILEntry = {
    id: "claude-mythos-restricted-model",
    title: "Anthropic's Claude Mythos 5 is a cybersecurity model deliberately kept out of public reach",
    date: "2026-06-14",
    category: "AI/ML",
    published: true,
    body: "Claude Mythos 5 was released on June 9, 2026 alongside Claude Fable 5, but unlike Fable it is not available to the general public. It sits above the Opus class in capability, is purpose-built for finding software vulnerabilities and has no safety classifiers that can decline requests. Anthropic restricts it to vetted partners through Project Glasswing. What struck me: we now have a two-tier model landscape where the most capable systems are deliberately gatekept, not because Anthropic could not ship them but because they chose not to. The pace of capability improvement has outrun the pace of safe deployment: and the gap is now structural.",
    detail: [
      {
        type: "p",
        text: "What makes Mythos 5 different from Opus or Sonnet is not just capability: it is the deliberate removal of safety refusals for cybersecurity tasks. Anthropic decided that for offensive security research, the friction of safety classifiers was too high, so vetted partners get a version without them. This acknowledges that safety classifiers are a trade-off against utility, not a zero-cost addition.",
      },
      {
        type: "note",
        text: "Project Glasswing is Anthropic's restricted-access programme for high-capability models. Vetted partners include security research organisations and national labs. If you are not already in that programme, there is no public application process.",
      },
      {
        type: "link",
        url: "https://www.anthropic.com/news/claude-fable-5-mythos-5",
        label: "Anthropic: Claude Fable 5 and Mythos 5",
        description: "The announcement covering both releases, the Project Glasswing access model and Anthropic's reasoning for restricted distribution.",
      },
    ],
    tags: ["AI", "Anthropic", "safety", "cybersecurity"],
    source: { label: "Anthropic: Claude Fable 5 and Mythos 5", url: "https://www.anthropic.com/news/claude-fable-5-mythos-5" },
  }

export default _claude_mythos_restricted_model
