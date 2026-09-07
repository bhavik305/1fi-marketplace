import React, { useMemo, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gradient } from '../components/Gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MarketplaceStackParamList } from '../navigation/types';
import type { Product, SortOption } from '../types';
import { fetchProducts } from '../api/marketplace';
import { useApi } from '../hooks/useApi';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import { EmptyState, ErrorState } from '../components/States';
import { BrandChips } from '../components/BrandChips';
import { DevDebugMenu } from '../components/DevDebugMenu';
import { brands } from '../data/products';
import { colors, gradients, radii, shadows, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<MarketplaceStackParamList, 'MarketplaceList'>;

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
];

export const MarketplaceListScreen: React.FC<Props> = ({ navigation }) => {
  const [brand, setBrand] = useState<string>('All');
  const [sort, setSort] = useState<SortOption>('price_asc');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const filters = useMemo(() => ({ brand, sort }), [brand, sort]);
  const { data: products, status, error, retry } = useApi<Product[]>(
    () => fetchProducts(filters),
    [brand, sort],
  );

  const [debugOpen, setDebugOpen] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const handleSelectProduct = (product: Product) => {
    navigation.navigate('MarketplaceDetail', { productId: product.id });
  };

  const handleTitleTap = () => {
    if (!__DEV__) return;
    setTapCount((t) => {
      const next = t + 1;
      if (next >= 3) {
        setDebugOpen(true);
        return 0;
      }
      return next;
    });
  };

  const renderHeader = () => (
    <View>
      <Gradient
        colors={gradients.banner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.bannerDecor} />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerEyebrow}>1Fi SHOP</Text>
          <Text style={styles.bannerTitle}>Buy smartphones on 0% EMI</Text>
          <Text style={styles.bannerSub}>
            Unlock your 1Fi spending limit and pay over time with no-cost EMIs.
          </Text>
          <View style={styles.bannerRow}>
            <View style={styles.bannerChip}>
              <Text style={styles.bannerChipText}>0% interest</Text>
            </View>
            <View style={styles.bannerChip}>
              <Text style={styles.bannerChipText}>No hidden fees</Text>
            </View>
            <View style={styles.bannerChip}>
              <Text style={styles.bannerChipText}>Instant approval</Text>
            </View>
          </View>
        </View>
      </Gradient>

      <Text style={styles.sectionLabel}>Filter by brand</Text>
      <BrandChips brands={brands} selected={brand} onSelect={setBrand} />

      <View style={styles.sortRow}>
        <Text style={styles.resultCount}>
          {status === 'success' && products
            ? `${products.length} phone${products.length === 1 ? '' : 's'} available`
            : ' '}
        </Text>
        <Pressable
          onPress={() => setSortMenuOpen((v) => !v)}
          style={({ pressed }) => [
            styles.sortButton,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={styles.sortText}>
            {SORT_OPTIONS.find((o) => o.value === sort)?.label}
          </Text>
          <Text style={styles.sortCaret}>▾</Text>
        </Pressable>
      </View>

      {sortMenuOpen ? (
        <Animated.View style={styles.sortMenu}>
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                setSort(opt.value);
                setSortMenuOpen(false);
              }}
              style={({ pressed }) => [
                styles.sortMenuItem,
                pressed && { backgroundColor: colors.primaryFaint },
              ]}
            >
              <Text
                style={[
                  styles.sortMenuText,
                  sort === opt.value && { color: colors.primary, fontWeight: '700' },
                ]}
              >
                {opt.label}
              </Text>
              {sort === opt.value ? <Text style={styles.sortCheck}>✓</Text> : null}
            </Pressable>
          ))}
        </Animated.View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={handleTitleTap} hitSlop={12}>
          <Text style={styles.topTitle}>Shop</Text>
          <View style={styles.topAccent} />
        </Pressable>
      </View>

      {status === 'loading' && !products ? (
        <FlatList
          data={Array.from({ length: 6 })}
          numColumns={2}
          keyExtractor={(_, i) => `skeleton-${i}`}
          contentContainerStyle={styles.list}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          ListHeaderComponent={renderHeader}
          renderItem={() => <ProductCardSkeleton />}
        />
      ) : status === 'error' ? (
        <ErrorState
          title="Couldn’t load phones"
          message={error ?? 'Please try again.'}
          onRetry={retry}
        />
      ) : products && products.length === 0 ? (
        <EmptyState
          title="No phones available"
          message={`No smartphones match the "${brand}" brand right now.`}
        />
      ) : (
        <FlatList
          data={products ?? []}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={handleSelectProduct} />
          )}
          refreshControl={
            <RefreshControl refreshing={status === 'loading'} onRefresh={retry} />
          }
        />
      )}

      {__DEV__ ? (
        <DevDebugMenu
          visible={debugOpen}
          onClose={() => {
            setDebugOpen(false);
            setTapCount(0);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  topTitle: { ...typography.h1, color: colors.text },
  topAccent: {
    marginTop: 6,
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },

  banner: {
    margin: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    padding: spacing.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  bannerDecor: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60,
    right: -40,
  },
  bannerEyebrow: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  bannerTitle: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 20,
    marginTop: 4,
    letterSpacing: -0.2,
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
    maxWidth: 240,
  },
  bannerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  bannerChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    marginRight: 6,
    marginBottom: 6,
  },
  bannerChipText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },

  sectionLabel: {
    ...typography.micro,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    textTransform: 'uppercase',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  resultCount: { ...typography.caption, color: colors.textMuted },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  sortText: {
    ...typography.small,
    color: colors.text,
    fontWeight: '600',
  },
  sortCaret: { marginLeft: 6, color: colors.textMuted, fontSize: 12 },
  sortMenu: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    overflow: 'hidden',
    ...shadows.card,
  },
  sortMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  sortMenuText: { ...typography.body, color: colors.text },
  sortCheck: { color: colors.primary, fontWeight: '700' },

  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
});