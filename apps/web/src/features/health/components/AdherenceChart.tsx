import { formatMoney } from '../../../lib/money'
import type { FundAssessment, FundClassification } from '../types'

const CLS_COLOR: Record<FundClassification, string> = {
  available: 'var(--disp)',
  reserve: 'var(--res)',
  committed: 'var(--comp)',
}

const STATUS_TEAL = 'var(--disp)'
const STATUS_AMBER = 'var(--comp)'

function statusTag(diff: number): { label: string; color: string } {
  if (diff < -5) return { label: 'Bajo', color: STATUS_AMBER }
  if (diff > 5)  return { label: `+${Math.round(diff)} pts`, color: STATUS_TEAL }
  return { label: 'En meta', color: STATUS_TEAL }
}

interface Props {
  funds: FundAssessment[]
  totalBase: string
}

export function AdherenceChart({ funds, totalBase }: Props) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '22px 24px' }}>
      <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 4 }}>Objetivo vs. real</div>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 20 }}>
        Flujo neto de cada fondo en el período. La línea marca tu meta.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {funds.map((fund) => {
          const hasTarget = fund.targetPercentage > 0
          const isNegative = Number(fund.actualAmount) < 0
          const diff = fund.actualPercentage - fund.targetPercentage
          const tag = hasTarget ? statusTag(diff) : null
          const color = CLS_COLOR[fund.classification]
          const realW = `${Math.max(0, Math.min(fund.actualPercentage, 100)).toFixed(1)}%`
          const targetW = `${Math.min(fund.targetPercentage, 100).toFixed(1)}%`

          return (
            <div key={fund.fundId}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{fund.fundName}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {tag && (
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: tag.color }}>{tag.label}</span>
                  )}
                  <span style={{ fontSize: 13, color: isNegative ? STATUS_AMBER : 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(fund.actualAmount, 'CLP')}
                  </span>
                </div>
              </div>

              <div style={{ position: 'relative', height: 10, background: 'var(--card-2)', borderRadius: 6, overflow: 'visible' }}>
                <div style={{ height: '100%', borderRadius: 6, background: isNegative ? STATUS_AMBER : color, width: realW, transition: 'width .4s ease' }} />
                {hasTarget && (
                  <div style={{
                    position: 'absolute',
                    top: -4,
                    width: 2,
                    height: 18,
                    borderRadius: 2,
                    background: 'var(--text)',
                    opacity: 0.6,
                    left: targetW,
                  }} />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                <span style={{ color: isNegative ? STATUS_AMBER : 'var(--muted)' }}>
                  Real {fund.actualPercentage.toFixed(0)}%
                </span>
                {hasTarget && <span>Meta {fund.targetPercentage.toFixed(0)}%</span>}
              </div>
            </div>
          )
        })}
      </div>

      {Number(totalBase) === 0 && (
        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
          Sin ingresos registrados en el período
        </div>
      )}
    </div>
  )
}
