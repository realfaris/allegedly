// Vertical gradient background for the QuoteScreen.
//
// This is the visual surface the entire app is judged on, so it's
// intentionally tiny and dependency-light: just expo-linear-gradient with
// stops from a Palette. No animation, no overlays — quiet by design.
//
// If we add subtle motion later (slow pan / parallax / film grain), it
// goes here so the rest of the app doesn't have to think about it.

import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';

import type { Palette } from '../theme/palettes';

interface Props {
  palette: Palette;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function QuoteBackground({ palette, style, children }: Props) {
  // expo-linear-gradient wants a colors array; locations default to even.
  return (
    <LinearGradient
      colors={palette.stops as unknown as readonly [string, string, ...string[]]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.fill, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
