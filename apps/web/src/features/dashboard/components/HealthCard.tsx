import { useNavigate } from 'react-router-dom'
import { classColor } from '../../funds/utils'
import { formatMoney } from '../../../lib/money'
import { useHealthAssessment, useHealthProfile } from '../../health/hooks'
import { FRAMEWORK_LABELS } from '../../health/utils'

function statusTag(diff: number): { label: string; color: string } {
  if (diff < -5) return { label: 'Bajo', color: 'var(--comp)' }
  if (diff > 5)  return { label: `+${Math.round(diff)} pts`, color: 'var(--disp)' }
  return { label: 'En meta', color: 'var(--disp)' }
}

interface Props {
  month?: string
}

export function HealthCard({ month }: Props) {
  const navigate = useNavigate()
  const { data: profile } = useHealthProfile()
  const { data: assessment, isLoading } = useHealthAssessment(month)

  const framework = profile?.framework ?? 'fondos'
  const allFunds = assessment?.funds ?? []
  const funds = framework === 'fondos' && allFunds.length > 3
    ? [...allFunds].sort((a, b) => (BigInt(b.actualAmount) > BigInt(a.actualAmount) ? 1 : -1)).slice(0, 3)
    : allFunds
  const hiddenCount = allFunds.length - funds.length

  return (
    <div
      onClick={() => navigate('/salud')}
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '20px 24px', cursor: 'pointer', transition: 'border-color .15s, transform .15s, box-shadow .15s' }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.borderColor = 'var(--border-strong)'
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = 'var(--shadow-lg)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.borderColor = 'var(--border)'
        el.style.transform = ''
        el.style.boxShadow = 'var(--shadow)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600 }}>Salud financiera</div>
        {profile && (
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--res)', background: 'var(--res-bg)', padding: '3px 9px', borderRadius: 20 }}>
            {FRAMEWORK_LABELS[framework]}
          </span>
        )}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 18 }}>
        Adherencia del mes vs. tu objetivo
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 10, background: 'var(--card-2)', borderRadius: 6 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {funds.map((fund) => {
            const diff = fund.actualPercentage - fund.targetPercentage
            const color = classColor(fund.classification).color
            const tag = statusTag(diff)
            const realW = `${Math.min(fund.actualPercentage, 100).toFixed(1)}%`
            const targetW = `${Math.min(fund.targetPercentage, 100).toFixed(1)}%`

            return (
              <div key={fund.fundId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{fund.fundName}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {fund.actualPercentage.toFixed(0)}% · meta {fund.targetPercentage.toFixed(0)}%
                  </span>
                </div>
                <div style={{ position: 'relative', height: 10, background: 'var(--card-2)', borderRadius: 6, overflow: 'visible' }}>
                  <div style={{ height: '100%', borderRadius: 6, background: color, width: realW }} />
                  <div style={{ position: 'absolute', top: -4, width: 2, height: 18, borderRadius: 2, background: 'var(--text)', opacity: 0.6, left: targetW }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 11 }}>
                  <span style={{ color: tag.color, fontWeight: 600 }}>{tag.label}</span>
                  <span style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{formatMoney(fund.actualAmount, 'CLP')}</span>
                </div>
              </div>
            )
          })}
          {hiddenCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>+{hiddenCount} fondos más</span>
              <span style={{ fontSize: 12, color: 'var(--info)', fontWeight: 600 }}>Ver todos</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
