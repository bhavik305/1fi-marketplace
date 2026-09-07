import { Platform } from 'react-native';

export const colors = {
  primary: '#3B5BFF',
  primaryDark: '#2940D9',
  primaryFaint: '#E8EDFF',
  background: '#F6F7FB',
  surface: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E5E7EB',
  borderSubtle: '#EEF1F6',
  success: '#10B981',
  successFaint: '#D1FAE5',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerFaint: '#FEE2E2',
  skeleton: '#E5E7EB',
  skeletonHighlight: '#F1F5F9',
  black: '#000000',
  white: '#FFFFFF',
};

export const gradients = {
  banner: ['#3B5BFF', '#5B73FF'] as const,
  success: ['#10B981', '#34D399'] as const,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const shadows = {
  card: Platform.select<{
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  }>({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 0,
    },
    android: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  })!,
  subtle: Platform.select<{
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  }>({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 0,
    },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
  })!,
};

export const typography = {
  h1: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.4 },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.2 },
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  small: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.2 },
  micro: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.4 },
};