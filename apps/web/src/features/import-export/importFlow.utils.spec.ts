import { describe, expect, it } from 'vitest'
import { deriveRowsToCommit, isValidYear, rowBadge, rowOpacity } from './importFlow.utils'
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

describe('rowBadge', () => {
  it('labels a duplicate row', () => {
    const row = buildRow({ duplicate: true })
    expect(rowBadge(row, [], new Set()).label).toBe('Duplicada')
  })

  it('labels a row with an unapproved unknown fund as skipped', () => {
    const row = buildRow({ fundName: 'Fondo Nuevo' })
    expect(rowBadge(row, ['Fondo Nuevo'], new Set()).label).toBe('Se omitirá')
  })

  it('labels a row with an approved unknown fund as valid', () => {
    const row = buildRow({ fundName: 'Fondo Nuevo' })
    expect(rowBadge(row, ['Fondo Nuevo'], new Set(['Fondo Nuevo'])).label).toBe('Válida')
  })

  it('labels a normal row as valid', () => {
    const row = buildRow()
    expect(rowBadge(row, [], new Set()).label).toBe('Válida')
  })
})

describe('rowOpacity', () => {
  it('dims a duplicate row', () => {
    expect(rowOpacity(buildRow({ duplicate: true }), [], new Set())).toBe(0.6)
  })

  it('dims a row with an unapproved unknown fund', () => {
    const row = buildRow({ fundName: 'Fondo Nuevo' })
    expect(rowOpacity(row, ['Fondo Nuevo'], new Set())).toBe(0.5)
  })

  it('keeps full opacity for a normal row', () => {
    expect(rowOpacity(buildRow(), [], new Set())).toBe(1)
  })
})
