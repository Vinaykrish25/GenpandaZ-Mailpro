import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // If customPrompt is sent directly, use it — but append the no-subject rule
    const basePrompt = body.customPrompt || buildPrompt(body)

    const finalPrompt = basePrompt + "\n\nIMPORTANT: Do NOT include a 'Subject:' line in your response. Write ONLY the email body starting with the greeting (e.g. 'Dear...'). The subject will be handled separately."

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: finalPrompt }],
      max_tokens: 600,
    })

    const email = response.choices?.[0]?.message?.content?.trim() || "No response generated"
    return Response.json({ email })

  } catch (error) {
    console.error("Groq error:", error)
    return Response.json({ error: "Failed to generate email" }, { status: 500 })
  }
}

function buildPrompt(body: Record<string, string>) {
  const { name, skills, role, company, reason, mode = "hr_outreach" } = body
  const toneMap: Record<string, string> = {
    formal:   "Very professional and formal.",
    friendly: "Warm and approachable.",
    bold:     "Confident and assertive.",
    concise:  "Extremely concise and direct.",
  }
  const t = toneMap[body.tone || "formal"] || toneMap.formal

  if (mode === "hr_outreach")
    return `Write a cold outreach email to HR.\nName: ${name} Skills: ${skills} Role: ${role} Company: ${company} Reason: ${reason}\nTone: ${t} Max 120 words. Start with greeting only.`

  return `Write a professional email.\nName: ${name} Role: ${role} Company: ${company}\nTone: ${t} Max 120 words. Start with greeting only.`
}