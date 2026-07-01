import { API_BASE_URL } from './config'
import { getAccessToken } from './tokenStore'
import { refreshSession } from './refreshGate'

export class ApiError extends Error {
  statusCode: number
  error: string

  constructor(statusCode: number, message: string, error: string) {
    super(message)
    this.statusCode = statusCode
    this.error = error
  }
}

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  _retry?: boolean
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { _retry, headers, body, ...rest } = options
  const token = getAccessToken()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && !_retry) {
    try {
      await refreshSession()
      return apiFetch<T>(path, { ...options, _retry: true })
    } catch {
      // refresh failed — fall through and surface the original 401 below
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new ApiError(
      response.status,
      errorBody?.message ?? response.statusText,
      errorBody?.error ?? 'Error',
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
