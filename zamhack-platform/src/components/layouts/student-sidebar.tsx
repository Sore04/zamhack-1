"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Search,
  Briefcase,
  Users,
  User,
  Settings,
  Zap,
} from "lucide-react"
import { LogoutButton } from "@/components/logout-button"

const studentNavItems = [
  { href: "/dashboard",     label: "Dashboard",        icon: LayoutDashboard },
  { href: "/challenges",    label: "Browse Challenges", icon: Search },
  { href: "/my-challenges", label: "My Challenges",     icon: Briefcase },
  { href: "/team",          label: "My Team",           icon: Users },
  { href: "/profile",       label: "Profile",           icon: User },
  { href: "/settings",      label: "Settings",          icon: Settings },
]

export const StudentSidebar = () => {
  const pathname = usePathname()

  return (
    <div className="sidebar-root">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Zap size={16} strokeWidth={2.5} color="white" />
        </div>
        <span className="sidebar-brand-name">ZamHack</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Menu</p>
        {studentNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
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
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <LogoutButton />
      </div>
    </div>
  )
}