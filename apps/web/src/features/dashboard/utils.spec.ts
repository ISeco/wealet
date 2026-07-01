import { describe, expect, it } from 'vitest'
import { formatMonthLabel, formatMonthShort, monthName, prevMonthName } from './utils'

describe('monthName', () => {
  it('returns the full month name for a YYYY-MM string', () => {
    expect(monthName('2026-01')).toBe('Enero')
    expect(monthName('2026-12')).toBe('Diciembre')
    expect(monthName('2026-06')).toBe('Junio')
  })
})

describe('formatMonthLabel', () => {
  it('returns full month name and year', () => {
    expect(formatMonthLabel('2026-01')).toBe('Enero 2026')
    expect(formatMonthLabel('2026-12')).toBe('Diciembre 2026')
  })
})

describe('formatMonthShort', () => {
  it('returns abbreviated month name from YYYY-MM-DD', () => {
    expect(formatMonthShort('2026-03-15')).toBe('Mar')
    expect(formatMonthShort('2026-07-01')).toBe('Jul')
  })
})

describe('prevMonthName', () => {
  it('returns previous month name in lowercase', () => {
    expect(prevMonthName('2026-02')).toBe('enero')
    expect(prevMonthName('2026-01')).toBe('diciembre') // wraps to December
  })
})
