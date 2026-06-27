import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { BarShapeProps } from 'recharts'
import { formatMoney } from '../../../lib/money'
import { useByCategory } from '../hooks'

const FALLBACK_COLOR = 'var(--muted)'
const PALETTE = ['#16A89A', '#2563EB', '#D97706', '#DC2626', '#7C3AED', '#0891B2']

interface Props {
  month: string
}

interface ChartEntry {
  name: string
  value: number
  amount: string
  color: string | null
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { amount: string } }> }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: '8px 12px', boxShadow: 'var(--shadow-lg)', fontSize: 12.5 }}>
      {formatMoney(payload[0].payload.amount, 'CLP')}
    </div>
  )
}

function makeBarShape(chartData: ChartEntry[]) {
  return function BarShape(props: BarShapeProps) {
    const { x, y, width, height, index } = props
    const entry = chartData[index]
    const fill = entry?.color ?? PALETTE[index % PALETTE.length] ?? FALLBACK_COLOR
    return <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.85} rx={4} />
  }
}

export function CategoryChart({ month }: Props) {
  const { data = [] } = useByCategory(month)

  const top6 = [...data]
    .sort((a, b) => Number(BigInt(b.amount) - BigInt(a.amount)))
    .slice(0, 6)

  const chartData: ChartEntry[] = top6.map((c) => ({
    name: c.categoryName.length > 13 ? c.categoryName.slice(0, 12) + '…' : c.categoryName,
    value: Number(c.amount),
    amount: c.amount,
    color: c.color,
  }))

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '20px 24px' }}>
      <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 16 }}>Gasto por categoría</div>

      {chartData.length === 0 ? (
        <div style={{ fontSize: 13.5, color: 'var(--muted)' }}>Sin gastos registrados este mes.</div>
      ) : (
        <ResponsiveContainer width="100%" height={chartData.length * 36 + 8}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category" dataKey="name" width={96}
              axisLine={false} tickLine={false}
              tick={{ fontSize: 13, fill: 'var(--text)' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--card-2)' }} />
            <Bar dataKey="value" maxBarSize={16} shape={makeBarShape(chartData)} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
