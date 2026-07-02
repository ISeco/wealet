import { describe, expect, it } from 'vitest'
import { buildActivityQuery, formatChipDate, toTableRow } from './utils'
import type { ActivityItem, TransactionFilters } from './types'

describe('formatChipDate', () => {
  it('returns null when both arguments are undefined', () => {
    expect(formatChipDate(undefined, undefined)).toBeNull()
  })

  it('returns month name when from and to are in the same month', () => {
    expect(formatChipDate('2026-01-01', '2026-01-31')).toBe('Enero 2026')
  })

  it('returns range string when from and to are in different months', () => {
    expect(formatChipDate('2026-01-01', '2026-03-31')).toBe('2026-01-01 – 2026-03-31')
  })

  it('returns from when only from is provided', () => {
    expect(formatChipDate('2026-06-01', undefined)).toBe('2026-06-01')
  })

  it('returns to when only to is provided', () => {
    expect(formatChipDate(undefined, '2026-06-30')).toBe('2026-06-30')
  })
})

function buildItem(overrides: Partial<ActivityItem> = {}): ActivityItem {
  return {
    id: 'item-1',
    type: 'transaction',
    subtype: 'expense',
    fundId: 'fund-1',
    categoryId: 'cat-1',
    amount: '5000',
    amountFormatted: '$5.000',
    currency: 'CLP',
    occurredOn: '2026-06-01',
    source: 'manual',
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  } as ActivityItem
}

describe('buildActivityQuery', () => {
  const filters: TransactionFilters = { fundId: 'fund-1', categoryId: 'cat-1', from: '2026-06-01', to: '2026-06-30' }

  it('leaves type/subtype undefined for the "all" tab', () => {
    const query = buildActivityQuery('all', filters, '', 1, 20)
    expect(query.type).toBeUndefined()
    expect(query.subtype).toBeUndefined()
  })

  it('sets type="transfer" for the "transfers" tab', () => {
    const query = buildActivityQuery('transfers', filters, '', 1, 20)
    expect(query.type).toBe('transfer')
    expect(query.subtype).toBeUndefined()
  })

  it('sets type="transaction" and subtype for "income"/"expense" tabs', () => {
    expect(buildActivityQuery('income', filters, '', 1, 20)).toMatchObject({ type: 'transaction', subtype: 'income' })
    expect(buildActivityQuery('expense', filters, '', 1, 20)).toMatchObject({ type: 'transaction', subtype: 'expense' })
  })

  it('carries filters, search and pagination through', () => {
    const query = buildActivityQuery('all', filters, 'gasolina', 3, 20)
    expect(query).toMatchObject({
      from: '2026-06-01',
      to: '2026-06-30',
      fundId: 'fund-1',
      categoryId: 'cat-1',
      q: 'gasolina',
      page: 3,
      limit: 20,
    })
  })

  it('omits q when search is empty', () => {
    expect(buildActivityQuery('all', filters, '', 1, 20).q).toBeUndefined()
  })
})

describe('toTableRow', () => {
  it('maps a transaction item to kind="transaction"', () => {
    const row = toTableRow(buildItem({ type: 'transaction', subtype: 'expense' }))
    expect(row.kind).toBe('transaction')
    if (row.kind === 'transaction') {
      expect(row.data.fundId).toBe('fund-1')
      expect(row.data.type).toBe('expense')
    }
  })

  it('maps a transfer item to kind="transfer"', () => {
    const row = toTableRow(buildItem({ type: 'transfer', fromFundId: 'f1', toFundId: 'f2' }))
    expect(row.kind).toBe('transfer')
    if (row.kind === 'transfer') {
      expect(row.data.fromFundId).toBe('f1')
      expect(row.data.toFundId).toBe('f2')
    }
  })
})
