import type { EmiPlan } from '../types';

export interface GenerateEmiPlansOptions {
  tenureMonthsList?: number[];
  perTenureCashback?: Record<number, number>;
  perTenureProcessingFee?: Record<number, number>;
}

export const DEFAULT_TENURES: readonly number[] = [3, 6, 9, 12, 18, 24];

export const DEFAULT_CASHBACK: Readonly<Record<number, number>> = {
  3: 0,
  6: 1000,
  9: 1500,
  12: 2500,
  18: 3000,
  24: 4000,
};

export const DEFAULT_PROCESSING_FEE: Readonly<Record<number, number>> = {
  3: 0,
  6: 0,
  9: 0,
  12: 0,
  18: 0,
  24: 0,
};

/**
 * Generate 0% interest EMI plans for a given price.
 *
 * IMPORTANT — reconciliation strategy:
 *
 * For 0% interest with no fees, the sum of all installments MUST equal the
 * product price exactly. We never round the monthly amount to the nearest
 * 10/100 rupees because doing so makes monthly × tenure ≠ price and forces
 * the UI to lie about the total.
 *
 * Instead we compute:
 *   regularMonthly = floor(price / months)
 *   lastMonthly    = price − regularMonthly × (months − 1)
 *
 * The first (months − 1) installments are `regularMonthly` rupees each, and
 * the last installment is `lastMonthly` rupees. By construction:
 *   regularMonthly × (months − 1) + lastMonthly = price.
 *
 * This means the displayed monthly figure is *not* always constant for a
 * given tenure, but it is always truthful: `Σ installments = product price`.
 *
 * All numbers are integers in rupees. There is no interest and no fees.
 */
export function generateEmiPlans(
  price: number,
  options: GenerateEmiPlansOptions = {},
): EmiPlan[] {
  if (!Number.isFinite(price) || price <= 0) {
    return [];
  }
  const tenures = options.tenureMonthsList ?? DEFAULT_TENURES;
  const cashbackByTenure = options.perTenureCashback ?? DEFAULT_CASHBACK;
  const feeByTenure = options.perTenureProcessingFee ?? DEFAULT_PROCESSING_FEE;

  return tenures.map((months) => {
    const regularMonthly = Math.floor(price / months);
    const lastMonthly = price - regularMonthly * (months - 1);
    const cashback = cashbackByTenure[months] ?? 0;
    const processingFee = feeByTenure[months] ?? 0;
    const totalAmount = price + processingFee;
    return {
      id: `emi-${months}m`,
      tenureMonths: months,
      regularMonthlyAmount: regularMonthly,
      lastMonthlyAmount: lastMonthly,
      monthlyAmount: regularMonthly,
      totalAmount,
      interestRate: 0,
      cashback,
      processingFee,
    };
  });
}

/**
 * The headline EMI figure used in the listing and hero card. We deliberately
 * return the *smaller* of the two installment amounts so the price stays
 * consumer-friendly — the actual final installment may differ by a few rupees.
 */
export function getLowestMonthly(price: number): number {
  const plans = generateEmiPlans(price);
  if (plans.length === 0) return 0;
  return Math.min(...plans.map((p) => Math.min(p.regularMonthlyAmount, p.lastMonthlyAmount)));
}

/**
 * Returns true when the plan would charge the same amount for every installment
 * (i.e. price divides evenly by tenure). UI uses this to suppress the
 * "final installment differs" disclaimer when it isn't needed.
 */
export function isFlatInstallment(plan: EmiPlan): boolean {
  return plan.regularMonthlyAmount === plan.lastMonthlyAmount;
}

/**
 * Total reconciliation amount actually paid across the tenure, ignoring any
 * cashback. Always equal to `plan.totalAmount` for 0% interest, no-fee plans.
 */
export function sumInstallments(plan: EmiPlan): number {
  return plan.regularMonthlyAmount * (plan.tenureMonths - 1) + plan.lastMonthlyAmount;
}