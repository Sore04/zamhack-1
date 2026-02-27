// src/app/(company)/layout.tsx
// ─────────────────────────────────────────────────────────
// Import the company-specific stylesheet (separate from globals)
import "@/app/(company)/company-portal.css"

import { CompanySidebar } from "@/components/layouts/company-sidebar"
import { MobileNav } from "@/components/layouts/mobile-nav"

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // data-portal="company" scopes all company-portal.css rules
    <div className="flex h-screen overflow-hidden" data-portal="company">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 md:block">
        <CompanySidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="company-header flex h-16 items-center border-b px-4 md:px-6">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <MobileNav title="Company Portal">
                <CompanySidebar />
              </MobileNav>
            </div>
            <h1 className="text-lg font-semibold">Company Portal</h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 cp-scrollable">
          {children}
        </main>
      </div>
    </div>
  )
}