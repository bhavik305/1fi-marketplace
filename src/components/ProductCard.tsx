import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Product } from '../types';
import { colors, radii, shadows, spacing, typography } from '../theme';
import { EmiPriceTag } from './PriceTag';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  return (
    <Pressable
      onPress={() => onPress(product)}
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 },
      ]}
      android_ripple={{ color: colors.primaryFaint }}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.brandPill}>
          <Text style={styles.brandText}>{product.brand.toUpperCase()}</Text>
        </View>
        <View style={styles.emiBadge}>
          <Text style={styles.emiBadgeText}>0% EMI</Text>
        </View>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.variantLabel} numberOfLines={1}>
        {product.variants[0]?.storage} • {product.variants[0]?.color}
      </Text>
      <View style={{ marginTop: spacing.sm }}>
        <EmiPriceTag price={product.variants[0]?.price ?? product.basePrice} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 10,
    width: '47%',
    marginBottom: 14,
    ...shadows.card,
  },
  imageWrap: {
    position: 'relative',
    backgroundColor: '#F1F5F9',
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 130,
  },
  brandPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  brandText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  emiBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  emiBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  name: {
    ...typography.h3,
    marginTop: spacing.sm,
    color: colors.text,
  },
  variantLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});