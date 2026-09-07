import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Variant } from '../types';
import { colors, radii, shadows, spacing, typography } from '../theme';
import { formatINR } from '../utils/currency';

interface VariantSelectorProps {
  variants: Variant[];
  selectedId?: string;
  onSelect: (variant: Variant) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedId,
  onSelect,
}) => {
  return (
    <View style={styles.row}>
      {variants.map((v) => {
        const selected = v.id === selectedId;
        return (
          <Pressable
            key={v.id}
            onPress={() => onSelect(v)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] },
            ]}
            android_ripple={{ color: colors.primaryFaint }}
          >
            <View style={[styles.dot, { backgroundColor: v.colorHex }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.storage, selected && { color: colors.primary }]}>
                {v.storage}
              </Text>
              <Text style={styles.color}>{v.color}</Text>
              <Text style={styles.price}>{formatINR(v.price)}</Text>
            </View>
            {selected ? <Text style={styles.tick}>✓</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    minWidth: '47%',
    ...shadows.subtle,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  storage: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  color: {
    ...typography.caption,
    color: colors.textMuted,
  },
  price: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  tick: {
    color: colors.primary,
    fontWeight: '800',
    marginLeft: spacing.sm,
  },
});