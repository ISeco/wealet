import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAllocationCurrent,
  createAllocation,
  getHealthAssessment,
  getHealthProfile,
  updateHealthProfile,
  updateMonthlyIncome,
} from './api'
import type { CurrentAllocation, HealthFramework } from './types'

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

export function useAllocation() {
  return useQuery({
    queryKey: ['health', 'allocation', 'current'],
    queryFn: getAllocationCurrent,
  })
}

export function useCreateAllocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createAllocation,
    onSuccess: (data) => {
      qc.setQueryData<CurrentAllocation>(['health', 'allocation', 'current'], data)
      qc.invalidateQueries({ queryKey: ['health', 'assessment'] })
      qc.invalidateQueries({ queryKey: ['health', 'profile'] })
      qc.invalidateQueries({ queryKey: ['funds'] })
    },
  })
}
