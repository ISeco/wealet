import type { ImportRowDto } from './types'

export function isValidYear(input: string): boolean {
  if (input.trim() === '') return false
  const parsed = Number(input)
  return Number.isInteger(parsed) && parsed >= 2000 && parsed <= 2100
}

export function deriveRowsToCommit(
  rows: ImportRowDto[],
  approvedFunds: Set<string>,
  unknownFunds: string[],
): ImportRowDto[] {
  return rows.filter(
    (row) => !row.duplicate && (!unknownFunds.includes(row.fundName) || approvedFunds.has(row.fundName)),
  )
}

export function rowBadge(
  row: ImportRowDto,
  unknownFunds: string[],
  approvedFunds: Set<string>,
): { label: string; bg: string; color: string } {
  if (row.duplicate) return { label: 'Duplicada', bg: 'var(--warn-bg)', color: 'var(--warn)' }
  if (unknownFunds.includes(row.fundName) && !approvedFunds.has(row.fundName)) {
    return { label: 'Se omitirá', bg: 'var(--card-2)', color: 'var(--muted)' }
  }
  return { label: 'Válida', bg: 'var(--pos-bg)', color: 'var(--pos)' }
}

export function rowOpacity(row: ImportRowDto, unknownFunds: string[], approvedFunds: Set<string>): number {
  if (row.duplicate) return 0.6
  if (unknownFunds.includes(row.fundName) && !approvedFunds.has(row.fundName)) return 0.5
  return 1
}
