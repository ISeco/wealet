const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function formatDateLabel(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]}`
}

export interface QuickAmount {
  label: string
  value: bigint
}

export function computeQuickAmounts(fromBalance: bigint): QuickAmount[] {
  return [
    { label: '25%', value: fromBalance / 4n },
    { label: '50%', value: fromBalance / 2n },
    { label: '75%', value: (fromBalance * 3n) / 4n },
    { label: 'Todo', value: fromBalance },
  ]
}

export function validateTransferAmount(amount: bigint, fromBalance: bigint): string | null {
  if (amount <= 0n) return 'El monto debe ser mayor a cero'
  if (amount > fromBalance) return 'El monto supera el saldo disponible'
  return null
}
