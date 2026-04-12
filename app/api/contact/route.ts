import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }

    // TODO: Integrate email service (e.g. Resend)
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({ ... })

    console.log("Contact form submission:", { name, email, message })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
