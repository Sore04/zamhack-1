"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense } from "react"
import {
  LayoutDashboard, Briefcase, Search,
  Building2, HelpCircle, Settings, Zap, MessageCircle, BarChart2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LogoutButton } from "@/components/logout-button"
import { CompanyUnreadBadge } from "./company-unread-badge"

const companyNavItems = [
  { href: "/company/dashboard",    label: "Dashboard",     icon: LayoutDashboard },
  { href: "/company/challenges",   label: "Challenges",    icon: Briefcase },
  { href: "/company/analytics",    label: "Analytics",     icon: BarChart2 },
  { href: "/company/talent",       label: "Talent Search", icon: Search },
  { href: "/company/messages",     label: "Messages",      icon: MessageCircle, showBadge: true },
  { href: "/company/organization", label: "Org Settings",  icon: Building2 },
  { href: "/company/support",      label: "Admin Support", icon: HelpCircle },
  { href: "/company/settings",     label: "Settings",      icon: Settings },
]

export const CompanySidebar = () => {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-white border-r border-[var(--cp-border,rgba(44,62,80,0.10))]">
      <div className="company-sidebar-header flex h-16 items-center gap-2.5 px-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white leading-tight">ZamHack</h2>
          <p className="text-[0.65rem] text-white/60 font-medium">Company Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        {companyNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/") || pathname.startsWith(item.href + "?")
          return (
            <Link key={item.href} href={item.href} className={cn("company-nav-link", isActive && "active")}>
              <Icon />
              <span>{item.label}</span>
              {item.showBadge && (
                <Suspense fallback={null}>
                  <CompanyUnreadBadge />
                </Suspense>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[var(--cp-border,rgba(44,62,80,0.10))] p-3">
        <LogoutButton />
      </div>
    </div>
  )
}