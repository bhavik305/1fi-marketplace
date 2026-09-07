import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
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
import { useMarketplace } from '../hooks/useMarketplace';
import { colors, gradients, radii, shadows, spacing, typography } from '../theme';
import { formatINR } from '../utils/currency';
import { isFlatInstallment, sumInstallments } from '../utils/emi';

type Props = NativeStackScreenProps<
  MarketplaceStackParamList,
  'MarketplaceConfirmation'
>;

export const MarketplaceConfirmationScreen: React.FC<Props> = ({
  navigation,
}) => {
  const { product, variant, emiPlan, reset } = useMarketplace();
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

  if (!product || !variant || !emiPlan) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No order in progress</Text>
          <Text style={styles.emptyBody}>
            Please choose a product and EMI plan to continue.
          </Text>
          <Pressable
            style={styles.cta}
            onPress={() => navigation.popToTop()}
          >
            <Text style={styles.ctaText}>Back to Marketplace</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const flat = isFlatInstallment(emiPlan);
  const totalPaid = sumInstallments(emiPlan);
  const reconciliations =
    totalPaid === variant.price
      ? `Sum of ${emiPlan.tenureMonths} installments equals ${formatINR(variant.price)} (the product price). 0% interest, no fees.`
      : `Sum of installments equals ${formatINR(totalPaid)}, matching the product price of ${formatINR(variant.price)}. 0% interest, no fees.`;

  const monthlyText = flat
    ? `${formatINR(emiPlan.regularMonthlyAmount)} × ${emiPlan.tenureMonths} months`
    : `${formatINR(emiPlan.regularMonthlyAmount)} × ${emiPlan.tenureMonths - 1} + ${formatINR(emiPlan.lastMonthlyAmount)} (final EMI)`;

  const handleDone = () => {
    reset();
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View
          style={[
            styles.successCard,
            { opacity, transform: [{ scale }] },
          ]}
        >
          <Gradient
            colors={gradients.success}
            style={styles.checkCircle}
          >
            <Text style={styles.checkMark}>✓</Text>
          </Gradient>
          <Text style={styles.successTitle}>Order placed</Text>
          <Text style={styles.successSub}>
            We’re confirming your order with the brand. No payment has been
            deducted yet.
          </Text>
        </Animated.View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order summary</Text>
          <Row label="Product" value={`${product.brand} ${product.name}`} />
          <Row label="Variant" value={`${variant.storage} • ${variant.color}`} />
          <Row label="Total price" value={formatINR(variant.price)} bold />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>EMI plan</Text>
          <Row label="Tenure" value={`${emiPlan.tenureMonths} months`} />
          <Row
            label={flat ? 'Monthly payment' : 'Monthly EMI'}
            value={
              flat
                ? `${formatINR(emiPlan.regularMonthlyAmount)}/mo`
                : `${formatINR(emiPlan.regularMonthlyAmount)}/mo (last EMI ${formatINR(emiPlan.lastMonthlyAmount)})`
            }
          />
          <Row label="Total payable" value={formatINR(emiPlan.totalAmount)} bold />
          <Row label="Interest" value="0%" />
          <Row label="Processing fee" value={formatINR(emiPlan.processingFee ?? 0)} />
          {emiPlan.cashback && emiPlan.cashback > 0 ? (
            <Row label="Cashback" value={formatINR(emiPlan.cashback)} success />
          ) : null}
          <View style={styles.assuranceBox}>
            <Text style={styles.assuranceLabel}>Reconciliation</Text>
            <Text style={styles.assurance}>{monthlyText}</Text>
            <Text style={[styles.assurance, { marginTop: 4 }]}>{reconciliations}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What happens next</Text>
          <Step index={1} text="Order is verified with the partner brand." />
          <Step index={2} text="EMI plan is activated against your 1Fi limit." />
          <Step index={3} text="First EMI will appear in your account cycle." />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.cta,
            pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] },
          ]}
          onPress={handleDone}
        >
          <Text style={styles.ctaText}>Back to Marketplace</Text>
        </Pressable>

        <Pressable onPress={handleDone} style={styles.linkBtn}>
          <Text style={styles.linkText}>Continue shopping</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const Row: React.FC<{
  label: string;
  value: string;
  bold?: boolean;
  success?: boolean;
}> = ({ label, value, bold, success }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text
      style={[
        styles.rowValue,
        bold && { fontSize: 16 },
        success && { color: colors.success },
      ]}
    >
      {value}
    </Text>
  </View>
);

const Step: React.FC<{ index: number; text: string }> = ({ index, text }) => (
  <View style={styles.stepRow}>
    <View style={styles.stepNum}>
      <Text style={styles.stepNumText}>{index}</Text>
    </View>
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },

  successCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.successFaint,
    ...shadows.card,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  checkMark: { color: colors.white, fontSize: 36, fontWeight: '800' },
  successTitle: { ...typography.h1, color: colors.text, marginTop: 4 },
  successSub: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 280,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  cardTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLabel: { ...typography.body, color: colors.textMuted },
  rowValue: { ...typography.body, color: colors.text, fontWeight: '600' },

  assuranceBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.successFaint,
  },
  assuranceLabel: {
    ...typography.small,
    color: '#065F46',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  assurance: {
    ...typography.caption,
    color: '#065F46',
    lineHeight: 18,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  stepNumText: { color: colors.primary, fontWeight: '800', fontSize: 12 },
  stepText: { ...typography.body, color: colors.text, flex: 1 },

  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
    ...shadows.card,
  },
  ctaText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  linkBtn: { alignItems: 'center', marginTop: spacing.md, paddingVertical: 8 },
  linkText: { color: colors.primary, fontWeight: '700' },

  emptyContainer: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  emptyBody: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});