import { API_BASE_URL } from './config'
import { setAccessToken } from './tokenStore'
import type { AuthResponse } from '../../features/auth/types'

let refreshPromise: Promise<AuthResponse> | null = null

async function doRefresh(): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    setAccessToken(null)
    throw new Error('refresh failed')
  }

  const data = (await response.json()) as AuthResponse
  setAccessToken(data.accessToken)
  return data
}

// Single-flight: every caller (silent bootstrap on app load, the 401 retry
// path) shares one in-flight refresh instead of firing concurrent requests —
// the backend revokes all tokens if the same refresh cookie is used twice.
export function refreshSession(): Promise<AuthResponse> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}
