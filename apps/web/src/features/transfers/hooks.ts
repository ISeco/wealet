import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTransfer, listTransfers } from './api'
import type { CreateTransferPayload, TransferQuery } from './types'

export function useTransfers(query: TransferQuery) {
  return useQuery({
    queryKey: ['transfers', query],
    queryFn: () => listTransfers(query),
  })
}

export function useCreateTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTransferPayload) => createTransfer(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transfers'] })
      qc.invalidateQueries({ queryKey: ['funds'] })
    },
  })
}
