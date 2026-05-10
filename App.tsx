// App root. Composes the providers (safe-area + navigation container) and
// hands rendering off to RootNavigator. Anything app-wide that needs a
// provider (gesture handler, fonts, theme context) gets wrapped here.

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  EBGaramond_400Regular,
  EBGaramond_500Medium,
  EBGaramond_400Regular_Italic,
} from '@expo-google-fonts/eb-garamond';

import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  // EB Garamond is the signature serif for quote display + byline. Other
  // chrome (onboarding, settings) keeps system fonts so the brand reveal
  // lands on the QuoteScreen.
  const [fontsLoaded] = useFonts({
    EBGaramond_400Regular,
    EBGaramond_500Medium,
    EBGaramond_400Regular_Italic,
  });

  if (!fontsLoaded) {
    // Brief gate while the woff2 files load. Returning null shows the
    // native splash that Expo holds open by default.
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
