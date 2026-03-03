// ============================================================
// ESTATE HUB — MAIN LAYOUT (3-column authenticated shell)
// src/components/layout/MainLayout.tsx
// ============================================================

import { Outlet } from 'react-router-dom'
import Navbar       from '@/components/layout/Navbar'
import LeftSidebar  from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="feed-shell">
          {/* Left sidebar — hidden on mobile */}
          <aside className="left-sidebar hidden lg:block sticky-sidebar">
            <LeftSidebar />
          </aside>

          {/* Center feed content */}
          <main className="min-w-0">
            <Outlet />
          </main>

          {/* Right sidebar — hidden below 1200px */}
          <aside className="right-sidebar sticky-sidebar">
            <RightSidebar />
          </aside>
        </div>
      </div>
    </div>
  )
}