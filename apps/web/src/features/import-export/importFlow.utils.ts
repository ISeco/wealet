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
