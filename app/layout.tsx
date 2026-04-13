import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import "@/styles/animations.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import CommandMenu from "@/components/shared/CommandMenu"
import { ThemeProvider } from "@/components/providers/ThemeProvider"

export const metadata: Metadata = {
  title: {
    default: "Isaac Adjei | Electronic Engineering & Computer Science",
    template: "%s | Isaac Adjei",
  },
  description:
    "Electronic Engineering and Computer Science student at Aston University. Passionate about embedded systems, IoT and accessible technology.",
  keywords: [
    "Isaac Adjei",
    "Zac",
    "Zacess",
    "Electronic Engineering",
    "Computer Science",
    "Aston University",
    "Embedded Systems",
    "IoT",
  ],
  authors: [{ name: "Isaac Adjei" }],
  creator: "Isaac Adjei",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://isaacadjei.me",
    title: "Isaac Adjei | Electronic Engineering & Computer Science",
    description:
      "Electronic Engineering and Computer Science student passionate about embedded systems and accessible technology.",
    siteName: "Isaac Adjei Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Isaac Adjei | Electronic Engineering & Computer Science",
    description:
      "Electronic Engineering and Computer Science student passionate about embedded systems and accessible technology.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CommandMenu />
        </ThemeProvider>
      </body>
    </html>
  )
}
