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
  metadataBase: new URL("https://isaacadjei.me"),
  title: {
    default: "Isaac Adjei | EECS",
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
  icons: {
    icon: [{ url: "/images/avatar.png", type: "image/png" }],
    apple: [{ url: "/images/avatar.png", type: "image/png" }],
    shortcut: ["/images/avatar.png"],
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://isaacadjei.me",
    title: "Isaac Adjei | EECS",
    description:
      "Electronic Engineering and Computer Science student passionate about embedded systems and accessible technology.",
    siteName: "Isaac Adjei Portfolio",
    images: [
      {
        url: "/images/zac_profile.jpg",
        width: 1200,
        height: 630,
        alt: "Isaac Adjei",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Isaac Adjei | EECS",
    description:
      "Electronic Engineering and Computer Science student passionate about embedded systems and accessible technology.",
    images: ["/images/zac_profile.jpg"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
