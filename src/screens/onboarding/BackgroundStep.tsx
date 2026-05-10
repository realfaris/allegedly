// Step 4 — background. Two top-level options:
//   1. Match category (default) — the quote screen palette shifts with the
//      active category each time-of-day window.
//   2. Pick one — user locks a single curated palette and it never changes.
//
// Final swatches and gradients land in Phase 4. For now we render a flat
// representative color per palette so the picker is at least functional.

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { useColorMode } from '../../theme/useColorMode';
import { neutrals } from '../../theme/colors';
import { type as typeScale } from '../../theme/typography';
import { space, radius } from '../../theme/spacing';
import type { BackgroundMode, PaletteId } from '../../types';

interface Props {
  mode: BackgroundMode;
  palette: PaletteId | undefined;
  onChange: (mode: BackgroundMode, palette?: PaletteId) => void;
}

interface PaletteOption {
  id: PaletteId;
  label: string;
  swatch: string; // single representative color until Phase 4 gradients
}

// User-pickable curated set. Category-default palettes
// (sunrise/noir/stone/pastel/sunbeam) are not exposed here — those bind to
// a category, not to a fixed-palette choice.
const PALETTES: PaletteOption[] = [
  { id: 'dusk', label: 'Dusk', swatch: '#3D2E5C' },
  { id: 'midnight', label: 'Midnight', swatch: '#0E1A2B' },
  { id: 'parchment', label: 'Parchment', swatch: '#E8DEC2' },
  { id: 'oceanic', label: 'Oceanic', swatch: '#1E5A78' },
  { id: 'rose', label: 'Rose', swatch: '#C77B89' },
  { id: 'forest', label: 'Forest', swatch: '#2F4A3A' },
  { id: 'monochrome', label: 'Monochrome', swatch: '#3A3A38' },
  { id: 'amber', label: 'Amber', swatch: '#B57340' },
];

export function BackgroundStep({ mode, palette, onChange }: Props) {
  const cmode = useColorMode();
  const c = neutrals(cmode);

  return (
    <View>
      <Text style={[typeScale.display, { color: c.text }]}>
        How should the background feel?
      </Text>
      <Text style={[typeScale.body, { color: c.textMuted, marginTop: space.sm }]}>
        You can change this in settings later.
      </Text>

      <View style={{ marginTop: space.xl, gap: space.sm }}>
        <Pressable
          onPress={() => onChange('category')}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: mode === 'category' ? c.accent : c.surface,
              borderColor: mode === 'category' ? c.accent : c.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          accessibilityRole="radio"
          accessibilityState={{ selected: mode === 'category' }}
        >
          <Text
            style={[
              typeScale.heading,
              { color: mode === 'category' ? c.accentText : c.text },
            ]}
          >
            Match my category
          </Text>
          <Text
            style={[
              typeScale.caption,
              {
                color: mode === 'category' ? c.accentText : c.textMuted,
                marginTop: space.xs,
                opacity: mode === 'category' ? 0.85 : 1,
              },
            ]}
          >
            Background shifts with the vibe of the active category.
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            onChange('fixed', palette ?? PALETTES[0].id)
          }
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: mode === 'fixed' ? c.accent : c.surface,
              borderColor: mode === 'fixed' ? c.accent : c.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          accessibilityRole="radio"
          accessibilityState={{ selected: mode === 'fixed' }}
        >
          <Text
            style={[
              typeScale.heading,
              { color: mode === 'fixed' ? c.accentText : c.text },
            ]}
          >
            Pick one I like
          </Text>
          <Text
            style={[
              typeScale.caption,
              {
                color: mode === 'fixed' ? c.accentText : c.textMuted,
                marginTop: space.xs,
                opacity: mode === 'fixed' ? 0.85 : 1,
              },
            ]}
          >
            Same palette every time, regardless of category.
          </Text>
        </Pressable>
      </View>

      {mode === 'fixed' && (
        <View style={{ marginTop: space.lg }}>
          <Text style={[typeScale.caption, { color: c.textMuted }]}>
            Choose a palette
          </Text>
          <View style={styles.grid}>
            {PALETTES.map((p) => {
              const selected = palette === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => onChange('fixed', p.id)}
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
                    style={[styles.swatchColor, { backgroundColor: p.swatch }]}
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
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  grid: {
    marginTop: space.sm,
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
});
