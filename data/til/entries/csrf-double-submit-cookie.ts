import type { TILEntry } from "../index"

const _csrf_double_submit_cookie: TILEntry = {
    id: "csrf-double-submit-cookie",
    title: "CSRF protection with a double-submit cookie does not require server-side session storage",
    date: "2026-06-04",
    category: "Security",
    published: true,
    body: "The standard [CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) double-submit cookie pattern: generate a random token, set it as a non-HttpOnly cookie and require the same value in a request header or form field. A cross-origin attacker cannot read the cookie value (same-origin policy blocks it), so they cannot reproduce the header value. The server checks cookie value equals header value: no session lookup needed. This makes it easy to implement in stateless API servers.",
    detail: [
      {
        type: "p",
        text: "The double-submit pattern works because of the same-origin policy: JavaScript on attacker.com cannot read cookies set by your-app.com. The attacker can submit a form that sends the cookie automatically (that is the CSRF attack), but they cannot read the cookie value to also set the matching header.",
      },
      {
        type: "note",
        text: "SameSite=Strict or SameSite=Lax on the session cookie is a simpler defence that prevents the cookie being sent cross-origin at all. Most modern frameworks set SameSite=Lax by default. Double-submit is the fallback for APIs consumed by native apps or embedded in iframes across origins.",
      },
      {
        type: "link",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html",
        label: "OWASP: CSRF Prevention Cheat Sheet",
        description: "Covers SameSite cookies, synchroniser tokens, double-submit and the origin header check.",
      },
    ],
    tags: ["security", "web", "CSRF"],
  }

export default _csrf_double_submit_cookie
