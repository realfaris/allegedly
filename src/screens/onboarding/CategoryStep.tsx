// Step 2 — categories. Multi-select chips. Must pick at least one
// (parent enforces canAdvance).

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { useColorMode } from '../../theme/useColorMode';
import { neutrals } from '../../theme/colors';
import { type as typeScale } from '../../theme/typography';
import { space, radius } from '../../theme/spacing';
import { ALL_CATEGORIES } from '../../types';
import type { Category } from '../../types';

interface Props {
  value: Category[];
  onChange: (v: Category[]) => void;
}

const LABELS: Record<Category, { label: string; blurb: string }> = {
  motivational: {
    label: 'Motivational',
    blurb: 'Sincere — Emerson, Roosevelt, Keller',
  },
  anti_motivational: {
    label: 'Anti-motivational',
    blurb: 'Original. Cynical. Allegedly.',
  },
  dumb: {
    label: 'Dumb',
    blurb: 'Shitposts and second-mouse energy',
  },
  funny: {
    label: 'Funny',
    blurb: 'Twain, Wilde, Bierce',
  },
  stoic: {
    label: 'Stoic',
    blurb: 'Aurelius, Seneca, Epictetus',
  },
};

export function CategoryStep({ value, onChange }: Props) {
  const mode = useColorMode();
  const c = neutrals(mode);

  const toggle = (cat: Category) => {
    if (value.includes(cat)) {
      onChange(value.filter((v) => v !== cat));
    } else {
      onChange([...value, cat]);
    }
  };

  return (
    <View>
      <Text style={[typeScale.display, { color: c.text }]}>
        Pick your flavors.
      </Text>
      <Text style={[typeScale.body, { color: c.textMuted, marginTop: space.sm }]}>
        At least one. You can change these later.
      </Text>

      <View style={{ marginTop: space.xl, gap: space.sm }}>
        {ALL_CATEGORIES.map((cat) => {
          const selected = value.includes(cat);
          return (
            <Pressable
              key={cat}
              onPress={() => toggle(cat)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: selected ? c.accent : c.surface,
                  borderColor: selected ? c.accent : c.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
            >
              <Text
                style={[
                  typeScale.heading,
                  { color: selected ? c.accentText : c.text },
                ]}
              >
                {LABELS[cat].label}
              </Text>
              <Text
                style={[
                  typeScale.caption,
                  {
                    color: selected ? c.accentText : c.textMuted,
                    marginTop: space.xs,
                    opacity: selected ? 0.85 : 1,
                  },
                ]}
              >
                {LABELS[cat].blurb}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
