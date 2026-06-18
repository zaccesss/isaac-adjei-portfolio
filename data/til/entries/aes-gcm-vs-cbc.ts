import type { TILEntry } from "../index"

const _aes_gcm_vs_cbc: TILEntry = {
    id: "aes-gcm-vs-cbc",
    title: "AES-GCM is authenticated encryption; AES-CBC is not: using CBC without a MAC is dangerous",
    date: "2026-05-29",
    category: "Security",
    published: true,
    body: "[AES-GCM](https://csrc.nist.gov/publications/detail/sp/800-38d/final) (Galois/Counter Mode) provides authenticated encryption with associated data (AEAD). It encrypts the plaintext AND produces a 128-bit authentication tag. Any modification to the ciphertext makes the tag verification fail and decryption is rejected. AES-CBC encrypts correctly but produces no integrity check. An attacker who can flip bits in a CBC ciphertext will produce different decrypted plaintext and the receiver accepts it silently. This is the basis of padding oracle attacks. Always use an AEAD mode (GCM, ChaCha20-Poly1305) for any new system.",
    detail: [
      {
        type: "embed",
        url: "https://www.youtube.com/embed/-fpVv_T4xwA",
        caption: "Computerphile: AES-GCM and Authenticated Encryption explained by Dr Mike Pound",
      },
      {
        type: "embed",
        url: "https://open.spotify.com/embed/show/7vAbYigR3zs8GYJP3EoVWw",
        variant: "spotify",
        caption: "Security Now: Steve Gibson and Leo Laporte on encryption, protocol security and applied cryptography",
      },
      {
        type: "note",
        text: "GCM uses a 96-bit nonce. Reusing the same nonce with the same key completely breaks GCM security: it reveals the authentication key and exposes plaintext XOR. Always generate a random 96-bit nonce per encryption, store it alongside the ciphertext and never reuse it.",
      },
      {
        type: "link",
        url: "https://csrc.nist.gov/publications/detail/sp/800-38d/final",
        label: "NIST SP 800-38D: GCM Mode",
        description: "The NIST specification for AES-GCM including nonce requirements, tag length choices and usage restrictions.",
      },
    ],
    tags: ["security", "cryptography", "AES"],
  }

export default _aes_gcm_vs_cbc
