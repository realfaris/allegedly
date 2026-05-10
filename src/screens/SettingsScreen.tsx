// Settings screen.
//
// Inline editors, auto-save on every change (no Save button — iOS-native
// pattern). Reads/writes prefs via storage/prefs. The QuoteScreen recomputes
// rotation on focus, so any change here lands instantly when the user
// returns.
//
// Validation:
//   - Categories: must keep ≥1 selected. Tapping the last selected chip is
//     a no-op (the chip stays selected).
//   - Background "fixed" mode requires a palette; we default to the first
//     curated palette if user flips to fixed without picking one.

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { loadPrefs, updatePrefs, clearPrefs } from '../storage/prefs';
import { useColorMode } from '../theme/useColorMode';
import { neutrals } from '../theme/colors';
import { type as typeScale } from '../theme/typography';
import { space, radius } from '../theme/spacing';
import { ALL_CATEGORIES } from '../types';
import type {
  BackgroundMode,
  Category,
  PaletteId,
  Prefs,
  Tone,
} from '../types';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const CATEGORY_LABELS: Record<Category, string> = {
  motivational: 'Motivational',
  anti_motivational: 'Anti-motivational',
  dumb: 'Dumb',
  funny: 'Funny',
  stoic: 'Stoic',
};

const TONES: { id: Tone; label: string }[] = [
  { id: 'sincere', label: 'Sincere' },
  { id: 'sassy', label: 'Sassy' },
  { id: 'minimal', label: 'Minimal' },
];

interface PaletteOption {
  id: PaletteId;
  label: string;
  swatch: string;
}

const PICKABLE_PALETTES: PaletteOption[] = [
  { id: 'dusk', label: 'Dusk', swatch: '#3D2E5C' },
  { id: 'midnight', label: 'Midnight', swatch: '#0E1A2B' },
  { id: 'parchment', label: 'Parchment', swatch: '#E8DEC2' },
  { id: 'oceanic', label: 'Oceanic', swatch: '#1E5A78' },
  { id: 'rose', label: 'Rose', swatch: '#C77B89' },
  { id: 'forest', label: 'Forest', swatch: '#2F4A3A' },
  { id: 'monochrome', label: 'Monochrome', swatch: '#3A3A38' },
  { id: 'amber', label: 'Amber', swatch: '#B57340' },
];

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const mode = useColorMode();
  const c = neutrals(mode);

  const [prefs, setPrefs] = useState<Prefs | null>(null);
  // local mirror of name so typing feels instant; persist on blur
  const [nameDraft, setNameDraft] = useState('');

  useEffect(() => {
    (async () => {
      const p = await loadPrefs();
      setPrefs(p);
      setNameDraft(p.name ?? '');
    })();
  }, []);

  const patch = useCallback(async (next: Partial<Prefs>) => {
    const updated = await updatePrefs(next);
    setPrefs(updated);
  }, []);

  if (!prefs) {
    return <View style={[styles.loading, { backgroundColor: c.bg }]} />;
  }

  const toggleCategory = (cat: Category) => {
    const has = prefs.categories.includes(cat);
    if (has && prefs.categories.length === 1) {
      // last one — refuse to deselect
      return;
    }
    const next = has
      ? prefs.categories.filter((x) => x !== cat)
      : [...prefs.categories, cat];
    patch({ categories: next });
  };

  const setTone = (tone: Tone) => patch({ tone });

  const setBackgroundMode = (m: BackgroundMode) => {
    if (m === 'fixed') {
      patch({
        backgroundMode: 'fixed',
        fixedPalette: prefs.fixedPalette ?? PICKABLE_PALETTES[0].id,
      });
    } else {
      patch({ backgroundMode: 'category', fixedPalette: undefined });
    }
  };

  const setFixedPalette = (id: PaletteId) =>
    patch({ backgroundMode: 'fixed', fixedPalette: id });

  const onResetOnboarding = () => {
    Alert.alert(
      'Re-run onboarding?',
      'This clears your saved name, categories, tone, and background. Favorites are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const favs = prefs.favorites; // preserve favorites across reset
            await clearPrefs();
            await updatePrefs({ favorites: favs });
            navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* PERSONAL */}
      <Section title="Personal" color={c.textMuted}>
        <Row color={c.text} label="Name">
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            onBlur={() =>
              patch({ name: nameDraft.trim() || undefined })
            }
            placeholder="Your name"
            placeholderTextColor={c.textMuted}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            maxLength={32}
            style={[
              styles.input,
              typeScale.body,
              { color: c.text, borderColor: c.border },
            ]}
          />
        </Row>

        <Row color={c.text} label="Tone">
          <View style={styles.segments}>
            {TONES.map((t) => {
              const selected = prefs.tone === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setTone(t.id)}
                  style={({ pressed }) => [
                    styles.segment,
                    {
                      backgroundColor: selected ? c.accent : c.surface,
                      borderColor: selected ? c.accent : c.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      typeScale.button,
                      {
                        color: selected ? c.accentText : c.text,
                      },
                    ]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Row>
      </Section>

      {/* QUOTE TYPES */}
      <Section title="Quote types" color={c.textMuted}>
        <Text
          style={[
            typeScale.caption,
            { color: c.textMuted, marginBottom: space.sm },
          ]}
        >
          At least one must be selected.
        </Text>
        <View style={{ gap: space.xs }}>
          {ALL_CATEGORIES.map((cat) => {
            const selected = prefs.categories.includes(cat);
            const isLast =
              selected && prefs.categories.length === 1;
            return (
              <Pressable
                key={cat}
                onPress={() => toggleCategory(cat)}
                style={({ pressed }) => [
                  styles.checkRow,
                  {
                    backgroundColor: c.surface,
                    borderColor: c.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected, disabled: isLast }}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: selected ? c.accent : c.border,
                      backgroundColor: selected ? c.accent : 'transparent',
                    },
                  ]}
                >
                  {selected && (
                    <Text style={[styles.checkMark, { color: c.accentText }]}>
                      ✓
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    typeScale.body,
                    {
                      color: c.text,
                      flex: 1,
                      marginLeft: space.md,
                    },
                  ]}
                >
                  {CATEGORY_LABELS[cat]}
                </Text>
                {isLast && (
                  <Text
                    style={[
                      typeScale.caption,
                      { color: c.textMuted },
                    ]}
                  >
                    required
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </Section>

      {/* BACKGROUND */}
      <Section title="Background" color={c.textMuted}>
        <Pressable
          onPress={() => setBackgroundMode('category')}
          style={({ pressed }) => [
            styles.modeRow,
            {
              backgroundColor:
                prefs.backgroundMode === 'category' ? c.accent : c.surface,
              borderColor:
                prefs.backgroundMode === 'category' ? c.accent : c.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          accessibilityRole="radio"
          accessibilityState={{ selected: prefs.backgroundMode === 'category' }}
        >
          <Text
            style={[
              typeScale.body,
              {
                color:
                  prefs.backgroundMode === 'category'
                    ? c.accentText
                    : c.text,
              },
            ]}
          >
            Match my category
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setBackgroundMode('fixed')}
          style={({ pressed }) => [
            styles.modeRow,
            {
              backgroundColor:
                prefs.backgroundMode === 'fixed' ? c.accent : c.surface,
              borderColor:
                prefs.backgroundMode === 'fixed' ? c.accent : c.border,
              opacity: pressed ? 0.85 : 1,
              marginTop: space.xs,
            },
          ]}
          accessibilityRole="radio"
          accessibilityState={{ selected: prefs.backgroundMode === 'fixed' }}
        >
          <Text
            style={[
              typeScale.body,
              {
                color:
                  prefs.backgroundMode === 'fixed' ? c.accentText : c.text,
              },
            ]}
          >
            Pick one I like
          </Text>
        </Pressable>

        {prefs.backgroundMode === 'fixed' && (
          <View style={[styles.swatchGrid, { marginTop: space.md }]}>
            {PICKABLE_PALETTES.map((p) => {
              const selected = prefs.fixedPalette === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setFixedPalette(p.id)}
                  style={({ pressed }) => [
                    styles.swatch,
                    {
                      borderColor: selected ? c.accent : c.border,
                      borderWidth: selected ? 3 : 1,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={p.label}
                >
                  <View
                    style={[
                      styles.swatchColor,
                      { backgroundColor: p.swatch },
                    ]}
                  />
                  <Text
                    style={[
                      typeScale.caption,
                      { color: c.text, marginTop: space.xs },
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </Section>

      {/* SAVED */}
      <Section title="Saved" color={c.textMuted}>
        <Pressable
          onPress={() => navigation.navigate('Favorites')}
          style={({ pressed }) => [
            styles.linkRow,
            {
              backgroundColor: c.surface,
              borderColor: c.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          accessibilityRole="button"
        >
          <Text style={[typeScale.body, { color: c.text, flex: 1 }]}>
            Favorites
          </Text>
          <Text style={[typeScale.body, { color: c.textMuted }]}>
            {prefs.favorites.length === 0
              ? 'None saved'
              : `${prefs.favorites.length} saved`}
          </Text>
          <Text style={[styles.chevron, { color: c.textMuted }]}>›</Text>
        </Pressable>
      </Section>

      {/* RESET */}
      <Section title="Reset" color={c.textMuted}>
        <Pressable
          onPress={onResetOnboarding}
          style={({ pressed }) => [
            styles.linkRow,
            {
              backgroundColor: c.surface,
              borderColor: c.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[typeScale.body, { color: c.danger, flex: 1 }]}>
            Re-run onboarding
          </Text>
        </Pressable>
      </Section>

      {/* ABOUT */}
      <View style={styles.about}>
        <Text style={[typeScale.caption, { color: c.textMuted }]}>
          Allegedly · v0.1
        </Text>
        <Text
          style={[
            typeScale.caption,
            { color: c.textMuted, marginTop: 4 },
          ]}
        >
          Local-only. No data collected.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      {children}
    </View>
  );
}

function Row({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, typeScale.body, { color }]}>{label}</Text>
      <View style={styles.rowControl}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: space.lg,
    paddingBottom: space.xxxl,
  },
  section: {
    marginBottom: space.xl,
  },
  sectionTitle: {
    ...typeScale.caption,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.sm,
  },
  rowLabel: {
    width: 80,
  },
  rowControl: {
    flex: 1,
  },
  input: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  segments: {
    flexDirection: 'row',
    gap: space.xs,
  },
  segment: {
    flex: 1,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  modeRow: {
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  swatch: {
    width: '22%',
    aspectRatio: 0.8,
    borderRadius: radius.md,
    padding: space.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchColor: {
    width: '100%',
    flex: 1,
    borderRadius: radius.sm,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  chevron: {
    fontSize: 20,
    marginLeft: space.sm,
  },
  about: {
    alignItems: 'center',
    marginTop: space.lg,
  },
});
