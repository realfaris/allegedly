// 4-pt spacing grid. Use `space[n]` everywhere instead of magic numbers
// so visual rhythm stays consistent and one tweak adjusts the whole app.

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export type Space = keyof typeof space;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;
