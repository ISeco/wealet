import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { createFund } from './api'
import { useCompleteOnboarding } from './hooks/useCompleteOnboarding'
import { Step1Preset, type PresetOption } from './steps/Step1Preset'
import { EXCEL_YEAR_FORM_ID, Step2Funds } from './steps/Step2Funds'
import { Step3Income } from './steps/Step3Income'
import { Step3Success } from './steps/Step3Success'
import type { CreateFundPayload } from '../funds/types'

const SLOT_PRESETS: PresetOption[] = ['jars_eker', '50_30_20', 'profit_first']

export function OnboardingPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const isReconfigure = searchParams.get('from') === 'settings'
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selected, setSelected] = useState<PresetOption | null>(null)
  const [customFunds, setCustomFunds] = useState<CreateFundPayload[]>([])
  const [addFundError, setAddFundError] = useState<string | null>(null)
  const [incomeAmount, setIncomeAmount] = useState('')
  const [excelYearState, setExcelYearState] = useState({ awaiting: false, isPending: false })

  const { complete, isPending, error } = useCompleteOnboarding()

  const isSlotPreset = selected ? SLOT_PRESETS.includes(selected) : false
  const totalSteps = isSlotPreset ? 4 : 3

  // Map internal step (1-4) to dot position (1-totalSteps)
  const dotStep = isSlotPreset ? step : step === 4 ? 3 : step

  const dots = Array.from({ length: totalSteps }, (_, i) => ({
    active: i + 1 === dotStep,
    width: i + 1 === dotStep ? 24 : 8,
  }))

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
    if (isSlotPreset) {
      setStep(3)
    } else {
      const ok = await complete(selected, undefined, isReconfigure)
      if (ok) setStep(4)
    }
  }

  async function handleConfirmIncome(income?: string) {
    if (!selected) return
    const ok = await complete(selected, income, isReconfigure)
    if (ok) setStep(4)
  }

  async function handleExcelComplete() {
    if (!selected) return
    const ok = await complete(selected, undefined, isReconfigure)
    if (ok) setStep(4)
  }

  const showNavFooter = step !== 4

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
              onExcelYearPromptState={setExcelYearState}
            />
          )}
          {step === 3 && (
            <Step3Income
              rawAmount={incomeAmount}
              onChange={setIncomeAmount}
            />
          )}
          {step === 4 && selected && (
            <Step3Success preset={selected} displayName={user?.displayName ?? null} isReconfigure={isReconfigure} />
          )}

          {/* Nav footer */}
          {showNavFooter && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 36 }}>
              {error && step === 3 && (
                <div style={{ fontSize: 13, color: 'var(--neg)', fontWeight: 500 }}>{error}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Atrás */}
              {(step === 2 || step === 3) && (
                <button
                  onClick={() => setStep(step === 3 ? 2 : 1)}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, height: 46, padding: '0 22px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                  Atrás
                </button>
              )}

              {/* Siguiente (step 1) */}
              {step === 1 && (
                <button
                  onClick={() => selected && setStep(2)}
                  disabled={!selected}
                  style={{ height: 46, padding: '0 30px', border: 'none', borderRadius: 9, background: selected ? 'var(--grad)' : 'var(--border)', color: selected ? '#fff' : 'var(--muted)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: selected ? 'pointer' : 'not-allowed', transition: 'all .15s' }}
                >
                  Siguiente
                </button>
              )}

              {/* Continuar (step 2, excel path, waiting for a year) */}
              {step === 2 && selected === 'excel' && excelYearState.awaiting && (
                <button
                  type="submit"
                  form={EXCEL_YEAR_FORM_ID}
                  disabled={excelYearState.isPending}
                  style={{ height: 46, padding: '0 30px', border: 'none', borderRadius: 9, background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: excelYearState.isPending ? 'not-allowed' : 'pointer', opacity: excelYearState.isPending ? 0.7 : 1, boxShadow: 'var(--shadow)' }}
                >
                  {excelYearState.isPending ? 'Analizando…' : 'Continuar'}
                </button>
              )}

              {/* Confirmar (step 2, no excel) */}
              {step === 2 && selected !== 'excel' && (
                <button
                  onClick={handleConfirmStep2}
                  disabled={isPending}
                  style={{ height: 46, padding: '0 30px', border: 'none', borderRadius: 9, background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1, boxShadow: 'var(--shadow)' }}
                >
                  {isPending ? 'Configurando…' : 'Confirmar'}
                </button>
              )}

              {/* Step 3: Saltar + Continuar */}
              {step === 3 && (
                <>
                  <button
                    onClick={() => handleConfirmIncome(undefined)}
                    disabled={isPending}
                    style={{ height: 46, padding: '0 20px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--card)', color: 'var(--muted)', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1 }}
                  >
                    Saltar por ahora
                  </button>
                  <button
                    onClick={() => handleConfirmIncome(incomeAmount || undefined)}
                    disabled={!incomeAmount || isPending}
                    style={{ height: 46, padding: '0 30px', border: 'none', borderRadius: 9, background: incomeAmount ? 'var(--grad)' : 'var(--border)', color: incomeAmount ? '#fff' : 'var(--muted)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: (!incomeAmount || isPending) ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1, boxShadow: incomeAmount ? 'var(--shadow)' : 'none', transition: 'all .15s' }}
                  >
                    {isPending ? 'Configurando…' : 'Continuar'}
                  </button>
                </>
              )}

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
