import { describe, expect, it } from 'vitest'
import { computeScore, getRecommendations } from './utils'
import type { FundAssessment } from './types'

function buildFund(overrides: Partial<FundAssessment> = {}): FundAssessment {
  return {
    fundId: 'f1',
    fundName: 'Test',
    classification: 'available',
    frameworkSlot: null,
    targetPercentage: 50,
    actualPercentage: 50,
    actualAmount: '100000',
    ...overrides,
  }
}

describe('computeScore', () => {
  it('returns 0 for an empty fund list', () => {
    expect(computeScore([])).toBe(0)
  })

  it('returns 100 when all funds are exactly on target', () => {
    const funds = [
      buildFund({ targetPercentage: 50, actualPercentage: 50 }),
      buildFund({ targetPercentage: 30, actualPercentage: 30 }),
    ]
    expect(computeScore(funds)).toBe(100)
  })

  it('subtracts total absolute deviation from 100', () => {
    // |40 - 50| = 10 → score = 90
    expect(computeScore([buildFund({ targetPercentage: 50, actualPercentage: 40 })])).toBe(90)
  })

  it('clamps to 0 when total deviation exceeds 100', () => {
    const funds = [
      buildFund({ targetPercentage: 0, actualPercentage: 60 }),
      buildFund({ targetPercentage: 0, actualPercentage: 60 }),
    ]
    expect(computeScore(funds)).toBe(0)
  })
})

describe('getRecommendations', () => {
  it('produces one recommendation per unique classification', () => {
    const funds = [
      buildFund({ classification: 'available', targetPercentage: 30, actualPercentage: 30 }),
      buildFund({ classification: 'reserve', targetPercentage: 20, actualPercentage: 20 }),
      buildFund({ classification: 'committed', targetPercentage: 50, actualPercentage: 50 }),
    ]
    expect(getRecommendations(funds)).toHaveLength(3)
  })

  it('returns icon "down" when actual is more than 5% below target', () => {
    const [rec] = getRecommendations([
      buildFund({ classification: 'reserve', targetPercentage: 20, actualPercentage: 10 }),
    ])
    expect(rec.icon).toBe('down')
  })

  it('returns icon "up" when actual is more than 5% above target', () => {
    const [rec] = getRecommendations([
      buildFund({ classification: 'reserve', targetPercentage: 20, actualPercentage: 30 }),
    ])
    expect(rec.icon).toBe('up')
  })

  it('returns icon "check" when actual is within 5% of target', () => {
    const [rec] = getRecommendations([
      buildFund({ classification: 'available', targetPercentage: 50, actualPercentage: 54 }),
    ])
    expect(rec.icon).toBe('check')
  })

  it('aggregates multiple funds of the same classification before comparing', () => {
    // Two 'available' funds: total actual = 40, total target = 40 → diff = 0 → ok
    const funds = [
      buildFund({ classification: 'available', targetPercentage: 20, actualPercentage: 20 }),
      buildFund({ classification: 'available', targetPercentage: 20, actualPercentage: 20 }),
    ]
    const recs = getRecommendations(funds)
    expect(recs).toHaveLength(1)
    expect(recs[0].icon).toBe('check')
  })
})
