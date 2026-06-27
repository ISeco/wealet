import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateFund } from '../funds/api'
import { changePassword, updateProfile } from './api'
import type { ChangePasswordPayload, UpdateProfilePayload } from './types'

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  })
}

export function useToggleFundRunway() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, countsForRunway }: { id: string; countsForRunway: boolean }) =>
      updateFund(id, { countsForRunway }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['funds'] }),
  })
}
