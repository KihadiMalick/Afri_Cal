import React, { useState, useEffect, useCallback } from 'react';
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

interface MealSuggestion {
  id: string;
  name: string;
  kcal_per_100g: number | null;
  protein_per_100g: number | null;
  carbs_per_100g: number | null;
  fat_per_100g: number | null;
  country_origin: string | null;
}

/**
 * Normalise un texte pour la recherche floue.
 * Gère les variantes de noms africains
 * (thiéboudienne, tieboudieune, tieb dieune → tiebudine)
 */
function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ou/g, 'u')
    .replace(/ie/g, 'i')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/** Correspondance floue entre un nom de plat et une recherche */
function matchesFuzzy(mealName: string, query: string): boolean {
  const normalizedMeal = normalizeSearch(mealName);
  const normalizedQuery = normalizeSearch(query);
  if (normalizedQuery.length < 2) return false;
  if (normalizedMeal.includes(normalizedQuery)) return true;
  if (normalizedQuery.length > 4 && normalizedMeal.startsWith(normalizedQuery.substring(0, 4))) return true;
  return false;
}

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

  // Recherche et suggestions
  const [allMeals, setAllMeals] = useState<MealSuggestion[]>([]);
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dbLoaded, setDbLoaded] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const accent = theme.accent;

  const mealTypeLabels: Record<string, string> = {
    breakfast: t.meals.breakfast,
    lunch: t.meals.lunch,
    dinner: t.meals.dinner,
    snack: t.meals.snack,
  };

  // Charger la base de données des plats
  useEffect(() => {
    async function loadMealsDb() {
      const { data } = await (supabase as any)
        .from('meals_master')
        .select('id, name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, country_origin')
        .order('name', { ascending: true });
      if (data) setAllMeals(data as MealSuggestion[]);
      setDbLoaded(true);
    }
    loadMealsDb();
  }, []);

  // Filtrer les suggestions en temps réel
  const handleNameChange = useCallback((text: string) => {
    setName(text);
    if (text.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = allMeals.filter((m) => matchesFuzzy(m.name, text));
    setSuggestions(filtered.slice(0, 8));
    setShowSuggestions(filtered.length > 0);
  }, [allMeals]);

  // Sélectionner une suggestion — pré-remplir pour 350g
  const handleSelectSuggestion = (meal: MealSuggestion) => {
    setName(meal.name);
    const portion = 3.5;
    setCalories(String(Math.round((meal.kcal_per_100g || 0) * portion)));
    setProtein(String(Math.round((meal.protein_per_100g || 0) * portion)));
    setCarbs(String(Math.round((meal.carbs_per_100g || 0) * portion)));
    setFat(String(Math.round((meal.fat_per_100g || 0) * portion)));
    setShowSuggestions(false);
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
              <Text style={[styles.backText, { color: accent }]}>{t.common.back}</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>{t.meals.addMeal}</Text>
          </View>

          {/* Type de repas */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>{t.meals.mealType}</Text>
          <View style={styles.typeRow}>
            {MEAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: mealType === type ? accent : theme.surface,
                    borderColor: mealType === type ? accent : theme.border,
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

          {/* Champ nom avec recherche intelligente */}
          <View style={{ zIndex: 10 }}>
            <Input
              label={t.meals.name}
              value={name}
              onChangeText={handleNameChange}
              placeholder={locale === 'fr' ? 'Thiéboudienne, Yassa, Mafé...' : 'Search a meal...'}
            />

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={[styles.suggestionsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {suggestions.map((meal) => (
                  <TouchableOpacity
                    key={meal.id}
                    style={[styles.suggestionRow, { borderBottomColor: theme.border }]}
                    onPress={() => handleSelectSuggestion(meal)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.suggestionName, { color: theme.text }]}>{meal.name}</Text>
                      {meal.country_origin && (
                        <Text style={[styles.suggestionOrigin, { color: theme.textSecondary }]}>
                          {meal.country_origin}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.suggestionCal, { color: accent }]}>
                      {meal.kcal_per_100g || '?'} kcal/100g
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!dbLoaded && name.length >= 2 && (
              <Text style={[styles.loadingHint, { color: theme.textSecondary }]}>
                {locale === 'fr' ? 'Chargement des suggestions...' : 'Loading suggestions...'}
              </Text>
            )}
          </View>

          {/* Champs nutritionnels */}
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

  suggestionsContainer: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    marginTop: -spacing.sm,
    overflow: 'hidden',
    maxHeight: 280,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionName: { fontSize: 14, fontWeight: '600' },
  suggestionOrigin: { fontSize: 11, marginTop: 2 },
  suggestionCal: { fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  loadingHint: { fontSize: 12, fontStyle: 'italic', marginTop: spacing.xs },
});
