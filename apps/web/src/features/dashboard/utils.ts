import type { CategorySpend } from './types'

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/** Returns the full month name for a "YYYY-MM" string, e.g. "2026-06" → "Junio". */
export function monthName(yyyyMM: string): string {
  const [, m] = yyyyMM.split('-')
  return MONTH_NAMES[Number(m) - 1]
}

const MONTH_ABBR = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

export function formatMonthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-')
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`
}

export function formatMonthShort(yyyyMMDD: string): string {
  const month = Number(yyyyMMDD.slice(5, 7))
  return MONTH_ABBR[month - 1]
}

export function prevMonthName(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-').map(Number)
  const prevDate = new Date(year, month - 2, 1)
  return MONTH_NAMES[prevDate.getMonth()].toLowerCase()
}

/** Sorts categories by spent amount, highest first. */
export function sortCategoriesByAmountDesc(categories: CategorySpend[]): CategorySpend[] {
  return [...categories].sort((a, b) =>
    BigInt(b.amount) > BigInt(a.amount) ? 1 : BigInt(b.amount) < BigInt(a.amount) ? -1 : 0
  )
}
