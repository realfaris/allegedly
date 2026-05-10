// Favorites screen.
//
// Read-only list of favorited quotes. Tap heart on a row to unfavorite.
// Per-row palette swatch indicates the source category at a glance.
//
// Tap-to-view is intentionally NOT wired in v1 — would require navigating
// back to QuoteScreen with that quote pre-selected, plus reasoning about
// "what does swipe do when you came in via Favorites". Defer to v2 if it's
// requested in real use. (Out-of-scope item for now: just see and curate.)

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { loadPrefs, toggleFavorite } from '../storage/prefs';
import { getQuoteById } from '../quotes/load';
import { useColorMode } from '../theme/useColorMode';
import { neutrals } from '../theme/colors';
import { type as typeScale } from '../theme/typography';
import { space, radius } from '../theme/spacing';
import { CATEGORY_PALETTE_FOR, PALETTES } from '../theme/palettes';
import type { Quote } from '../types';

export function FavoritesScreen() {
  const mode = useColorMode();
  const c = neutrals(mode);

  const [quotes, setQuotes] = useState<Quote[]>([]);

  const refresh = useCallback(async () => {
    const p = await loadPrefs();
    const resolved: Quote[] = [];
    for (const id of p.favorites) {
      const q = getQuoteById(id);
      if (q) resolved.push(q);
    }
    setQuotes(resolved);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // If a user unfavorites from QuoteScreen and comes back, we want fresh data.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const onUnfavorite = async (id: string) => {
    await toggleFavorite(id);
    refresh();
  };

  if (quotes.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: c.bg }]}>
        <Text style={[typeScale.heading, { color: c.text }]}>
          No favorites yet
        </Text>
        <Text
          style={[
            typeScale.body,
            { color: c.textMuted, marginTop: space.sm, textAlign: 'center' },
          ]}
        >
          Tap the heart on any quote to save it here.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.scrollContent}
    >
      {quotes.map((q) => {
        const paletteId = CATEGORY_PALETTE_FOR[q.category];
        const palette = PALETTES[paletteId];
        // Vertical micro-gradient for the swatch — uses the same stops as
        // the real palette so the user can mentally connect this thumbnail
        // to the QuoteScreen's gradient.
        const swatchGradient = palette.stops;
        return (
          <View
            key={q.id}
            style={[
              styles.card,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <View style={styles.cardRow}>
              <View style={styles.swatchContainer}>
                {swatchGradient.map((color, i) => (
                  <View
                    key={i}
                    style={[
                      styles.swatchBand,
                      { backgroundColor: color, flex: 1 },
                    ]}
                  />
                ))}
              </View>

              <View style={styles.cardBody}>
                <Text
                  style={[typeScale.body, { color: c.text }]}
                  numberOfLines={4}
                >
                  “{q.text}”
                </Text>
                <Text
                  style={[
                    typeScale.caption,
                    { color: c.textMuted, marginTop: space.xs },
                  ]}
                >
                  — {q.author}
                </Text>
              </View>

              <Pressable
                onPress={() => onUnfavorite(q.id)}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.heartButton,
                  { opacity: pressed ? 0.5 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Unfavorite"
              >
                <Text style={[styles.heartGlyph, { color: c.danger }]}>
                  ♥
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}
      <Text
        style={[
          typeScale.caption,
          { color: c.textMuted, textAlign: 'center', marginTop: space.lg },
        ]}
      >
        {quotes.length} saved
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: space.lg,
    paddingBottom: space.xxxl,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.md,
    marginBottom: space.sm,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  swatchContainer: {
    width: 6,
    flexDirection: 'column',
  },
  swatchBand: {
    width: '100%',
  },
  cardBody: {
    flex: 1,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
  },
  heartButton: {
    paddingHorizontal: space.md,
    justifyContent: 'center',
  },
  heartGlyph: {
    fontSize: 22,
    lineHeight: 24,
  },
});
