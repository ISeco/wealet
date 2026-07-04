import { formatMoney } from '../../../lib/money'
import { useSummary } from '../hooks'
import { prevMonthName } from '../utils'

interface Props {
  month: string
}

const cardStyle: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  boxShadow: 'var(--shadow)',
  padding: '18px 20px',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  display: 'flex',
  alignItems: 'center',
  gap: 7,
}

const amountStyle: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 600,
  letterSpacing: '-0.02em',
  marginTop: 8,
  fontVariantNumeric: 'tabular-nums',
}

const subtextStyle: React.CSSProperties = {
  fontSize: 12.5,
  color: 'var(--muted)',
  marginTop: 4,
}

export function StatRow({ month }: Props) {
  const { data, isLoading } = useSummary(month)

  const income = data?.income ?? '0'
  const expense = data?.expense ?? '0'
  const balance = isLoading
    ? '0'
    : (BigInt(income) - BigInt(expense)).toString()
  const balancePositive = !isLoading && BigInt(balance) >= 0n

  const pct = data?.expenseChangePercent
  const expensePctText =
    pct != null
      ? `${pct < 0 ? '' : '+'}${pct.toFixed(0)}% vs. ${prevMonthName(month)}`
      : null
  const expensePctColor = pct != null ? (pct <= 0 ? 'var(--pos)' : 'var(--neg)') : undefined

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(222px, 1fr))', gap: 16 }}>
      <div style={cardStyle}>
        <div style={labelStyle}>Balance del mes</div>
        <div style={{ ...amountStyle, color: isLoading ? 'var(--text)' : balancePositive ? 'var(--pos)' : 'var(--neg)' }}>
          {isLoading ? '—' : `${balancePositive ? '+' : ''}${formatMoney(balance, 'CLP')}`}
        </div>
        <div style={subtextStyle}>Ingresos − gastos del mes</div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--pos)' }} />
          Ingresos
        </div>
        <div style={amountStyle}>
          {isLoading ? '—' : formatMoney(income, 'CLP')}
        </div>
        <div style={subtextStyle}>&nbsp;</div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neg)' }} />
          Gastos
        </div>
        <div style={amountStyle}>
          {isLoading ? '—' : formatMoney(expense, 'CLP')}
        </div>
        <div style={{ ...subtextStyle, color: expensePctColor ?? 'var(--muted)' }}>
          {expensePctText ?? <>&nbsp;</>}
        </div>
      </div>
    </div>
  )
}
