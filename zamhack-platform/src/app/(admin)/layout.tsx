import { AdminSidebar } from "@/components/layouts/admin-sidebar"
import { MobileNav } from "@/components/layouts/mobile-nav"
import { Shield } from "lucide-react"

// Import dedicated admin styles
import "@/app/(admin)/admin.css"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout" data-layout="admin">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block">
        <AdminSidebar />
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            {/* Mobile Nav trigger */}
            <div className="md:hidden">
              <MobileNav title="Admin Portal">
                <AdminSidebar />
              </MobileNav>
            </div>

            {/* Desktop breadcrumb */}
            <div className="hidden md:flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: "var(--admin-coral)" }} />
              <span className="admin-header-title">Admin Portal</span>
            </div>
          </div>

          <div className="admin-header-right">
            {/* Live indicator */}
            <div className="admin-header-badge">
              <span className="admin-header-badge-dot" />
              Live
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  )
}