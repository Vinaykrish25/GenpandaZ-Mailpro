import { google } from "googleapis"
import { createClient } from "@supabase/supabase-js"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url))

  const { searchParams } = new URL(req.url)
  const code    = searchParams.get("code")
  const account = searchParams.get("state") as "primary"|"secondary"|"work" || "primary"

  if (!code) return NextResponse.redirect(new URL("/dashboard/settings?error=no_code", req.url))

  try {
    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
    const { tokens } = await oauth2.getToken(code)
    const refreshToken = tokens.refresh_token

    if (!refreshToken) {
      return NextResponse.redirect(new URL("/dashboard/settings?error=no_refresh_token", req.url))
    }

    // Get user email from token info
    oauth2.setCredentials(tokens)
    const oauth2api  = google.oauth2({ version:"v2", auth: oauth2 })
    const { data }   = await oauth2api.userinfo.get()
    const gmailEmail = data.email

    const colMap: Record<string, string> = { primary:"gmail_user", secondary:"gmail_user_2", work:"gmail_user_3" }
    const metMap: Record<string, string> = { primary:"gmail_method", secondary:"gmail_method_2", work:"gmail_method_3" }
    const tokMap: Record<string, string> = { primary:"gmail_token", secondary:"gmail_token_2", work:"gmail_token_3" }

    await supabase.from("profiles").upsert({
      id:                userId,
      [colMap[account]]: gmailEmail,
      [metMap[account]]: "oauth",
      [tokMap[account]]: refreshToken,
    })

    return NextResponse.redirect(new URL("/dashboard/settings?gmail_connected=true", req.url))
  } catch (err) {
    console.error("Gmail OAuth callback error:", err)
    return NextResponse.redirect(new URL("/dashboard/settings?error=oauth_failed", req.url))
  }
}