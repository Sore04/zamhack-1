"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense } from "react"
import {
  LayoutDashboard, Search, Briefcase, Users,
  User, Settings, Zap, MessageCircle,
} from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { UnreadMessagesBadge } from "@/components/layouts/unread-badge"

const studentNavItems = [
  { href: "/dashboard",     label: "Dashboard",         icon: LayoutDashboard },
  { href: "/challenges",    label: "Browse Challenges", icon: Search },
  { href: "/my-challenges", label: "My Challenges",     icon: Briefcase },
  { href: "/team",          label: "My Team",           icon: Users },
  { href: "/messages",      label: "Messages",          icon: MessageCircle, showBadge: true },
  { href: "/profile",       label: "Profile",           icon: User },
  { href: "/settings",      label: "Settings",          icon: Settings },
]

export const StudentSidebar = () => {
  const pathname = usePathname()

  return (
    <div className="sidebar-root">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Zap size={16} strokeWidth={2.5} color="white" />
        </div>
        <span className="sidebar-brand-name">ZamHack</span>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Menu</p>
        {studentNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "?")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <span className="sidebar-link-icon">
                <Icon size={16} />
              </span>
              {item.label}
              {item.showBadge && (
                <Suspense fallback={null}>
                  <UnreadMessagesBadge />
                </Suspense>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <LogoutButton />
      </div>
    </div>
  )
}