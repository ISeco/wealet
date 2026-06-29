import { MONTH_NAMES } from '../dashboard/utils'
import type { ActivityItem } from './types'
import type { TableRow } from './TransactionsTable'

export function formatChipDate(from?: string, to?: string): string | null {
  if (!from && !to) return null
  if (from && to) {
    const [fy, fm] = from.split('-')
    const [ty, tm] = to.split('-')
    if (fy === ty && fm === tm) return `${MONTH_NAMES[parseInt(fm) - 1]} ${fy}`
    return `${from} – ${to}`
  }
  return from ?? to ?? null
}

export function toTableRow(item: ActivityItem): TableRow {
  if (item.type === 'transfer') {
    return {
      kind: 'transfer',
      data: {
        id: item.id,
        fromFundId: item.fromFundId!,
        toFundId: item.toFundId!,
        amount: item.amount,
        amountFormatted: item.amountFormatted,
        currency: item.currency,
        occurredOn: item.occurredOn,
        note: item.note ?? null,
        createdAt: item.createdAt,
      },
    }
  }
  return {
    kind: 'transaction',
    data: {
      id: item.id,
      fundId: item.fundId!,
      categoryId: item.categoryId!,
      type: item.subtype!,
      amount: item.amount,
      amountFormatted: item.amountFormatted,
      currency: item.currency,
      description: item.description ?? null,
      occurredOn: item.occurredOn,
      source: item.source!,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt ?? item.createdAt,
    },
  }
}
