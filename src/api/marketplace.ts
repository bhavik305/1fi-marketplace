import type { EmiPlan, Product, ProductFilters } from '../types';
import { products as productData } from '../data/products';
import { generateEmiPlans } from '../utils/emi';

export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const DEFAULT_DELAY_MS = 400;

export interface ApiConfig {
  delayMs: number;
  /** When true, every endpoint throws. When an object, only the named endpoints throw. */
  shouldFail: boolean | { products?: boolean; product?: boolean; emi?: boolean };
}

const defaultConfig: ApiConfig = {
  delayMs: DEFAULT_DELAY_MS,
  shouldFail: false,
};

let config: ApiConfig = { ...defaultConfig };

export function setApiConfig(next: Partial<ApiConfig>): void {
  config = { ...config, ...next };
}

export function getApiConfig(): ApiConfig {
  return config;
}

export function resetApiConfig(): void {
  config = { ...defaultConfig };
}

export interface ApiError extends Error {
  status?: number;
}

function shouldFailEndpoint(endpoint: 'products' | 'product' | 'emi'): boolean {
  const f = config.shouldFail;
  if (f === true) return true;
  if (typeof f === 'object' && f !== null) {
    return Boolean(f[endpoint]);
  }
  return false;
}

function maybeFail(endpoint: 'products' | 'product' | 'emi'): void {
  if (shouldFailEndpoint(endpoint)) {
    const err: ApiError = new Error('Network request failed. Please try again.');
    err.status = 500;
    throw err;
  }
}

export async function fetchProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  await delay(config.delayMs);
  maybeFail('products');

  let result: Product[] = productData.map((p) => ({
    ...p,
    variants: p.variants.map((v) => ({ ...v })),
  }));

  if (filters.brand && filters.brand !== 'All') {
    result = result.filter((p) => p.brand === filters.brand);
  }

  result.sort((a, b) => {
    if (filters.sort === 'price_desc') return b.basePrice - a.basePrice;
    if (filters.sort === 'price_asc') return a.basePrice - b.basePrice;
    return 0;
  });

  return result;
}

export async function fetchProductById(id: string): Promise<Product> {
  await delay(config.delayMs);
  maybeFail('product');

  const found = productData.find((p) => p.id === id);
  if (!found) {
    const err: ApiError = new Error('Product not found.');
    err.status = 404;
    throw err;
  }
  return {
    ...found,
    variants: found.variants.map((v) => ({ ...v })),
  };
}

export async function fetchEmiPlans(variantPrice: number): Promise<EmiPlan[]> {
  await delay(config.delayMs);
  maybeFail('emi');

  return generateEmiPlans(variantPrice);
}