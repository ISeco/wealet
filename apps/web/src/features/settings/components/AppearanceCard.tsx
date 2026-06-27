import { useTheme } from '../../../app/theme'
import { updateProfile } from '../api'
import { card } from '../styles'

export function AppearanceCard() {
  const { theme, toggleTheme } = useTheme()

  function handleTheme(target: 'light' | 'dark') {
    if (theme !== target) toggleTheme()
    updateProfile({ theme: target }).catch(() => {})
  }

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>Apariencia</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>
            El navy de marca es la superficie en modo oscuro.
          </div>
        </div>
        <div
          style={{
            display: 'inline-flex',
            padding: 3,
            background: 'var(--card-2)',
            border: '1px solid var(--border)',
            borderRadius: 9,
            gap: 3,
          }}
        >
          {(['light', 'dark'] as const).map((t) => {
            const active = theme === t
            return (
              <div
                key={t}
                onClick={() => handleTheme(t)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  background: active ? 'var(--card)' : 'transparent',
                  color: active ? 'var(--text)' : 'var(--muted)',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,.12)' : 'none',
                  transition: 'all .15s',
                }}
              >
                {t === 'light' ? 'Claro' : 'Oscuro'}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
