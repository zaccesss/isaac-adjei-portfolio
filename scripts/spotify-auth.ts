// I perform the one-time Spotify OAuth flow to obtain a long-lived refresh token that the /api/spotify route can use on every request without re-prompting.
// Run: npx tsx scripts/spotify-auth.ts
// Then open the printed URL in your browser, authorise and paste the full
// redirect URL (it will look like https://isaacadjei.me?code=AQC...) back here.

import * as readline from "readline"

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
// I use the portfolio root as the redirect URI because Spotify requires an exact match
// and I don't need a real callback page - the code is in the URL which I read manually.
const REDIRECT_URI = "https://isaacadjei.me"

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET env vars first.")
  console.error("Example:")
  console.error("  $env:SPOTIFY_CLIENT_ID='your_client_id_here'")
  console.error("  $env:SPOTIFY_CLIENT_SECRET='your_client_secret_here'")
  process.exit(1)
}

// Scopes: currently-playing + playback state for /api/spotify; user-top-read for /api/spotify-top;
// user-library-read for /api/spotify-top podcasts (saved shows)
const scope = "user-read-currently-playing user-read-playback-state user-top-read user-library-read"
const authUrl =
  `https://accounts.spotify.com/authorize` +
  `?client_id=${CLIENT_ID}` +
  `&response_type=code` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=${encodeURIComponent(scope)}`

console.log("\n1. Open this URL in your browser:\n")
console.log(authUrl)
console.log("\n2. Authorise the app.")
console.log("3. You will be redirected to isaacadjei.me - the page may not load, that is fine.")
console.log("4. Copy the FULL URL from your browser address bar and paste it below.\n")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
rl.question("Paste the redirect URL here: ", async (redirectUrl: string) => {
  rl.close()

  let code: string | null
  try {
    const url = new URL(redirectUrl)
    code = url.searchParams.get("code")
  } catch {
    console.error("Could not parse the URL. Make sure you pasted the full address bar URL.")
    process.exit(1)
  }

  if (!code) {
    console.error("No code found in the URL.")
    process.exit(1)
  }

  console.log("\nExchanging code for tokens...")

  // I use Basic auth with base64-encoded client_id:client_secret as required by the Spotify token endpoint.
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  })

  const data = await response.json() as Record<string, string>

  if (!response.ok) {
    console.error("Error from Spotify:", data)
    process.exit(1)
  }

  // I only need the refresh_token - the access_token expires after 1 hour
  // but the refresh_token is long-lived and the API route uses it on every request.
  console.log("\n========================================")
  console.log("SUCCESS! Add this to your Vercel env vars:")
  console.log("========================================")
  console.log(`SPOTIFY_REFRESH_TOKEN=${data.refresh_token}`)
  console.log("========================================\n")
})
