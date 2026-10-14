/**
 * One place for colour, spacing and type.
 *
 * Money apps live or die on whether you can tell at a glance which way a number
 * points, so `owed` and `owes` are first-class colours rather than ad-hoc greens
 * and reds sprinkled through the screens.
 */

import { Platform, useColorScheme } from 'react-native';

export interface Palette {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentText: string;
  /** Money coming back to you. */
  owed: string;
  /** Money you still have to hand over. */
  owes: string;
  settled: string;
  danger: string;
  overlay: string;
}

const light: Palette = {
  background: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  border: '#E3E6EB',
  text: '#11151C',
  textMuted: '#5A6472',
  textFaint: '#8A94A3',
  accent: '#1F6F5C',
  accentText: '#FFFFFF',
  owed: '#0F7B54',
  owes: '#C0392B',
  settled: '#5A6472',
  danger: '#C0392B',
  overlay: 'rgba(15, 20, 28, 0.45)',
};

const dark: Palette = {
  background: '#0E1116',
  surface: '#161B22',
  surfaceRaised: '#1C232C',
  border: '#2A323D',
  text: '#F0F3F7',
  textMuted: '#9AA5B4',
  textFaint: '#6C7787',
  accent: '#3DD9A0',
  accentText: '#07120E',
  owed: '#3DD9A0',
  owes: '#FF7B6B',
  settled: '#9AA5B4',
  danger: '#FF7B6B',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.6 },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  heading: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.2 },
  caption: { fontSize: 12, fontWeight: '400' as const },
  /** Amounts line up in columns only if the digits are the same width. */
  amount: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontVariant: ['tabular-nums'] as const,
  },
};

/** Keeps content readable on a wide desktop browser instead of stretching edge to edge. */
export const CONTENT_MAX_WIDTH = 720;

export function useTheme(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const shadow = Platform.select({
  web: { boxShadow: '0 1px 2px rgba(15, 20, 28, 0.06), 0 4px 16px rgba(15, 20, 28, 0.04)' },
  ios: {
    shadowColor: '#0F141C',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  default: { elevation: 2 },
}) as object;
