"use client"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { supabase } from "@/lib/supabase"

type EmailLog = {
  id: string
  to_email: string
  mode: string
  subject: string | null
  status: string
  sent_at: string
}

const ML: Record<string, string> = {
  hr_outreach:     "HR Outreach",
  client_approach: "Client Pitch",
  reply_generator: "Reply",
  follow_up:       "Follow Up",
  linkedin:        "LinkedIn",
  referral:        "Referral",
  thank_you:       "Thank You",
  apology:         "Apology",
  cold_dm:         "Cold Pitch",
}

export default function CampaignsPage() {
  const { user, isLoaded } = useUser()
  const [logs,    setLogs]    = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [active,  setActive]  = useState<string | null>(null)

  useEffect(() => { if (isLoaded && user) load() }, [isLoaded, user])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("email_logs")
      .select("*")
      .eq("user_id", user!.id)
      .order("sent_at", { ascending: false })
    setLogs(data || [])
    setLoading(false)
  }

  // Group logs by mode — each mode = one campaign card
  const campaigns = Object.entries(
    logs.reduce((acc, log) => {
      if (!acc[log.mode]) acc[log.mode] = []
      acc[log.mode].push(log)
      return acc
    }, {} as Record<string, EmailLog[]>)
  ).map(([mode, items]) => ({
    mode,
    label:    ML[mode] || mode,
    total:    items.length,
    success:  items.filter(i => i.status === "sent").length,
    failed:   items.filter(i => i.status === "failed").length,
    lastSent: items[0]?.sent_at,
    items,
  })).sort((a, b) => b.total - a.total)

  if (!isLoaded || loading) return (
    <div className="pg">
      <div className="pg-hd">
        <div className="pg-t">Campaigns</div>
        <div className="pg-s">Your email activity grouped by type</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"13px" }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="shim" style={{ height:"140px", borderRadius:"var(--rl)" }} />
        ))}
      </div>
    </div>
  )

  return (
    <div className="pg">
      <div className="pg-hd" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div className="pg-t">Campaigns</div>
          <div className="pg-s">Your email activity grouped by type — click any card to expand</div>
        </div>
        <button className="btn btn-s btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      {campaigns.length === 0 ? (
        <div className="card" style={{ padding:"60px 20px", textAlign:"center" }}>
          <div style={{ fontSize:"48px", opacity:.2, marginBottom:"12px" }}>📊</div>
          <div style={{ fontSize:".95rem", fontWeight:700, color:"var(--t3)", marginBottom:"6px" }}>
            No campaigns yet
          </div>
          <div style={{ fontSize:".82rem", color:"var(--t4)" }}>
            Send your first email from the Compose tab and it will appear here.
          </div>
        </div>
      ) : (
        <>
          {/* CAMPAIGN CARDS */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"13px", marginBottom:"20px" }}>
            {campaigns.map(c => (
              <div
                key={c.mode}
                onClick={() => setActive(active === c.mode ? null : c.mode)}
                style={{
                  background: "var(--s)",
                  border: `1px solid ${active === c.mode ? "var(--p)" : "var(--bd)"}`,
                  borderRadius: "var(--rl)",
                  padding: "18px",
                  cursor: "pointer",
                  transition: "all .15s",
                  boxShadow: active === c.mode ? "0 0 0 3px var(--p-b)" : "var(--xs)",
                }}
              >
                {/* Header */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
                  <div style={{ fontSize:".92rem", fontWeight:700, color:"var(--t1)" }}>{c.label}</div>
                  <div style={{ fontSize:".72rem", color:"var(--t4)" }}>
                    {c.lastSent
                      ? new Date(c.lastSent).toLocaleDateString("en", { month:"short", day:"numeric" })
                      : ""}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display:"flex", gap:"10px", marginBottom:"12px" }}>
                  {[
                    { n: c.total,   l: "Sent"    },
                    { n: c.success, l: "Success" },
                    { n: c.failed,  l: "Failed"  },
                    { n: c.total > 0 ? Math.round((c.success / c.total) * 100) + "%" : "0%", l: "Rate" },
                  ].map((s, i) => (
                    <div key={i} style={{ flex:1, background:"var(--s2)", borderRadius:"var(--r)", padding:"8px 6px", textAlign:"center" }}>
                      <div style={{ fontFamily:"Inter,sans-serif", fontSize:"1.1rem", fontWeight:800, color:"var(--p-t)", letterSpacing:"-.02em" }}>{s.n}</div>
                      <div style={{ fontSize:".6rem", fontWeight:700, color:"var(--t4)", textTransform:"uppercase", letterSpacing:".06em", marginTop:"2px" }}>{s.l}</div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div style={{ width:"100%", height:"5px", background:"var(--s2)", borderRadius:"4px", overflow:"hidden" }}>
                  <div style={{ height:"100%", background:"var(--p)", borderRadius:"4px", width:`${c.total > 0 ? (c.success / c.total) * 100 : 0}%`, transition:"width .5s ease" }} />
                </div>

                <div style={{ fontSize:".7rem", color:"var(--t4)", marginTop:"8px" }}>
                  {active === c.mode ? "▲ Click to collapse" : "▼ Click to see all recipients"}
                </div>
              </div>
            ))}
          </div>

          {/* DETAIL TABLE */}
          {active && (() => {
            const camp = campaigns.find(c => c.mode === active)
            if (!camp) return null
            return (
              <div className="tw au">
                <div className="tw-h">
                  <span className="tw-ht">{camp.label} — All Recipients ({camp.items.length})</span>
                  <button className="btn btn-g btn-sm" onClick={() => setActive(null)}>Close ✕</button>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Recipient</th>
                        <th className="d-only">Subject</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {camp.items.map(log => (
                        <tr key={log.id}>
                          <td style={{ color:"var(--t2)" }}>{log.to_email}</td>
                          <td className="d-only" style={{ color:"var(--t3)", maxWidth:"220px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {log.subject || "—"}
                          </td>
                          <td>
                            <span className={`bdg ${log.status === "sent" ? "bdg-g" : "bdg-r"}`}>
                              {log.status}
                            </span>
                          </td>
                          <td style={{ color:"var(--t4)", fontSize:".78rem", whiteSpace:"nowrap" }}>
                            {new Date(log.sent_at).toLocaleDateString("en", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}