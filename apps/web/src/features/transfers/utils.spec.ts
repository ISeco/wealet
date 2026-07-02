import { describe, expect, it } from 'vitest'
import { computeQuickAmounts, formatDateLabel, validateTransferAmount } from './utils'

describe('formatDateLabel', () => {
  it('formats a single-digit day and month', () => {
    expect(formatDateLabel('2026-01-05')).toBe('5 ene')
  })

  it('formats a double-digit day and the last month', () => {
    expect(formatDateLabel('2026-12-25')).toBe('25 dic')
  })
})

describe('computeQuickAmounts', () => {
  it('returns 25/50/75/100 percent splits of the balance', () => {
    expect(computeQuickAmounts(1000n)).toEqual([
      { label: '25%', value: 250n },
      { label: '50%', value: 500n },
      { label: '75%', value: 750n },
      { label: 'Todo', value: 1000n },
    ])
  })

  it('truncates fractional minor units instead of rounding', () => {
    expect(computeQuickAmounts(10n)).toEqual([
      { label: '25%', value: 2n },
      { label: '50%', value: 5n },
      { label: '75%', value: 7n },
      { label: 'Todo', value: 10n },
    ])
  })

  it('returns zero-value splits when the balance is zero', () => {
    expect(computeQuickAmounts(0n)).toEqual([
      { label: '25%', value: 0n },
      { label: '50%', value: 0n },
      { label: '75%', value: 0n },
      { label: 'Todo', value: 0n },
    ])
  })
})

describe('validateTransferAmount', () => {
  it('rejects a zero amount', () => {
    expect(validateTransferAmount(0n, 1000n)).toBe('El monto debe ser mayor a cero')
  })

  it('rejects a negative amount', () => {
    expect(validateTransferAmount(-500n, 1000n)).toBe('El monto debe ser mayor a cero')
  })

  it('rejects an amount greater than the available balance', () => {
    expect(validateTransferAmount(1500n, 1000n)).toBe('El monto supera el saldo disponible')
  })

  it('accepts an amount equal to the available balance', () => {
    expect(validateTransferAmount(1000n, 1000n)).toBeNull()
  })

  it('accepts an amount within the available balance', () => {
    expect(validateTransferAmount(500n, 1000n)).toBeNull()
  })
})
