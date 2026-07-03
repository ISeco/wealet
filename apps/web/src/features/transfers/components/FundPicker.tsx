// apps/web/src/features/transfers/components/FundPicker.tsx
import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon, PlusIcon } from '../../../components/ui/icons'
import { formatMoney } from '../../../lib/money'
import type { Fund } from '../../funds/types'
import { classColor, getFundChip, getInitials } from '../../funds/utils'

interface FundPickerProps {
  label: string
  direction: 'from' | 'to'
  funds: Fund[]
  selectedId: string | null
  onChange: (id: string) => void
  exclude: string | null
  projectedBalance: number | null
  disabled?: boolean
}

export function FundPicker({ label, direction, funds, selectedId, onChange, exclude, projectedBalance, disabled }: FundPickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = funds.find((f) => f.id === selectedId) ?? null
  const available = funds.filter(
    (f) => f.id !== exclude && !f.archivedAt && (direction === 'to' || Number(f.balance) > 0),
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const chip = selected ? getFundChip(selected) : null
  const cls = selected ? classColor(selected.classification) : null
  const projectedColor = direction === 'from' ? 'var(--neg)' : 'var(--pos)'

  return (
    <div ref={containerRef} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, background: disabled ? 'var(--card)' : 'var(--card-2)', position: 'relative', opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
        {label}
      </div>

      <div
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        {chip && selected ? (
          <span style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, fontFamily: "'Geist Mono', monospace", background: chip.bg, color: chip.color }}>
            {getInitials(selected.name)}
          </span>
        ) : (
          <span style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlusIcon color="var(--muted)" size={16} />
          </span>
        )}

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selected ? selected.name : 'Seleccionar fondo'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {cls ? cls.label : '—'}
          </div>
        </div>

        <span style={{ marginLeft: 'auto', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', display: 'flex' }}>
          <ChevronDownIcon />
        </span>
      </div>

      {selected && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Saldo actual</div>
          <div style={{ fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{selected.balanceFormatted}</div>
          {projectedBalance !== null && (
            <div style={{ fontSize: 12, color: projectedColor, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
              → {formatMoney(String(projectedBalance), 'CLP')} después
            </div>
          )}
        </div>
      )}

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', zIndex: 10, overflow: 'hidden' }}>
          {available.length === 0 ? (
            <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--muted)' }}>Sin fondos disponibles</div>
          ) : (
            available.map((fund, idx) => {
              const fChip = getFundChip(fund)
              const fCls = classColor(fund.classification)
              const isSelected = fund.id === selectedId
              return (
                <div
                  key={fund.id}
                  onClick={() => { onChange(fund.id); setOpen(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', background: isSelected ? 'var(--tint)' : 'transparent', borderBottom: idx < available.length - 1 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--card-2)' }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, fontFamily: "'Geist Mono', monospace", background: fChip.bg, color: fChip.color }}>
                    {getInitials(fund.name)}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{fund.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{fCls.label}</div>
                  </div>
                  <div style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', color: 'var(--muted)', flexShrink: 0 }}>{fund.balanceFormatted}</div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
