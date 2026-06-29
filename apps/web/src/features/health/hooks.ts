import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getHealthAssessment, getHealthProfile, updateHealthProfile, updateMonthlyIncome } from './api'
import type { HealthFramework } from './types'

export function useHealthProfile() {
  return useQuery({
    queryKey: ['health', 'profile'],
    queryFn: getHealthProfile,
  })
}

export function useHealthAssessment(month?: string) {
  return useQuery({
    queryKey: ['health', 'assessment', month ?? 'current'],
    queryFn: () => getHealthAssessment(month),
  })
}

export function useActivateFramework() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (framework: HealthFramework) => updateHealthProfile(framework),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['health', 'profile'], updatedProfile)
      queryClient.invalidateQueries({ queryKey: ['health', 'assessment'] })
      queryClient.invalidateQueries({ queryKey: ['funds'] })
    },
  })
}

export function useUpdateMonthlyIncome() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (monthlyIncome: string) => updateMonthlyIncome(monthlyIncome),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['health', 'profile'], updatedProfile)
      queryClient.invalidateQueries({ queryKey: ['health', 'assessment'] })
    },
  })
}
