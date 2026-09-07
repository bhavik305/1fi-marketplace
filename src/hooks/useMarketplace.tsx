import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { EmiPlan, Product, Variant } from '../types';

interface MarketplaceSelection {
  product: Product | null;
  variant: Variant | null;
  emiPlan: EmiPlan | null;
}

interface MarketplaceContextValue extends MarketplaceSelection {
  setProduct: (product: Product) => void;
  setVariant: (variant: Variant) => void;
  setEmiPlan: (plan: EmiPlan) => void;
  reset: () => void;
}

const initial: MarketplaceSelection = {
  product: null,
  variant: null,
  emiPlan: null,
};

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [product, setProductState] = useState<Product | null>(null);
  const [variant, setVariantState] = useState<Variant | null>(null);
  const [emiPlan, setEmiPlanState] = useState<EmiPlan | null>(null);

  const setProduct = useCallback((p: Product) => {
    setProductState(p);
    setVariantState(null);
    setEmiPlanState(null);
  }, []);

  const setVariant = useCallback((v: Variant) => {
    setVariantState(v);
    setEmiPlanState(null);
  }, []);

  const setEmiPlan = useCallback((plan: EmiPlan) => {
    setEmiPlanState(plan);
  }, []);

  const reset = useCallback(() => {
    setProductState(null);
    setVariantState(null);
    setEmiPlanState(null);
  }, []);

  const value = useMemo<MarketplaceContextValue>(
    () => ({ product, variant, emiPlan, setProduct, setVariant, setEmiPlan, reset }),
    [product, variant, emiPlan, setProduct, setVariant, setEmiPlan, reset],
  );

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};

export function useMarketplace(): MarketplaceContextValue {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) {
    throw new Error('useMarketplace must be used within MarketplaceProvider');
  }
  return ctx;
}