// I present the privacy policy explaining what data the site collects, how it is used and how to contact me about it.

import type { Metadata } from "next"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy and legal terms for isaacadjei.me. How this site handles data, intellectual property, cookies and analytics.",
  alternates: {
    canonical: "https://www.isaacadjei.me/privacy",
  },
  robots: {
    index: false,
  },
}

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-24 space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground font-mono">Last updated: June 2026</p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          This page covers how Isaac Adjei handles your data, who owns the content on this site
          and the terms under which you access it. By using this site you agree to the terms
          described here. If you have any concerns, please reach out through the{" "}
          <Link
            href="/contact"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            contact page
          </Link>
          .
        </p>
      </section>

      <Separator />

      <section className="space-y-10 text-muted-foreground [&_h2]:text-foreground [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mb-3 [&_p]:leading-relaxed [&_p]:text-[0.95rem]">
        <div>
          <h2>Intellectual property</h2>
          <p>
            All content on this site, including text, images, code samples, project write-ups,
            design and branding, is the intellectual property of Isaac Adjei unless otherwise
            credited. You may not reproduce, redistribute or repurpose any part of this site
            without explicit written permission. You are welcome to share links to this site with
            appropriate attribution.
          </p>
        </div>

        <div>
          <h2>Use of content</h2>
          <p>
            The content on this site is provided for informational and educational purposes only.
            It reflects my personal work, views and experiences. No warranty is made regarding the
            accuracy, completeness or fitness of any information for a particular purpose. This
            site and its content are provided in good faith on an &ldquo;as is&rdquo; basis. I am
            not liable for any loss or damage arising from your use of this site or reliance on any
            information found here.
          </p>
        </div>

        <div>
          <h2>Analytics</h2>
          <p>
            This site uses analytics services to understand general usage patterns such as page
            views, device type and geographic region. All data collected is fully anonymised. No
            individual visitor is identified, tracked across other websites or profiled in any way.
            The purpose is solely to understand which parts of the site are useful and to improve
            the content accordingly.
          </p>
          <p className="mt-3">
            Blog posts also record anonymous scroll-depth events at the 25%, 50%, 75% and 100%
            read marks. These are stored alongside a one-way hashed representation of the visitor
            IP address so that duplicate events from the same session are not counted. No raw IP
            address is retained. This data is used only to understand which posts are read in full
            and to guide future writing.
          </p>
        </div>

        <div>
          <h2>Contact form</h2>
          <p>
            When you use the contact form, your name, email address and message are used solely to
            respond to your enquiry. This information is handled by a third-party email delivery
            service (see{" "}
            <a
              href="https://resend.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Resend Privacy Policy
            </a>
            ) and is not stored in any database on my end. It is not shared with any other party.
          </p>
          <p className="mt-3">
            The contact form is also protected by{" "}
            <a
              href="https://www.cloudflare.com/products/turnstile/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Cloudflare Turnstile
            </a>
            , a silent bot-detection service. Turnstile analyses browser signals to determine
            whether a submission is from a human. No personal data is collected by this check and
            it is governed by{" "}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Cloudflare&apos;s Privacy Policy
            </a>
            .
          </p>
        </div>

        <div>
          <h2>Newsletter</h2>
          <p>
            If you subscribe to the newsletter, your email address is stored and managed by a
            third-party newsletter platform (see{" "}
            <a
              href="https://www.beehiiv.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Beehiiv Privacy Policy
            </a>
            ). Their privacy policy governs how that data is handled. Every issue includes a
            one-click unsubscribe link at the bottom so you can leave at any time with no
            questions asked.
          </p>
        </div>

        <div>
          <h2>Blog comments</h2>
          <p>
            Blog posts on this site use{" "}
            <a
              href="https://giscus.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Giscus
            </a>
            , a comments system powered by GitHub Discussions. If you choose to leave a comment,
            you will be asked to sign in with your GitHub account. That authentication is handled
            entirely by GitHub and your credentials are never shared with or stored by this site.
            Your comments are stored in a public GitHub repository and are subject to{" "}
            <a
              href="https://github.com/giscus/giscus/blob/main/PRIVACY-POLICY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Giscus&apos;s Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              GitHub&apos;s Privacy Statement
            </a>
            . You can view or delete your comments directly on GitHub at any time.
          </p>
        </div>

        <div>
          <h2>Cookies</h2>
          <p>
            This site uses a cookie to remember your theme preference (light or dark mode). It
            stores only your chosen display mode, contains no personal information and is not
            accessible to any third party. No tracking cookies or advertising cookies are used. If
            you sign in with GitHub to leave a comment via the embedded{" "}
            <a
              href="https://giscus.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Giscus
            </a>{" "}
            widget, GitHub may set additional cookies within that widget. Those are governed by{" "}
            <a
              href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              GitHub&apos;s Privacy Statement
            </a>
            , not this one. You can clear cookies at any time through your browser settings.
          </p>
        </div>

        <div>
          <h2>External links</h2>
          <p>
            This site contains links to external platforms including GitHub, LinkedIn, YouTube and
            others. I am not responsible for the content, availability or privacy practices of
            those sites. I recommend reading their respective privacy policies before sharing any
            personal information with them.
          </p>
        </div>

        <div>
          <h2>Your rights</h2>
          <p>
            Since I do not store personal data on my own systems, there is no profile to delete or
            export. If you have a question about data you may have submitted through the contact
            form or newsletter, feel free to get in touch and I will respond as quickly as I can.
            If you believe any content on this site infringes your rights or if you have any other
            concern, you can raise it through the{" "}
            <Link
              href="/contact"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              contact page
            </Link>{" "}
            and it will be addressed promptly.
          </p>
        </div>

        <div>
          <h2>Changes to this policy</h2>
          <p>
            This policy will be updated in the future as the site evolves. The date at the top of
            this page will always reflect the most recent revision. Continued use of the site after
            any update constitutes acceptance of the revised policy in effect at that time, not any
            previous version. If data collection practices change significantly, all users and
            subscribers will be notified before those changes come into effect.
          </p>
        </div>

        <div>
          <h2>Contact</h2>
          <p>
            If you have any questions about this policy, please reach out at{" "}
            <a
              href="mailto:contact@isaacadjei.me"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              contact@isaacadjei.me
            </a>{" "}
            or use the{" "}
            <Link
              href="/contact"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              contact page
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
