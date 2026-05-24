"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="border rounded-xl p-8 shadow-sm bg-card flex flex-col items-center gap-6 max-w-sm w-full">
        {/* Avatar */}
        <Image
          src="/images/avatar.png"
          alt="Isaac Adjei"
          width={64}
          height={64}
          className="rounded-full w-16 h-16 mx-auto"
          priority
        />

        {/* Identity */}
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl font-bold">Isaac Adjei</h1>
          <p className="text-sm text-muted-foreground">Private access only</p>
        </div>

        {/* Sign-in */}
        <Button
          className="w-full gap-2"
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        >
          <Github className="h-4 w-4" />
          Sign in with GitHub
        </Button>
      </div>
    </div>
  )
}
