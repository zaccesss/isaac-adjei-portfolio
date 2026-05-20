import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

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
      return session
    },
    jwt({ token, profile }) {
      if (profile) {
        token.githubId = (profile as { id?: number }).id
      }
      return token
    },
  },
  pages: {
    signIn: "/dashboard/login",
    error: "/dashboard/login",
  },
})
