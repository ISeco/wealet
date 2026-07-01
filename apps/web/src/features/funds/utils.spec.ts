import { describe, expect, it } from 'vitest'
import { classColor, getFundChip, getInitials } from './utils'
import type { Fund } from './types'

function buildFund(overrides: Partial<Fund> = {}): Fund {
  return {
    id: 'f1',
    name: 'Operativa',
    classification: 'available',
    color: null,
    isOperative: false,
    countsForRunway: false,
    frameworkSlot: null,
    targetPercentage: null,
    archivedAt: null,
    balance: '100000',
    balanceFormatted: '$100.000',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('getInitials', () => {
  it('returns first letters of the first two words in uppercase', () => {
    expect(getInitials('Fondo Operativo')).toBe('FO')
  })

  it('returns first 2 characters of a single word', () => {
    expect(getInitials('Operativa')).toBe('OP')
  })

  it('handles extra whitespace between words', () => {
    expect(getInitials('Ahorro  Largo Plazo')).toBe('AL')
  })
})

describe('classColor', () => {
  it('returns teal token for available', () => {
    expect(classColor('available').color).toBe('var(--disp)')
    expect(classColor('available').label).toBe('Disponible')
  })

  it('returns blue token for reserve', () => {
    expect(classColor('reserve').color).toBe('var(--res)')
    expect(classColor('reserve').label).toBe('Reserva')
  })

  it('returns amber token for committed', () => {
    expect(classColor('committed').color).toBe('var(--comp)')
    expect(classColor('committed').label).toBe('Comprometido')
  })
})

describe('getFundChip', () => {
  it('uses fund.color when set', () => {
    const chip = getFundChip(buildFund({ color: '#FF5733' }))
    expect(chip.color).toBe('#FF5733')
    expect(chip.bg).toBe('#FF573322')
  })

  it('falls back to classification color when fund.color is null', () => {
    const chip = getFundChip(buildFund({ classification: 'reserve', color: null }))
    expect(chip.color).toBe('var(--res)')
  })
})
