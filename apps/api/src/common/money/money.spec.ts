import { convertToBase, formatMoney, parseMoney } from './money';

describe('formatMoney', () => {
  it('formats CLP with no decimals', () => {
    expect(formatMoney('1500', 'CLP')).toBe('$1.500');
  });

  it('formats USD with 2 decimals', () => {
    expect(formatMoney('1250', 'USD')).toBe('US$12,50');
  });

  it('accepts bigint input', () => {
    expect(formatMoney(1500n, 'CLP')).toBe('$1.500');
  });

  it('throws on unsupported currency', () => {
    expect(() => formatMoney('100', 'XXX')).toThrow(
      'Unsupported currency: XXX',
    );
  });
});

describe('parseMoney', () => {
  it('parses an integer CLP amount', () => {
    expect(parseMoney('1500', 'CLP')).toBe('1500');
  });

  it('parses a decimal USD amount into minor units', () => {
    expect(parseMoney('12.50', 'USD')).toBe('1250');
  });

  it('pads missing decimal digits', () => {
    expect(parseMoney('12.5', 'USD')).toBe('1250');
  });

  it('round-trips with formatMoney for integer currencies', () => {
    const minorUnits = parseMoney('1500', 'CLP');
    expect(formatMoney(minorUnits, 'CLP')).toBe('$1.500');
  });

  it('rejects more decimal digits than the currency allows', () => {
    expect(() => parseMoney('12.5', 'CLP')).toThrow(
      'Amount has more decimal digits than CLP allows (max 0)',
    );
  });

  it('rejects non-numeric input', () => {
    expect(() => parseMoney('abc', 'CLP')).toThrow('Invalid amount: abc');
  });

  it('throws on unsupported currency', () => {
    expect(() => parseMoney('100', 'XXX')).toThrow('Unsupported currency: XXX');
  });
});

describe('convertToBase', () => {
  it('convierte USD a CLP con la tasa (caso tarjeta)', () => {
    // USD 9,99 (999 minor) a 948.95 CLP/USD → 9480 CLP
    expect(convertToBase('999', 'USD', 'CLP', '948.95')).toBe('9480');
  });

  it('redondea al entero de la unidad base más cercana', () => {
    // USD 1,00 a 950.5 → 950.5 → 951 CLP
    expect(convertToBase('100', 'USD', 'CLP', '950.5')).toBe('951');
  });

  it('respeta el exponente de una base con decimales (EUR→USD)', () => {
    // EUR 10,00 (1000) a 1.08 USD/EUR → 10,80 USD → 1080 minor
    expect(convertToBase('1000', 'EUR', 'USD', '1.08')).toBe('1080');
  });

  it('lanza para una moneda no soportada', () => {
    expect(() => convertToBase('100', 'ARS', 'CLP', '1')).toThrow(
      'Unsupported currency: ARS',
    );
  });
});
