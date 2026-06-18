import type { TILEntry } from "../index"

const _tls_1_3_vs_1_2: TILEntry = {
    id: "tls-1-3-vs-1-2",
    title: "TLS 1.3 completes a handshake in one round trip instead of two",
    date: "2026-06-13",
    category: "Security",
    published: true,
    body: "In TLS 1.2, the client sends ClientHello, waits for ServerHello and certificate, sends its key exchange, then waits for the server Finished before sending its own Finished: two round trips before any application data flows. TLS 1.3 redesigned the handshake: the client sends a key share speculatively in ClientHello. If the server supports it, it responds with certificate, key share and Finished in one message. The client can send application data immediately after its Finished. One round trip total.",
    detail: [
      {
        type: "embed",
        url: "https://www.youtube.com/embed/86cQJ0MMses",
        caption: "Computerphile: TLS Handshake Explained by Dr Mike Pound",
      },
      {
        type: "p",
        text: "TLS 1.3 also removed weak cipher suites (RC4, DES, 3DES), made forward secrecy mandatory and eliminated RSA key exchange entirely. The result: TLS 1.3 is both faster and more secure than TLS 1.2.",
      },
      {
        type: "note",
        text: "TLS 1.3 also introduced 0-RTT resumption for returning clients: the client sends application data in its first message before the server responds. This eliminates the round trip entirely for resumed sessions, but 0-RTT data must be idempotent. Never use 0-RTT for POST requests to non-idempotent endpoints.",
      },
    ],
    tags: ["security", "TLS", "cryptography", "web"],
  }

export default _tls_1_3_vs_1_2
