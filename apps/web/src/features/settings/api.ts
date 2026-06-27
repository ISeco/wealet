import { apiFetch } from '../../lib/api/client'
import { API_BASE_URL } from '../../lib/api/config'
import { getAccessToken } from '../../lib/api/tokenStore'
import type { ChangePasswordPayload, UpdateProfilePayload } from './types'
import type { User } from '../auth/types'

export function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  return apiFetch<User>('/users/me', { method: 'PATCH', body: payload })
}

export function changePassword(payload: ChangePasswordPayload): Promise<void> {
  return apiFetch<void>('/auth/change-password', { method: 'POST', body: payload })
}

export async function exportAll(): Promise<void> {
  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/export`, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) throw new Error('Error al exportar')
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'wealet-export.xlsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
