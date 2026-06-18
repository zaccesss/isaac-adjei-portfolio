import type { TILEntry } from "../index"

const _how_https_handshake_works: TILEntry = {
    id: "how-https-handshake-works",
    title: "The HTTPS handshake exchanges keys without ever sending the private key over the wire",
    date: "2026-09-02",
    category: "Security",
    published: true,
    body: "TLS 1.3 does this in one round trip. The client sends a ClientHello with supported cipher suites and a key share ([Diffie-Hellman](https://datatracker.ietf.org/doc/html/rfc7919) public value). The server responds with its certificate, a key share and the Finished message: all encrypted using the derived shared secret. The client verifies the certificate against a trusted CA, derives the same shared secret and sends its Finished. No private key ever traverses the network. The shared secret is derived using [ECDHE](https://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-elliptic-curve-cryptography/) so it changes every session: this is forward secrecy.",
    detail: [
      {
        type: "p",
        text: "TLS 1.3 is faster than TLS 1.2 because the client sends a key share in the ClientHello, before the server has even responded. TLS 1.2 required a separate key exchange step, adding a full round trip. In TLS 1.3 the server can respond with its certificate and Finished in a single message.",
      },
      {
        type: "embed",
        url: "https://www.youtube.com/embed/86cQJ0MMses",
        caption: "Computerphile: TLS Handshake Explained by Dr Mike Pound",
      },
      {
        type: "link",
        url: "https://www.rfc-editor.org/rfc/rfc8446",
        label: "RFC 8446: TLS 1.3",
        description: "The full specification. Section 2 has an excellent summary of the handshake flow with message diagrams.",
      },
    ],
    tags: ["security", "TLS", "cryptography", "web"],
  }

export default _how_https_handshake_works
