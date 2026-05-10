// Step 1 — name. Optional. We pass empty string up if user skips.

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

import { useColorMode } from '../../theme/useColorMode';
import { neutrals } from '../../theme/colors';
import { type as typeScale } from '../../theme/typography';
import { space, radius } from '../../theme/spacing';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function NameStep({ value, onChange }: Props) {
  const mode = useColorMode();
  const c = neutrals(mode);

  return (
    <View>
      <Text style={[typeScale.display, { color: c.text }]}>
        What should we call you?
      </Text>
      <Text style={[typeScale.body, { color: c.textMuted, marginTop: space.sm }]}>
        Used in greetings. Skip if you'd rather not.
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Your name"
        placeholderTextColor={c.textMuted}
        autoFocus
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        style={[
          styles.input,
          typeScale.body,
          {
            color: c.text,
            backgroundColor: c.surface,
            borderColor: c.border,
          },
        ]}
        maxLength={32}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    marginTop: space.xl,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
});
