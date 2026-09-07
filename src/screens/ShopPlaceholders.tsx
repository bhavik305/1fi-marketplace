import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gradient } from '../components/Gradient';
import { colors, gradients, radii, shadows, spacing, typography } from '../theme';
import { brands } from '../data/products';

interface PlaceholderProps {
  title: string;
  description: string;
  emoji: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title, description, emoji }) => (
  <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.container}>
      <Gradient
        colors={gradients.banner}
        style={styles.hero}
      >
        <Text style={styles.heroEmoji}>{emoji}</Text>
      </Gradient>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{description}</Text>

      <View style={styles.chipRow}>
        {brands
          .filter((b) => b !== 'All')
          .map((b) => (
            <View key={b} style={styles.chip}>
              <Text style={styles.chipText}>{b}</Text>
            </View>
          ))}
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          This is a placeholder screen as part of the 1Fi Shop section. The full
          experience is implemented in the “1Fi Marketplace” tab.
        </Text>
      </View>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  heroEmoji: { fontSize: 44 },
  title: { ...typography.h1, color: colors.text, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryFaint,
    margin: 4,
  },
  chipText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  note: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  noteText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export const TopBrandsScreen: React.FC = () => (
  <Placeholder
    title="Top Brands"
    description="Explore the most popular smartphone brands available on 1Fi Marketplace."
    emoji="🏷️"
  />
);

export const NearbyStoresScreen: React.FC = () => (
  <Placeholder
    title="Nearby Stores"
    description="Find partner stores around you where you can redeem your 1Fi EMI offers."
    emoji="📍"
  />
);