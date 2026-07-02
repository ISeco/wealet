import { describe, expect, it } from 'vitest'
import { computeProposed, drawerReducer, getFrameworkFunds } from './allocationDrawer.utils'
import type { Fund } from '../funds/types'

function buildFund(overrides: Partial<Fund> = {}): Fund {
  return {
    id: 'f1',
    name: 'Fund',
    classification: 'available',
    color: null,
    isOperative: false,
    countsForRunway: false,
    frameworkSlot: null,
    targetPercentage: null,
    archivedAt: null,
    balance: '0',
    balanceFormatted: '$0',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

describe('getFrameworkFunds', () => {
  it('returns funds with no frameworkSlot for "fondos"', () => {
    const funds = [
      buildFund({ id: 'a', frameworkSlot: null }),
      buildFund({ id: 'b', frameworkSlot: '50_30_20_necesidades' }),
    ]
    expect(getFrameworkFunds(funds, 'fondos').map((f) => f.id)).toEqual(['a'])
  })

  it('filters by slot prefix for slot-based frameworks', () => {
    const funds = [
      buildFund({ id: 'a', frameworkSlot: '50_30_20_necesidades' }),
      buildFund({ id: 'b', frameworkSlot: 'jars_diversion' }),
    ]
    expect(getFrameworkFunds(funds, '50_30_20').map((f) => f.id)).toEqual(['a'])
  })

  it('excludes archived funds', () => {
    const funds = [buildFund({ id: 'a', frameworkSlot: null, archivedAt: '2026-01-01' })]
    expect(getFrameworkFunds(funds, 'fondos')).toEqual([])
  })
})

describe('computeProposed', () => {
  it('splits evenly when no fund has a target percentage', () => {
    const funds = [buildFund({ id: 'a' }), buildFund({ id: 'b' }), buildFund({ id: 'c' })]
    const result = computeProposed(funds, 100n)
    expect(result).toEqual({ a: '34', b: '33', c: '33' })
  })

  it('distributes by target percentage and assigns the remainder to the first funded slot', () => {
    const funds = [
      buildFund({ id: 'a', targetPercentage: 50 }),
      buildFund({ id: 'b', targetPercentage: 30 }),
      buildFund({ id: 'c', targetPercentage: 20 }),
    ]
    const result = computeProposed(funds, 999n)
    expect(BigInt(result.a) + BigInt(result.b) + BigInt(result.c)).toBe(999n)
  })

  it('returns an empty object for no active funds', () => {
    expect(computeProposed([], 1000n)).toEqual({})
  })
})

describe('drawerReducer', () => {
  it('SET_INCOME updates rawIncome only', () => {
    const state = { step: 'income' as const, rawIncome: '', amounts: {} }
    const next = drawerReducer(state, { type: 'SET_INCOME', rawIncome: '5000' })
    expect(next).toEqual({ step: 'income', rawIncome: '5000', amounts: {} })
  })

  it('ADVANCE_TO_DISTRIBUTION moves to distribution step with amounts', () => {
    const state = { step: 'income' as const, rawIncome: '5000', amounts: {} }
    const next = drawerReducer(state, {
      type: 'ADVANCE_TO_DISTRIBUTION',
      amounts: { a: '5000' },
      rawIncome: '5000',
    })
    expect(next.step).toBe('distribution')
    expect(next.amounts).toEqual({ a: '5000' })
  })

  it('CHANGE_AMOUNT strips non-digit characters', () => {
    const state = { step: 'distribution' as const, rawIncome: '5000', amounts: { a: '0' } }
    const next = drawerReducer(state, { type: 'CHANGE_AMOUNT', fundId: 'a', value: '1.500' })
    expect(next.amounts.a).toBe('1500')
  })
})
