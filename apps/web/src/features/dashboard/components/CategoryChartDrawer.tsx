import { Modal } from '../../../components/ui/Modal'
import { formatMoney } from '../../../lib/money'
import { useByCategory } from '../hooks'

const PALETTE = ['#16A89A', '#2563EB', '#D97706', '#DC2626', '#7C3AED', '#0891B2']

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

interface CategoryChartDrawerProps {
  month: string
  onClose: () => void
}

export function CategoryChartDrawer({ month, onClose }: CategoryChartDrawerProps) {
  const { data = [] } = useByCategory(month)

  const sorted = [...data].sort((a, b) =>
    BigInt(b.amount) > BigInt(a.amount) ? 1 : BigInt(b.amount) < BigInt(a.amount) ? -1 : 0
  )

  const maxAmount = sorted.length > 0 ? Number(sorted[0].amount) : 1

  const total = sorted.reduce((sum, c) => sum + BigInt(c.amount), 0n)

  const m = month.split('-')[1]
  const monthName = MONTH_NAMES[Number(m) - 1]

  const footer = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--muted)' }}>Gasto total</span>
      <span style={{ fontSize: 15, fontWeight: 600 }}>{formatMoney(String(total), 'CLP')}</span>
    </div>
  )

  return (
    <Modal title="Gasto por categoría" onClose={onClose} position="right" width={400} footer={footer}>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>{monthName}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sorted.map((c, i) => {
          const color = c.color ?? PALETTE[i % PALETTE.length]
          const barWidth = `${Math.round((Number(c.amount) / maxAmount) * 100)}%`
          return (
            <div key={c.categoryId}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, flexShrink: 0, background: color }} />
                  <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.categoryName}
                  </span>
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginLeft: 12, color: 'var(--text)' }}>
                  {formatMoney(c.amount, 'CLP')}
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--card-2)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, background: color, opacity: 0.85, width: barWidth }} />
              </div>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
