// Main quote screen.
//
// Phase 4 build: renders a SAMPLE quote from the user's first category on
// a real palette gradient with the signature serif. No rotation engine yet,
// no swipe, no heart — those land in Phase 5. Phase 4 exists so we can
// look at typography + palette together and decide what (if anything) to
// tune before wiring rotation behind it.

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { loadPrefs } from '../storage/prefs';
import type { Prefs, Quote } from '../types';
import { getQuotesForCategory, filterStubs } from '../quotes/load';
import { resolvePalette } from '../theme/palettes';
import type { Palette } from '../theme/palettes';
import { QuoteBackground } from '../components/QuoteBackground';
import { type as typeScale } from '../theme/typography';
import { space } from '../theme/spacing';

// Brightness heuristic for picking status-bar style against the top stop
// of the gradient. Darker top → light status bar; lighter top → dark.
function isDarkTopStop(palette: Palette): boolean {
  const hex = palette.stops[0].replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Standard relative-luminance approximation
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.5;
}

export function QuoteScreen() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [sample, setSample] = useState<Quote | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await loadPrefs();
      if (cancelled) return;
      setPrefs(p);
      const cat = p.categories[0] ?? 'motivational';
      const pack = filterStubs(getQuotesForCategory(cat));
      const pickFrom = pack.length > 0 ? pack : getQuotesForCategory(cat);
      // Static sample for Phase 4 — Phase 5 replaces with rotation engine.
      setSample(pickFrom[0]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!prefs || !sample) {
    return <View style={styles.loadingFill} />;
  }

  const category = prefs.categories[0] ?? 'motivational';
  const palette = resolvePalette({
    category,
    backgroundMode: prefs.backgroundMode,
    fixedPalette: prefs.fixedPalette,
  });

  // Greeting placeholder. Phase 5 builds the real category × tone × time
  // matrix and shares it with the widget.
  const greeting =
    prefs.tone === 'minimal'
      ? null
      : prefs.name
      ? `GOOD MORNING, ${prefs.name.toUpperCase()}`
      : 'GOOD MORNING';

  return (
    <QuoteBackground palette={palette}>
      <StatusBar style={isDarkTopStop(palette) ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerArea}>
          {greeting && (
            <Text style={[typeScale.greeting, { color: palette.textMuted }]}>
              {greeting}
            </Text>
          )}
        </View>

        <View style={styles.quoteArea}>
          <Text
            style={[typeScale.quote, { color: palette.text }]}
            allowFontScaling={false}
          >
            “{sample.text}”
          </Text>
          <Text
            style={[
              typeScale.byline,
              { color: palette.textMuted, marginTop: space.lg },
            ]}
          >
            — {sample.author}
          </Text>
        </View>

        <View style={styles.footerArea} />
      </SafeAreaView>
    </QuoteBackground>
  );
}

const styles = StyleSheet.create({
  loadingFill: {
    flex: 1,
    backgroundColor: '#000',
  },
  safe: {
    flex: 1,
    paddingHorizontal: space.xl,
  },
  headerArea: {
    paddingTop: space.xl,
    alignItems: 'center',
  },
  quoteArea: {
    flex: 1,
    justifyContent: 'center',
  },
  footerArea: {
    height: space.xxxl,
  },
});
