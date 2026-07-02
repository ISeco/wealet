import { describe, expect, it } from 'vitest'
import { formatMonthLabel, formatMonthShort, monthName, prevMonthName, sortCategoriesByAmountDesc } from './utils'

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

describe('sortCategoriesByAmountDesc', () => {
  const cat = (categoryId: string, amount: string) => ({ categoryId, categoryName: categoryId, color: null, amount })

  it('sorts by amount descending', () => {
    const result = sortCategoriesByAmountDesc([cat('a', '100'), cat('b', '300'), cat('c', '200')])
    expect(result.map((c) => c.categoryId)).toEqual(['b', 'c', 'a'])
  })

  it('does not mutate the input array', () => {
    const input = [cat('a', '100'), cat('b', '300')]
    sortCategoriesByAmountDesc(input)
    expect(input.map((c) => c.categoryId)).toEqual(['a', 'b'])
  })

  it('handles amounts beyond Number precision correctly via BigInt comparison', () => {
    const result = sortCategoriesByAmountDesc([cat('small', '9007199254740993'), cat('big', '9007199254740994')])
    expect(result.map((c) => c.categoryId)).toEqual(['big', 'small'])
  })
})
