import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gradient } from '../components/Gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MarketplaceStackParamList } from '../navigation/types';
import type { EmiPlan, Product, Variant } from '../types';
import { fetchEmiPlans, fetchProductById } from '../api/marketplace';
import { useApi } from '../hooks/useApi';
import { useMarketplace } from '../hooks/useMarketplace';
import { VariantSelector } from '../components/VariantSelector';
import { EmiPlanCard } from '../components/EmiPlanCard';
import { DetailSkeleton } from '../components/Skeleton';
import { ErrorState } from '../components/States';
import { colors, gradients, radii, shadows, spacing, typography } from '../theme';
import { formatINR } from '../utils/currency';
import { isFlatInstallment, getLowestMonthly } from '../utils/emi';

type Props = NativeStackScreenProps<MarketplaceStackParamList, 'MarketplaceDetail'>;

export const MarketplaceDetailScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { productId } = route.params;

  const productApi = useApi<Product>(() => fetchProductById(productId), [productId]);
  const { data: product } = productApi;

  const { variant, emiPlan, setProduct, setVariant, setEmiPlan } = useMarketplace();
  const [activeImage, setActiveImage] = useState(0);

  const lastProductIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!product) return;
    if (lastProductIdRef.current === product.id) {
      // Same product re-rendered (e.g. after retry). Validate the selected
      // variant actually belongs to this product, otherwise reset.
      if (!variant || !product.variants.some((v) => v.id === variant.id)) {
        const first = product.variants[0];
        setVariant(first);
      }
      return;
    }
    // Different product loaded for the first time.
    lastProductIdRef.current = product.id;
    setProduct(product);
    setVariant(product.variants[0]);
    setActiveImage(0);
  }, [product, variant, setProduct, setVariant]);

  const currentVariant: Variant | undefined = variant ?? product?.variants[0];

  const plansApi = useApi<EmiPlan[]>(
    () => fetchEmiPlans(currentVariant?.price ?? 0),
    [currentVariant?.price],
  );
  const { data: plans, status: plansStatus, retry: retryPlans } = plansApi;

  const lowestMonthly = useMemo(() => {
    if (!currentVariant) return null;
    return getLowestMonthly(currentVariant.price);
  }, [currentVariant]);

  const handleContinue = () => {
    if (!product || !currentVariant || !emiPlan) return;
    setEmiPlan(emiPlan);
    navigation.navigate('MarketplaceConfirmation');
  };

  if (productApi.status === 'loading' && !product) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <DetailSkeleton />
      </SafeAreaView>
    );
  }

  if (productApi.status === 'error' || !product) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState
          title="Couldn’t load product"
          message={productApi.error ?? 'Please try again.'}
          onRetry={productApi.retry}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹  Back to Marketplace</Text>
        </Pressable>

        <View style={styles.imageWrap}>
          <Image
            source={{ uri: product.images[activeImage] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <Gradient
            colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.18)']}
            style={styles.imageOverlay}
            pointerEvents="none"
          />
          <View style={styles.brandTag}>
            <Text style={styles.brandTagText}>{product.brand.toUpperCase()}</Text>
          </View>
          {product.images.length > 1 ? (
            <View style={styles.galleryDots}>
              {product.images.map((_, i) => (
                <Pressable
                  key={`dot-${i}`}
                  onPress={() => setActiveImage(i)}
                  style={[
                    styles.dot,
                    i === activeImage && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.brand}>{product.brand.toUpperCase()}</Text>
          <Text style={styles.name}>{product.name}</Text>

          {lowestMonthly !== null && currentVariant ? (
            <Gradient
              colors={[colors.primaryFaint, '#F8FAFF']}
              style={styles.priceBox}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.priceLabel}>Starting at</Text>
                <Text style={styles.priceBig}>
                  {formatINR(lowestMonthly)}/mo
                </Text>
                <Text style={styles.priceSmall}>
                  {emiPlan && !isFlatInstallment(emiPlan)
                    ? `0% interest EMI · last EMI ${formatINR(emiPlan.lastMonthlyAmount)}`
                    : '0% interest EMI · no processing fee'}
                </Text>
              </View>
              <View style={styles.spendingPill}>
                <Text style={styles.spendingPillText}>USE 1Fi LIMIT</Text>
              </View>
            </Gradient>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose a variant</Text>
          <Text style={styles.sectionHint}>
            Storage and colour options for this product.
          </Text>
          <VariantSelector
            variants={product.variants}
            selectedId={currentVariant?.id}
            onSelect={(v) => setVariant(v)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose an EMI plan</Text>
          <Text style={styles.sectionHint}>
            0% interest, no-cost EMIs based on the selected variant.
          </Text>

          {plansStatus === 'loading' ? (
            <Text style={styles.muted}>Loading EMI plans…</Text>
          ) : plansStatus === 'error' ? (
            <ErrorState
              title="Couldn’t load EMI plans"
              message={plansApi.error ?? 'Please try again.'}
              onRetry={retryPlans}
            />
          ) : (
            (plans ?? []).map((plan) => (
              <EmiPlanCard
                key={plan.id}
                plan={plan}
                variantPrice={currentVariant?.price ?? 0}
                selected={emiPlan?.id === plan.id}
                onSelect={setEmiPlan}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specsCard}>
            {product.specs.map((s, idx) => (
              <View
                key={s.label}
                style={[
                  styles.specRow,
                  idx === product.specs.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Text style={styles.specLabel}>{s.label}</Text>
                <Text style={styles.specValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          <View style={styles.highlightsRow}>
            {product.highlights.map((h) => (
              <View key={h} style={styles.highlightPill}>
                <Text style={styles.highlightText}>{h}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          {currentVariant ? (
            <>
              <Text style={styles.footerLabel}>
                {currentVariant.storage} • {currentVariant.color}
              </Text>
              <Text style={styles.footerPrice}>{formatINR(currentVariant.price)}</Text>
            </>
          ) : null}
        </View>
        <Pressable
          disabled={!emiPlan}
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.cta,
            !emiPlan && styles.ctaDisabled,
            pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] },
          ]}
        >
          <Gradient
            colors={emiPlan ? gradients.banner : ['#94A3B8', '#94A3B8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>
              {emiPlan ? 'Proceed with this plan  →' : 'Select an EMI plan'}
            </Text>
          </Gradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xxxl },
  backBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  backText: { color: colors.primary, fontWeight: '700', fontSize: 14 },

  imageWrap: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  mainImage: {
    width: '100%',
    height: 280,
    backgroundColor: '#F1F5F9',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  brandTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  brandTagText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  galleryDots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 22,
  },

  heroSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  brand: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  name: { ...typography.h1, color: colors.text, marginTop: 4 },
  priceBox: {
    marginTop: spacing.md,
    borderRadius: radii.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  priceLabel: {
    ...typography.micro,
    color: colors.textMuted,
  },
  priceBig: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
    letterSpacing: -0.4,
  },
  priceSmall: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  spendingPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  spendingPillText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: { ...typography.h2, color: colors.text },
  sectionHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing.md,
  },

  specsCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.subtle,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  specLabel: { ...typography.body, color: colors.textMuted },
  specValue: { ...typography.body, color: colors.text, fontWeight: '600' },

  highlightsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  highlightPill: {
    backgroundColor: colors.primaryFaint,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    margin: 4,
  },
  highlightText: { color: colors.primary, fontWeight: '700', fontSize: 12 },

  muted: { ...typography.body, color: colors.textMuted },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    ...shadows.card,
  },
  footerLabel: {
    ...typography.micro,
    color: colors.textMuted,
  },
  footerPrice: { ...typography.h2, color: colors.text, marginTop: 2 },
  cta: {
    marginLeft: spacing.md,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  ctaDisabled: { opacity: 0.9 },
  ctaGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  ctaText: { color: colors.white, fontWeight: '800', fontSize: 14 },
});