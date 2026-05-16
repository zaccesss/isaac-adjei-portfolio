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
        <p className="text-sm text-muted-foreground font-mono">Last updated: May 2026</p>
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
            ). Their privacy policy governs how that data is handled. You can unsubscribe at any
            time using the link in any issue.
          </p>
        </div>

        <div>
          <h2>Cookies</h2>
          <p>
            This site uses a single cookie to remember your theme preference (light or dark mode).
            The theme preference cookie stores only your chosen display mode and contains no
            personal information. It is not accessible to any third party. No tracking cookies or
            advertising cookies are used. You can clear cookies at any time through your browser
            settings.
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
            This policy may be updated from time to time to reflect changes to the site or
            applicable requirements. The date at the top of this page will always show when it was
            last revised. Continued use of the site after any update constitutes acceptance of the
            revised policy.
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
