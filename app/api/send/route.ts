import nodemailer from "nodemailer"
import { createClient } from "@supabase/supabase-js"
import { auth } from "@clerk/nextjs/server"

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getTransport(account: string) {
  const map: Record<string, { user?: string; pass?: string }> = {
    primary:   { user: process.env.GMAIL_USER,   pass: process.env.GMAIL_APP_PASSWORD },
    secondary: { user: process.env.GMAIL_USER_2, pass: process.env.GMAIL_APP_PASSWORD_2 },
    work:      { user: process.env.GMAIL_USER_3, pass: process.env.GMAIL_APP_PASSWORD_3 },
  }
  const c = map[account] ?? map.primary
  if (!c.user || !c.pass) throw new Error(`No credentials for: ${account}`)
  return { t: nodemailer.createTransport({ service: "gmail", auth: { user: c.user, pass: c.pass } }), from: c.user }
}

// Extract subject from the first line of the email if it starts with "Subject:"
function extractSubject(emailBody: string, fallbackSubject: string): { subject: string; body: string } {
  const lines = emailBody.trim().split("\n")
  const firstLine = lines[0].trim()

  if (firstLine.toLowerCase().startsWith("subject:")) {
    const subject = firstLine.replace(/^subject:\s*/i, "").trim()
    // Remove the subject line and any blank line after it from the body
    const remaining = lines.slice(1).join("\n").replace(/^\s*\n/, "").trim()
    return { subject, body: remaining }
  }

  return { subject: fallbackSubject, body: emailBody.trim() }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: "Unauthorised" }, { status: 401 })

    const {
      email: rawEmail,
      hrEmail,
      name,
      role,
      company,
      resume,
      cc,
      bcc,
      senderAccount = "primary",
      mode = "hr_outreach",
      customSubject,
    } = await req.json()

    if (!rawEmail)  return Response.json({ error: "Email body required" },    { status: 400 })
    if (!hrEmail)   return Response.json({ error: "Recipient email required" }, { status: 400 })

    // Build fallback subject from form data
    const fallback = customSubject
      || `Application for ${role || "a position"}${company ? " at " + company : ""}`

    // Extract subject from email body if AI put it there
    const { subject, body: cleanBody } = extractSubject(rawEmail, fallback)

    const { t, from } = getTransport(senderAccount)

    const opts: nodemailer.SendMailOptions = {
      from:    `"${name || "Panda Mail"}" <${from}>`,
      to:      hrEmail,
      subject,
      text:    cleanBody,
      attachments: resume
        ? [{ filename: resume.name, content: resume.data, encoding: "base64" }]
        : [],
    }
    if (cc?.trim())  opts.cc  = cc.trim()
    if (bcc?.trim()) opts.bcc = bcc.trim()

    await t.sendMail(opts)

    // Log to Supabase
    await sb.from("email_logs").insert({
      user_id:   userId,
      to_email:  hrEmail,
      cc_email:  cc?.trim()  || null,
      bcc_email: bcc?.trim() || null,
      mode,
      subject,
      status:    "sent",
      sent_at:   new Date().toISOString(),
    })

    return Response.json({ success: true, subject, sentFrom: from })

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    console.error("Send error:", msg)
    try {
      const { userId } = await auth()
      if (userId) {
        const b = await req.clone().json().catch(() => ({}))
        await sb.from("email_logs").insert({
          user_id:  userId,
          to_email: b.hrEmail || "unknown",
          mode:     b.mode || "hr_outreach",
          status:   "failed",
          sent_at:  new Date().toISOString(),
        })
      }
    } catch {}
    return Response.json({ error: msg }, { status: 500 })
  }
}