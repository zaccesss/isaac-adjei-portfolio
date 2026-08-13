import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

// I parse it as an integer at startup so the hot-path comparison is a simple number equality check
const ALLOWED_ID = parseInt(process.env.ALLOWED_GITHUB_ID ?? "0", 10)

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    signIn({ profile }) {
      // I check the numeric GitHub ID so a username change can never break access
      return (profile as { id?: number })?.id === ALLOWED_ID
    },
    session({ session, token }) {
      // I return the session unchanged - the GitHub ID check already happened in signIn
      return session
    },
    jwt({ token, profile }) {
      // I store the GitHub ID on the token so I can verify it is still the allowed account
      if (profile) {
        token.githubId = (profile as { id?: number }).id
      }
      return token
    },
  },
  events: {
    // I record sign-ins and sign-outs in the activity log. I use a dynamic import so the Supabase
    // client is never bundled into the edge middleware (which imports this module) and I
    // fire-and-forget inside a try/catch so a logging failure can never block authentication.
    async signIn({ profile }) {
      try {
        const { supabase } = await import("@/lib/supabase")
        await supabase.from("activity_log").insert({
          action: "auth.login",
          detail: (profile as { login?: string })?.login ?? null,
        })
      } catch {}
    },
    async signOut() {
      try {
        const { supabase } = await import("@/lib/supabase")
        await supabase.from("activity_log").insert({ action: "auth.logout" })
      } catch {}
    },
  },
  pages: {
    // I redirect both sign-in and errors to the same login page to avoid leaking which step failed
    signIn: "/dashboard/login",
    error: "/dashboard/login",
  },
})
