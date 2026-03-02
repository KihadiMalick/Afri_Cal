import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { Input, Button } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { updateDailySummary } from '@/utils/daily-summary';
import { spacing, borderRadius } from '@/theme/spacing';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export function AddMealScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, locale } = useLocale();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<typeof MEAL_TYPES[number]>('lunch');
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const mealTypeLabels: Record<string, string> = {
    breakfast: t.meals.breakfast,
    lunch: t.meals.lunch,
    dinner: t.meals.dinner,
    snack: t.meals.snack,
  };

  const handleSave = async () => {
    if (!user || !name.trim() || !calories.trim()) return;
    setLoading(true);

    const { error } = await supabase.from('meals').insert({
      user_id: user.id,
      name: name.trim(),
      calories: parseInt(calories, 10) || 0,
      protein: parseInt(protein, 10) || 0,
      carbs: parseInt(carbs, 10) || 0,
      fat: parseInt(fat, 10) || 0,
      meal_type: mealType,
      date: todayStr,
    });

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }

    await updateDailySummary(supabase, user.id, todayStr);
    setLoading(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[styles.backText, { color: theme.accent }]}>{t.common.back}</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>{t.meals.addMeal}</Text>
          </View>

          {/* Meal Type Selector */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>{t.meals.mealType}</Text>
          <View style={styles.typeRow}>
            {MEAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: mealType === type ? theme.accent : theme.surface,
                    borderColor: mealType === type ? theme.accent : theme.border,
                  },
                ]}
                onPress={() => setMealType(type)}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    { color: mealType === type ? '#000' : theme.textSecondary },
                  ]}
                >
                  {mealTypeLabels[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Fields */}
          <Input label={t.meals.name} value={name} onChangeText={setName} placeholder="Thiéboudienne..." />
          <Input label={t.meals.calories} value={calories} onChangeText={setCalories} placeholder="420" keyboardType="numeric" />

          <View style={styles.macroRow}>
            <View style={{ flex: 1 }}>
              <Input label={t.meals.protein} value={protein} onChangeText={setProtein} placeholder="25" keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label={t.meals.carbs} value={carbs} onChangeText={setCarbs} placeholder="60" keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label={t.meals.fat} value={fat} onChangeText={setFat} placeholder="15" keyboardType="numeric" />
            </View>
          </View>

          <Button
            title={t.common.save}
            onPress={handleSave}
            loading={loading}
            fullWidth
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing['4xl'] },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.md },
  backText: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '900' },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  typeRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  typeChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  typeChipText: { fontSize: 13, fontWeight: '600' },
  macroRow: { flexDirection: 'row', gap: spacing.md },
});
