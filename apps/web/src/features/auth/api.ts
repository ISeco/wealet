import { apiFetch } from '../../lib/api/client'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from './types'

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: payload })
}

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: payload })
}

export function logout(): Promise<void> {
  return apiFetch<void>('/auth/logout', { method: 'POST' })
}

export function getMe(): Promise<User> {
  return apiFetch<User>('/users/me')
}
