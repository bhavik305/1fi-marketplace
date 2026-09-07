import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '../theme';

interface EmptyStateProps {
  title: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message }) => (
  <View style={styles.container}>
    <View style={styles.iconWrap}>
      <Text style={styles.icon}>🛒</Text>
    </View>
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </View>
);

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We couldn’t load this content. Please try again.',
  onRetry,
}) => (
  <View style={styles.container}>
    <View style={[styles.iconWrap, styles.iconWrapDanger]}>
      <Text style={styles.icon}>⚠️</Text>
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {onRetry ? (
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [
          styles.retry,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        ]}
      >
        <Text style={styles.retryText}>Tap to retry</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.subtle,
  },
  iconWrapDanger: {
    backgroundColor: colors.dangerFaint,
  },
  icon: { fontSize: 36 },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  retry: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    ...shadows.subtle,
  },
  retryText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});