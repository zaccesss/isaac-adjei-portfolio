import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get("title") ?? "Isaac Adjei"
  const description = searchParams.get("description") ?? "Electronic Engineering & Computer Science Student"

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage: "radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a0a 100%)",
          padding: "40px 80px",
        }}
      >
        {/* Logo / Name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: "bold",
              color: "white",
              marginRight: "20px",
            }}
          >
            IA
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "600",
              color: "#ffffff",
              letterSpacing: "-0.5px",
            }}
          >
            isaacadjei.me
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: "700",
            color: "#ffffff",
            textAlign: "center",
            lineHeight: "1.1",
            marginBottom: "20px",
            maxWidth: "900px",
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: "32px",
            color: "#a0a0a0",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: "1.4",
          }}
        >
          {description}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "20px",
            color: "#666",
          }}
        >
          <span>Electronic Engineering</span>
          <span style={{ color: "#667eea" }}>•</span>
          <span>Computer Science</span>
          <span style={{ color: "#667eea" }}>•</span>
          <span>Aston University</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
