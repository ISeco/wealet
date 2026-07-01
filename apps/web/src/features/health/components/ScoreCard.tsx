import { useState } from 'react'
import type { HealthFramework } from '../types'
import { FRAMEWORK_ACTIVATE_WARNING, FRAMEWORK_LABELS } from '../utils'

const GRAD = 'linear-gradient(120deg,#1FA9E0 0%,#16A89A 52%,#6BBF3F 100%)'
const SCORE_GRAD = 'linear-gradient(120deg,#7FD4FF,#5DE0C8 52%,#A7E07A)'
const SLOT_FRAMEWORKS: HealthFramework[] = ['50_30_20', 'jars_eker', 'profit_first']

const fmtIncome = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })

interface Props {
  score: number
  description: string
  selectedFramework: HealthFramework
  activeFramework: HealthFramework
  monthlyIncome: string | null
  onActivate: () => Promise<void>
  onUpdateIncome: (value: string) => Promise<void>
}

export function ScoreCard({ score, description, selectedFramework, activeFramework, monthlyIncome, onActivate, onUpdateIncome }: Props) {
  const isActive = selectedFramework === activeFramework
  const isSlot = SLOT_FRAMEWORKS.includes(activeFramework)
  const title = FRAMEWORK_LABELS[selectedFramework]
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingIncome, setEditingIncome] = useState(false)
  const [incomeRaw, setIncomeRaw] = useState('')
  const [incomeSaving, setIncomeSaving] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onActivate()
      setConfirming(false)
    } finally {
      setLoading(false)
    }
  }

  function openIncomeEdit() {
    setIncomeRaw(monthlyIncome ?? '')
    setEditingIncome(true)
  }

  async function handleSaveIncome() {
    const parsed = parseInt(incomeRaw || '0', 10)
    if (!parsed) { setEditingIncome(false); return }
    setIncomeSaving(true)
    try {
      await onUpdateIncome(String(parsed))
      setEditingIncome(false)
    } finally {
      setIncomeSaving(false)
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
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,.14)', padding: '5px 11px', borderRadius: 20, color: 'rgba(255,255,255,.85)' }}>
              Framework activo
            </div>

            {/* Monthly income — only for slot-based frameworks */}
            {isSlot && (
              <div style={{ marginTop: 12 }}>
                {editingIncome ? (
                  <div style={{ background: 'rgba(0,0,0,.25)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.6)', marginBottom: 6 }}>Ingreso mensual neto (CLP)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input
                        autoFocus
                        type="text"
                        inputMode="numeric"
                        value={incomeRaw ? parseInt(incomeRaw, 10).toLocaleString('es-CL') : ''}
                        onChange={(e) => setIncomeRaw(e.target.value.replace(/\D/g, ''))}
                        placeholder="0"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          height: 36,
                          padding: '0 10px',
                          borderRadius: 7,
                          border: '1px solid rgba(255,255,255,.22)',
                          background: 'rgba(255,255,255,.1)',
                          color: '#fff',
                          fontFamily: 'inherit',
                          fontSize: 14,
                          fontVariantNumeric: 'tabular-nums',
                          outline: 'none',
                        }}
                      />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={handleSaveIncome}
                          disabled={incomeSaving || !incomeRaw}
                          style={{ flex: 1, height: 32, borderRadius: 7, border: 'none', background: 'rgba(255,255,255,.9)', color: '#0F2240', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: incomeSaving || !incomeRaw ? 'default' : 'pointer', opacity: incomeSaving || !incomeRaw ? 0.6 : 1 }}
                        >
                          {incomeSaving ? 'Guardando…' : 'Guardar'}
                        </button>
                        <button
                          onClick={() => setEditingIncome(false)}
                          disabled={incomeSaving}
                          style={{ height: 32, padding: '0 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,.22)', background: 'transparent', color: 'rgba(255,255,255,.8)', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={openIncomeEdit}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'rgba(255,255,255,.6)', fontFamily: 'inherit', fontSize: 12, maxWidth: '100%', overflow: 'hidden' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {monthlyIncome && Number(monthlyIncome) > 0
                        ? <>{fmtIncome.format(Number(monthlyIncome))}<span style={{ opacity: 0.6 }}>/mes</span></>
                        : <span style={{ color: 'rgba(255,255,255,.45)' }}>Configurar ingreso mensual</span>
                      }
                    </span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, flexShrink: 0 }}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
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
                style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: loading ? 'default' : 'pointer', background: 'rgba(255,255,255,.92)', color: '#0F2240', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Activando…' : 'Confirmar'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={loading}
                style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid rgba(255,255,255,.25)', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500, cursor: loading ? 'default' : 'pointer', background: 'transparent', color: 'rgba(255,255,255,.8)' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.22)', padding: '6px 14px', borderRadius: 20, color: 'rgba(255,255,255,.9)', fontFamily: 'inherit', cursor: 'pointer', transition: 'background .15s' }}
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
