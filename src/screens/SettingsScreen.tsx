// Placeholder. Real implementation in Phase 6 (re-run onboarding,
// view favorites, about/privacy stub).

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Settings (Phase 6)</Text>
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
