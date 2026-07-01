import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { completeOnboarding, createPresetFunds, setHealthFramework } from '../api'
import type { PresetOption } from '../steps/Step1Preset'

const PRESET_TO_FRAMEWORK = {
  jars_eker: 'jars_eker' as const,
  '50_30_20': '50_30_20' as const,
  profit_first: 'profit_first' as const,
}

export function useCompleteOnboarding() {
  const qc = useQueryClient()
  const { refetchUser } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function complete(preset: PresetOption, monthlyIncome?: string, isReconfigure?: boolean): Promise<boolean> {
    setIsPending(true)
    setError(null)
    try {
      if (preset === 'jars_eker' || preset === '50_30_20' || preset === 'profit_first') {
        await createPresetFunds(preset)
        await setHealthFramework(PRESET_TO_FRAMEWORK[preset], monthlyIncome)
      } else {
        await setHealthFramework('fondos')
      }
      if (!isReconfigure) {
        await completeOnboarding()
      }
      await refetchUser()
      qc.invalidateQueries({ queryKey: ['funds'] })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.')
      return false
    } finally {
      setIsPending(false)
    }
  }

  return { complete, isPending, error }
}
