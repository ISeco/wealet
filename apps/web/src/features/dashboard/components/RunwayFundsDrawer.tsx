import { useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../../components/ui/Modal'
import { formatMoney } from '../../../lib/money'
import { useFunds, useUpdateFund } from '../../funds/hooks'
import type { Fund } from '../../funds/types'
import { activeFunds, classColor } from '../../funds/utils'

interface RunwayFundsDrawerProps {
  onClose: () => void
}

export function RunwayFundsDrawer({ onClose }: RunwayFundsDrawerProps) {
  const { data: allFunds = [] } = useFunds()
  const update = useUpdateFund()
  const qc = useQueryClient()

  const funds = activeFunds(allFunds)
    .sort((a, b) => Number(b.countsForRunway) - Number(a.countsForRunway))

  const cushionTotal = funds
    .filter((f) => f.countsForRunway)
    .reduce((sum, f) => sum + BigInt(f.balance), 0n)

  function handleToggle(fund: Fund) {
    if (update.isPending) return
    update.mutate(
      { id: fund.id, payload: { countsForRunway: !fund.countsForRunway } },
      { onSuccess: () => qc.invalidateQueries({ queryKey: ['reports', 'runway'] }) },
    )
  }

  const footer = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--muted)' }}>Colchón total</span>
      <span style={{ fontSize: 15, fontWeight: 600 }}>{formatMoney(String(cushionTotal), 'CLP')}</span>
    </div>
  )

  return (
    <Modal title="Fondos colchón" onClose={onClose} position="right" width={400} footer={footer}>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5 }}>
        Los fondos marcados se suman al cálculo del Runway.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {funds.map((fund) => {
          const cls = classColor(fund.classification)
          return (
            <div
              key={fund.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 10,
                background: fund.countsForRunway ? 'var(--tint)' : 'transparent',
                border: `1px solid ${fund.countsForRunway ? 'var(--border)' : 'transparent'}`,
              }}
            >
              <span style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: fund.color ?? cls.color,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13.5, fontWeight: 500, color: 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {fund.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: cls.color, background: cls.bg,
                    borderRadius: 4, padding: '1px 5px',
                  }}>
                    {cls.label}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {fund.balanceFormatted}
                  </span>
                </div>
              </div>
              <div
                onClick={() => handleToggle(fund)}
                style={{
                  width: 38, height: 22, borderRadius: 11,
                  background: fund.countsForRunway ? 'var(--disp)' : 'var(--border-strong)',
                  position: 'relative', flexShrink: 0,
                  cursor: update.isPending ? 'not-allowed' : 'pointer',
                  opacity: update.isPending ? 0.6 : 1,
                  transition: 'background .15s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 2,
                  left: fund.countsForRunway ? 18 : 2,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#fff', transition: 'left .15s',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
