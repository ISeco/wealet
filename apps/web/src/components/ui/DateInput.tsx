import { forwardRef, useRef, useImperativeHandle, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface DateInputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  error?: boolean
  style?: React.CSSProperties
  maxDate?: string
}

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function formatDisplay(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS_ES[m - 1]} ${y}`
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function buildGrid(y: number, m: number) {
  const firstDow = (new Date(y, m - 1, 1).getDay() + 6) % 7 // Mon=0
  const daysInCurr = new Date(y, m, 0).getDate()
  const daysInPrev = new Date(y, m - 1, 0).getDate()
  const prevM = m === 1 ? 12 : m - 1
  const prevY = m === 1 ? y - 1 : y
  const nextM = m === 12 ? 1 : m + 1
  const nextY = m === 12 ? y + 1 : y

  const cells: { y: number; m: number; d: number; current: boolean }[] = []
  for (let i = firstDow - 1; i >= 0; i--)
    cells.push({ y: prevY, m: prevM, d: daysInPrev - i, current: false })
  for (let d = 1; d <= daysInCurr; d++)
    cells.push({ y, m, d, current: true })
  let nd = 1
  while (cells.length % 7 !== 0)
    cells.push({ y: nextY, m: nextM, d: nd++, current: false })

  return cells
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  function DateInput({ label, placeholder = 'Selecciona una fecha', value, onChange, required, error, style, maxDate }, ref) {
    const hiddenRef = useRef<HTMLInputElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => hiddenRef.current!)

    const today = new Date()
    const parsed = value ? value.split('-').map(Number) : null
    const [open, setOpen] = useState(false)
    const [viewY, setViewY] = useState(parsed?.[0] ?? today.getFullYear())
    const [viewM, setViewM] = useState(parsed?.[1] ?? today.getMonth() + 1)
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

    const openCalendar = useCallback(() => {
      if (!triggerRef.current) return
      const r = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - r.bottom
      const calHeight = 300
      const top = spaceBelow >= calHeight ? r.bottom + 6 : r.top - calHeight - 6
      const calWidth = Math.max(r.width, 260)
      const left = r.left + calWidth > window.innerWidth - 8 ? r.right - calWidth : r.left
      setPos({ top, left, width: r.width })
      setOpen(true)
    }, [])

    useEffect(() => {
      if (!open) return
      function onDown(e: MouseEvent) {
        if (triggerRef.current?.contains(e.target as Node)) return
        setOpen(false)
      }
      document.addEventListener('mousedown', onDown)
      return () => document.removeEventListener('mousedown', onDown)
    }, [open])

    function selectDay(cell: { y: number; m: number; d: number }) {
      const iso = toISO(cell.y, cell.m, cell.d)
      if (maxDate && iso > maxDate) return
      // Synthesize a change event on the hidden input so React's onChange fires
      const nativeInput = hiddenRef.current!
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!.call(nativeInput, iso)
      nativeInput.dispatchEvent(new Event('change', { bubbles: true }))
      setOpen(false)
    }

    const cells = buildGrid(viewY, viewM)
    const todayISO = toISO(today.getFullYear(), today.getMonth() + 1, today.getDate())
    const nextMonthISO = toISO(viewM === 12 ? viewY + 1 : viewY, viewM === 12 ? 1 : viewM + 1, 1)
    const isNextMonthDisabled = !!maxDate && nextMonthISO > maxDate

    const calendar = open ? createPortal(
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          width: Math.max(pos.width, 260),
          zIndex: 9999,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          boxShadow: 'var(--shadow-lg)',
          padding: '14px 12px 12px',
          animation: 'wl-fade .1s both',
        }}
      >
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => { const pm = viewM === 1 ? 12 : viewM - 1; setViewM(pm); if (pm === 12) setViewY(y => y - 1) }}
            style={{ width: 28, height: 28, border: 'none', background: 'var(--card-2)', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{MONTHS_ES[viewM - 1]} {viewY}</span>
          <button
            type="button"
            disabled={isNextMonthDisabled}
            onClick={() => { const nm = viewM === 12 ? 1 : viewM + 1; setViewM(nm); if (nm === 1) setViewY(y => y + 1) }}
            style={{ width: 28, height: 28, border: 'none', background: 'var(--card-2)', borderRadius: 7, cursor: isNextMonthDisabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', opacity: isNextMonthDisabled ? 0.35 : 1 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {WEEKDAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--muted)', padding: '2px 0' }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {cells.map((cell, i) => {
            const iso = toISO(cell.y, cell.m, cell.d)
            const isSelected = iso === value
            const isToday = iso === todayISO
            const isDisabled = !!maxDate && iso > maxDate
            return (
              <button
                key={i}
                type="button"
                disabled={isDisabled}
                onClick={() => selectDay(cell)}
                style={{
                  height: 32,
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  fontVariantNumeric: 'tabular-nums',
                  background: isSelected ? 'var(--grad)' : isToday ? 'var(--info-bg)' : 'transparent',
                  color: isSelected ? '#fff' : isToday ? 'var(--info)' : cell.current ? 'var(--text)' : 'var(--muted)',
                  fontWeight: isSelected || isToday ? 600 : 400,
                  opacity: isDisabled ? 0.3 : cell.current ? 1 : 0.45,
                }}
              >
                {cell.d}
              </button>
            )
          })}
        </div>
      </div>,
      document.body,
    ) : null

    return (
      <div>
        {label && (
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>
            {label}
          </div>
        )}
        <div
          ref={triggerRef}
          onClick={openCalendar}
          style={{
            height: 44,
            border: `1px solid ${error ? 'var(--neg)' : 'var(--border)'}`,
            borderRadius: 10,
            background: 'var(--field)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: 8,
            cursor: 'pointer',
            ...style,
          }}
        >
          <span style={{ flex: 1, fontSize: 14, fontVariantNumeric: 'tabular-nums', color: value ? 'var(--text)' : 'var(--muted)' }}>
            {value ? formatDisplay(value) : placeholder}
          </span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="16" y1="2" x2="16" y2="6" />
          </svg>
        </div>

        {/* Hidden input keeps value in form + exposes ref for useFormFieldErrors */}
        <input
          ref={hiddenRef}
          type="date"
          value={value}
          onChange={onChange}
          required={required}
          max={maxDate}
          tabIndex={-1}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
        />

        {calendar}
      </div>
    )
  },
)
