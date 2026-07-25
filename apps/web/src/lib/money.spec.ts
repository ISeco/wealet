import { describe, expect, it } from 'vitest'
import { formatMoney, formatThousands, parseMoney, convertToBaseMinor, formatForeignNote } from './money'

describe('parseMoney', () => {
  it('parses a plain CLP integer', () => {
    expect(parseMoney('1000', 'CLP')).toBe('1000')
  })

  it('removes thousand-separator dots (es-CL input format)', () => {
    // User types "1.000.500" → dots are thousands separators in es-CL
    expect(parseMoney('1.000.500', 'CLP')).toBe('1000500')
  })

  it('parses USD amount with comma decimal separator', () => {
    // "12.500,50" → remove dots → "12500,50" → replace comma with dot → "12500.50"
    // USD exponent = 2 → minor units = "1250050"
    expect(parseMoney('12.500,50', 'USD')).toBe('1250050')
  })

  it('throws when CLP amount has a decimal part', () => {
    expect(() => parseMoney('1000,50', 'CLP')).toThrow()
  })

  it('parses zero', () => {
    expect(parseMoney('0', 'CLP')).toBe('0')
  })

  it('throws for empty string', () => {
    expect(() => parseMoney('', 'CLP')).toThrow('Invalid amount')
  })

  it('throws for negative sign', () => {
    expect(() => parseMoney('-100', 'CLP')).toThrow('Invalid amount')
  })

  it('throws for unsupported currency', () => {
    expect(() => parseMoney('1000', 'ARS')).toThrow('Unsupported currency: ARS')
  })
})

describe('formatThousands', () => {
  it('adds es-CL dot separator for thousands', () => {
    expect(formatThousands('1000000')).toMatch(/1[.,]000[.,]000/)
  })

  it('returns empty string for empty input', () => {
    expect(formatThousands('')).toBe('')
  })

  it('returns "0" for zero', () => {
    expect(formatThousands('0')).toBe('0')
  })
})

// Smoke test: formatMoney is exported and callable
describe('formatMoney', () => {
  it('formats CLP amount without decimals', () => {
    const result = formatMoney('1000', 'CLP')
    expect(result).toMatch(/1\.000|1,000/)
  })
})

describe('convertToBaseMinor', () => {
  it('convierte USD a CLP con la tasa (caso tarjeta)', () => {
    expect(convertToBaseMinor('999', 'USD', 'CLP', '948.95')).toBe('9480')
  })

  it('redondea al entero más cercano de la base', () => {
    expect(convertToBaseMinor('100', 'USD', 'CLP', '950.5')).toBe('951')
  })
})

describe('formatForeignNote', () => {
  it('arma la nota con monto original y tasa', () => {
    // "US$9,99 · TC 948,95" — separadores es-CL
    const note = formatForeignNote('999', 'USD', '948.95')
    expect(note).toContain('9,99')
    expect(note).toContain('948,95')
    expect(note).toContain('TC')
  })
})
