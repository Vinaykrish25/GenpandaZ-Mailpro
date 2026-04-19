"use client"
import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { supabase } from "@/lib/supabase"

type Contact = {id:string;name:string;email:string;company:string|null;position:string|null;tag:string;created_at:string}
const TAGS = ["General","Job Seeker","Freelance","Client","Referral"]

export default function ContactsPage() {
  const { user, isLoaded } = useUser()
  const csvRef = useRef<HTMLInputElement>(null)
  const [contacts, setContacts]   = useState<Contact[]>([])
  const [loading,  setLoading]    = useState(true)
  const [search,   setSearch]     = useState("")
  const [ftag,     setFtag]       = useState("All")
  const [showForm, setShowForm]   = useState(false)
  const [editC,    setEditC]      = useState<Contact|null>(null)
  const [saving,   setSaving]     = useState(false)
  const [msg,      setMsg]        = useState<{t:string;ok:boolean}|null>(null)
  const [delTarget,setDelTarget]  = useState<Contact|null>(null)
  const [csvPrev,  setCsvPrev]    = useState<any[]>([])
  const [showCsv,  setShowCsv]    = useState(false)
  const [importing,setImporting]  = useState(false)
  const [form,     setForm]       = useState({name:"",email:"",company:"",position:"",tag:"General"})

  useEffect(()=>{ if(isLoaded&&user) load() },[isLoaded,user])

  const load = async () => {
    setLoading(true)
    const {data}=await supabase.from("contacts").select("*").eq("user_id",user!.id).order("created_at",{ascending:false})
    setContacts(data||[]); setLoading(false)
  }

  const flash = (t:string,ok=true)=>{ setMsg({t,ok}); setTimeout(()=>setMsg(null),3000) }
  const reset = ()=>{ setShowForm(false);setEditC(null);setForm({name:"",email:"",company:"",position:"",tag:"General"}) }

  const save = async () => {
    if(!form.name.trim()||!form.email.trim()){flash("Name and email required",false);return}
    setSaving(true)
    if(editC){
      const {error}=await supabase.from("contacts").update({name:form.name,email:form.email,company:form.company||null,position:form.position||null,tag:form.tag}).eq("id",editC.id)
      if(error) flash(error.message,false); else {flash("Contact updated");reset();load()}
    } else {
      if(contacts.find(c=>c.email.toLowerCase()===form.email.toLowerCase())){flash("Email already exists",false);setSaving(false);return}
      const {error}=await supabase.from("contacts").insert({user_id:user!.id,name:form.name,email:form.email,company:form.company||null,position:form.position||null,tag:form.tag})
      if(error) flash(error.message,false); else {flash("Contact added");reset();load()}
    }
    setSaving(false)
  }

  const del = async () => {
    if(!delTarget)return
    const {error}=await supabase.from("contacts").delete().eq("id",delTarget.id)
    if(error) flash(error.message,false); else {flash("Deleted");setDelTarget(null);load()}
  }

  const startEdit = (c:Contact)=>{ setEditC(c);setForm({name:c.name,email:c.email,company:c.company||"",position:c.position||"",tag:c.tag});setShowForm(true) }

  const handleCsv = (e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file)return
    const r=new FileReader()
    r.onload=ev=>{
      const text=ev.target?.result as string
      const lines=text.trim().split("\n").filter(Boolean)
      if(lines.length<2){flash("CSV needs header + data rows",false);return}
      const headers=lines[0].split(",").map(h=>h.trim().toLowerCase().replace(/['"]/g,""))
      const get=(row:string[],keys:string[])=>{for(const k of keys){const i=headers.indexOf(k);if(i!==-1)return row[i]?.trim().replace(/['"]/g,"")||""}return""}
      const parsed:any[]=[]
      for(let i=1;i<lines.length;i++){
        const cols=lines[i].split(",")
        const email=get(cols,["email","email address","e-mail"])
        if(!email||!email.includes("@"))continue
        parsed.push({name:get(cols,["name","full name","fullname","first name"])||email.split("@")[0],email,company:get(cols,["company","organization","org"])||null,position:get(cols,["position","title","role","job title"])||null,tag:get(cols,["tag","segment","type"])||"General"})
      }
      if(parsed.length===0){flash("No valid emails found",false);return}
      setCsvPrev(parsed);setShowCsv(true)
      if(csvRef.current)csvRef.current.value=""
    }
    r.readAsText(file)
  }

  const importCsv = async ()=>{
    setImporting(true)
    const ex=new Set(contacts.map(c=>c.email.toLowerCase()))
    const ins=csvPrev.filter(c=>!ex.has(c.email.toLowerCase())).map(c=>({...c,user_id:user!.id}))
    const sk=csvPrev.length-ins.length
    if(ins.length>0){const {error}=await supabase.from("contacts").insert(ins);if(error){flash(error.message,false);setImporting(false);return}}
    setImporting(false);setShowCsv(false);setCsvPrev([])
    flash(`Imported ${ins.length}${sk>0?` · ${sk} skipped`:""}`)
    load()
  }

  const filtered=contacts.filter(c=>{
    const q=search.toLowerCase()
    return(!search||c.name.toLowerCase().includes(q)||c.email.toLowerCase().includes(q)||(c.company||"").toLowerCase().includes(q))&&(ftag==="All"||c.tag===ftag)
  })

  if(!isLoaded) return <div className="pg"><div className="shim" style={{height:"400px",borderRadius:"var(--rl)"}}/></div>

  return (
    <div className="pg">
      <div className="pg-hd"><div className="pg-t">Contacts</div><div className="pg-s">Your personal contact list — only you can see this</div></div>
      {msg&&<div className={`al ${msg.ok?"al-ok":"al-err"} au`} style={{marginBottom:"14px"}}>{msg.t}</div>}

      <div style={{display:"flex",gap:"10px",marginBottom:"14px",flexWrap:"wrap",alignItems:"center"}}>
        <input className="inp" style={{flex:1,minWidth:"180px"}} placeholder="Search name, email, company..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className="inp" style={{width:"auto"}} value={ftag} onChange={e=>setFtag(e.target.value)}><option value="All">All Tags</option>{TAGS.map(t=><option key={t}>{t}</option>)}</select>
        <label className="btn btn-s" style={{cursor:"pointer"}}><input ref={csvRef} type="file" accept=".csv" style={{display:"none"}} onChange={handleCsv}/>📂 CSV</label>
        <button className="btn btn-p" onClick={()=>{reset();setShowForm(true)}}>+ Add</button>
      </div>

      <div style={{display:"flex",gap:"6px",marginBottom:"14px",flexWrap:"wrap"}}>
        <span className="bdg bdg-n">Total: {contacts.length}</span>
        {TAGS.map(t=>{const n=contacts.filter(c=>c.tag===t).length;return n>0?<span key={t} className="bdg bdg-p">{t}: {n}</span>:null})}
      </div>

      {showForm&&(
        <div className="card au" style={{padding:"20px",marginBottom:"14px",borderColor:"var(--p-m)",borderWidth:"1.5px"}}>
          <div style={{fontSize:".85rem",fontWeight:700,color:"var(--t1)",marginBottom:"14px"}}>{editC?"Edit Contact":"Add Contact"}</div>
          <div className="r2"><div className="fld"><label className="lbl">Full Name *</label><input className="inp" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Anita Sharma"/></div><div className="fld"><label className="lbl">Email *</label><input className="inp" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="anita@company.com"/></div></div>
          <div className="r2"><div className="fld"><label className="lbl">Company</label><input className="inp" value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} placeholder="Infosys"/></div><div className="fld"><label className="lbl">Position</label><input className="inp" value={form.position} onChange={e=>setForm(f=>({...f,position:e.target.value}))} placeholder="HR Manager"/></div></div>
          <div className="fld" style={{maxWidth:"200px",marginBottom:"14px"}}><label className="lbl">Tag</label><select className="inp" value={form.tag} onChange={e=>setForm(f=>({...f,tag:e.target.value}))}>{TAGS.map(t=><option key={t}>{t}</option>)}</select></div>
          <div style={{display:"flex",gap:"8px"}}><button className="btn btn-p btn-sm" onClick={save} disabled={saving}>{saving?"Saving...":editC?"Update":"Save"}</button><button className="btn btn-g btn-sm" onClick={reset}>Cancel</button></div>
        </div>
      )}

      {loading?<div className="shim" style={{height:"300px",borderRadius:"var(--rl)"}}/>:filtered.length===0?(
        <div className="card" style={{padding:"60px 20px",textAlign:"center"}}>
          <div style={{fontSize:"40px",opacity:.2,marginBottom:"10px"}}>👥</div>
          <div style={{fontSize:".9rem",fontWeight:600,color:"var(--t3)",marginBottom:"6px"}}>{contacts.length===0?"No contacts yet":"No matches"}</div>
          <div style={{fontSize:".8rem",color:"var(--t4)"}}>{contacts.length===0 ? 'Click "+ Add" or import a CSV to get started.' : "Try a different search."}</div>
        </div>
      ):(
        <div className="tw">
          <div className="tw-h"><span className="tw-ht">Contacts ({filtered.length})</span></div>
          <div style={{overflowX:"auto"}}>
            <table>
              <thead><tr><th>Name</th><th>Email</th><th className="d-only">Company</th><th className="d-only">Position</th><th>Tag</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(c=>(
                  <tr key={c.id}>
                    <td style={{fontWeight:600,color:"var(--t1)"}}>{c.name}</td>
                    <td style={{color:"var(--t3)"}}>{c.email}</td>
                    <td className="d-only" style={{color:"var(--t3)"}}>{c.company||"—"}</td>
                    <td className="d-only" style={{color:"var(--t3)"}}>{c.position||"—"}</td>
                    <td><span className="bdg bdg-p">{c.tag}</span></td>
                    <td><div style={{display:"flex",gap:"5px"}}><button className="btn btn-g btn-sm" onClick={()=>startEdit(c)}>Edit</button><button className="btn btn-d btn-sm" onClick={()=>setDelTarget(c)}>Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCsv&&(
        <div className="ov"><div className="mo">
          <div className="mo-t">CSV Preview</div>
          <div className="mo-s">{csvPrev.length} contacts · duplicates auto-skipped</div>
          <div style={{overflowX:"auto",maxHeight:"280px",border:"1px solid var(--bd)",borderRadius:"var(--r)",marginBottom:"16px"}}>
            <table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Tag</th></tr></thead>
            <tbody>{csvPrev.slice(0,30).map((c,i)=><tr key={i}><td style={{fontWeight:600}}>{c.name}</td><td style={{color:"var(--t3)"}}>{c.email}</td><td style={{color:"var(--t3)"}}>{c.company||"—"}</td><td><span className="bdg bdg-p">{c.tag}</span></td></tr>)}{csvPrev.length>30&&<tr><td colSpan={4} style={{textAlign:"center",color:"var(--t4)",fontSize:".8rem"}}>...and {csvPrev.length-30} more</td></tr>}</tbody></table>
          </div>
          <div style={{display:"flex",gap:"10px"}}><button className="btn btn-p" onClick={importCsv} disabled={importing}>{importing ? "Importing..." : `Import ${csvPrev.length}`}</button><button className="btn btn-g" onClick={()=>{setShowCsv(false);setCsvPrev([])}}>Cancel</button></div>
        </div></div>
      )}

      {delTarget&&(
        <div className="ov"><div className="mo" style={{maxWidth:"340px",textAlign:"center"}}>
          <div style={{fontSize:"32px",marginBottom:"10px"}}>🗑️</div>
          <div className="mo-t">Delete {delTarget.name}?</div>
          <div className="mo-s">This cannot be undone.</div>
          <div style={{display:"flex",gap:"10px",justifyContent:"center"}}><button className="btn btn-d" onClick={del}>Delete</button><button className="btn btn-g" onClick={()=>setDelTarget(null)}>Cancel</button></div>
        </div></div>
      )}
    </div>
  )
}
