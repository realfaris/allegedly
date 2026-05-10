// Type scale.
//
// Chrome (onboarding, settings, favorites) uses system fonts (San Francisco
// on iOS, Roboto on Android) — neutral, native, fast.
//
// The signature serif is **EB Garamond** (Phase 4 lock-in). It's used for
// the quote display, byline, and greeting on QuoteScreen — i.e. the brand
// surfaces the user actually shares. Loaded at app boot via expo-google-fonts
// in App.tsx; if the font hasn't loaded yet, fontFamily falls back to the
// platform serif so we never render with undefined font.

import { Platform, TextStyle } from 'react-native';

const systemFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

// EB Garamond family names match @expo-google-fonts/eb-garamond exports.
// If a weight isn't loaded yet, RN falls through to the platform serif.
export const fontFamily = {
  serifRegular: 'EBGaramond_400Regular',
  serifMedium: 'EBGaramond_500Medium',
  serifItalic: 'EBGaramond_400Regular_Italic',
} as const;

export const type = {
  // Onboarding + chrome (system font)
  display: {
    fontFamily: systemFamily,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  } as TextStyle,
  heading: {
    fontFamily: systemFamily,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
  } as TextStyle,
  body: {
    fontFamily: systemFamily,
    fontSize: 16,
    fontWeight: '400',
  } as TextStyle,
  caption: {
    fontFamily: systemFamily,
    fontSize: 13,
    fontWeight: '400',
  } as TextStyle,
  button: {
    fontFamily: systemFamily,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  } as TextStyle,

  // Quote screen — EB Garamond, the brand surface
  quote: {
    fontFamily: fontFamily.serifRegular,
    fontSize: 30,
    lineHeight: 42,
    letterSpacing: 0.2,
  } as TextStyle,
  byline: {
    fontFamily: fontFamily.serifItalic,
    fontSize: 15,
    letterSpacing: 0.4,
  } as TextStyle,
  greeting: {
    fontFamily: fontFamily.serifMedium,
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  } as TextStyle,
} as const;
