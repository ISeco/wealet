const CURRENCY_EXPONENTS: Record<string, number> = {
  CLP: 0,
  USD: 2,
  EUR: 2,
}

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_EXPONENTS)

function getCurrencyExponent(currency: string): number {
  const exponent = CURRENCY_EXPONENTS[currency]
  if (exponent === undefined) {
    throw new Error(`Unsupported currency: ${currency}`)
  }
  return exponent
}

export function formatMoney(amount: string, currency: string): string {
  const exponent = getCurrencyExponent(currency)
  const numericValue = Number(BigInt(amount)) / 10 ** exponent
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  }).format(numericValue)
}

/** Parses a user-entered amount (e.g. "12.500" or "12500,50") into minor units. */
export function parseMoney(input: string, currency: string): string {
  const exponent = getCurrencyExponent(currency)
  const normalized = input.trim().replace(/\./g, '').replace(',', '.')
  const match = /^(\d+)(?:\.(\d+))?$/.exec(normalized)
  if (!match) {
    throw new Error(`Invalid amount: ${input}`)
  }

  const [, integerPart, fractionalPart = ''] = match
  if (fractionalPart.length > exponent) {
    throw new Error(`Amount has more decimal digits than ${currency} allows (max ${exponent})`)
  }

  const minorUnits = `${integerPart}${fractionalPart.padEnd(exponent, '0')}`
  return BigInt(minorUnits).toString()
}
