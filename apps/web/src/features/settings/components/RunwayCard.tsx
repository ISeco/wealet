import { useState } from 'react'
import { useFunds } from '../../funds/hooks'
import { useHealthProfile } from '../../health/hooks'
import { fundMatchesFramework } from '../../health/utils'
import { useToggleFundRunway } from '../hooks'
import { card } from '../styles'

export function RunwayCard() {
  const { data: funds = [] } = useFunds()
  const { data: profile } = useHealthProfile()
  const { mutate: toggleRunway } = useToggleFundRunway()

  const activeFramework = profile?.framework ?? 'fondos'
  const visibleFunds = funds.filter((f) => fundMatchesFramework(f.frameworkSlot, activeFramework))
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  function handleToggle(fundId: string, current: boolean) {
    setPendingIds((prev) => new Set(prev).add(fundId))
    toggleRunway(
      { id: fundId, countsForRunway: !current },
      {
        onSettled: () =>
          setPendingIds((prev) => {
            const next = new Set(prev)
            next.delete(fundId)
            return next
          }),
      },
    )
  }

  return (
    <div style={card}>
      <div style={{ fontSize: 14.5, fontWeight: 600 }}>Fondos que cuentan para el runway</div>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4, marginBottom: 14 }}>
        Tu colchón = suma de estos fondos ÷ gasto mensual promedio.
      </div>
      {visibleFunds.map((fund) => {
        const pending = pendingIds.has(fund.id)
        const active = fund.countsForRunway
        return (
          <div
            key={fund.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 0',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{fund.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                {fund.balanceFormatted}
              </div>
            </div>
            <div
              onClick={() => !pending && handleToggle(fund.id, active)}
              role="switch"
              aria-checked={active}
              style={{
                width: 38,
                height: 22,
                borderRadius: 20,
                background: active ? 'var(--pos)' : 'var(--border-strong)',
                cursor: pending ? 'default' : 'pointer',
                opacity: pending ? 0.6 : 1,
                position: 'relative',
                transition: 'background .2s',
                flex: 'none',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: active ? 18 : 2,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 1px 2px rgba(0,0,0,.2)',
                  transition: 'left .2s',
                }}
              />
            </div>
          </div>
        )
      })}
      {visibleFunds.length === 0 && (
        <div style={{ fontSize: 13.5, color: 'var(--muted)', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          No hay fondos activos.
        </div>
      )}
    </div>
  )
}
