import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div style={{minHeight:"100vh",background:"#F8F9FC",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",backgroundImage:"radial-gradient(ellipse at 50% 0%,rgba(124,58,237,.1) 0%,transparent 60%)"}}>
      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"32px"}}>
        <div style={{width:"36px",height:"36px",background:"#7C3AED",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",boxShadow:"0 4px 16px rgba(124,58,237,.45)"}}>🐼</div>
        <span style={{fontFamily:"Inter,sans-serif",fontSize:"1.2rem",fontWeight:800,color:"#111827",letterSpacing:"-.02em"}}>GenpandaZ <span style={{color:"#7C3AED"}}>Mailpro</span></span>
      </div>
      <SignIn
        appearance={{
          variables:{
            colorPrimary:"#7C3AED",colorBackground:"#FFFFFF",
            colorInputBackground:"#F8F9FC",colorInputText:"#111827",
            colorText:"#111827",colorTextSecondary:"#6B7280",
            colorNeutral:"#E5E7EB",borderRadius:"8px",
            fontFamily:"Inter,sans-serif",fontSize:"14px",
          }
        }}
        forceRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  )
}
