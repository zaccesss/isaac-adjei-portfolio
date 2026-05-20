"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 p-8 max-w-sm w-full">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Private access only
          </p>
        </div>
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
