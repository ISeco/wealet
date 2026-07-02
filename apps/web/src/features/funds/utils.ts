import type { Fund, FundClassification } from './types'

export const CLASS_ORDER: FundClassification[] = ['available', 'reserve', 'committed']

export function classColor(cls: FundClassification) {
  switch (cls) {
    case 'available':
      return { color: 'var(--disp)', bg: 'var(--disp-bg)', label: 'Disponible' }
    case 'reserve':
      return { color: 'var(--res)', bg: 'var(--res-bg)', label: 'Reserva' }
    case 'committed':
      return { color: 'var(--comp)', bg: 'var(--comp-bg)', label: 'Comprometido' }
  }
}

export function getFundChip(fund: Fund) {
  const cls = classColor(fund.classification)
  if (fund.color) {
    return { color: fund.color, bg: `${fund.color}22` }
  }
  return { color: cls.color, bg: cls.bg }
}

export function activeFunds(funds: Fund[]): Fund[] {
  return funds.filter((fund) => !fund.archivedAt)
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}
