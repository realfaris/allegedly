// Main quote screen — Phase 5.
//
// Composes:
//   • Rotation engine (engine.getRotationState) — picks active category
//     and the deck cursor based on (now, prefs).
//   • Greeting helper — category × tone × time-of-day matrix.
//   • Horizontal FlatList — swipe to preview adjacent quotes in the same
//     deck. Initial scroll position is the rotation cursor; we walk the
//     deck in its natural order so app and widget can never disagree.
//   • Heart button — toggleFavorite for the currently-visible quote.
//   • Settings link — top-right, navigates to the Settings stack screen.
//
// On AppState becoming active (e.g. returning from background), we recompute
// the rotation state. If a time-of-day boundary has crossed while the app
// was backgrounded, the user lands on the new active quote, not the stale one.

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  AppState,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { loadPrefs, toggleFavorite as persistToggleFavorite } from '../storage/prefs';
import type { Prefs, Quote } from '../types';
import {
  getRotationState,
  type RotationState,
} from '../rotation/engine';
import { getBoundary, isNight } from '../rotation/timeOfDay';
import { getGreeting } from '../rotation/greeting';
import {
  resolvePalette,
  darkenPalette,
  type Palette,
} from '../theme/palettes';
import { QuoteBackground } from '../components/QuoteBackground';
import { type as typeScale } from '../theme/typography';
import { space } from '../theme/spacing';
import type { RootStackParamList } from '../navigation/RootNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList, 'Quote'>;

function isDarkTopStop(palette: Palette): boolean {
  const hex = palette.stops[0].replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.5;
}

export function QuoteScreen() {
  const navigation = useNavigation<Nav>();

  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [rotation, setRotation] = useState<RotationState | null>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);
  // Local override of favorites so the heart updates instantly without
  // re-reading AsyncStorage.
  const [favorites, setFavorites] = useState<string[]>([]);

  const listRef = useRef<FlatList<Quote>>(null);

  const recompute = useCallback(async () => {
    const p = await loadPrefs();
    const state = getRotationState(p);
    setPrefs(p);
    setRotation(state);
    setFavorites(p.favorites);
    // Land on the cursor position. Defer to next frame so FlatList has
    // mounted with data.
    requestAnimationFrame(() => {
      if (state.deck.length > 0) {
        const initialIndex = state.cursor % state.deck.length;
        setVisibleIndex(initialIndex);
        listRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }
    });
  }, []);

  useEffect(() => {
    recompute();
  }, [recompute]);

  // Recompute when user returns from settings (prefs may have changed).
  useFocusEffect(
    useCallback(() => {
      recompute();
    }, [recompute]),
  );

  // Recompute on app foreground in case a boundary crossed.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') recompute();
    });
    return () => sub.remove();
  }, [recompute]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setVisibleIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const palette = useMemo(() => {
    if (!prefs || !rotation) return null;
    const base = resolvePalette({
      category: rotation.category,
      backgroundMode: prefs.backgroundMode,
      fixedPalette: prefs.fixedPalette,
    });
    return isNight() ? darkenPalette(base, 0.35) : base;
  }, [prefs, rotation]);

  if (!prefs || !rotation || !palette) {
    return <View style={styles.loadingFill} />;
  }

  if (rotation.deck.length === 0) {
    // All quotes filtered as stubs (anti-mot/dumb before they're written).
    // Fall back to a graceful message rather than empty space.
    return (
      <QuoteBackground palette={palette}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.quoteArea}>
            <Text style={[typeScale.quote, { color: palette.text }]}>
              No quotes here yet.
            </Text>
            <Text
              style={[
                typeScale.byline,
                { color: palette.textMuted, marginTop: space.lg },
              ]}
            >
              — Allegedly
            </Text>
          </View>
        </SafeAreaView>
      </QuoteBackground>
    );
  }

  const visibleQuote: Quote =
    rotation.deck[visibleIndex] ?? rotation.deck[rotation.cursor % rotation.deck.length];
  const isFavorited = favorites.includes(visibleQuote.id);

  const greeting = getGreeting({
    category: rotation.category,
    tone: prefs.tone,
    boundary: getBoundary(),
    name: prefs.name,
  });

  const onHeartPress = async () => {
    const next = await persistToggleFavorite(visibleQuote.id);
    setFavorites(next);
    // Re-derive deck so the boost takes effect on next view. We don't
    // re-snap the scroll position — the user keeps their visual context.
    const p = await loadPrefs();
    setPrefs(p);
    const state = getRotationState(p);
    setRotation(state);
  };

  return (
    <QuoteBackground palette={palette}>
      <StatusBar style={isDarkTopStop(palette) ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safe}>
        {/* Top bar: greeting (left/centered) + Settings (right) */}
        <View style={styles.topBar}>
          <View style={styles.greetingArea}>
            {greeting && (
              <Text
                style={[typeScale.greeting, { color: palette.textMuted }]}
                numberOfLines={1}
              >
                {greeting}
              </Text>
            )}
          </View>
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            hitSlop={12}
            style={({ pressed }) => [
              styles.settingsButton,
              { opacity: pressed ? 0.6 : 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Text
              style={[
                typeScale.caption,
                {
                  color: palette.textMuted,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                },
              ]}
            >
              Settings
            </Text>
          </Pressable>
        </View>

        {/* Quote pager */}
        <FlatList
          ref={listRef}
          data={rotation.deck as Quote[]}
          keyExtractor={(q) => q.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={SCREEN_WIDTH}
          snapToAlignment="center"
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          initialScrollIndex={rotation.cursor % rotation.deck.length}
          onScrollToIndexFailed={(info) => {
            // Fallback if FlatList can't snap (rare with getItemLayout).
            const wait = new Promise((r) => setTimeout(r, 50));
            wait.then(() =>
              listRef.current?.scrollToIndex({
                index: info.index,
                animated: false,
              }),
            );
          }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item }) => (
            <View style={[styles.page, { width: SCREEN_WIDTH }]}>
              <View style={styles.quoteArea}>
                <Text
                  style={[typeScale.quote, { color: palette.text }]}
                  allowFontScaling={false}
                >
                  “{item.text}”
                </Text>
                <Text
                  style={[
                    typeScale.byline,
                    {
                      color: palette.textMuted,
                      marginTop: space.lg,
                    },
                  ]}
                >
                  — {item.author}
                </Text>
              </View>
            </View>
          )}
        />

        {/* Bottom: heart */}
        <View style={styles.bottomBar}>
          <Pressable
            onPress={onHeartPress}
            hitSlop={16}
            style={({ pressed }) => [
              styles.heartButton,
              { opacity: pressed ? 0.5 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={isFavorited ? 'Unfavorite' : 'Favorite'}
            accessibilityState={{ selected: isFavorited }}
          >
            <Text style={[styles.heartGlyph, { color: palette.text }]}>
              {isFavorited ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>
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
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    minHeight: 36,
  },
  greetingArea: {
    flex: 1,
  },
  settingsButton: {
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  page: {
    flex: 1,
    paddingHorizontal: space.xl,
    justifyContent: 'center',
  },
  quoteArea: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: space.lg,
  },
  heartButton: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  heartGlyph: {
    fontSize: 30,
    lineHeight: 32,
  },
});
