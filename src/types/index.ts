export type Brand = 'Apple' | 'Samsung' | 'Google' | string;

export interface Variant {
  id: string;
  storage: string;
  color: string;
  colorHex: string;
  price: number;
}

export interface Specification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  brand: Brand;
  images: string[];
  basePrice: number;
  variants: Variant[];
  specs: Specification[];
  highlights: string[];
}

export interface EmiPlan {
  id: string;
  tenureMonths: number;
  /** The amount charged in each of the first (tenureMonths − 1) installments. */
  regularMonthlyAmount: number;
  /** The amount charged in the final installment (may differ from regularMonthlyAmount by a few rupees). */
  lastMonthlyAmount: number;
  /** Headline monthly figure for marketing surfaces (regularMonthlyAmount). */
  monthlyAmount: number;
  /** Total payable across the tenure. Equal to product price for 0% interest, no-fee plans. */
  totalAmount: number;
  interestRate: number;
  cashback?: number;
  processingFee?: number;
}

export type SortOption = 'price_asc' | 'price_desc';

export interface ProductFilters {
  brand?: Brand;
  sort?: SortOption;
}