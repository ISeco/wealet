import { useAuth } from '../features/auth'

export function HomePlaceholder() {
  const { user, logout } = useAuth()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Hola, {user?.displayName ?? user?.email}</div>
      <button
        type="button"
        onClick={() => logout()}
        style={{
          height: 40,
          padding: '0 18px',
          border: '1px solid var(--border-strong)',
          borderRadius: 8,
          background: 'var(--card)',
          color: 'var(--text)',
          fontFamily: 'inherit',
          fontSize: 13.5,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Cerrar sesión
      </button>
    </div>
  )
}
