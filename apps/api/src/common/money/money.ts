import { getCurrencyExponent } from './currency';

export function formatMoney(amount: string | bigint, currency: string): string {
  const exponent = getCurrencyExponent(currency);
  const value = typeof amount === 'bigint' ? amount : BigInt(amount);
  const numericValue = Number(value) / 10 ** exponent;
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  }).format(numericValue);
}

export function parseMoney(input: string, currency: string): string {
  const exponent = getCurrencyExponent(currency);
  const match = /^(\d+)(?:\.(\d+))?$/.exec(input.trim());
  if (!match) {
    throw new Error(`Invalid amount: ${input}`);
  }

  const [, integerPart, fractionalPart = ''] = match;
  if (fractionalPart.length > exponent) {
    throw new Error(
      `Amount has more decimal digits than ${currency} allows (max ${exponent})`,
    );
  }

  const minorUnits = `${integerPart}${fractionalPart.padEnd(exponent, '0')}`;
  return BigInt(minorUnits).toString();
}
