import Link from "next/link"

export default function HomePage() {
  return (
    <>
      <style>{`
        body{background:#F8F9FC}
        .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;background:radial-gradient(ellipse at 50% -20%,rgba(124,58,237,.12) 0%,transparent 65%)}
        .logo-r{display:flex;align-items:center;gap:12px;margin-bottom:44px;justify-content:center}
        .lm{width:46px;height:46px;background:#7C3AED;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 6px 24px rgba(124,58,237,.45)}
        .ln{font-family:'Inter',sans-serif;font-size:1.5rem;font-weight:800;color:#111827;letter-spacing:-.02em}
        .ln span{color:#7C3AED}
        .hb{display:inline-flex;align-items:center;gap:6px;background:#EDE9FE;border:1px solid #C4B5FD;border-radius:20px;padding:5px 14px;font-size:.78rem;font-weight:600;color:#5B21B6;margin-bottom:24px}
        h1{font-family:'Inter',sans-serif;font-size:clamp(2rem,5vw,3.2rem);font-weight:800;color:#111827;line-height:1.15;margin-bottom:18px;max-width:640px;letter-spacing:-.03em}
        h1 span{color:#7C3AED}
        .hs{font-size:clamp(.95rem,2vw,1.05rem);color:#6B7280;max-width:480px;line-height:1.7;margin-bottom:36px}
        .cta-r{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
        .cta-a{display:inline-flex;align-items:center;gap:7px;background:#7C3AED;color:#fff;font-family:'Inter',sans-serif;font-size:.95rem;font-weight:700;border-radius:10px;padding:13px 28px;text-decoration:none;transition:all .2s}
        .cta-a:hover{background:#6D28D9;box-shadow:0 6px 20px rgba(124,58,237,.4);transform:translateY(-2px)}
        .cta-b{display:inline-flex;align-items:center;gap:7px;background:#fff;color:#374151;font-family:'Inter',sans-serif;font-size:.95rem;font-weight:600;border-radius:10px;padding:13px 28px;text-decoration:none;border:1.5px solid #E5E7EB;transition:all .2s}
        .cta-b:hover{border-color:#C4B5FD;color:#5B21B6}
        .feats{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;max-width:780px;width:100%;margin-top:64px}
        .feat{background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:18px;text-align:left;box-shadow:0 1px 2px rgba(0,0,0,.05)}
        .fi{font-size:22px;margin-bottom:9px}
        .ft{font-size:.88rem;font-weight:700;color:#111827;margin-bottom:4px}
        .fd{font-size:.75rem;color:#6B7280;line-height:1.5}
        .foot{margin-top:50px;font-size:.75rem;color:#9CA3AF}
        @media(max-width:480px){.feats{grid-template-columns:1fr 1fr}}
      `}</style>
      <div className="hero">
        <div className="logo-r">
          <div className="lm">🐼</div>
          <div className="ln">GenpandaZ <span>MailPro </span></div>
        </div>
        <div className="hb">✨ GenpandaZ Internal Tool · Free · No limits</div>
        <h1>Write perfect outreach emails<br />with <span>AI assistance</span></h1>
        <p className="hs">Generate professional cold emails for jobs, clients, referrals and more. Sign in with your Google account and start writing instantly.</p>
        <div className="cta-r">
          <Link href="/sign-up" className="cta-a">Get started →</Link>
          <Link href="/sign-in" className="cta-b">Sign in</Link>
        </div>
        <div className="feats">
          {[
            {i:"📧",t:"9 Email Modes",d:"HR outreach, client pitch, follow-up, LinkedIn, referral and more"},
            {i:"🤖",t:"Groq AI",d:"LLaMA 3.3-70b for fast, natural email generation"},
            {i:"🎨",t:"4 Tones",d:"Formal, friendly, bold or concise to match your style"},
            {i:"📎",t:"Resume Attach",d:"Attach your PDF resume to any outreach email"},
            {i:"👥",t:"Contacts",d:"Save contacts and import CSV files in bulk"},
            {i:"📊",t:"Analytics",d:"Track every email you send with full history"},
          ].map((f,i) => (
            <div key={i} className="feat">
              <div className="fi">{f.i}</div>
              <div className="ft">{f.t}</div>
              <div className="fd">{f.d}</div>
            </div>
          ))}
        </div>
        <div className="foot">Free · No credit card · No daily limits · GenPandaZ team only</div>
      </div>
    </>
  )
}