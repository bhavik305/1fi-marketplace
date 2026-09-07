import {
  fetchProducts,
  fetchProductById,
  fetchEmiPlans,
  setApiConfig,
  resetApiConfig,
} from '../marketplace';

describe('mock API — products listing', () => {
  beforeEach(() => resetApiConfig());

  it('returns all products when no filters are provided', async () => {
    const products = await fetchProducts();
    expect(products.length).toBeGreaterThanOrEqual(4);
    expect(products.length).toBeLessThanOrEqual(8);
  });

  it('filters by brand (case-sensitive exact match)', async () => {
    const apple = await fetchProducts({ brand: 'Apple' });
    expect(apple.every((p) => p.brand === 'Apple')).toBe(true);
    expect(apple.length).toBeGreaterThan(0);
  });

  it('returns all brands when brand="All"', async () => {
    const all = await fetchProducts({ brand: 'All' });
    const baseline = await fetchProducts();
    expect(all.length).toBe(baseline.length);
  });

  it('sorts ascending by base price', async () => {
    const asc = await fetchProducts({ sort: 'price_asc' });
    for (let i = 1; i < asc.length; i++) {
      expect(asc[i].basePrice).toBeGreaterThanOrEqual(asc[i - 1].basePrice);
    }
  });

  it('sorts descending by base price', async () => {
    const desc = await fetchProducts({ sort: 'price_desc' });
    for (let i = 1; i < desc.length; i++) {
      expect(desc[i].basePrice).toBeLessThanOrEqual(desc[i - 1].basePrice);
    }
  });

  it('combines filter + sort', async () => {
    const out = await fetchProducts({ brand: 'Samsung', sort: 'price_asc' });
    expect(out.every((p) => p.brand === 'Samsung')).toBe(true);
    for (let i = 1; i < out.length; i++) {
      expect(out[i].basePrice).toBeGreaterThanOrEqual(out[i - 1].basePrice);
    }
  });
});

describe('mock API — product detail', () => {
  beforeEach(() => resetApiConfig());

  it('returns the requested product with its variants', async () => {
    const product = await fetchProductById('iphone-15');
    expect(product.id).toBe('iphone-15');
    expect(product.brand).toBe('Apple');
    expect(product.variants.length).toBeGreaterThan(0);
    product.variants.forEach((v) => {
      expect(typeof v.id).toBe('string');
      expect(typeof v.price).toBe('number');
      expect(v.price).toBeGreaterThan(0);
    });
  });

  it('throws for an unknown id', async () => {
    await expect(fetchProductById('does-not-exist')).rejects.toThrow(/not found/i);
  });
});

describe('mock API — EMI plans', () => {
  beforeEach(() => resetApiConfig());

  it('returns 0% interest plans that reconcile to the price', async () => {
    const price = 79900;
    const plans = await fetchEmiPlans(price);
    expect(plans.length).toBeGreaterThan(0);
    for (const plan of plans) {
      expect(plan.interestRate).toBe(0);
      const sum =
        plan.regularMonthlyAmount * (plan.tenureMonths - 1) +
        plan.lastMonthlyAmount;
      expect(sum).toBe(price);
      expect(plan.totalAmount).toBe(price);
    }
  });
});

describe('mock API — failure injection + retry', () => {
  afterEach(() => resetApiConfig());

  it('rejects fetchProducts when the products endpoint is configured to fail', async () => {
    setApiConfig({ shouldFail: { products: true } });
    await expect(fetchProducts()).rejects.toThrow(/network request failed/i);
  });

  it('rejects fetchProductById when the product endpoint is configured to fail', async () => {
    setApiConfig({ shouldFail: { product: true } });
    await expect(fetchProductById('iphone-15')).rejects.toThrow(/network request failed/i);
  });

  it('rejects fetchEmiPlans when the EMI endpoint is configured to fail', async () => {
    setApiConfig({ shouldFail: { emi: true } });
    await expect(fetchEmiPlans(79900)).rejects.toThrow(/network request failed/i);
  });

  it('retrieves data again after resetApiConfig (retry scenario)', async () => {
    setApiConfig({ shouldFail: { products: true } });
    await expect(fetchProducts()).rejects.toThrow();
    resetApiConfig();
    const products = await fetchProducts();
    expect(products.length).toBeGreaterThan(0);
  });

  it('only fails the configured endpoint — others keep working', async () => {
    setApiConfig({ shouldFail: { emi: true } });
    const products = await fetchProducts();
    expect(products.length).toBeGreaterThan(0);
    await expect(fetchEmiPlans(79900)).rejects.toThrow();
  });
});