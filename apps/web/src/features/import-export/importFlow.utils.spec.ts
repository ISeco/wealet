import { describe, expect, it } from 'vitest'
import { deriveRowsToCommit, isValidYear } from './importFlow.utils'
import type { ImportRowDto } from './types'

describe('isValidYear', () => {
  it('accepts a plausible 4-digit year', () => {
    expect(isValidYear('2026')).toBe(true)
  })

  it('rejects a non-numeric string', () => {
    expect(isValidYear('abc')).toBe(false)
  })

  it('rejects a non-integer number', () => {
    expect(isValidYear('2026.5')).toBe(false)
  })

  it('rejects a year below 2000', () => {
    expect(isValidYear('1999')).toBe(false)
  })

  it('rejects a year above 2100', () => {
    expect(isValidYear('2101')).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(isValidYear('')).toBe(false)
  })
})

function buildRow(overrides: Partial<ImportRowDto> = {}): ImportRowDto {
  return {
    sheet: 'Enero 2026',
    cell: 'E4',
    fundName: 'Fondo Libre',
    amount: '10000',
    type: 'expense',
    description: 'Compra',
    occurredOn: '2026-01-04',
    dedupeHash: 'hash-1',
    duplicate: false,
    ...overrides,
  }
}

describe('deriveRowsToCommit', () => {
  it('includes a normal row', () => {
    const rows = [buildRow()]
    expect(deriveRowsToCommit(rows, new Set(), [])).toEqual(rows)
  })

  it('excludes a duplicate row', () => {
    const rows = [buildRow({ duplicate: true })]
    expect(deriveRowsToCommit(rows, new Set(), [])).toEqual([])
  })

  it('excludes a row whose fund is unknown and not approved', () => {
    const rows = [buildRow({ fundName: 'Fondo Nuevo' })]
    expect(deriveRowsToCommit(rows, new Set(), ['Fondo Nuevo'])).toEqual([])
  })

  it('includes a row whose fund is unknown but approved', () => {
    const rows = [buildRow({ fundName: 'Fondo Nuevo' })]
    expect(deriveRowsToCommit(rows, new Set(['Fondo Nuevo']), ['Fondo Nuevo'])).toEqual(rows)
  })
})
