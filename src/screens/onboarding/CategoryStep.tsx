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

// Each category gets a hand-picked example so the user feels the vibe
// before committing. These are editorial picks — not pulled randomly from
// the pack — so each category leads with its strongest representative.
const LABELS: Record<
  Category,
  { label: string; blurb: string; example: string; exampleAuthor: string }
> = {
  motivational: {
    label: 'Motivational',
    blurb: 'Sincere — Emerson, Roosevelt, Keller',
    example: 'Hitch your wagon to a star.',
    exampleAuthor: 'Emerson',
  },
  anti_motivational: {
    label: 'Anti-motivational',
    blurb: 'Original. Cynical. Allegedly.',
    example:
      'Behind every dead body on Mount Everest was once a highly motivated individual.',
    exampleAuthor: 'Allegedly',
  },
  dumb: {
    label: 'Dumb',
    blurb: 'Shitposts and second-mouse energy',
    example:
      'The early bird gets the worm, but the second mouse gets the cheese.',
    exampleAuthor: 'Allegedly',
  },
  funny: {
    label: 'Funny',
    blurb: 'Twain, Wilde, Bierce',
    example: 'I have never let my schooling interfere with my education.',
    exampleAuthor: 'Twain',
  },
  stoic: {
    label: 'Stoic',
    blurb: 'Aurelius, Seneca, Epictetus',
    example: 'Confine yourself to the present.',
    exampleAuthor: 'Aurelius',
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
              <Text
                style={[
                  styles.example,
                  {
                    color: selected ? c.accentText : c.text,
                    opacity: selected ? 0.95 : 0.85,
                  },
                ]}
              >
                “{LABELS[cat].example}”
              </Text>
              <Text
                style={[
                  typeScale.caption,
                  styles.exampleAuthor,
                  {
                    color: selected ? c.accentText : c.textMuted,
                    opacity: selected ? 0.8 : 0.7,
                  },
                ]}
              >
                — {LABELS[cat].exampleAuthor}
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
  example: {
    marginTop: space.sm,
    fontSize: 15,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  exampleAuthor: {
    marginTop: space.xs,
  },
});
