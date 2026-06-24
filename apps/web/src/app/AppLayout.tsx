import { Outlet } from 'react-router-dom'
import { CommandPalette } from './CommandPalette'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 32px 64px' }}>
            <Outlet />
          </div>
        </div>
      </main>
      <CommandPalette />
    </div>
  )
}
