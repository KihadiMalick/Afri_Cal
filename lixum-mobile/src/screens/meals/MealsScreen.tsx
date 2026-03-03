import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { usePreloadedData } from '@/context/DataPreloadContext';
import { Card } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { spacing, borderRadius } from '@/theme/spacing';
import type { Meal, MealsStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<MealsStackParamList>;

export function MealsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, locale } = useLocale();
  const navigation = useNavigation<Nav>();
  const { todayMeals: preloadedMeals, refresh } = usePreloadedData();

  const [meals, setMeals] = useState<Meal[]>(preloadedMeals);
  const [refreshing, setRefreshing] = useState(false);
  const accent = theme.accent;
  const todayStr = new Date().toISOString().split('T')[0];

  // Mettre à jour quand les données préchargées changent
  useEffect(() => { setMeals(preloadedMeals); }, [preloadedMeals]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(t.common.delete, locale === 'fr' ? 'Supprimer ce repas ?' : 'Delete this meal?', [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: async () => {
          await (supabase as any).from('meals').delete().eq('id', id);
          refresh();
        },
      },
    ]);
  };

  const totalCal = meals.reduce((s, m) => s + m.calories, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {locale === 'fr' ? 'Scan de plats' : 'Meal Scan'}
          </Text>
        </View>

        {/* Gros bouton scan central */}
        <TouchableOpacity
          style={[styles.scanBtn, { backgroundColor: accent }]}
          onPress={() => navigation.navigate('Scan')}
          activeOpacity={0.8}
        >
          <Text style={styles.scanIcon}>{'📸'}</Text>
          <Text style={styles.scanTitle}>
            {locale === 'fr' ? 'Scanner un plat' : 'Scan a meal'}
          </Text>
          <Text style={styles.scanSub}>
            {locale === 'fr' ? 'Analysez les calories en un clic' : 'Analyze calories in one click'}
          </Text>
        </TouchableOpacity>

        {/* Bouton upload photo */}
        <TouchableOpacity
          style={[styles.uploadBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.8,
              allowsEditing: true,
            });
            if (!result.canceled && result.assets[0]) {
              // Navigate to AddMeal with the selected image URI
              navigation.navigate('AddMeal');
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 22 }}>{'📷'}</Text>
          <Text style={[styles.uploadText, { color: theme.text }]}>
            {locale === 'fr' ? 'Charger une photo' : 'Upload a photo'}
          </Text>
        </TouchableOpacity>

        {/* Total du jour */}
        {meals.length > 0 && (
          <Card>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
                {locale === 'fr' ? 'Total du jour' : "Today's total"}
              </Text>
              <Text style={[styles.totalValue, { color: accent }]}>{totalCal} kcal</Text>
            </View>
          </Card>
        )}

        {/* Liste des repas du jour */}
        {meals.length > 0 && (
          <Card style={styles.mealsCard}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              {locale === 'fr' ? 'Repas du jour' : "Today's meals"}
            </Text>
            {meals.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                style={[styles.mealRow, { borderBottomColor: theme.border }]}
                onLongPress={() => handleDelete(meal.id)}
              >
                <View style={styles.mealInfo}>
                  <Text style={[styles.mealName, { color: theme.text }]}>{meal.name}</Text>
                  <Text style={[styles.mealType, { color: theme.textSecondary }]}>
                    {meal.meal_type} · P:{meal.protein ?? 0} G:{meal.carbs ?? 0} L:{meal.fat ?? 0}
                  </Text>
                </View>
                <View style={styles.mealCalContainer}>
                  <Text style={[styles.mealCal, { color: accent }]}>{meal.calories}</Text>
                  <Text style={[styles.mealCalUnit, { color: theme.textSecondary }]}>kcal</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Section Recettes */}
        <TouchableOpacity
          style={[styles.recipesBtn, { backgroundColor: theme.surface, borderColor: accent + '44' }]}
          onPress={() => navigation.navigate('Recipes')}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 28 }}>{'🍲'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.recipesBtnTitle, { color: theme.text }]}>
              {t.meals.recipes}
            </Text>
            <Text style={[styles.recipesBtnSub, { color: theme.textSecondary }]}>
              {locale === 'fr' ? 'Découvrir des idées de repas' : 'Discover meal ideas'}
            </Text>
          </View>
          <Text style={[styles.recipesArrow, { color: accent }]}>{'>'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing['4xl'] },
  header: { marginBottom: spacing.xs },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },

  scanBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    borderRadius: 20,
    gap: spacing.sm,
  },
  scanIcon: { fontSize: 48 },
  scanTitle: { fontSize: 20, fontWeight: '900', color: '#000' },
  scanSub: { fontSize: 13, fontWeight: '600', color: 'rgba(0,0,0,0.6)' },

  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  uploadText: { fontSize: 15, fontWeight: '700' },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalValue: { fontSize: 22, fontWeight: '900', fontVariant: ['tabular-nums'] },

  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing.md },
  mealsCard: { gap: 0 },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 15, fontWeight: '600' },
  mealType: { fontSize: 12, marginTop: 2 },
  mealCalContainer: { alignItems: 'flex-end' },
  mealCal: { fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  mealCalUnit: { fontSize: 10, fontWeight: '600' },

  recipesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  recipesBtnTitle: { fontSize: 16, fontWeight: '800' },
  recipesBtnSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  recipesArrow: { fontSize: 22, fontWeight: '700' },
});
