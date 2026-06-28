import { useState } from 'react'
import { formatMoney } from '../../../lib/money'
import { useFunds } from '../../funds/hooks'
import { useCashFlow, useRunway } from '../hooks'
import { RunwayFundsDrawer } from './RunwayFundsDrawer'

export function RunwayCard() {
  const { data: runway } = useRunway()
  const { data: cashFlow = [] } = useCashFlow(6)
  const { data: funds = [] } = useFunds()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const months = runway?.months
  const cushion = runway?.cushion ?? '0'
  const monthlyBurn = runway?.monthlyBurn ?? '0'

  const runwayFundCount = funds.filter((f) => f.countsForRunway && f.archivedAt === null).length

  const sparkHeights = cashFlow.map((p) => {
    const expense = Number(p.expense)
    return expense
  })
  const maxExpense = Math.max(...sparkHeights, 1)

  return (
    <>
      <div style={{
        position: 'relative', borderRadius: 14, padding: '22px 24px',
        overflow: 'hidden', background: '#0F2240', color: '#fff',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--grad)', opacity: 0.16 }} />
        <div style={{
          position: 'absolute', right: -30, top: -30,
          width: 160, height: 160, borderRadius: '50%',
          background: 'var(--grad)', opacity: 0.22, filter: 'blur(8px)',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,.72)' }}>
            Runway sin ingreso
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '10px 0 6px' }}>
            <span style={{
              fontSize: 46, fontWeight: 600, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
              background: 'linear-gradient(120deg,#7FD4FF,#5DE0C8 52%,#A7E07A)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>
              {months != null ? months.toFixed(1) : '—'}
            </span>
            <span style={{ fontSize: 18, fontWeight: 500, color: 'rgba(255,255,255,.82)' }}>
              {months != null ? 'meses' : ''}
            </span>
          </div>

          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.74)', lineHeight: 1.5, maxWidth: 280 }}>
            {months != null ? (
              <>
                Tus fondos colchón ({formatMoney(cushion, 'CLP')}) cubren ~{Math.round(months)} {Math.round(months) === 1 ? 'mes' : 'meses'} a tu gasto promedio de{' '}
                <b style={{ color: '#fff', fontWeight: 600 }}>{formatMoney(monthlyBurn, 'CLP')}</b>.
              </>
            ) : (
              'Sin datos de gasto suficientes para calcular el runway.'
            )}
          </div>

          {cashFlow.length > 0 && (
            <div style={{ display: 'flex', gap: 3, marginTop: 18, alignItems: 'flex-end', height: 30 }}>
              {sparkHeights.map((h, i) => (
                <span
                  key={i}
                  style={{
                    flex: 1, borderRadius: 2,
                    background: 'rgba(255,255,255,.32)',
                    height: `${Math.max(4, Math.round((h / maxExpense) * 30))}px`,
                  }}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              marginTop: 14, display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              color: 'rgba(255,255,255,.55)', fontSize: 13, fontFamily: 'inherit',
            }}
          >
            Ver fondos colchón ({runwayFundCount})
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {drawerOpen && <RunwayFundsDrawer onClose={() => setDrawerOpen(false)} />}
    </>
  )
}
