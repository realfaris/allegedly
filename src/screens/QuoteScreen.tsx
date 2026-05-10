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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

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
import { ShareCard, SHARE_SIZE } from '../components/ShareCard';
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
  const shareCardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);

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
    // Persist + update local favorites state for instant heart feedback.
    // Intentionally do NOT rebuild the deck here — that would scramble
    // the cards under the user's finger. The boost takes effect on the
    // next mount / focus / boundary crossing (recompute() is called in
    // those flows).
    const next = await persistToggleFavorite(visibleQuote.id);
    setFavorites(next);
  };

  const onSharePress = async () => {
    if (isSharing || !shareCardRef.current) return;
    setIsSharing(true);
    try {
      const uri = await captureRef(shareCardRef.current, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width: SHARE_SIZE,
        height: SHARE_SIZE,
      });
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Share unavailable', 'Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        UTI: 'public.png',
        dialogTitle: 'Share quote',
      });
    } catch (e) {
      // captureRef can throw if the view isn't laid out yet; show a soft error.
      // Don't crash the screen.
      // eslint-disable-next-line no-console
      console.warn('[share] capture/share failed', e);
      Alert.alert(
        'Could not share',
        'Something went wrong creating the image. Try again in a moment.',
      );
    } finally {
      setIsSharing(false);
    }
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
            onPress={onSharePress}
            hitSlop={12}
            disabled={isSharing}
            style={({ pressed }) => [
              styles.topAction,
              { opacity: isSharing ? 0.4 : pressed ? 0.6 : 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Share quote"
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
              {isSharing ? 'Sharing…' : 'Share'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            hitSlop={12}
            style={({ pressed }) => [
              styles.topAction,
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

      {/* Swipe hints — pointerEvents none so they don't eat the gesture.
          Only render when the deck has more than one quote. */}
      {rotation.deck.length > 1 && (
        <>
          <View pointerEvents="none" style={styles.hintLeft}>
            <Text style={[styles.hintGlyph, { color: palette.textMuted }]}>
              ‹
            </Text>
          </View>
          <View pointerEvents="none" style={styles.hintRight}>
            <Text style={[styles.hintGlyph, { color: palette.textMuted }]}>
              ›
            </Text>
          </View>
        </>
      )}

      {/* Off-screen share card. Rendered always so capture is instant on
          press. Visible quote drives its content. */}
      <ShareCard ref={shareCardRef} quote={visibleQuote} palette={palette} />
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
  topAction: {
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
  hintLeft: {
    position: 'absolute',
    left: 4,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    opacity: 0.4,
  },
  hintRight: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    opacity: 0.4,
  },
  hintGlyph: {
    fontSize: 36,
    lineHeight: 36,
    fontWeight: '300',
  },
});
