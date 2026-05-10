// Neutral palette used by chrome (onboarding, settings, favorites).
// Category-tied gradient palettes live in a separate module added in Phase 4
// — those drive the quote screen background. Here we just want a clean,
// premium-feeling neutral surface that works in both light and dark.

import type { ColorMode } from './useColorMode';

export interface Neutrals {
  bg: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;        // primary action color
  accentText: string;    // text on top of accent
  danger: string;
}

const light: Neutrals = {
  bg: '#FAFAF7',         // warm off-white
  surface: '#FFFFFF',
  surfaceMuted: '#F2F2EE',
  text: '#1A1A1A',
  textMuted: '#5C5C5C',
  border: '#E5E5DF',
  accent: '#1A1A1A',     // intentionally the text color — high contrast, premium feel
  accentText: '#FFFFFF',
  danger: '#B23A48',
};

const dark: Neutrals = {
  bg: '#0E0E0C',
  surface: '#171715',
  surfaceMuted: '#1F1F1C',
  text: '#F5F5F0',
  textMuted: '#9A9A95',
  border: '#2A2A26',
  accent: '#F5F5F0',
  accentText: '#0E0E0C',
  danger: '#E07480',
};

export function neutrals(mode: ColorMode): Neutrals {
  return mode === 'dark' ? dark : light;
}
