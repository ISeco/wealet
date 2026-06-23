export const CURRENCY_EXPONENTS: Record<string, number> = {
  CLP: 0,
  USD: 2,
  EUR: 2,
};

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_EXPONENTS);

export function getCurrencyExponent(currency: string): number {
  const exponent = CURRENCY_EXPONENTS[currency];
  if (exponent === undefined) {
    throw new Error(`Unsupported currency: ${currency}`);
  }
  return exponent;
}
