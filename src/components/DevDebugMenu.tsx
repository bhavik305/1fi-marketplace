import React, { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { getApiConfig, resetApiConfig, setApiConfig } from '../api/marketplace';
import { colors, radii, shadows, spacing, typography } from '../theme';

/**
 * Dev-only debug overlay for demonstrating loading / error / retry states.
 *
 * SECURITY: gated by `__DEV__` so it is never bundled into production
 * builds. It exposes the in-memory mock API failure toggle and lets
 * reviewers trigger any combination of the three mock endpoints to fail.
 *
 * The toggle only affects the local in-memory mock API; there is no
 * production backdoor or network endpoint involved.
 */
export const DevDebugMenu: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const [forceFailProducts, setForceFailProducts] = useState(false);
  const [forceFailProduct, setForceFailProduct] = useState(false);
  const [forceFailEmi, setForceFailEmi] = useState(false);

  const applyConfig = useCallback(
    (next: { products?: boolean; product?: boolean; emi?: boolean }) => {
      const anyOn = Boolean(next.products || next.product || next.emi);
      if (!anyOn) {
        resetApiConfig();
        return;
      }
      setApiConfig({
        shouldFail: {
          products: next.products,
          product: next.product,
          emi: next.emi,
        },
      });
      // eslint-disable-next-line no-console
      console.info('[1Fi debug] API config now:', getApiConfig());
    },
    [],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <Text style={styles.title}>1Fi Debug Menu</Text>
          <Text style={styles.subtitle}>
            Dev-only. Force the mock API to fail so reviewers can demo
            loading / error / retry states.
          </Text>

          <Toggle
            label="Fail fetchProducts()"
            value={forceFailProducts}
            onChange={(v) => {
              setForceFailProducts(v);
              applyConfig({ products: v });
            }}
          />
          <Toggle
            label="Fail fetchProductById()"
            value={forceFailProduct}
            onChange={(v) => {
              setForceFailProduct(v);
              applyConfig({ product: v });
            }}
          />
          <Toggle
            label="Fail fetchEmiPlans()"
            value={forceFailEmi}
            onChange={(v) => {
              setForceFailEmi(v);
              applyConfig({ emi: v });
            }}
          />

          <Pressable
            style={styles.resetBtn}
            onPress={() => {
              setForceFailProducts(false);
              setForceFailProduct(false);
              setForceFailEmi(false);
              resetApiConfig();
            }}
          >
            <Text style={styles.resetText}>Reset all</Text>
          </Pressable>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const Toggle: React.FC<{
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, value, onChange }) => (
  <Pressable
    style={styles.row}
    onPress={() => onChange(!value)}
    android_ripple={{ color: colors.primaryFaint }}
  >
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={[styles.pill, value && styles.pillOn]}>
      <Text style={styles.pillText}>{value ? 'ON' : 'OFF'}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    ...shadows.card,
  },
  title: { ...typography.h2, color: colors.text, marginBottom: 4 },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  rowLabel: { ...typography.body, color: colors.text, flex: 1 },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.borderSubtle,
  },
  pillOn: { backgroundColor: colors.primary },
  pillText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  resetBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  resetText: { color: colors.text, fontWeight: '700' },
  closeBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  closeText: { color: colors.white, fontWeight: '800' },
});