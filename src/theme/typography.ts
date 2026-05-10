// Type scale.
//
// v1 ships with system fonts (San Francisco on iOS, Roboto on Android) for
// onboarding and chrome. The signature serif for the actual quote display
// gets locked in during Phase 4 and only applies to QuoteScreen — the
// onboarding chrome stays system-font on purpose so the brand reveal lands
// when the first quote appears.
//
// `quote` and `byline` styles are placeholders here; Phase 4 swaps the
// fontFamily to the chosen serif and tunes the optical scale.

import { Platform, TextStyle } from 'react-native';

const systemFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const systemSerifFamily = Platform.select({
  // Phase 4 will replace these with @expo-google-fonts loaded family.
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia',
});

export const type = {
  // Onboarding + chrome
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

  // Quote screen — placeholders, Phase 4 finalizes
  quote: {
    fontFamily: systemSerifFamily,
    fontSize: 30,
    fontWeight: '400',
    lineHeight: 40,
  } as TextStyle,
  byline: {
    fontFamily: systemSerifFamily,
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'italic',
  } as TextStyle,
  greeting: {
    fontFamily: systemFamily,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  } as TextStyle,
} as const;
