import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { EmiPlan } from '../types';
import { colors, radii, shadows, spacing, typography } from '../theme';
import { formatINR, formatTenureMonths } from '../utils/currency';
import { isFlatInstallment } from '../utils/emi';

interface EmiPlanCardProps {
  plan: EmiPlan;
  selected?: boolean;
  variantPrice: number;
  onSelect?: (plan: EmiPlan) => void;
}

export const EmiPlanCard: React.FC<EmiPlanCardProps> = ({
  plan,
  selected,
  variantPrice,
  onSelect,
}) => {
  const flat = isFlatInstallment(plan);
  const monthlyLabel = flat
    ? formatINR(plan.regularMonthlyAmount)
    : `${formatINR(plan.regularMonthlyAmount)} → ${formatINR(plan.lastMonthlyAmount)}`;

  return (
    <Pressable
      onPress={() => onSelect?.(plan)}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && { opacity: 0.95, transform: [{ scale: 0.995 }] },
      ]}
      android_ripple={{ color: colors.primaryFaint }}
    >
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.tenure}>{formatTenureMonths(plan.tenureMonths)}</Text>
          <View style={styles.tagRow}>
            <View style={styles.zeroTag}>
              <Text style={styles.zeroText}>0% INTEREST</Text>
            </View>
            <View style={styles.zeroTag}>
              <Text style={styles.zeroText}>NO PROCESSING FEE</Text>
            </View>
            {plan.cashback && plan.cashback > 0 ? (
              <View style={[styles.zeroTag, styles.cashbackTag]}>
                <Text style={[styles.zeroText, styles.cashbackText]}>
                  CASHBACK {formatINR(plan.cashback)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.monthly} numberOfLines={1}>
            {monthlyLabel}
          </Text>
          <Text style={styles.monthlySuffix}>
            {flat ? '/month' : '/month (last EMI differs)'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.mutedLabel}>Total payable</Text>
          <Text style={styles.mutedValue}>{formatINR(plan.totalAmount)}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={styles.mutedLabel}>Product price</Text>
          <Text style={styles.mutedValue}>{formatINR(variantPrice)}</Text>
        </View>
      </View>

      {selected ? (
        <View style={styles.selectedBadge}>
          <Text style={styles.checkMark}>✓</Text>
          <Text style={styles.selectedText}>Selected plan</Text>
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  selected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#F8FAFF',
    ...shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tenure: {
    ...typography.h2,
    color: colors.text,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  zeroTag: {
    backgroundColor: colors.primaryFaint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    marginRight: 6,
    marginBottom: 4,
  },
  zeroText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  cashbackTag: {
    backgroundColor: colors.successFaint,
  },
  cashbackText: {
    color: colors.success,
  },
  monthly: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.2,
    maxWidth: 180,
    textAlign: 'right',
  },
  monthlySuffix: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.md,
  },
  mutedLabel: {
    ...typography.small,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  mutedValue: {
    ...typography.h3,
    color: colors.text,
    marginTop: 4,
  },
  selectedBadge: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: radii.pill,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  checkMark: {
    color: colors.white,
    fontWeight: '800',
    marginRight: 6,
    fontSize: 13,
  },
  selectedText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.6,
  },
});