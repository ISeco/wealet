import { ApiError, apiFetch } from '../../lib/api/client'
import { API_BASE_URL } from '../../lib/api/config'
import { getAccessToken } from '../../lib/api/tokenStore'
import type { ImportCommitResultDto, ImportPreviewResponseDto, ImportRowDto } from './types'

export async function importPreview(file: File, year?: number): Promise<ImportPreviewResponseDto> {
  const formData = new FormData()
  formData.append('file', file)
  if (year !== undefined) {
    formData.append('year', String(year))
  }
  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/import/preview`, {
    method: 'POST',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new ApiError(
      response.status,
      errorBody?.message ?? response.statusText,
      errorBody?.error ?? 'Error',
    )
  }
  return response.json() as Promise<ImportPreviewResponseDto>
}

export function importCommit(rows: ImportRowDto[]): Promise<ImportCommitResultDto> {
  return apiFetch<ImportCommitResultDto>('/import/commit', {
    method: 'POST',
    body: { rows },
  })
}
