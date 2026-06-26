import { useMemo } from 'react'
import type { Fund } from '../types'
import type { FundHistoryPoint } from '../types'
import { classColor, getFundChip, getInitials } from '../utils'

interface FundHeaderCardProps {
  fund: Fund
  history: FundHistoryPoint[]
}

export function FundHeaderCard({ fund, history }: FundHeaderCardProps) {
  const chip = getFundChip(fund)
  const cls = classColor(fund.classification)

  const maxHistory = useMemo(
    () => history.reduce((m, h) => Math.max(m, Number(h.balance)), 1),
    [history],
  )

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, fontFamily: "'Geist Mono', monospace", background: chip.bg, color: chip.color, textTransform: 'uppercase', flexShrink: 0 }}>
          {getInitials(fund.name)}
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{fund.name}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{cls.label}</div>
        </div>
        <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: 11.5, fontWeight: 600, padding: '4px 11px', borderRadius: 20, background: chip.bg, color: chip.color }}>
          {cls.label}
        </span>
      </div>

      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 22 }}>Saldo actual</div>
      <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.025em', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
        {fund.balanceFormatted}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, marginTop: 20, height: 84 }}>
        {history.length > 0
          ? history.map((h, i) => {
              const pct = Math.max(4, (Number(h.balance) / maxHistory) * 100)
              return (
                <div
                  key={i}
                  title={h.month}
                  style={{ flex: 1, borderRadius: '3px 3px 0 0', background: chip.color, opacity: 0.28, height: `${pct}%` }}
                />
              )
            })
          : Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{ flex: 1, borderRadius: '3px 3px 0 0', background: 'var(--border)', height: '10%' }} />
            ))}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>Evolución del saldo · últimos 12 meses</div>
    </div>
  )
}
