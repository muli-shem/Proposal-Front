import { Outlet } from 'react-router-dom'
import Navbar      from '@/components/layout/Navbar'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6 items-start">

            {/* Left sidebar — hidden on mobile */}
            <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-20 self-start">
              <LeftSidebar />
            </aside>

            {/* Center feed content */}
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>

            {/* Right sidebar — hidden below xl */}
            <aside className="hidden xl:block w-64 flex-shrink-0 sticky top-20 self-start">
              <RightSidebar />
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}