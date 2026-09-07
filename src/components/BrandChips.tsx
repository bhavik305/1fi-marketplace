import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '../theme';

interface BrandChipsProps {
  brands: string[];
  selected: string;
  onSelect: (brand: string) => void;
}

export const BrandChips: React.FC<BrandChipsProps> = ({
  brands,
  selected,
  onSelect,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.row}
  >
    {brands.map((brand) => {
      const isSelected = brand === selected;
      return (
        <Pressable
          key={brand}
          onPress={() => onSelect(brand)}
          style={({ pressed }) => [
            styles.chip,
            isSelected && styles.selected,
            pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
          ]}
        >
          <Text style={[styles.text, isSelected && styles.selectedText]}>
            {brand}
          </Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    ...shadows.subtle,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.card,
  },
  text: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  selectedText: {
    color: colors.white,
  },
});