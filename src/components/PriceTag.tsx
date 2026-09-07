import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';
import { formatINR } from '../utils/currency';
import { getLowestMonthly } from '../utils/emi';

interface PriceTagProps {
  price: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PriceTag: React.FC<PriceTagProps> = ({
  price,
  label = 'Starting at',
  size = 'md',
}) => {
  const fontSize = size === 'lg' ? 22 : size === 'sm' ? 14 : 18;
  return (
    <View>
      <Text style={[styles.label, size === 'lg' && { fontSize: 13 }]}>
        {label}
      </Text>
      <Text style={[styles.price, { fontSize }]}>{formatINR(price)}</Text>
    </View>
  );
};

export const EmiPriceTag: React.FC<{ price: number }> = ({ price }) => {
  const monthly = getLowestMonthly(price);
  return (
    <View>
      <Text style={styles.label}>Starting at</Text>
      <Text style={styles.price}>{formatINR(monthly)}/mo</Text>
      <Text style={styles.sub}>on 0% interest EMI</Text>
    </View>
  );
};

export const CompactPriceTag: React.FC<{ price: number }> = ({ price }) => (
  <View>
    <Text style={styles.label}>Total</Text>
    <Text style={styles.price}>{formatINR(price)}</Text>
  </View>
);

const styles = StyleSheet.create({
  label: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },
  price: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: -0.2,
  },
  sub: {
    ...typography.micro,
    color: colors.success,
    marginTop: 4,
    fontWeight: '700',
  },
});