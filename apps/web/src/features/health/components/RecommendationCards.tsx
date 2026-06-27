import type { Recommendation } from '../utils'

function IconCheck({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconUp({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  )
}

function IconDown({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

interface Props {
  recommendations: Recommendation[]
}

export function RecommendationCards({ recommendations }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 20 }}>
      {recommendations.map((rec, i) => (
        <div
          key={i}
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '18px 18px 16px' }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: rec.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            {rec.icon === 'check' && <IconCheck color={rec.iconColor} />}
            {rec.icon === 'up'    && <IconUp    color={rec.iconColor} />}
            {rec.icon === 'down'  && <IconDown  color={rec.iconColor} />}
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>{rec.title}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>{rec.description}</div>
        </div>
      ))}
    </div>
  )
}
