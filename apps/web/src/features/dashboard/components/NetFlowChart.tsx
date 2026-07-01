import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { formatMoney } from '../../../lib/money'
import { useCashFlow } from '../hooks'
import { formatMonthShort } from '../utils'

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-lg)', fontSize: 12.5 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.name === 'income' ? 'var(--pos)' : 'var(--neg)' }}>
          {p.name === 'income' ? 'Ingresos' : 'Gastos'}: {formatMoney(String(Math.abs(p.value)), 'CLP')}
        </div>
      ))}
    </div>
  )
}

export function NetFlowChart() {
  const { data: cashFlow = [] } = useCashFlow(6)

  const chartData = cashFlow.map((p) => ({
    month: formatMonthShort(p.month),
    income: Number(p.income),
    expense: -Number(p.expense),
  }))

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600 }}>Flujo neto mensual</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Últimos 6 meses</div>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={chartData} barGap={2} barCategoryGap="30%">
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11.5, fill: 'var(--muted)', fontWeight: 500 }} />
          <ReferenceLine y={0} stroke="var(--border-strong)" strokeWidth={1} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--card-2)' }} />
          <Bar dataKey="income" fill="var(--pos)" radius={[4, 4, 0, 0]} maxBarSize={34} />
          <Bar dataKey="expense" fill="var(--neg)" radius={[0, 0, 4, 4]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
