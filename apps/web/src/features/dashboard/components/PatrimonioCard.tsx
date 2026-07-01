import { formatMoney } from '../../../lib/money'
import { useNetWorth } from '../hooks'

const SEGMENTS = [
  { key: 'available' as const, label: 'Disponible', color: 'var(--disp)' },
  { key: 'reserve' as const, label: 'Reserva', color: 'var(--res)' },
  { key: 'committed' as const, label: 'Comprometido', color: 'var(--comp)' },
]

function ChangeBadge({ changePercent }: { changePercent: number | null | undefined }) {
  if (changePercent == null) return null
  const positive = changePercent >= 0
  const formatted = `${positive ? '+' : ''}${changePercent.toFixed(1)}%`
  const color = positive ? 'var(--pos)' : 'var(--neg)'
  const bg = positive ? 'var(--pos-bg)' : 'var(--neg-bg)'
  const Arrow = positive ? (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 18 18 6" /><polyline points="9 6 18 6 18 15" />
    </svg>
  ) : (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 6 18 18" /><polyline points="9 18 18 18 18 9" />
    </svg>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color, fontWeight: 600, background: bg, padding: '3px 8px', borderRadius: 20 }}>
      {Arrow}{formatted}
    </div>
  )
}

interface Props {
  month: string
}

export function PatrimonioCard({ month }: Props) {
  const { data, isLoading } = useNetWorth(month)

  const total = data?.total ?? '0'
  const totalNum = Number(BigInt(total))

  const segmentWidths = SEGMENTS.map(({ key }) => {
    const val = Number(BigInt(data?.[key] ?? '0'))
    return totalNum > 0 ? (val / totalNum) * 100 : 0
  })

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Patrimonio total
        </div>
        {!isLoading && <ChangeBadge changePercent={data?.changePercent} />}
      </div>

      <div style={{ fontSize: 38, fontWeight: 600, letterSpacing: '-0.025em', margin: '10px 0 18px', fontVariantNumeric: 'tabular-nums' }}>
        {isLoading ? '—' : formatMoney(total, 'CLP')}
      </div>

      <div style={{ display: 'flex', height: 12, borderRadius: 7, overflow: 'hidden', gap: 2, marginBottom: 14 }}>
        {SEGMENTS.map(({ key, color }, i) => (
          <div key={key} style={{ width: `${segmentWidths[i]}%`, background: color }} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {SEGMENTS.map(({ key, label, color }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: color }} />
            <div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{label}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {isLoading ? '—' : formatMoney(data?.[key] ?? '0', 'CLP')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
