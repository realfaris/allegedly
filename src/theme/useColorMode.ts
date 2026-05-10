// Light/dark mode hook. v1: keyed off the system preference via React Native's
// useColorScheme. We deliberately do NOT expose a manual override yet —
// per PLAN.md, theming differentiation comes from category palettes, not from
// a user-facing dark-mode toggle. If we add an override later, it lives in
// Prefs and overlays this hook's return.

import { useColorScheme } from 'react-native';

export type ColorMode = 'light' | 'dark';

export function useColorMode(): ColorMode {
  const scheme = useColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}
