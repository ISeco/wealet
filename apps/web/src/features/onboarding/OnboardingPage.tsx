import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { createFund } from './api'
import { useCompleteOnboarding } from './hooks/useCompleteOnboarding'
import { Step1Preset, type PresetOption } from './steps/Step1Preset'
import { Step2Funds } from './steps/Step2Funds'
import { Step3Success } from './steps/Step3Success'
import type { CreateFundPayload } from '../funds/types'

export function OnboardingPage() {
  const { user } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selected, setSelected] = useState<PresetOption | null>(null)
  const [customFunds, setCustomFunds] = useState<CreateFundPayload[]>([])
  const [addFundError, setAddFundError] = useState<string | null>(null)

  const { complete, isPending, error } = useCompleteOnboarding()

  async function handleAddFund(fund: CreateFundPayload) {
    setAddFundError(null)
    try {
      await createFund(fund)
      setCustomFunds((prev) => [...prev, fund])
    } catch (err) {
      setAddFundError(err instanceof Error ? err.message : 'No se pudo crear el fondo.')
    }
  }

  function handleRemoveFund(index: number) {
    setCustomFunds((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleConfirmStep2() {
    if (!selected) return
    const ok = await complete(selected)
    if (ok) setStep(3)
  }

  async function handleExcelComplete() {
    if (!selected) return
    const ok = await complete(selected)
    if (ok) setStep(3)
  }

  const dots = [1, 2, 3].map((n) => ({
    width: n === step ? 24 : 8,
    active: n === step,
  }))

  const showNavFooter = step !== 3

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 32px' }}>
        <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-.02em', color: 'var(--text)' }}>Wealet</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {dots.map((d, i) => (
            <span
              key={i}
              style={{ height: 8, borderRadius: 4, transition: 'width .25s, background .25s', width: d.width, background: d.active ? 'var(--disp)' : 'var(--border-strong)', display: 'inline-block' }}
            />
          ))}
        </div>
        <button
          onClick={() => { window.location.href = '/login' }}
          style={{ border: 'none', background: 'none', color: 'var(--muted)', fontFamily: 'inherit', fontSize: 13.5, cursor: 'pointer' }}
        >
          Salir
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 24px 48px' }}>
        <div style={{ width: '100%', maxWidth: 780 }}>
          {step === 1 && (
            <Step1Preset selected={selected} onSelect={setSelected} />
          )}
          {step === 2 && selected && (
            <Step2Funds
              preset={selected}
              customFunds={customFunds}
              onAddFund={handleAddFund}
              onRemoveFund={handleRemoveFund}
              onConfirm={handleConfirmStep2}
              onExcelComplete={handleExcelComplete}
              isPending={isPending}
              error={error ?? addFundError}
            />
          )}
          {step === 3 && selected && (
            <Step3Success preset={selected} displayName={user?.displayName ?? null} />
          )}

          {/* Nav footer */}
          {showNavFooter && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 36 }}>
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, height: 46, padding: '0 22px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                  Atrás
                </button>
              )}
              {step === 1 && (
                <button
                  onClick={() => selected && setStep(2)}
                  disabled={!selected}
                  style={{ height: 46, padding: '0 30px', border: 'none', borderRadius: 9, background: selected ? 'var(--grad)' : 'var(--border)', color: selected ? '#fff' : 'var(--muted)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: selected ? 'pointer' : 'not-allowed', transition: 'all .15s' }}
                >
                  Siguiente
                </button>
              )}
              {step === 2 && selected !== 'excel' && (
                <button
                  onClick={handleConfirmStep2}
                  disabled={isPending}
                  style={{ height: 46, padding: '0 30px', border: 'none', borderRadius: 9, background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1, boxShadow: 'var(--shadow)' }}
                >
                  {isPending ? 'Configurando…' : 'Confirmar'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
