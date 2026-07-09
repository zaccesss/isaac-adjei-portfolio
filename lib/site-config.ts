// Central identifiers, read from the environment so nothing is hardcoded in scattered literals and a
// fork can override them without editing source. Each has a safe fallback so the site always renders.
//
// A note on what is and is not secret: the public values below render on the site or ship in the client
// bundle by nature (the profile handle and the Discord id behind the presence card), so an env var
// centralises them but does not make them secret - that is fine, they are meant to be public. The
// server-only values are used solely in server routes that call the GitHub API and are never sent to the
// client. Real credentials (tokens, keys, webhooks) live only as environment secrets, never here.

// I use || rather than ?? so an empty-string env var also falls back to the sensible default, which
// keeps the site rendering even if a var is ever set blank by mistake.

// --- Public (safe for the client; set with NEXT_PUBLIC_ so they reach the browser) ---
export const GITHUB_USER = process.env.NEXT_PUBLIC_GITHUB_USER || "zaccesss"
export const DISCORD_USER_ID = process.env.NEXT_PUBLIC_DISCORD_USER_ID || "1087417301583790212"

// --- Server only (used by the GitHub API routes; never sent to the client; set in Vercel) ---
export const GH_OWNER = process.env.GH_OWNER || "zaccesss"
export const AUTOMATIONS_REPO = process.env.AUTOMATIONS_REPO || "isaac-adjei-automations"
export const PORTFOLIO_REPO = process.env.PORTFOLIO_REPO || "isaac-adjei-portfolio"
