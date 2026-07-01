import { formatMoney, parseMoney } from './money';

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
