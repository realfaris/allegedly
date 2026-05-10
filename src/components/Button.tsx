// Primary / secondary / ghost button. Theme-aware via useColorMode.
// Use this everywhere instead of raw <Pressable> so styling is consistent.

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  PressableStateCallbackType,
} from 'react-native';

import { useColorMode } from '../theme/useColorMode';
import { neutrals } from '../theme/colors';
import { type as typeScale } from '../theme/typography';
import { space, radius } from '../theme/spacing';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  style,
}: Props) {
  const mode = useColorMode();
  const c = neutrals(mode);

  const containerStyle = (state: PressableStateCallbackType): ViewStyle => {
    const base: ViewStyle = {
      paddingVertical: space.md,
      paddingHorizontal: space.lg,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.4 : state.pressed ? 0.85 : 1,
      ...(fullWidth ? { alignSelf: 'stretch' } : {}),
    };
    if (variant === 'primary') {
      return { ...base, backgroundColor: c.accent };
    }
    if (variant === 'secondary') {
      return {
        ...base,
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.border,
      };
    }
    return { ...base, backgroundColor: 'transparent' };
  };

  const labelStyle: TextStyle = {
    ...typeScale.button,
    color:
      variant === 'primary'
        ? c.accentText
        : variant === 'secondary'
        ? c.text
        : c.textMuted,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={(state) => [containerStyle(state), style]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={labelStyle}>{label}</Text>
    </Pressable>
  );
}

// Useful for cases where buttons sit side-by-side with consistent gap.
export const buttonRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.sm,
  },
});
