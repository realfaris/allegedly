// Placeholder. Real implementation in Phase 6 (read-only list of favorited
// quotes, tap to view, swipe-to-unfavorite).

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Favorites (Phase 6)</Text>
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
