import type { Fund, FundClassification } from './types'

export function classColor(cls: FundClassification) {
  switch (cls) {
    case 'available':
      return { color: 'var(--disp)', bg: 'var(--disp-bg)', label: 'Disponible', cssColor: '#16A89A' }
    case 'reserve':
      return { color: 'var(--res)', bg: 'var(--res-bg)', label: 'Reserva', cssColor: '#2563EB' }
    case 'committed':
      return { color: 'var(--comp)', bg: 'var(--comp-bg)', label: 'Comprometido', cssColor: '#D97706' }
  }
}

export function getFundChip(fund: Fund) {
  const cls = classColor(fund.classification)
  if (fund.color) {
    return { color: fund.color, bg: `${fund.color}22` }
  }
  return { color: cls.color, bg: cls.bg }
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}
