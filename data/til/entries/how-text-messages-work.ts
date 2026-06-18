import type { TILEntry } from "../index"

const _how_text_messages_work: TILEntry = {
    id: "how-text-messages-work",
    title: "A text message routes through three separate network systems before reaching your phone",
    date: "2026-08-15",
    category: "Web",
    published: true,
    body: "When you send an SMS, your phone sends it to your carrier's SMSC (Short Message Service Centre). The SMSC queries the HLR (Home Location Register) via the [SS7](https://www.itu.int/rec/T-REC-Q.700-198811-I/en) (Signalling System 7) network to find which network currently serves the recipient's number. SS7 is a 1970s protocol that remains the backbone of global telecom signalling: it has well-known security problems (IMSI catchers exploit its trust model). Once the HLR returns the recipient's current VLR (Visitor Location Register), the SMSC routes the message to the correct cell tower.",
    detail: [
      {
        type: "p",
        text: "SS7's security problems are well-documented and not patched because replacing the global telecom signalling infrastructure is not feasible. Researchers have demonstrated SMS interception, call forwarding and location tracking using only an SS7 access point. This is why two-factor authentication via SMS is considered weaker than authenticator apps or hardware keys: an attacker with SS7 access can intercept the OTP before it reaches your phone.",
      },
      {
        type: "note",
        text: "Signal, WhatsApp and iMessage bypass the SS7 layer entirely by routing messages over the data channel (IP) with end-to-end encryption. The telecom network only carries the data packets, not the message content. The security improvement is fundamental: IP-based messaging does not touch SS7 at all.",
      },
    ],
    tags: ["networking", "telecom", "systems"],
  }

export default _how_text_messages_work
