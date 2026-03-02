import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { Input, Button, Card } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { getCalorieCalculation } from '@/utils/calories';
import { spacing, borderRadius } from '@/theme/spacing';

type Gender = 'male' | 'female';
type Goal = 'lose' | 'maintain' | 'gain';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

export function OnboardingScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, locale } = useLocale();
  const navigation = useNavigation();

  const [step, setStep] = useState(0);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const accent = theme.accent;

  const STEPS = [
    { title: locale === 'fr' ? 'Informations de base' : 'Basic Info', key: 'basic' },
    { title: locale === 'fr' ? 'Objectif & Activité' : 'Goal & Activity', key: 'goal' },
    { title: locale === 'fr' ? 'Confirmation' : 'Confirmation', key: 'confirm' },
  ];

  const handleSave = async () => {
    if (!user) return;

    const w = parseFloat(weight) || 70;
    const h = parseFloat(height) || 170;
    const a = parseInt(age, 10) || 25;

    const calc = getCalorieCalculation(w, h, a, gender, activityLevel, goal, 5, 3);

    setLoading(true);

    const { error } = await (supabase as any)
      .from('users_profile')
      .upsert({
        user_id: user.id,
        full_name: fullName.trim() || null,
        age: a,
        weight: w,
        height: h,
        gender,
        goal,
        activity_level: activityLevel,
        bmr: calc.bmr,
        tdee: calc.tdee,
        daily_calorie_target: calc.dailyTarget,
      }, { onConflict: 'user_id' });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert(t.onboarding.success);
    navigation.goBack();
  };

  const canNext = () => {
    if (step === 0) return !!age && !!weight && !!height;
    return true;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[styles.backText, { color: accent }]}>{t.common.back}</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>{t.onboarding.welcome}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t.onboarding.subtitle}</Text>
          </View>

          {/* Progress */}
          <View style={styles.progressRow}>
            {STEPS.map((s, i) => (
              <View key={s.key} style={styles.progressItem}>
                <View style={[styles.progressDot, { backgroundColor: i <= step ? accent : theme.border }]} />
                <Text style={[styles.progressLabel, { color: i <= step ? accent : theme.textSecondary }]}>
                  {s.title}
                </Text>
              </View>
            ))}
          </View>

          {/* Step 0: Basic Info */}
          {step === 0 && (
            <Card style={styles.stepCard}>
              <Input
                label={locale === 'fr' ? 'Nom complet' : 'Full name'}
                value={fullName}
                onChangeText={setFullName}
                placeholder="John Doe"
              />
              <Input label={t.onboarding.age} value={age} onChangeText={setAge} placeholder="25" keyboardType="numeric" />
              <Input label={t.onboarding.weight} value={weight} onChangeText={setWeight} placeholder="70" keyboardType="numeric" />
              <Input label={t.onboarding.height} value={height} onChangeText={setHeight} placeholder="170" keyboardType="numeric" />

              <Text style={[styles.chipLabel, { color: theme.textSecondary }]}>{t.onboarding.gender}</Text>
              <View style={styles.chipRow}>
                {([
                  { key: 'male' as Gender, label: t.onboarding.male },
                  { key: 'female' as Gender, label: t.onboarding.female },
                ]).map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.chip, { backgroundColor: gender === key ? accent : theme.surface, borderColor: gender === key ? accent : theme.border }]}
                    onPress={() => setGender(key)}
                  >
                    <Text style={[styles.chipText, { color: gender === key ? '#000' : theme.textSecondary }]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {/* Step 1: Goal & Activity */}
          {step === 1 && (
            <Card style={styles.stepCard}>
              <Text style={[styles.chipLabel, { color: theme.textSecondary }]}>{t.onboarding.goal}</Text>
              <View style={styles.chipRow}>
                {([
                  { key: 'lose' as Goal, label: t.onboarding.loseWeight },
                  { key: 'maintain' as Goal, label: t.onboarding.maintainWeight },
                  { key: 'gain' as Goal, label: t.onboarding.gainWeight },
                ]).map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.chip, { backgroundColor: goal === key ? accent : theme.surface, borderColor: goal === key ? accent : theme.border }]}
                    onPress={() => setGoal(key)}
                  >
                    <Text style={[styles.chipText, { color: goal === key ? '#000' : theme.textSecondary }]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.chipLabel, { color: theme.textSecondary, marginTop: spacing.xl }]}>
                {t.onboarding.activityLevel}
              </Text>
              <View style={styles.chipRow}>
                {([
                  { key: 'sedentary' as ActivityLevel, label: t.onboarding.sedentary },
                  { key: 'light' as ActivityLevel, label: t.onboarding.light },
                  { key: 'moderate' as ActivityLevel, label: t.onboarding.moderate },
                  { key: 'active' as ActivityLevel, label: t.onboarding.active },
                ]).map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.chip, { backgroundColor: activityLevel === key ? accent : theme.surface, borderColor: activityLevel === key ? accent : theme.border }]}
                    onPress={() => setActivityLevel(key)}
                  >
                    <Text style={[styles.chipText, { color: activityLevel === key ? '#000' : theme.textSecondary }]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && (
            <Card style={styles.stepCard}>
              <Text style={[styles.confirmTitle, { color: theme.text }]}>
                {locale === 'fr' ? 'Résumé' : 'Summary'}
              </Text>
              <SummaryRow label={t.onboarding.age} value={age} theme={theme} />
              <SummaryRow label={t.onboarding.weight} value={`${weight} kg`} theme={theme} />
              <SummaryRow label={t.onboarding.height} value={`${height} cm`} theme={theme} />
              <SummaryRow label={t.onboarding.gender} value={gender === 'male' ? t.onboarding.male : t.onboarding.female} theme={theme} />
              <SummaryRow label={t.onboarding.goal} value={goal === 'lose' ? t.onboarding.loseWeight : goal === 'gain' ? t.onboarding.gainWeight : t.onboarding.maintainWeight} theme={theme} />
              <SummaryRow label={t.onboarding.activityLevel} value={t.onboarding[activityLevel]} theme={theme} />
            </Card>
          )}

          {/* Navigation buttons */}
          <View style={styles.navRow}>
            {step > 0 && (
              <Button
                title={t.common.back}
                onPress={() => setStep(s => s - 1)}
                variant="secondary"
                style={{ flex: 1 }}
              />
            )}
            {step < STEPS.length - 1 ? (
              <Button
                title={t.common.next}
                onPress={() => setStep(s => s + 1)}
                disabled={!canNext()}
                style={{ flex: 1 }}
              />
            ) : (
              <Button
                title={t.onboarding.complete}
                onPress={handleSave}
                loading={loading}
                style={{ flex: 1 }}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={summaryStyles.row}>
      <Text style={[summaryStyles.label, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[summaryStyles.value, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.05)' },
  label: { fontSize: 14, fontWeight: '500' },
  value: { fontSize: 14, fontWeight: '700' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing['4xl'] },
  header: { gap: spacing.xs },
  backText: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '900', marginTop: spacing.sm },
  subtitle: { fontSize: 13, fontWeight: '500' },

  progressRow: { flexDirection: 'row', justifyContent: 'space-around', gap: spacing.md },
  progressItem: { alignItems: 'center', gap: spacing.xs },
  progressDot: { width: 10, height: 10, borderRadius: 5 },
  progressLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  stepCard: { gap: spacing.sm },
  chipLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: borderRadius.full, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },

  confirmTitle: { fontSize: 18, fontWeight: '800', marginBottom: spacing.sm },

  navRow: { flexDirection: 'row', gap: spacing.md },
});
