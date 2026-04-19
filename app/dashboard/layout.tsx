"use client"
import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, useUser } from "@clerk/nextjs"

const NAV = [
  { href:"/dashboard",           icon:"✏️", label:"Compose"  },
  { href:"/dashboard/contacts",  icon:"👥", label:"Contacts" },
  { href:"/dashboard/analytics", icon:"📊", label:"Analytics"},
  { href:"/dashboard/settings",  icon:"⚙️", label:"Settings" },
]

const TITLES: Record<string,string> = {
  "/dashboard":"Compose","/dashboard/contacts":"Contacts",
  "/dashboard/analytics":"Analytics","/dashboard/settings":"Settings",
}

export default function DashLayout({ children }: { children: ReactNode }) {
  const path = usePathname()
  const { user } = useUser()
  const title = TITLES[path] ?? "Dashboard"
  const name  = user?.firstName
    ? `${user.firstName}${user.lastName?" "+user.lastName:""}`
    : user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "User"
  const init  = (user?.firstName?.[0] ?? name[0] ?? "U").toUpperCase()

  return (
    <>
      <div className="shell">
        {/* TOPBAR */}
        <header className="topbar">
          <Link href="/dashboard" className="t-brand">
            <div className="t-mark">🐼</div>
            <span className="t-name d-only">GenpandaZ <span>MailPro</span></span>
          </Link>
          <div className="t-body">
            <span className="t-page">{title}</span>
            <div className="t-right">
              <div className="u-pill d-only">
                <div className="u-av">{init}</div>
                <span className="u-nm">{name}</span>
              </div>
              <UserButton
                appearance={{ variables:{colorPrimary:"#7C3AED",colorBackground:"#FFFFFF",colorText:"#111827",borderRadius:"8px"} }}
              />
            </div>
          </div>
        </header>

        {/* SIDEBAR */}
        <aside className="sidebar d-only">
          <div className="n-sec">Menu</div>
          {NAV.map(n => (
            <Link key={n.href} href={n.href} prefetch={true}
              className={`nav-lnk ${path===n.href?"on":""}`}>
              <div className="nav-ico">{n.icon}</div>
              {n.label}
            </Link>
          ))}
          <div style={{marginTop:"auto",padding:"12px 11px"}}>
            <div style={{fontSize:".7rem",color:"var(--t4)",lineHeight:"1.5"}}>
              GenPandaZ · Free · No limits
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">{children}</main>
      </div>

      {/* MOBILE NAV */}
      <nav className="mob-nav m-only">
        {NAV.map(n => (
          <Link key={n.href} href={n.href} prefetch={true}
            className={`mob-t ${path===n.href?"on":""}`}>
            <span className="mob-ti">{n.icon}</span>
            <span>{n.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
