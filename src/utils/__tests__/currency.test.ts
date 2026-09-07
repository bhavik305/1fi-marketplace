import { formatINR, formatTenureMonths } from '../currency';

describe('formatINR', () => {
  it('formats Indian rupees with lakh grouping', () => {
    expect(formatINR(79900)).toBe('₹79,900');
    expect(formatINR(124999)).toBe('₹1,24,999');
    expect(formatINR(1000000)).toBe('₹10,00,000');
    expect(formatINR(500)).toBe('₹500');
    expect(formatINR(0)).toBe('₹0');
  });

  it('handles non-finite values safely', () => {
    expect(formatINR(Number.NaN)).toBe('₹0');
    expect(formatINR(Number.POSITIVE_INFINITY)).toBe('₹0');
  });

  it('rounds half-to-even correctly', () => {
    expect(formatINR(99.4)).toBe('₹99');
    expect(formatINR(99.5)).toBe('₹100');
  });
});

describe('formatTenureMonths', () => {
  it('formats months as years when divisible by 12', () => {
    expect(formatTenureMonths(12)).toBe('12 months (1 year)');
    expect(formatTenureMonths(24)).toBe('24 months (2 years)');
  });
    expect(formatTenureMonths(3)).toBe('3 months');
    expect(formatTenureMonths(18)).toBe('18 months');
});