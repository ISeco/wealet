import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFunds } from '../features/funds/hooks'
import type { Fund } from '../features/funds/types'
import { isMacPlatform } from '../lib/platform'
import { SearchIcon } from './icons'

export const OPEN_COMMAND_PALETTE_EVENT = 'wealet:open-command-palette'

type PaletteGroup = 'Navegar a' | 'Crear' | 'Fondos recientes' | 'Fondos'

interface PaletteItem {
  id: string
  label: string
  group: PaletteGroup
  route: string
}

const NAV_ITEMS: PaletteItem[] = [
  { id: 'nav-dashboard',      label: 'Dashboard',        group: 'Navegar a', route: '/' },
  { id: 'nav-fondos',         label: 'Fondos',           group: 'Navegar a', route: '/fondos' },
  { id: 'nav-transacciones',  label: 'Transacciones',    group: 'Navegar a', route: '/transacciones' },
  { id: 'nav-transferencias', label: 'Transferencias',   group: 'Navegar a', route: '/transferencias' },
  { id: 'nav-salud',          label: 'Salud financiera', group: 'Navegar a', route: '/salud' },
  { id: 'nav-categorias',     label: 'Categorías',       group: 'Navegar a', route: '/categorias' },
  { id: 'nav-import',         label: 'Importar',         group: 'Navegar a', route: '/import' },
  { id: 'nav-ajustes',        label: 'Ajustes',          group: 'Navegar a', route: '/ajustes' },
]

const ACTION_ITEMS: PaletteItem[] = [
  { id: 'create-tx',       label: 'Nueva transacción',   group: 'Crear', route: '/transacciones?action=new' },
  { id: 'create-transfer', label: 'Nueva transferencia', group: 'Crear', route: '/transferencias?action=new' },
  { id: 'create-fund',     label: 'Nuevo fondo',         group: 'Crear', route: '/fondos?action=new' },
  { id: 'create-category', label: 'Nueva categoría',     group: 'Crear', route: '/categorias?action=new' },
]

const STATIC_ITEMS = [...NAV_ITEMS, ...ACTION_ITEMS]

const GROUP_ORDER: PaletteGroup[] = ['Navegar a', 'Crear', 'Fondos recientes', 'Fondos']

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()

  const { data: funds = [] } = useFunds()

  function close() {
    setOpen(false)
    setQuery('')
    setActiveIndex(0)
  }

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
        setActiveIndex(0)
        return
      }
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
        setActiveIndex(0)
      }
    }
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, handleOpenRequest)
    window.addEventListener('keydown', handleKeydown)
    return () => {
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, handleOpenRequest)
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  const q = query.trim().toLowerCase()

  const fundItems: PaletteItem[] = useMemo(
    () => funds.map((f: Fund) => ({
      id: `fund-${f.id}`,
      label: f.name,
      group: q ? 'Fondos' : 'Fondos recientes',
      route: `/fondos/${f.id}`,
    })),
    [funds, q]
  )

  const filtered = useMemo(
    () => q
      ? [...STATIC_ITEMS, ...fundItems].filter((item) => item.label.toLowerCase().includes(q))
      : [...STATIC_ITEMS, ...fundItems.slice(0, 3)],
    [fundItems, q]
  )

  const grouped = useMemo(
    () => GROUP_ORDER
      .map((group) => ({ group, items: filtered.filter((item) => item.group === group) }))
      .filter((g) => g.items.length > 0),
    [filtered]
  )

  const indexedGroups = useMemo(() => {
    let i = 0
    return grouped.map(({ group, items }) => ({
      group,
      items: items.map((item) => ({ item, index: i++ })),
    }))
  }, [grouped])

  function handleSelect(item: PaletteItem) {
    navigate(item.route)
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
            onChange={(event) => { setQuery(event.target.value); setActiveIndex(0) }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActiveIndex((i) => Math.max(i - 1, 0))
              } else if (event.key === 'Enter') {
                const target = filtered[activeIndex]
                if (target) handleSelect(target)
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
          {indexedGroups.length === 0 ? (
            <div style={{ padding: 10, fontSize: 13.5, color: 'var(--muted)' }}>Sin resultados</div>
          ) : (
            indexedGroups.map(({ group, items }) => (
              <div key={group}>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--muted)',
                  padding: '8px 10px 4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {group}
                </div>
                {items.map(({ item, index }) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 10,
                      borderRadius: 9,
                      cursor: 'pointer',
                      background: index === activeIndex ? 'var(--card-2)' : 'transparent',
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: 'var(--text)' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
