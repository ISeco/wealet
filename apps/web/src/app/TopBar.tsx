import { useLocation } from 'react-router-dom'
import { useTheme } from './theme'
import { pageTitles } from './navConfig'
import { MenuIcon, MoonIcon, SearchIcon, SunIcon } from '../components/ui/icons'
import { OPEN_COMMAND_PALETTE_EVENT } from './CommandPalette'
import { isMacPlatform } from '../lib/platform'

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { crumb, title } = pageTitles[location.pathname] ?? { crumb: 'General', title: 'Wealet' }
  const shortcutLabel = isMacPlatform() ? '⌘K' : 'Ctrl K'

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 32px',
        borderBottom: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--bg) 70%, transparent)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <button
        type="button"
        className="topbar-btn hamburger-btn"
        aria-label="Abrir menú"
        onClick={onMenuClick}
        style={{
          width: 38,
          height: 38,
          flex: 'none',
          border: '1px solid var(--border)',
          borderRadius: 9,
          background: 'var(--card)',
          color: 'var(--muted)',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MenuIcon />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{crumb}</div>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text)', marginTop: 1 }}>{title}</div>
      </div>
      <button
        type="button"
        className="topbar-btn"
        onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          height: 38,
          padding: '0 12px',
          border: '1px solid var(--border)',
          borderRadius: 9,
          background: 'var(--card)',
          color: 'var(--muted)',
          fontFamily: 'inherit',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        <SearchIcon />
        <span className="topbar-search-label" style={{ minWidth: 120, textAlign: 'left' }}>Buscar o crear…</span>
        <span className="topbar-search-label" style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, border: '1px solid var(--border)', borderRadius: 5, padding: '2px 6px', color: 'var(--muted)' }}>
          {shortcutLabel}
        </span>
      </button>
      <button
        type="button"
        className="topbar-btn"
        aria-label="Tema"
        onClick={toggleTheme}
        style={{
          width: 38,
          height: 38,
          flex: 'none',
          border: '1px solid var(--border)',
          borderRadius: 9,
          background: 'var(--card)',
          color: 'var(--muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  )
}
