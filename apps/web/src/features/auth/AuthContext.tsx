import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { refreshSession } from '../../lib/api/refreshGate'
import { setAccessToken } from '../../lib/api/tokenStore'
import * as authApi from './api'
import { AuthContext, type AuthContextValue, type AuthStatus } from './context'
import type { LoginPayload, RegisterPayload, User } from './types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('idle')

  useEffect(() => {
    let cancelled = false

    refreshSession()
      .then((response) => {
        if (cancelled) return
        setUser(response.user)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        setUser(null)
        setStatus('unauthenticated')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload)
    setAccessToken(response.accessToken)
    setUser(response.user)
    setStatus('authenticated')
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authApi.register(payload)
    setAccessToken(response.accessToken)
    setUser(response.user)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // best-effort: clear local session regardless of API result
    }
    setAccessToken(null)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const refetchUser = useCallback(async () => {
    const me = await authApi.getMe()
    setUser(me)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout, refetchUser }),
    [user, status, login, register, logout, refetchUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
