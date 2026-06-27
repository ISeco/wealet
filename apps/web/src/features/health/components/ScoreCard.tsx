import { useState } from 'react'
import type { HealthFramework } from '../types'
import { FRAMEWORK_ACTIVATE_WARNING, FRAMEWORK_LABELS } from '../utils'

const GRAD = 'linear-gradient(120deg,#1FA9E0 0%,#16A89A 52%,#6BBF3F 100%)'
const SCORE_GRAD = 'linear-gradient(120deg,#7FD4FF,#5DE0C8 52%,#A7E07A)'

interface Props {
  score: number
  description: string
  selectedFramework: HealthFramework
  activeFramework: HealthFramework
  onActivate: () => Promise<void>
}

export function ScoreCard({ score, description, selectedFramework, activeFramework, onActivate }: Props) {
  const isActive = selectedFramework === activeFramework
  const title = FRAMEWORK_LABELS[selectedFramework]
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onActivate()
      setConfirming(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#0F2240', borderRadius: 14, padding: 24, position: 'relative', overflow: 'hidden', minHeight: 220, boxShadow: 'var(--shadow)' }}>
      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: GRAD, opacity: 0.16, pointerEvents: 'none' }} />
      {/* Blob */}
      <div style={{ position: 'absolute', left: -30, bottom: -40, width: 160, height: 160, borderRadius: '50%', background: GRAD, opacity: 0.22, filter: 'blur(8px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,.72)', marginBottom: 10 }}>
          Adherencia
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{
            fontSize: 56,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
            background: SCORE_GRAD,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {score}
          </span>
          <span style={{ fontSize: 24, fontWeight: 500, color: 'rgba(255,255,255,.8)' }}>/100</span>
        </div>

        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 8 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.74)', lineHeight: 1.5, marginTop: 6 }}>{description}</div>

        {isActive ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 18, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,.14)', padding: '5px 11px', borderRadius: 20, color: 'rgba(255,255,255,.85)' }}>
            Framework activo
          </div>
        ) : confirming ? (
          <div style={{ marginTop: 16, background: 'rgba(0,0,0,.25)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: 'rgba(255,255,255,.8)', lineHeight: 1.55 }}>
              {FRAMEWORK_ACTIVATE_WARNING[selectedFramework]}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleConfirm}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: 8,
                  border: 'none',
                  fontFamily: 'inherit',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: loading ? 'default' : 'pointer',
                  background: 'rgba(255,255,255,.92)',
                  color: '#0F2240',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Activando…' : 'Confirmar'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,.25)',
                  fontFamily: 'inherit',
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: loading ? 'default' : 'pointer',
                  background: 'transparent',
                  color: 'rgba(255,255,255,.8)',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            style={{
              marginTop: 18,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              background: 'rgba(255,255,255,.14)',
              border: '1px solid rgba(255,255,255,.22)',
              padding: '6px 14px',
              borderRadius: 20,
              color: 'rgba(255,255,255,.9)',
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'background .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.22)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.14)' }}
          >
            Usar este framework
          </button>
        )}
      </div>
    </div>
  )
}
