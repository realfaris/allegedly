// Shown for the brief window between app launch and the first prefs read.
// Intentionally minimal — a blank background. We don't show a spinner because
// on a typical device the read completes in <100ms and a flashing spinner
// looks worse than a quiet pause.

import React from 'react';
import { View, StyleSheet } from 'react-native';

export function LoadingScreen() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
