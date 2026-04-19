"use client"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { supabase } from "@/lib/supabase"

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const [g1,setG1]=useState(""); const [g2,setG2]=useState(""); const [g3,setG3]=useState("")
  const [saving,setSaving]=useState(false)
  const [msg,setMsg]=useState<{t:string;ok:boolean}|null>(null)

  useEffect(()=>{if(isLoaded&&user)load()},[isLoaded,user])

  const load = async ()=>{
    const {data}=await supabase.from("profiles").select("gmail_user,gmail_user_2,gmail_user_3").eq("id",user!.id).single()
    if(data){setG1(data.gmail_user||"");setG2(data.gmail_user_2||"");setG3(data.gmail_user_3||"")}
  }
  const flash=(t:string,ok=true)=>{setMsg({t,ok});setTimeout(()=>setMsg(null),3500)}

  const save = async ()=>{
    setSaving(true)
    const {error}=await supabase.from("profiles").upsert({id:user!.id,email:user!.emailAddresses[0]?.emailAddress,gmail_user:g1||null,gmail_user_2:g2||null,gmail_user_3:g3||null})
    setSaving(false)
    if(error) flash(error.message,false); else flash("Saved!")
  }

  if(!isLoaded) return <div className="pg"><div className="shim" style={{height:"400px",borderRadius:"var(--rl)"}}/></div>

  const init=(user?.firstName?.[0]??user?.emailAddresses?.[0]?.emailAddress?.[0]??"U").toUpperCase()
  const name=user?.firstName?`${user.firstName} ${user.lastName||""}`.trim():user?.emailAddresses?.[0]?.emailAddress?.split("@")[0]??"User"

  return (
    <div className="pg" style={{maxWidth:"640px"}}>
      <div className="pg-hd"><div className="pg-t">Settings</div><div className="pg-s">Your account and Gmail configuration</div></div>
      {msg&&<div className={`al ${msg.ok?"al-ok":"al-err"} au`} style={{marginBottom:"14px"}}>{msg.t}</div>}

      <div className="card" style={{padding:"20px",marginBottom:"14px"}}>
        <div style={{fontSize:".85rem",fontWeight:700,color:"var(--t1)",marginBottom:"16px"}}>Account</div>
        <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"16px"}}>
          <div style={{width:"50px",height:"50px",borderRadius:"50%",background:"var(--p)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",fontWeight:800,color:"#fff",flexShrink:0}}>
            {user?.imageUrl?<img src={user.imageUrl} alt="" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}/>:init}
          </div>
          <div>
            <div style={{fontSize:".92rem",fontWeight:700,color:"var(--t1)"}}>{name}</div>
            <div style={{fontSize:".8rem",color:"var(--t3)",marginTop:"2px"}}>{user?.emailAddresses?.[0]?.emailAddress}</div>
            <span className="bdg bdg-p" style={{marginTop:"6px"}}>GenPandaZ Member</span>
          </div>
        </div>
        <div style={{fontSize:".78rem",color:"var(--t3)",lineHeight:"1.6",background:"var(--s2)",padding:"10px 12px",borderRadius:"var(--r)"}}>
          To update your name, photo or password — click your profile avatar in the top right corner. Clerk manages authentication securely.
        </div>
      </div>

      <div className="card" style={{padding:"20px",marginBottom:"14px"}}>
        <div style={{fontSize:".85rem",fontWeight:700,color:"var(--t1)",marginBottom:"4px"}}>Sender Gmail Accounts</div>
        <div style={{fontSize:".78rem",color:"var(--t3)",marginBottom:"16px",lineHeight:"1.6"}}>These labels show which Gmail slot matches which account in the Compose screen. The actual sending uses the Gmail App Passwords set in your Vercel environment variables.</div>
        {[{l:"Primary Gmail",hint:"→ GMAIL_USER in Vercel",val:g1,set:setG1},{l:"Secondary Gmail",hint:"→ GMAIL_USER_2 in Vercel",val:g2,set:setG2},{l:"Work Gmail",hint:"→ GMAIL_USER_3 in Vercel",val:g3,set:setG3}].map((g,i)=>(
          <div key={i} className="fld" style={{marginBottom:"13px"}}>
            <label className="lbl">{g.l}</label>
            <input className="inp" placeholder="yourname@gmail.com" value={g.val} onChange={e=>g.set(e.target.value)}/>
            <div style={{fontSize:".67rem",color:"var(--t4)",marginTop:"3px"}}>{g.hint}</div>
          </div>
        ))}
        <button className="btn btn-p btn-sm" onClick={save} disabled={saving}>{saving?"Saving...":"Save Gmail Accounts"}</button>
      </div>

      <div className="al al-info" style={{fontSize:".78rem",lineHeight:"1.7"}}>
        <strong>App Password setup:</strong> For each Gmail, go to Google Account → Security → 2-Step Verification → App Passwords → generate one → add to Vercel env:<br/>
        <code style={{display:"block",marginTop:"6px",background:"rgba(124,58,237,.08)",padding:"7px 10px",borderRadius:"5px",fontSize:".74rem",lineHeight:"1.8"}}>
          GMAIL_USER=primary@gmail.com<br/>GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx<br/>GMAIL_USER_2=other@gmail.com<br/>GMAIL_APP_PASSWORD_2=xxxx xxxx xxxx xxxx
        </code>
      </div>
    </div>
  )
}