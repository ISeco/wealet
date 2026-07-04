import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { CommandPalette } from './CommandPalette'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div className="app-content" style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 32px 64px' }}>
            <Outlet />
          </div>
        </div>
      </main>
      <CommandPalette />
    </div>
  )
}
