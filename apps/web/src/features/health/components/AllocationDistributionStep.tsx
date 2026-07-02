import { Button } from '../../../components/ui/Button'
import { formatMoney, formatThousands } from '../../../lib/money'
import type { Fund } from '../../funds/types'

interface Props {
  activeFunds: Fund[]
  amounts: Record<string, string>
  total: bigint
  onAmountChange: (fundId: string, value: string) => void
  onConfirm: () => void
  isPending: boolean
}

export function AllocationDistributionStep({ activeFunds, amounts, total, onAmountChange, onConfirm, isPending }: Props) {
  const sumAmounts = activeFunds.reduce(
    (acc, f) => acc + BigInt(amounts[f.id] || '0'),
    0n,
  )
  const isValid = activeFunds.length > 0 && sumAmounts === total && total > 0n

  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activeFunds.length === 0 && (
          <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
            No hay fondos activos para este framework.
          </p>
        )}
        {activeFunds.map((fund) => (
          <div
            key={fund.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              background: 'var(--card-2)',
              border: '1px solid var(--border)',
              borderRadius: 10,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>
                {fund.name}
              </div>
              {fund.targetPercentage != null && fund.targetPercentage > 0 && (
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                  Meta {fund.targetPercentage}%
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--border)', borderRadius: 7, padding: '6px 10px', background: 'var(--card)' }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>$</span>
              <input
                type="text"
                inputMode="numeric"
                value={formatThousands(amounts[fund.id] ?? '0')}
                onChange={(e) => onAmountChange(fund.id, e.target.value)}
                style={{
                  width: 110, border: 'none', background: 'none',
                  fontSize: 13.5, fontWeight: 600, color: 'var(--text)',
                  outline: 'none', fontFamily: 'inherit', textAlign: 'right',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 13, fontWeight: 600,
          }}
        >
          <span style={{ color: 'var(--muted)' }}>Total asignado</span>
          <span style={{ color: isValid ? 'var(--disp)' : 'var(--neg)' }}>
            {formatMoney(String(sumAmounts), 'CLP')} / {formatMoney(String(total), 'CLP')}
          </span>
        </div>
        <Button
          onClick={onConfirm}
          disabled={!isValid || isPending}
          style={{ width: '100%' }}
        >
          {isPending ? 'Confirmando…' : 'Confirmar distribución'}
        </Button>
      </div>
    </>
  )
}
