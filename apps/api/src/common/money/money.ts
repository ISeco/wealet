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

/**
 * Convierte un monto en moneda extranjera (unidades mínimas) a la moneda base
 * (unidades mínimas) usando un tipo de cambio. El resultado es la fuente de
 * verdad contable; el monto/tasa originales se guardan solo como metadato.
 * Los montos personales son pequeños, así que el cálculo intermedio en Number
 * es seguro para el rango esperado.
 */
export function convertToBase(
  originalMinor: string,
  originalCurrency: string,
  baseCurrency: string,
  rate: string,
): string {
  const originalExponent = getCurrencyExponent(originalCurrency);
  const baseExponent = getCurrencyExponent(baseCurrency);
  const originalMajor = Number(BigInt(originalMinor)) / 10 ** originalExponent;
  const baseMinor = Math.round(
    originalMajor * Number(rate) * 10 ** baseExponent,
  );
  return BigInt(baseMinor).toString();
}
