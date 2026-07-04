import { useEffect, useRef, useState } from 'react'
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../components/ui/icons'
import { formatMonthLabel } from '../utils'

interface Props {
  months: string[]
  value: string
  onChange: (month: string) => void
}

const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const btnBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 38,
  height: 38,
  border: '1px solid var(--border)',
  borderRadius: 9,
  background: 'var(--card)',
  color: 'var(--muted)',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

export function MonthSelector({ months, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const idx = months.indexOf(value)
  const canPrev = idx < months.length - 1
  const canNext = idx > 0

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
      <button
        className="month-nav-btn"
        style={{ ...btnBase, opacity: canPrev ? 1 : 0.4, cursor: canPrev ? 'pointer' : 'default' }}
        disabled={!canPrev}
        onClick={() => canPrev && onChange(months[idx + 1])}
      >
        <ChevronLeftIcon size={16} />
      </button>

      <button
        onClick={() => setOpen((o) => !o)}
        style={{ ...btnBase, width: 'auto', gap: 8, padding: '0 14px', color: 'var(--text)', fontSize: 13.5, fontWeight: 500 }}
      >
        <CalendarIcon />
        {formatMonthLabel(value)}
        <ChevronDownIcon size={14} />
      </button>

      <button
        className="month-nav-btn"
        style={{ ...btnBase, opacity: canNext ? 1 : 0.4, cursor: canNext ? 'pointer' : 'default' }}
        disabled={!canNext}
        onClick={() => canNext && onChange(months[idx - 1])}
      >
        <ChevronRightIcon size={16} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 46, right: 0, zIndex: 30,
          width: 200, background: 'var(--card)',
          border: '1px solid var(--border-strong)', borderRadius: 12,
          boxShadow: 'var(--shadow-lg)', padding: 6,
        }}>
          {months.map((m) => (
            <div
              key={m}
              onClick={() => { onChange(m); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 11px', borderRadius: 8, cursor: 'pointer',
                fontSize: 13.5, fontWeight: m === value ? 600 : 400,
                background: m === value ? 'var(--card-2)' : 'transparent',
                color: 'var(--text)',
              }}
            >
              {formatMonthLabel(m)}
              {m === value && <CheckIcon size={15} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
