// Placeholder. Real 4-step onboarding flow lands in Phase 3
// (name → categories → tone → background).

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Onboarding (Phase 3)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  label: {
    color: '#fff',
    fontSize: 18,
  },
});
