import type { ReactNode } from 'react'

interface AuthCenteredLayoutProps {
  children: ReactNode
}

export function AuthCenteredLayout({ children }: AuthCenteredLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 392 }}>{children}</div>
    </div>
  )
}
