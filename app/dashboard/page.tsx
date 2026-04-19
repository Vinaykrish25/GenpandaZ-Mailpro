"use client"
import { useState } from "react"

const MODES = [
  { v:"hr_outreach",     i:"📧", l:"HR Outreach",  d:"Cold email to recruiter" },
  { v:"client_approach", i:"🤝", l:"Client Pitch",  d:"Business proposal" },
  { v:"reply_generator", i:"↩️", l:"Reply",          d:"Reply to an email" },
  { v:"follow_up",       i:"🔔", l:"Follow Up",      d:"Follow up message" },
  { v:"linkedin",        i:"💼", l:"LinkedIn",       d:"Connection note" },
  { v:"referral",        i:"🌟", l:"Referral",       d:"Ask for referral" },
  { v:"thank_you",       i:"🙏", l:"Thank You",      d:"Post-interview" },
  { v:"apology",         i:"😔", l:"Apology",        d:"Professional apology" },
  { v:"cold_dm",         i:"🎯", l:"Cold Pitch",     d:"Short cold pitch" },
]
const TONES = [
  { v:"formal",   l:"Formal" },
  { v:"friendly", l:"Friendly" },
  { v:"bold",     l:"Bold" },
  { v:"concise",  l:"Concise" },
]
const SENDERS = [
  { id:"primary",   l:"Primary" },
  { id:"secondary", l:"Secondary" },
  { id:"work",      l:"Work" },
]
const TM: Record<string, string> = {
  formal:"Very professional and formal.", friendly:"Warm and approachable.",
  bold:"Confident and assertive.",        concise:"Extremely concise and direct.",
}

// Auto-generate subject based on mode and form data
function autoSubject(mode: string, form: Record<string, string>): string {
  if (mode === "hr_outreach")     return `Application for ${form.role || "Position"}${form.company ? " at " + form.company : ""}`
  if (mode === "client_approach") return `Proposal: ${form.service || "Our Services"}${form.clientCompany ? " for " + form.clientCompany : ""}`
  if (mode === "reply_generator") return `Re: Your Email`
  if (mode === "follow_up")       return `Following Up — ${form.role || "Application"}${form.company ? " at " + form.company : ""}`
  if (mode === "linkedin")        return `Connecting with ${form.targetPerson || "You"}`
  if (mode === "referral")        return `Referral Request — ${form.role || "Position"}${form.company ? " at " + form.company : ""}`
  if (mode === "thank_you")       return `Thank You — ${form.role || "Interview"}${form.company ? " at " + form.company : ""}`
  if (mode === "apology")         return `Apology — ${form.apologyReason?.slice(0, 40) || "Delayed Submission"}`
  if (mode === "cold_dm")         return `${form.coldOffer || "Partnership Opportunity"}`
  return "Professional Email"
}

export default function ComposePage() {
  const [mode,    setMode]    = useState("hr_outreach")
  const [tone,    setTone]    = useState("formal")
  const [form,    setForm]    = useState<Record<string, string>>({})
  const [subject, setSubject] = useState("")
  const [toEmail, setToEmail] = useState("")
  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [aiAct,   setAiAct]   = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [copied,  setCopied]  = useState(false)
  const [resume,  setResume]  = useState<{ name: string; data: string } | null>(null)
  const [cc,      setCc]      = useState("")
  const [bcc,     setBcc]     = useState("")
  const [showCC,  setShowCC]  = useState(false)
  const [sender,  setSender]  = useState("primary")
  const [showM,   setShowM]   = useState(false)
  const [spam,    setSpam]    = useState<number | null>(null)

  const fc = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const buildPrompt = (action?: string) => {
    const t = TM[tone]
    const noSubject = "\n\nIMPORTANT: Do NOT write a Subject: line. Start directly with the greeting."
    if (action === "rewrite") return `Rewrite this email with a ${tone} tone under 120 words. No subject line:\n\n${email}`
    if (action === "shorten") return `Shorten to under 80 words. No subject line:\n\n${email}`
    if (action === "expand")  return `Expand to max 150 words. No subject line:\n\n${email}`
    if (action === "grammar") return `Fix grammar only. Return corrected email body only:\n\n${email}`
    if (mode === "hr_outreach")
      return `Write a cold outreach email body to HR.\nName:${form.name} Skills:${form.skills} Role:${form.role} Company:${form.company} Reason:${form.reason}\nTone:${t} Max 120 words. Start with greeting.${noSubject}`
    if (mode === "client_approach")
      return `Write a business proposal email body.\nFrom:${form.name} To:${form.clientName} at ${form.clientCompany} Service:${form.service} Why:${form.clientReason}\nTone:${t} Max 150 words. Start with greeting.${noSubject}`
    if (mode === "reply_generator")
      return `Write a reply email body to:\n---\n${form.receivedEmail}\n---\nFrom:${form.name} Intent:${form.replyIntent}\nTone:${t} Max 120 words. Start with greeting.${noSubject}`
    if (mode === "follow_up")
      return `Write a follow-up email body.\nName:${form.name} Company:${form.company} Role:${form.role} Date:${form.originalEmailDate} Reason:${form.followUpReason}\nTone:${t} Max 100 words. Start with greeting.${noSubject}`
    if (mode === "linkedin")
      return `Write a LinkedIn connection message body.\nFrom:${form.name} To:${form.targetPerson} at ${form.company} Reason:${form.reason}\nTone:${t} Max 60 words. Start with greeting.${noSubject}`
    if (mode === "referral")
      return `Write a referral request email body.\nFrom:${form.name} Employee:${form.referralPerson} at ${form.company} Role:${form.role} Known:${form.howKnown}\nTone:${t} Max 100 words. Start with greeting.${noSubject}`
    if (mode === "thank_you")
      return `Write a thank you email body after interview.\nFrom:${form.name} Interviewer:${form.interviewer} Company:${form.company} Role:${form.role} Moment:${form.keyMoment}\nTone:${t} Max 100 words. Start with greeting.${noSubject}`
    if (mode === "apology")
      return `Write a professional apology email body.\nFrom:${form.name} To:${form.apologyTo} Reason:${form.apologyReason} Fix:${form.apologyFix}\nTone:${t} Max 100 words. Start with greeting.${noSubject}`
    if (mode === "cold_dm")
      return `Write a cold pitch email body.\nFrom:${form.name} To:${form.coldTarget} at ${form.company} Offer:${form.coldOffer} Benefit:${form.coldBenefit}\nTone:${t} Max 80 words. Strong hook. One CTA.${noSubject}`
    return ""
  }

  const callAI = async (p: string) => {
    const r = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customPrompt: p }),
    })
    if (!r.ok) throw new Error("AI failed")
    return (await r.json()).email as string
  }

  const generate = async () => {
    try {
      setLoading(true); setSent(false); setEmail(""); setSpam(null)
      const result = await callAI(buildPrompt())
      // Strip any Subject: line the AI may have added despite instructions
      const clean = result.replace(/^subject:.*\n?/im, "").trim()
      setEmail(clean)
      setSpam(Math.floor(Math.random() * 3) + 1)
      // Auto-set subject based on form data
      if (!subject) setSubject(autoSubject(mode, form))
    } catch { setEmail("Error generating. Please try again.") }
    finally { setLoading(false) }
  }

  const runAction = async (a: string) => {
    if (!email) return
    try {
      setAiAct(a)
      const result = await callAI(buildPrompt(a))
      const clean = result.replace(/^subject:.*\n?/im, "").trim()
      setEmail(clean)
    } catch { alert("Action failed") }
    finally { setAiAct(null) }
  }

  const send = async () => {
    if (!email || !toEmail) return alert("Add recipient email first")
    try {
      setSending(true)
      const r = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          hrEmail:       toEmail,
          customSubject: subject,
          resume, cc, bcc,
          senderAccount: sender,
          mode,
          ...form,
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "Failed")
      setSent(true)
      // Clear form fields after successful send
      setForm({})
      setToEmail("")
      setSubject("")
      setCc(""); setBcc("")
      setResume(null)
    } catch (e: any) { alert(e.message || "Send failed") }
    finally { setSending(false) }
  }

  const resetAll = () => {
    setEmail(""); setSent(false); setSpam(null)
    setForm({}); setToEmail(""); setSubject("")
    setCc(""); setBcc(""); setResume(null)
  }

  const copy = () => {
    navigator.clipboard.writeText(email)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handleResume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    const r = new FileReader()
    r.onload = () => setResume({ name: f.name, data: (r.result as string).split(",")[1] })
    r.readAsDataURL(f)
  }

  const wc  = email.trim().split(/\s+/).filter(Boolean).length
  const cur = MODES.find(m => m.v === mode)!

  // Input style
  const inp: React.CSSProperties = {
    width:"100%", background:"#fff", border:"1.5px solid #E5E7EB",
    borderRadius:"8px", padding:"10px 13px", color:"#111827",
    fontFamily:"Inter,sans-serif", fontSize:".875rem", fontWeight:500,
    outline:"none", transition:"border-color .15s, box-shadow .15s",
  }

  return (
    <>
      <style>{`
        .ci:focus{border-color:#7C3AED!important;box-shadow:0 0 0 3px rgba(124,58,237,0.12)!important}
        .ci::placeholder{color:#D1D5DB;font-weight:400}
        .ci:hover{border-color:#C4B5FD}
        .mode-mob-btn:hover{background:var(--s2)!important}
        .tone-mob:hover{border-color:#C4B5FD!important;color:#5B21B6!important}
        .ai-tool:hover:not(:disabled){border-color:#C4B5FD;color:#5B21B6;background:#EDE9FE}
        .ai-tool.run{color:#5B21B6;border-color:#C4B5FD;background:#EDE9FE;animation:pulse 1s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
        .sender-opt:hover{border-color:#C4B5FD!important}
        .up-hover:hover{border-color:#C4B5FD!important;background:#EDE9FE!important}
        tbody tr:hover td{background:#FAFBFF}
      `}</style>

      <div className="cmp">

        {/* ── MODE SIDEBAR (desktop) ── */}
        <div className="cmp-modes">
          <div className="sl">Email Type</div>
          {MODES.map(m => (
            <button key={m.v}
              className={`m-btn ${mode === m.v ? "on" : ""}`}
              onClick={() => { setMode(m.v); resetAll() }}>
              <div className="m-ico">{m.i}</div>
              <div>
                <span className="m-t">{m.l}</span>
                <span className="m-s">{m.d}</span>
              </div>
            </button>
          ))}
          <div className="n-div" />
          <div className="sl">Tone</div>
          {TONES.map(t => (
            <button key={t.v}
              className={`t-opt ${tone === t.v ? "on" : ""}`}
              onClick={() => setTone(t.v)}>
              {t.l}
            </button>
          ))}
        </div>

        {/* ── FORM PANEL ── */}
        <div className="cmp-form">

          {/* Mobile: mode picker */}
          <div className="m-only" style={{ marginBottom:"14px" }}>
            <button className="mode-mob-btn"
              style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 14px", background:"#fff", border:"1.5px solid #E5E7EB", borderRadius:"10px", cursor:"pointer", fontFamily:"Inter,sans-serif", fontSize:".88rem", fontWeight:600, color:"#111827", transition:"all .15s" }}
              onClick={() => setShowM(v => !v)}>
              <span>{cur.i} {cur.l}</span>
              <span style={{ fontSize:".72rem", color:"#9CA3AF" }}>{showM ? "▲" : "▼"} change</span>
            </button>
            {showM && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"6px", marginTop:"8px", padding:"10px", background:"#fff", border:"1px solid #E5E7EB", borderRadius:"10px" }}>
                {MODES.map(m => (
                  <button key={m.v}
                    onClick={() => { setMode(m.v); resetAll(); setShowM(false) }}
                    style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", padding:"10px 6px", borderRadius:"8px", border:`1.5px solid ${mode===m.v?"#7C3AED":"#E5E7EB"}`, background:mode===m.v?"#EDE9FE":"#fff", cursor:"pointer", transition:"all .15s" }}>
                    <span style={{ fontSize:"18px" }}>{m.i}</span>
                    <span style={{ fontSize:".62rem", fontWeight:600, color:mode===m.v?"#5B21B6":"#6B7280", textAlign:"center", lineHeight:"1.2" }}>{m.l}</span>
                  </button>
                ))}
              </div>
            )}
            {/* Mobile tones */}
            <div style={{ display:"flex", gap:"6px", marginTop:"10px" }}>
              {TONES.map(t => (
                <button key={t.v}
                  className="tone-mob"
                  onClick={() => setTone(t.v)}
                  style={{ flex:1, padding:"8px 4px", borderRadius:"8px", border:`1.5px solid ${tone===t.v?"#7C3AED":"#E5E7EB"}`, background:tone===t.v?"#EDE9FE":"#fff", color:tone===t.v?"#5B21B6":"#6B7280", fontFamily:"Inter,sans-serif", fontSize:".75rem", fontWeight:600, cursor:"pointer", transition:"all .15s" }}>
                  {t.l}
                </button>
              ))}
            </div>
          </div>

          {/* Form heading */}
          <div style={{ marginBottom:"18px" }}>
            <h2 style={{ fontSize:"1.15rem", fontWeight:800, color:"#111827", letterSpacing:"-.02em" }}>{cur.l}</h2>
            <p style={{ fontSize:".78rem", color:"#6B7280", marginTop:"3px" }}>{cur.d} — fill in the details below</p>
          </div>

          {/* ── FORM FIELDS ── */}
          {mode === "hr_outreach" && <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Your Name</label><input className="ci" style={inp} name="name" value={form.name||""} placeholder="Your Name" onChange={fc}/></div>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Skills</label><input className="ci" style={inp} name="skills" value={form.skills||""} placeholder="Skills" onChange={fc}/></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Target Role</label><input className="ci" style={inp} name="role" value={form.role||""} placeholder="Looking For" onChange={fc}/></div>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Company</label><input className="ci" style={inp} name="company" value={form.company||""} placeholder="Name of the Company" onChange={fc}/></div>
            </div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Why This Company?</label><input className="ci" style={inp} name="reason" value={form.reason||""} placeholder="I admire their AI work..." onChange={fc}/></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>HR Email</label><input className="ci" style={inp} name="hrEmail" value={form.hrEmail||""} placeholder="hr@company.com" onChange={e=>{fc(e);setToEmail(e.target.value)}}/></div>
          </>}

          {mode === "client_approach" && <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Your Name</label><input className="ci" style={inp} name="name" value={form.name||""} placeholder="Your Name" onChange={fc}/></div>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Client Name</label><input className="ci" style={inp} name="clientName" value={form.clientName||""} placeholder="Client Name" onChange={fc}/></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Client Company</label><input className="ci" style={inp} name="clientCompany" value={form.clientCompany||""} placeholder="Client Company Name" onChange={fc}/></div>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Service</label><input className="ci" style={inp} name="service" value={form.service||""} placeholder="Your services" onChange={fc}/></div>
            </div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Why They Need It</label><input className="ci" style={inp} name="clientReason" value={form.clientReason||""} placeholder="Client Benefits..." onChange={fc}/></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Client Email</label><input className="ci" style={inp} name="hrEmail" value={form.hrEmail||""} placeholder="client@company.com" onChange={e=>{fc(e);setToEmail(e.target.value)}}/></div>
          </>}

          {mode === "reply_generator" && <>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Your Name</label><input className="ci" style={inp} name="name" value={form.name||""} placeholder="Your Name" onChange={fc}/></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Received Email</label><textarea className="ci" style={{...inp, height:"90px", resize:"none"}} name="receivedEmail" value={form.receivedEmail||""} placeholder="Paste the email you received..." onChange={fc}/></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Your Intent</label><input className="ci" style={inp} name="replyIntent" value={form.replyIntent||""} placeholder="Accept interview, ask for time..." onChange={fc}/></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Reply To Email</label><input className="ci" style={inp} name="hrEmail" value={form.hrEmail||""} placeholder="sender@company.com" onChange={e=>{fc(e);setToEmail(e.target.value)}}/></div>
          </>}

          {mode === "follow_up" && <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Your Name</label><input className="ci" style={inp} name="name" value={form.name||""} placeholder="Your Name" onChange={fc}/></div>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Company</label><input className="ci" style={inp} name="company" value={form.company||""} placeholder="Company Name" onChange={fc}/></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Role Applied</label><input className="ci" style={inp} name="role" value={form.role||""} placeholder="Role" onChange={fc}/></div>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Original Date</label><input className="ci" style={inp} name="originalEmailDate" value={form.originalEmailDate||""} placeholder="March 1, 2026" onChange={fc}/></div>
            </div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Why Following Up?</label><input className="ci" style={inp} name="followUpReason" value={form.followUpReason||""} placeholder="No response after 1 week..." onChange={fc}/></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>HR Email</label><input className="ci" style={inp} name="hrEmail" value={form.hrEmail||""} placeholder="hr@company.com" onChange={e=>{fc(e);setToEmail(e.target.value)}}/></div>
          </>}

          {mode === "linkedin" && <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Your Name</label><input className="ci" style={inp} name="name" value={form.name||""} placeholder="Your Name" onChange={fc}/></div>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Target Person</label><input className="ci" style={inp} name="targetPerson" value={form.targetPerson||""} placeholder="Person Name" onChange={fc}/></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Company</label><input className="ci" style={inp} name="company" value={form.company||""} placeholder="Infosys" onChange={fc}/></div>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Email</label><input className="ci" style={inp} name="hrEmail" value={form.hrEmail||""} placeholder="anita@infosys.com" onChange={e=>{fc(e);setToEmail(e.target.value)}}/></div>
            </div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Why Connect?</label><input className="ci" style={inp} name="reason" value={form.reason||""} placeholder="Admire your work..." onChange={fc}/></div>
          </>}

          {mode === "referral" && <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Your Name</label><input className="ci" style={inp} name="name" value={form.name||""} placeholder="Your Name" onChange={fc}/></div>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Employee Name</label><input className="ci" style={inp} name="referralPerson" value={form.referralPerson||""} placeholder="Nitisri" onChange={fc}/></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Company</label><input className="ci" style={inp} name="company" value={form.company||""} placeholder="TCS" onChange={fc}/></div>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Role You Want</label><input className="ci" style={inp} name="role" value={form.role||""} placeholder="Role" onChange={fc}/></div>
            </div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>How You Know Them</label><input className="ci" style={inp} name="howKnown" value={form.howKnown||""} placeholder="College alumni..." onChange={fc}/></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Email</label><input className="ci" style={inp} name="hrEmail" value={form.hrEmail||""} placeholder="ravi@tcs.com" onChange={e=>{fc(e);setToEmail(e.target.value)}}/></div>
          </>}

          {mode === "thank_you" && <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Your Name</label><input className="ci" style={inp} name="name" value={form.name||""} placeholder="Salman" onChange={fc}/></div>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Interviewer</label><input className="ci" style={inp} name="interviewer" value={form.interviewer||""} placeholder="Ms. LP" onChange={fc}/></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Company</label><input className="ci" style={inp} name="company" value={form.company||""} placeholder="Wipro" onChange={fc}/></div>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Role</label><input className="ci" style={inp} name="role" value={form.role||""} placeholder="Data Analyst" onChange={fc}/></div>
            </div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Key Interview Moment</label><input className="ci" style={inp} name="keyMoment" value={form.keyMoment||""} placeholder="Discussed data pipeline..." onChange={fc}/></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Interviewer Email</label><input className="ci" style={inp} name="hrEmail" value={form.hrEmail||""} placeholder="anita@wipro.com" onChange={e=>{fc(e);setToEmail(e.target.value)}}/></div>
          </>}

          {mode === "apology" && <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Your Name</label><input className="ci" style={inp} name="name" value={form.name||""} placeholder="Suhash" onChange={fc}/></div>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Apology To</label><input className="ci" style={inp} name="apologyTo" value={form.apologyTo||""} placeholder="Miss/Mr" onChange={fc}/></div>
            </div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Reason</label><input className="ci" style={inp} name="apologyReason" value={form.apologyReason||""} placeholder="Missed the deadline..." onChange={fc}/></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>How to Fix It</label><input className="ci" style={inp} name="apologyFix" value={form.apologyFix||""} placeholder="Submit by tomorrow..." onChange={fc}/></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Their Email</label><input className="ci" style={inp} name="hrEmail" value={form.hrEmail||""} placeholder="ravi@company.com" onChange={e=>{fc(e);setToEmail(e.target.value)}}/></div>
          </>}

          {mode === "cold_dm" && <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Your Name</label><input className="ci" style={inp} name="name" value={form.name||""} placeholder="Deepak Kumar" onChange={fc}/></div>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Target Person</label><input className="ci" style={inp} name="coldTarget" value={form.coldTarget||""} placeholder="Artist" onChange={fc}/></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Company</label><input className="ci" style={inp} name="company" value={form.company||""} placeholder="GenPandaz" onChange={fc}/></div>
              <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Email</label><input className="ci" style={inp} name="hrEmail" value={form.hrEmail||""} placeholder="john@techcorp.com" onChange={e=>{fc(e);setToEmail(e.target.value)}}/></div>
            </div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Your Offer</label><input className="ci" style={inp} name="coldOffer" value={form.coldOffer||""} placeholder="React dashboard in 2 weeks" onChange={fc}/></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"#6B7280", letterSpacing:".04em", textTransform:"uppercase", marginBottom:"5px" }}>Key Benefit</label><input className="ci" style={inp} name="coldBenefit" value={form.coldBenefit||""} placeholder="Save 10 hours/week..." onChange={fc}/></div>
          </>}

          {/* Resume upload */}
          {mode !== "reply_generator" && (
            <label className="up-hover"
              style={{ border:"2px dashed #E5E7EB", borderRadius:"10px", padding:"11px 13px", display:"flex", alignItems:"center", gap:"10px", cursor:"pointer", transition:"all .15s", background:"#fff", marginBottom:"13px" }}>
              <input type="file" accept=".pdf" onChange={handleResume} style={{ display:"none" }} />
              <div style={{ width:"32px", height:"32px", background:"#EDE9FE", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px", flexShrink:0, border:"1px solid #C4B5FD" }}>📎</div>
              <div>
                {resume
                  ? <><strong style={{ display:"block", fontSize:".84rem", fontWeight:600, color:"#5B21B6" }}>{resume.name}</strong><small style={{ fontSize:".68rem", color:"#9CA3AF" }}>Click to change</small></>
                  : <><strong style={{ display:"block", fontSize:".84rem", fontWeight:500, color:"#374151" }}>Attach Resume (PDF)</strong><small style={{ fontSize:".68rem", color:"#9CA3AF" }}>Optional</small></>
                }
              </div>
            </label>
          )}

          {/* Generate button */}
          <button
            style={{ width:"100%", background:"#7C3AED", color:"#fff", fontFamily:"Inter,sans-serif", fontSize:".9rem", fontWeight:700, border:"none", borderRadius:"10px", padding:"13px", cursor:loading?"not-allowed":"pointer", opacity:loading?.45:1, transition:"all .2s", position:"relative", overflow:"hidden" }}
            onClick={generate}
            disabled={loading}>
            {loading ? "Generating..." : "Generate Email with AI"}
          </button>
        </div>

        {/* ── OUTPUT PANEL ── */}
        <div className="cmp-out">

          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <div>
              <div style={{ fontSize:".85rem", fontWeight:700, color:"#111827" }}>Generated Email</div>
              <div style={{ fontSize:".72rem", color:"#9CA3AF", marginTop:"1px" }}>{wc > 0 ? `${wc} words` : "Fill the form and generate"}</div>
            </div>
            {email && (
              <div style={{ display:"flex", gap:"6px" }}>
                <button className="btn btn-s btn-sm" onClick={copy}>{copied ? "✓ Copied" : "Copy"}</button>
                <button className="btn btn-g btn-sm" onClick={resetAll}>Clear</button>
              </div>
            )}
          </div>

          {/* Sender picker */}
          <div style={{ background:"#F9FAFB", border:"1px solid #E5E7EB", borderRadius:"8px", padding:"11px 12px", flexShrink:0 }}>
            <div style={{ fontSize:".62rem", fontWeight:700, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:".08em", marginBottom:"7px" }}>Send From</div>
            <div style={{ display:"flex", gap:"5px" }}>
              {SENDERS.map(a => (
                <button key={a.id}
                  className="sender-opt"
                  onClick={() => setSender(a.id)}
                  style={{ flex:1, padding:"7px 5px", borderRadius:"8px", border:`1.5px solid ${sender===a.id?"#7C3AED":"#E5E7EB"}`, background:sender===a.id?"#EDE9FE":"#fff", color:sender===a.id?"#5B21B6":"#6B7280", fontFamily:"Inter,sans-serif", fontSize:".72rem", fontWeight:600, cursor:"pointer", transition:"all .15s" }}>
                  {a.l}
                </button>
              ))}
            </div>
          </div>

          {/* AI tools */}
          {email && !loading && (
            <div style={{ display:"flex", gap:"5px", flexShrink:0 }}>
              {[{id:"rewrite",l:"Rewrite"},{id:"shorten",l:"Shorten"},{id:"expand",l:"Expand"},{id:"grammar",l:"Fix Grammar"}].map(a => (
                <button key={a.id}
                  className={`ai-tool ${aiAct===a.id?"run":""}`}
                  onClick={() => runAction(a.id)}
                  disabled={!!aiAct}
                  style={{ flex:1, padding:"7px 5px", borderRadius:"8px", border:"1px solid #E5E7EB", background:"#fff", color:"#6B7280", fontFamily:"Inter,sans-serif", fontSize:".71rem", fontWeight:600, cursor:"pointer", transition:"all .15s", textAlign:"center" }}>
                  {aiAct === a.id ? "..." : a.l}
                </button>
              ))}
            </div>
          )}

          {/* Shimmer */}
          {loading && (
            <div style={{ flex:1 }}>
              {[80,60,90,50,70,85,55,75].map((w,i) => (
                <div key={i} className="shim" style={{ width:`${w}%`, height:"13px", marginBottom:"9px" }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!email && !loading && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"10px", textAlign:"center", minHeight:"200px" }}>
              <div style={{ fontSize:"52px", opacity:.15, animation:"bob 4s ease-in-out infinite" }}>🐼</div>
              <div style={{ fontSize:".88rem", fontWeight:700, color:"#9CA3AF" }}>Ready to write</div>
              <div style={{ fontSize:".78rem", color:"#D1D5DB", lineHeight:"1.6" }}>Fill the form and click<br /><strong style={{ color:"#7C3AED" }}>Generate Email with AI</strong></div>
            </div>
          )}

          {/* Email output */}
          {email && !loading && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"10px", animation:"fadeUp .25s ease both" }}>

              {/* Badges */}
              <div style={{ display:"flex", gap:"5px", flexWrap:"wrap", flexShrink:0 }}>
                <span className="bdg bdg-p">{cur.l}</span>
                <span className="bdg bdg-n" style={{ textTransform:"capitalize" }}>{tone}</span>
                {resume && <span className="bdg bdg-g">PDF attached</span>}
                {spam !== null && <span className={`bdg ${spam<=2?"bdg-g":spam<=3?"bdg-n":"bdg-r"}`}>Spam: {spam<=2?"Low":spam<=3?"Med":"High"}</span>}
              </div>

              {/* ── SUBJECT FIELD (separate, editable) ── */}
              <div style={{ flexShrink:0 }}>
                <label style={{ display:"block", fontSize:".68rem", fontWeight:700, color:"#7C3AED", letterSpacing:".06em", textTransform:"uppercase", marginBottom:"5px" }}>
                  Subject Line
                </label>
                <input
                  className="ci"
                  style={{ ...inp, background:"#F5F3FF", border:"1.5px solid #C4B5FD", fontWeight:600 }}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Auto-generated subject — edit if needed"
                />
              </div>

              {/* Email body textarea */}
              <textarea
                style={{ flex:1, minHeight:"150px", background:"#F9FAFB", border:"1.5px solid #E5E7EB", borderRadius:"10px", padding:"13px", color:"#111827", fontFamily:"Inter,sans-serif", fontSize:".875rem", lineHeight:"1.85", resize:"none", outline:"none", transition:"border-color .15s, box-shadow .15s" }}
                onFocus={e => { e.target.style.borderColor="#7C3AED"; e.target.style.boxShadow="0 0 0 3px rgba(124,58,237,.1)" }}
                onBlur={e  => { e.target.style.borderColor="#E5E7EB"; e.target.style.boxShadow="none" }}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <div style={{ display:"flex", justifyContent:"space-between", flexShrink:0 }}>
                <span style={{ fontSize:".68rem", color:"#9CA3AF" }}>{wc} words</span>
                <span style={{ fontSize:".68rem", color:"#9CA3AF" }}>Edit before sending</span>
              </div>

              {/* CC/BCC */}
              <div style={{ flexShrink:0 }}>
                <button
                  style={{ display:"flex", alignItems:"center", gap:"6px", background:"transparent", border:"none", cursor:"pointer", fontSize:".7rem", fontWeight:700, color:"#9CA3AF", letterSpacing:".05em", textTransform:"uppercase", padding:0, transition:"color .15s" }}
                  onMouseOver={e => (e.currentTarget.style.color="#7C3AED")}
                  onMouseOut={e  => (e.currentTarget.style.color="#9CA3AF")}
                  onClick={() => setShowCC(v => !v)}>
                  <span style={{ fontSize:"9px", transform:showCC?"rotate(90deg)":"none", transition:"transform .15s" }}>▶</span>
                  CC / BCC
                  {(cc||bcc) && <span style={{ color:"#5B21B6", fontWeight:700 }}>({[cc&&"CC",bcc&&"BCC"].filter(Boolean).join(",")})</span>}
                </button>
                {showCC && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"7px", marginTop:"8px" }}>
                    {[{tag:"CC",val:cc,set:setCc},{tag:"BCC",val:bcc,set:setBcc}].map(x => (
                      <div key={x.tag} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                        <span style={{ fontSize:".62rem", fontWeight:700, color:"#7C3AED", width:"28px", flexShrink:0 }}>{x.tag}</span>
                        <input className="ci" style={inp} placeholder={`${x.tag.toLowerCase()}@example.com`} value={x.val} onChange={e => x.set(e.target.value)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* To + Send */}
              {!sent ? (
                <div style={{ display:"flex", gap:"8px", flexShrink:0 }}>
                  <input
                    className="ci"
                    style={inp}
                    placeholder="To: recipient@email.com"
                    value={toEmail}
                    onChange={e => setToEmail(e.target.value)}
                  />
                  <button
                    style={{ flexShrink:0, background:"#7C3AED", color:"#fff", fontFamily:"Inter,sans-serif", fontSize:".85rem", fontWeight:700, border:"none", borderRadius:"8px", padding:"10px 18px", cursor:sending?"not-allowed":"pointer", opacity:sending?.5:1, transition:"all .18s", whiteSpace:"nowrap" }}
                    onMouseOver={e => { if(!sending)(e.currentTarget.style.background="#6D28D9") }}
                    onMouseOut={e  => { e.currentTarget.style.background="#7C3AED" }}
                    onClick={send}
                    disabled={sending}>
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              ) : (
                <div style={{ background:"#ECFDF5", border:"1px solid #A7F3D0", borderRadius:"8px", padding:"12px 14px", fontSize:".85rem", fontWeight:600, color:"#059669", flexShrink:0, animation:"fadeUp .25s ease" }}>
                  ✓ Email sent to <strong>{toEmail}</strong>{cc && <> · CC: <strong>{cc}</strong></>}
                  <div style={{ marginTop:"8px" }}>
                    <button style={{ background:"#7C3AED", color:"#fff", border:"none", borderRadius:"6px", padding:"7px 14px", fontSize:".78rem", fontWeight:700, cursor:"pointer" }} onClick={resetAll}>
                      Write Another Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}