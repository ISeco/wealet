import { useState } from 'react'
import { createFund } from '../api'
import { useCompleteOnboarding } from './useCompleteOnboarding'
import { useExcelImportFlow } from '../../import-export/useExcelImportFlow'
import { useAllocation, useHealthProfile } from '../../health/hooks'
import type { PresetOption } from '../steps/Step1Preset'
import type { CreateFundPayload } from '../../funds/types'
import type { HealthFramework } from '../../health/types'

const SLOT_PRESETS: PresetOption[] = ['jars_eker', '50_30_20', 'profit_first']

export function useOnboardingFlow(isReconfigure: boolean) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selected, setSelected] = useState<PresetOption | null>(null)
  const [customFunds, setCustomFunds] = useState<CreateFundPayload[]>([])
  const [addFundError, setAddFundError] = useState<string | null>(null)
  const [incomeAmount, setIncomeAmount] = useState('')
  const [showFrameworkWarning, setShowFrameworkWarning] = useState(false)
  const excelFlow = useExcelImportFlow()
  const { data: healthProfile } = useHealthProfile()
  const { data: currentAllocation } = useAllocation()
  const { complete, isPending, error } = useCompleteOnboarding()

  // Income for the current month is already registered (HealthProfile.monthlyIncome or a
  // MonthlyAllocation row) — skip re-asking for it when just switching framework mid-month.
  const existingIncome = currentAllocation?.totalAmount ?? healthProfile?.monthlyIncome ?? undefined
  const skipIncomeStep = isReconfigure && !!existingIncome

  // 'excel' doesn't pick a framework directly, but completing it implicitly
  // sets 'fondos' (see useCompleteOnboarding) — treat it the same way here.
  const targetFramework: HealthFramework | null =
    selected === 'excel' ? 'fondos' : (selected as HealthFramework | null)

  const willChangeFramework =
    isReconfigure &&
    targetFramework !== null &&
    healthProfile !== undefined &&
    targetFramework !== healthProfile.framework

  const isSlotPreset = selected ? SLOT_PRESETS.includes(selected) : false
  const showsIncomeStep = isSlotPreset && !skipIncomeStep
  const totalSteps = showsIncomeStep ? 4 : 3

  // Map internal step (1-4) to dot position (1-totalSteps)
  const dotStep = showsIncomeStep ? step : step === 4 ? 3 : step
  const dots = Array.from({ length: totalSteps }, (_, i) => ({
    active: i + 1 === dotStep,
    width: i + 1 === dotStep ? 24 : 8,
  }))

  function goToStep2() {
    if (!selected) return
    if (willChangeFramework) {
      setShowFrameworkWarning(true)
      return
    }
    setStep(2)
  }

  function goBack() {
    setStep(step === 3 ? 2 : 1)
  }

  function confirmFrameworkChange() {
    setShowFrameworkWarning(false)
    setStep(2)
  }

  function closeFrameworkWarning() {
    setShowFrameworkWarning(false)
  }

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
    if (showsIncomeStep) {
      setStep(3)
    } else if (isSlotPreset) {
      const ok = await complete(selected, existingIncome, isReconfigure)
      if (ok) setStep(4)
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

  return {
    step,
    selected,
    setSelected,
    customFunds,
    addFundError,
    incomeAmount,
    setIncomeAmount,
    excelFlow,
    healthProfile,
    showFrameworkWarning,
    targetFramework,
    willChangeFramework,
    isSlotPreset,
    skipIncomeStep,
    existingIncome,
    totalSteps,
    dots,
    isPending,
    error,
    goToStep2,
    goBack,
    confirmFrameworkChange,
    closeFrameworkWarning,
    handleAddFund,
    handleRemoveFund,
    handleConfirmStep2,
    handleConfirmIncome,
    handleExcelComplete,
  }
}
