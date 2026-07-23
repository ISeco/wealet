import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFund, deleteFund, getFundHistory, getFundMonths, listFunds, updateFund } from './api'
import type { CreateFundPayload, UpdateFundPayload } from './types'

export function useFunds() {
  return useQuery({
    queryKey: ['funds'],
    queryFn: () => listFunds(),
  })
}

export function useFundsAll() {
  return useQuery({
    queryKey: ['funds', 'all'],
    queryFn: () => listFunds(true),
  })
}

export function useFundHistory(id: string) {
  return useQuery({
    queryKey: ['funds', id, 'history'],
    queryFn: () => getFundHistory(id),
    enabled: !!id,
  })
}

export function useFundMonths(fundId: string) {
  return useQuery({
    queryKey: ['funds', fundId, 'months'],
    queryFn: () => getFundMonths(fundId),
    enabled: !!fundId,
  })
}

export function useCreateFund() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateFundPayload) => createFund(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funds'] })
    },
  })
}

export function useUpdateFund() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFundPayload }) =>
      updateFund(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['funds'] })
      qc.invalidateQueries({ queryKey: ['funds', id, 'history'] })
    },
  })
}

export function useDeleteFund() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteFund(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funds'] })
    },
  })
}
