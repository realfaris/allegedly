// Four-step onboarding: name → categories → tone → background.
//
// Holds a `draft` Prefs object across steps and only persists on completion,
// so backing out mid-flow leaves storage untouched. On finish, calls
// updatePrefs with onboarded:true and resets nav stack to Quote, so the
// system back gesture can't return the user into onboarding.

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useColorMode } from '../theme/useColorMode';
import { neutrals } from '../theme/colors';
import { type as typeScale } from '../theme/typography';
import { space } from '../theme/spacing';
import { Button } from '../components/Button';
import { updatePrefs, DEFAULT_PREFS } from '../storage/prefs';
import type {
  Category,
  PaletteId,
  Prefs,
  Tone,
  BackgroundMode,
} from '../types';
import type { RootStackParamList } from '../navigation/RootNavigator';

import { NameStep } from './onboarding/NameStep';
import { CategoryStep } from './onboarding/CategoryStep';
import { ToneStep } from './onboarding/ToneStep';
import { BackgroundStep } from './onboarding/BackgroundStep';

type Step = 1 | 2 | 3 | 4;
const TOTAL_STEPS = 4;

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen() {
  const mode = useColorMode();
  const c = neutrals(mode);
  const navigation = useNavigation<Nav>();

  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<Prefs>(DEFAULT_PREFS);

  const setName = useCallback(
    (name: string) =>
      setDraft((d) => ({ ...d, name: name.trim() || undefined })),
    [],
  );
  const setCategories = useCallback(
    (categories: Category[]) => setDraft((d) => ({ ...d, categories })),
    [],
  );
  const setTone = useCallback(
    (tone: Tone) => setDraft((d) => ({ ...d, tone })),
    [],
  );
  const setBackground = useCallback(
    (mode: BackgroundMode, palette?: PaletteId) =>
      setDraft((d) => ({
        ...d,
        backgroundMode: mode,
        fixedPalette: mode === 'fixed' ? palette : undefined,
      })),
    [],
  );

  const canAdvance = (): boolean => {
    if (step === 1) return true; // name optional
    if (step === 2) return draft.categories.length >= 1;
    if (step === 3) return true; // tone always has a default
    if (step === 4) {
      if (draft.backgroundMode === 'category') return true;
      return !!draft.fixedPalette;
    }
    return false;
  };

  const next = useCallback(async () => {
    if (step < TOTAL_STEPS) {
      setStep(((step as number) + 1) as Step);
      return;
    }
    // Step 4 — finalize
    await updatePrefs({ ...draft, onboarded: true });
    // Reset stack so back gesture doesn't return to onboarding
    navigation.reset({ index: 0, routes: [{ name: 'Quote' }] });
  }, [step, draft, navigation]);

  const back = useCallback(() => {
    if (step > 1) setStep(((step as number) - 1) as Step);
  }, [step]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <View style={styles.progress}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
          const filled = i + 1 <= step;
          return (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: filled ? c.accent : c.border,
                  width: i + 1 === step ? 24 : 8,
                },
              ]}
            />
          );
        })}
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <NameStep value={draft.name ?? ''} onChange={setName} />
        )}
        {step === 2 && (
          <CategoryStep value={draft.categories} onChange={setCategories} />
        )}
        {step === 3 && (
          <ToneStep
            value={draft.tone}
            onChange={setTone}
            name={draft.name}
            previewCategory={draft.categories[0] ?? 'motivational'}
          />
        )}
        {step === 4 && (
          <BackgroundStep
            mode={draft.backgroundMode}
            palette={draft.fixedPalette}
            onChange={setBackground}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 ? (
          <Button label="Back" variant="ghost" onPress={back} />
        ) : (
          <View />
        )}
        <View style={styles.spacer} />
        <Button
          label={step === TOTAL_STEPS ? 'Done' : 'Continue'}
          onPress={next}
          disabled={!canAdvance()}
        />
      </View>
      <Text style={[styles.stepLabel, { color: c.textMuted }]}>
        Step {step} of {TOTAL_STEPS}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  progress: {
    flexDirection: 'row',
    gap: space.xs,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    paddingBottom: space.lg,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  stepLabel: {
    ...typeScale.caption,
    textAlign: 'center',
    paddingBottom: space.md,
  },
});
