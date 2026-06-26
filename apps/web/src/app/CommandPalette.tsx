import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import { isMacPlatform } from '../lib/platform'
import { DashboardIcon, SearchIcon, TransfersIcon } from './icons'

export const OPEN_COMMAND_PALETTE_EVENT = 'wealet:open-command-palette'

interface QuickAction {
  key: string
  label: string
  bg: string
  color: string
  icon: ComponentType<{ color?: string }>
  onSelect: () => void
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const actions: QuickAction[] = useMemo(
    () => [
      {
        key: 'dashboard',
        label: 'Ir a Dashboard',
        bg: 'var(--info-bg)',
        color: 'var(--info)',
        icon: DashboardIcon,
        onSelect: () => navigate('/'),
      },
      {
        key: 'transactions',
        label: 'Ir a Transacciones',
        bg: 'var(--disp-bg)',
        color: 'var(--disp)',
        icon: TransfersIcon,
        onSelect: () => navigate('/transacciones'),
      },
    ],
    [navigate],
  )

  const filtered = useMemo(
    () => actions.filter((action) => action.label.toLowerCase().includes(query.toLowerCase())),
    [actions, query],
  )

  useEffect(() => {
    function handleOpenRequest() {
      setOpen(true)
    }
    function handleKeydown(event: KeyboardEvent) {
      const modifierPressed = isMacPlatform() ? event.metaKey : event.ctrlKey
      if (modifierPressed && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((current) => !current)
        setQuery('')
        return
      }
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, handleOpenRequest)
    window.addEventListener('keydown', handleKeydown)
    return () => {
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, handleOpenRequest)
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  function close() {
    setOpen(false)
    setQuery('')
  }

  function select(action: QuickAction) {
    action.onSelect()
    close()
  }

  if (!open) return null

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(15,34,64,.42)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '14vh',
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 560,
          maxWidth: '92vw',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <SearchIcon />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && filtered[0]) {
                select(filtered[0])
              }
            }}
            placeholder="Buscar o escribe un comando…"
            style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 15, color: 'var(--text)' }}
          />
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, border: '1px solid var(--border)', borderRadius: 5, padding: '2px 6px', color: 'var(--muted)' }}>
            ESC
          </span>
        </div>
        <div style={{ padding: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--muted)', padding: '8px 10px 4px' }}>
            Acciones rápidas
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: 10, fontSize: 13.5, color: 'var(--muted)' }}>Sin resultados</div>
          ) : (
            filtered.map((action) => {
              const Icon = action.icon
              return (
                <div
                  key={action.key}
                  onClick={() => select(action)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 9, cursor: 'pointer' }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      flex: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: action.bg,
                      color: action.color,
                    }}
                  >
                    <Icon color={action.color} />
                  </span>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: 'var(--text)' }}>{action.label}</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
