import { formatMoney } from '../../../lib/money'
import type { Fund } from '../types'

interface FundStatsColumnProps {
  fund: Fund
  monthLabel: string
  monthIncome: number
  monthExpense: number
}

export function FundStatsColumn({ fund, monthLabel, monthIncome, monthExpense }: FundStatsColumnProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '18px 20px' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Entradas en {monthLabel}</div>
        <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--pos)', marginTop: 4 }}>
          +{formatMoney(String(BigInt(Math.round(monthIncome))), 'CLP')}
        </div>
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '18px 20px' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Salidas en {monthLabel}</div>
        <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>
          {monthExpense > 0
            ? `−${formatMoney(String(BigInt(Math.round(monthExpense))), 'CLP')}`
            : formatMoney('0', 'CLP')}
        </div>
      </div>
      <div style={{ background: 'var(--tint)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Cuenta para tu runway</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>
          {fund.countsForRunway ? 'Sí · fondo colchón' : 'No'}
        </div>
      </div>
    </div>
  )
}
