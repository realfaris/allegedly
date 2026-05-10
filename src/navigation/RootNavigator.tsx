// Root navigation graph.
//
// On mount, loads prefs from storage. If user hasn't onboarded, routes to
// the Onboarding flow; otherwise routes straight into Quote (main). The
// LoadingScreen handles the brief gap before prefs are read so we never
// flash the wrong screen.
//
// As of Phase 1 most of these screens are placeholders — wiring exists so
// later phases can drop real content in without touching navigation.

import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { loadPrefs } from '../storage/prefs';
import type { Prefs } from '../types';

import { LoadingScreen } from '../screens/LoadingScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { QuoteScreen } from '../screens/QuoteScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Quote: undefined;
  Favorites: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadPrefs();
      if (!cancelled) setPrefs(loaded);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!prefs) {
    return <LoadingScreen />;
  }

  const initialRoute = prefs.onboarded ? 'Quote' : 'Onboarding';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Quote" component={QuoteScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
