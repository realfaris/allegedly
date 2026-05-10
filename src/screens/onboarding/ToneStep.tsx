// Step 3 — greeting tone. Single-select. Each option shows a preview
// greeting using the user's name + first selected category, so the choice
// is concrete rather than abstract.

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { useColorMode } from '../../theme/useColorMode';
import { neutrals } from '../../theme/colors';
import { type as typeScale } from '../../theme/typography';
import { space, radius } from '../../theme/spacing';
import type { Category, Tone } from '../../types';

interface Props {
  value: Tone;
  onChange: (v: Tone) => void;
  name: string | undefined;
  previewCategory: Category;
}

interface OptionMeta {
  id: Tone;
  label: string;
  description: string;
}

const OPTIONS: OptionMeta[] = [
  {
    id: 'sincere',
    label: 'Sincere',
    description: 'Earnest. Plays the quote straight.',
  },
  {
    id: 'sassy',
    label: 'Sassy',
    description: 'A little unhinged. Earns its keep on bad mornings.',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'No greeting. Just the quote.',
  },
];

// Preview greeting for the morning slot, parameterized by category × tone.
// Phase 5 will share a real `getGreeting` helper across app and widget;
// this is a self-contained preview so onboarding doesn't depend on that yet.
function previewGreeting(
  tone: Tone,
  category: Category,
  name: string | undefined,
): string {
  const who = name ? `, ${name}` : '';
  if (tone === 'minimal') return '(no greeting — just the quote)';
  if (tone === 'sincere') return `Good morning${who}`;
  // sassy
  switch (category) {
    case 'anti_motivational':
      return name ? `Wake up, ${name}` : 'Wake up, idiot';
    case 'motivational':
      return `Time to fake it${who}`;
    case 'stoic':
      return `Memento mori${who}`;
    case 'dumb':
      return name ? `wake up babe, ${name}` : 'wake up babe new cope just dropped';
    case 'funny':
      return `Up and at 'em${who}`;
    default:
      return `Morning${who}`;
  }
}

export function ToneStep({ value, onChange, name, previewCategory }: Props) {
  const mode = useColorMode();
  const c = neutrals(mode);

  return (
    <View>
      <Text style={[typeScale.display, { color: c.text }]}>How should we greet you?</Text>
      <Text style={[typeScale.body, { color: c.textMuted, marginTop: space.sm }]}>
        Each pick changes the morning line above your quote.
      </Text>

      <View style={{ marginTop: space.xl, gap: space.sm }}>
        {OPTIONS.map((opt) => {
          const selected = value === opt.id;
          const preview = previewGreeting(opt.id, previewCategory, name);
          return (
            <Pressable
              key={opt.id}
              onPress={() => onChange(opt.id)}
              style={({ pressed }) => [
                styles.card,
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
                  typeScale.heading,
                  { color: selected ? c.accentText : c.text },
                ]}
              >
                {opt.label}
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
                {opt.description}
              </Text>
              <Text
                style={[
                  styles.preview,
                  typeScale.greeting,
                  {
                    color: selected ? c.accentText : c.textMuted,
                    opacity: selected ? 0.95 : 0.85,
                  },
                ]}
              >
                {preview}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
  preview: {
    marginTop: space.md,
    fontStyle: 'italic',
  },
});
