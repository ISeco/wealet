import { createContext } from 'react'
import type { LoginPayload, RegisterPayload, User } from './types'

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refetchUser: () => Promise<void>
  loginWithGoogle: (accessToken: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
