import {
  generateEmiPlans,
  getLowestMonthly,
  isFlatInstallment,
  sumInstallments,
  DEFAULT_TENURES,
} from '../emi';

const PRICES = [60000, 79900, 69999, 75999, 134900, 144999];
const TENURES = [3, 6, 9, 12, 18, 24];

describe('generateEmiPlans — financial correctness', () => {
  it.each(PRICES)('produces plans for every tenure for price=%i', (price) => {
    const plans = generateEmiPlans(price);
    expect(plans).toHaveLength(DEFAULT_TENURES.length);
    for (const t of DEFAULT_TENURES) {
      expect(plans.find((p) => p.tenureMonths === t)).toBeDefined();
    }
  });

  it.each(PRICES.flatMap((p) => TENURES.map((t) => [p, t] as const)))(
    'price=%i tenure=%i reconciles exactly to the product price',
    (price, months) => {
      const plans = generateEmiPlans(price, { tenureMonthsList: [months] });
      const plan = plans[0];
      // 0% interest, no processing fee
      expect(plan.interestRate).toBe(0);
      expect(plan.processingFee).toBe(0);
      // Sum of installments == price
      expect(sumInstallments(plan)).toBe(price);
      // Total payable == price (no fees)
      expect(plan.totalAmount).toBe(price);
      // All installment amounts are positive integers
      expect(Number.isInteger(plan.regularMonthlyAmount)).toBe(true);
      expect(Number.isInteger(plan.lastMonthlyAmount)).toBe(true);
      expect(plan.regularMonthlyAmount).toBeGreaterThan(0);
      expect(plan.lastMonthlyAmount).toBeGreaterThan(0);
      // Both installments are <= price
      expect(plan.regularMonthlyAmount).toBeLessThanOrEqual(price);
      expect(plan.lastMonthlyAmount).toBeLessThanOrEqual(price);
      // Cashback is never negative
      expect(plan.cashback ?? 0).toBeGreaterThanOrEqual(0);
    },
  );

  it('brief example: ₹60,000 over 12 months is exactly ₹5,000 × 12', () => {
    const [plan] = generateEmiPlans(60000, { tenureMonthsList: [12] });
    expect(plan.regularMonthlyAmount).toBe(5000);
    expect(plan.lastMonthlyAmount).toBe(5000);
    expect(isFlatInstallment(plan)).toBe(true);
    expect(sumInstallments(plan)).toBe(60000);
    expect(plan.totalAmount).toBe(60000);
    expect(plan.interestRate).toBe(0);
  });

  it('₹79,900 over 9 months reconciles (last EMI absorbs the remainder)', () => {
    const [plan] = generateEmiPlans(79900, { tenureMonthsList: [9] });
    // floor(79900/9) = 8877, last EMI = 79900 - 8877*8 = 79900 - 71016 = 8884
    expect(plan.regularMonthlyAmount).toBe(8877);
    expect(plan.lastMonthlyAmount).toBe(8884);
    expect(sumInstallments(plan)).toBe(79900);
    expect(isFlatInstallment(plan)).toBe(false);
  });

  it('returns no plans for invalid prices', () => {
    expect(generateEmiPlans(0)).toEqual([]);
    expect(generateEmiPlans(-100)).toEqual([]);
    expect(generateEmiPlans(Number.NaN)).toEqual([]);
  });

  it('getLowestMonthly never exceeds price', () => {
    for (const price of PRICES) {
      const lowest = getLowestMonthly(price);
      expect(lowest).toBeGreaterThan(0);
      expect(lowest).toBeLessThanOrEqual(price);
    }
  });
});

describe('generateEmiPlans — cashback is a marketing overlay only', () => {
  it('cashback does not change totalAmount or installment math', () => {
    const price = 89900;
    const base = generateEmiPlans(price, { tenureMonthsList: [12] })[0];
    const withCashback = generateEmiPlans(price, {
      tenureMonthsList: [12],
      perTenureCashback: { 12: 5000 },
    })[0];
    expect(withCashback.totalAmount).toBe(base.totalAmount);
    expect(sumInstallments(withCashback)).toBe(price);
    expect(withCashback.cashback).toBe(5000);
  });
});