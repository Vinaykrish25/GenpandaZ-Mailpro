import { google } from "googleapis"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url))

  const { searchParams } = new URL(req.url)
  const account = searchParams.get("account") || "primary"

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt:      "consent",         // force to get refresh_token every time
    scope: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    state: account,                 // pass account slot through OAuth flow
  })

  return NextResponse.redirect(url)
}