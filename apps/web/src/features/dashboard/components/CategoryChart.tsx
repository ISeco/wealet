import { formatMoney } from '../../../lib/money'
import { useByCategory } from '../hooks'

const PALETTE = ['#16A89A', '#2563EB', '#D97706', '#DC2626', '#7C3AED', '#0891B2']

interface Props {
  month: string
}

export function CategoryChart({ month }: Props) {
  const { data = [] } = useByCategory(month)

  const top6 = [...data]
    .sort((a, b) => (BigInt(b.amount) > BigInt(a.amount) ? 1 : BigInt(b.amount) < BigInt(a.amount) ? -1 : 0))
    .slice(0, 6)

  const maxAmount = top6.length > 0 ? Number(top6[0].amount) : 1

  const m = month.split('-')[1]
  const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const monthName = MONTH_NAMES[Number(m) - 1]

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600 }}>Gasto por categoría</div>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{monthName}</span>
      </div>

      {top6.length === 0 ? (
        <div style={{ fontSize: 13.5, color: 'var(--muted)' }}>Sin gastos registrados este mes.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {top6.map((c, i) => {
            const color = c.color ?? PALETTE[i % PALETTE.length]
            const barWidth = `${Math.round((Number(c.amount) / maxAmount) * 100)}%`
            return (
              <div key={c.categoryId} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, flex: 'none', background: color }} />
                <span style={{ fontSize: 13, flex: 'none', width: 92, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.categoryName}
                </span>
                <div style={{ flex: 1, height: 6, background: 'var(--card-2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: color, opacity: 0.85, width: barWidth }} />
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums', width: 74, textAlign: 'right', color: 'var(--text)' }}>
                  {formatMoney(c.amount, 'CLP')}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
