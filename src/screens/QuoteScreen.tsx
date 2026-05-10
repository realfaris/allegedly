// Placeholder for the main quote screen. Real implementation in Phase 5
// (typography, swipe gestures, greeting, heart, share, rotation engine).

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function QuoteScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Quote screen (Phase 5)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  label: {
    color: '#fff',
    fontSize: 18,
  },
});
