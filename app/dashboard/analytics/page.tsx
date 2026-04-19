"use client"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { supabase } from "@/lib/supabase"

type Log = { id:string;to_email:string;mode:string;subject:string|null;status:string;sent_at:string }
const ML:Record<string,string> = {hr_outreach:"HR Outreach",client_approach:"Client Pitch",reply_generator:"Reply",follow_up:"Follow Up",linkedin:"LinkedIn",referral:"Referral",thank_you:"Thank You",apology:"Apology",cold_dm:"Cold Pitch"}

export default function AnalyticsPage() {
  const { user, isLoaded } = useUser()
  const [logs, setLogs]   = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => { if(isLoaded&&user) load() }, [isLoaded,user])

  const load = async () => {
    setLoading(true); setError("")
    const { data, error:e } = await supabase.from("email_logs").select("*").eq("user_id",user!.id).order("sent_at",{ascending:false}).limit(500)
    if(e) { setError(e.message); setLoading(false); return }
    setLogs(data||[]); setLoading(false)
  }

  const total   = logs.length
  const success = logs.filter(l=>l.status==="sent").length
  const failed  = logs.filter(l=>l.status==="failed").length
  const today   = logs.filter(l=>l.sent_at?.startsWith(new Date().toISOString().split("T")[0])).length

  const byMode: Record<string,number> = {}
  logs.forEach(l=>{byMode[l.mode]=(byMode[l.mode]||0)+1})
  const topM = Object.entries(byMode).sort((a,b)=>b[1]-a[1]).slice(0,5)

  const last7:{key:string;label:string;count:number}[] = []
  for(let i=6;i>=0;i--) {
    const d=new Date(); d.setDate(d.getDate()-i)
    const key=d.toISOString().split("T")[0]
    last7.push({key,label:d.toLocaleDateString("en",{weekday:"short"}),count:logs.filter(l=>l.sent_at?.startsWith(key)).length})
  }
  const maxD = Math.max(...last7.map(d=>d.count),1)

  const byDomain:Record<string,number>={}
  logs.forEach(l=>{const d=l.to_email?.split("@")[1]||"unknown";byDomain[d]=(byDomain[d]||0)+1})
  const topD = Object.entries(byDomain).sort((a,b)=>b[1]-a[1]).slice(0,5)

  if(!isLoaded||loading) return (
    <div className="pg">
      <div className="pg-hd"><div className="pg-t">Analytics</div><div className="pg-s">Your personal email performance</div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginBottom:"20px"}}>
        {[1,2,3,4].map(i=><div key={i} className="shim" style={{height:"90px",borderRadius:"var(--rl)"}}/>)}
      </div>
      <div className="shim" style={{height:"300px",borderRadius:"var(--rl)"}}/>
    </div>
  )

  return (
    <div className="pg">
      <div className="pg-hd" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div className="pg-t">Analytics</div><div className="pg-s">Only your own data — nobody else can see this</div></div>
        <button className="btn btn-s btn-sm" onClick={load}>↻ Refresh</button>
      </div>
      {error&&<div className="al al-err" style={{marginBottom:"16px"}}>{error}</div>}

      <div className="sc-grid">
        {[{l:"Total Sent",v:total,n:"all time",hi:true},{l:"Sent Today",v:today,n:new Date().toLocaleDateString("en",{month:"short",day:"numeric"})},{l:"Successful",v:success,n:`${total>0?Math.round(success/total*100):0}% rate`},{l:"Failed",v:failed,n:failed>0?"check Gmail settings":"all clear"}].map((s,i)=>(
          <div key={i} className={`sc ${s.hi?"hi":""}`}><div className="sc-l">{s.l}</div><div className="sc-v">{s.v}</div><div className="sc-n">{s.n}</div></div>
        ))}
      </div>

      {total===0?(
        <div className="card" style={{padding:"60px 20px",textAlign:"center"}}>
          <div style={{fontSize:"48px",opacity:.2,marginBottom:"12px"}}>📊</div>
          <div style={{fontSize:".95rem",fontWeight:700,color:"var(--t3)",marginBottom:"6px"}}>No emails sent yet</div>
          <div style={{fontSize:".82rem",color:"var(--t4)"}}>Send your first email from Compose and it will appear here.</div>
        </div>
      ):(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"13px",marginBottom:"18px"}}>
            <div className="card" style={{padding:"18px"}}>
              <div className="sl">Last 7 Days</div>
              <div className="dc">
                {last7.map(d=>(
                  <div key={d.key} className="dc-col">
                    <span className="dc-v">{d.count>0?d.count:""}</span>
                    <div className="dc-bw"><div className="dc-b" style={{height:`${(d.count/maxD)*100}%`}}/></div>
                    <span className="dc-l">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{padding:"18px"}}>
              <div className="sl">Top Email Modes</div>
              {topM.length===0?<div style={{fontSize:".8rem",color:"var(--t4)"}}>No data yet</div>:topM.map(([m,c])=>(
                <div key={m} className="br-row"><span className="br-l">{ML[m]||m}</span><div className="br-t"><div className="br-f" style={{width:`${(c/topM[0][1])*100}%`}}/></div><span className="br-v">{c}</span></div>
              ))}
            </div>
            <div className="card" style={{padding:"18px"}}>
              <div className="sl">Top Domains</div>
              {topD.length===0?<div style={{fontSize:".8rem",color:"var(--t4)"}}>No data yet</div>:topD.map(([d,c])=>(
                <div key={d} className="br-row"><span className="br-l">{d}</span><div className="br-t"><div className="br-f" style={{width:`${(c/topD[0][1])*100}%`}}/></div><span className="br-v">{c}</span></div>
              ))}
            </div>
          </div>

          <div className="tw">
            <div className="tw-h"><span className="tw-ht">Email Log ({logs.length})</span></div>
            <div style={{overflowX:"auto"}}>
              <table>
                <thead><tr><th>Recipient</th><th>Mode</th><th className="d-only">Subject</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {logs.slice(0,100).map(l=>(
                    <tr key={l.id}>
                      <td style={{color:"var(--t2)"}}>{l.to_email}</td>
                      <td><span className="bdg bdg-p">{ML[l.mode]||l.mode}</span></td>
                      <td className="d-only" style={{color:"var(--t3)",maxWidth:"200px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.subject||"—"}</td>
                      <td><span className={`bdg ${l.status==="sent"?"bdg-g":"bdg-r"}`}>{l.status}</span></td>
                      <td style={{color:"var(--t4)",fontSize:".78rem",whiteSpace:"nowrap"}}>{new Date(l.sent_at).toLocaleDateString("en",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}