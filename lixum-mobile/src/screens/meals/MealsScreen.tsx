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
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { Card, Button } from '@/components/ui';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { supabase } from '@/lib/supabase';
import { spacing } from '@/theme/spacing';
import type { Meal, MealsStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<MealsStackParamList>;

export function MealsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, locale } = useLocale();
  const navigation = useNavigation<Nav>();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const accent = theme.accent;

  const loadMeals = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayStr)
      .order('created_at', { ascending: false });
    setMeals((data as Meal[]) ?? []);
    setLoading(false);
  }, [user, todayStr]);

  useEffect(() => { loadMeals(); }, [loadMeals]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      t.common.delete,
      locale === 'fr' ? 'Supprimer ce repas ?' : 'Delete this meal?',
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            await (supabase as any).from('meals').delete().eq('id', id);
            loadMeals();
          },
        },
      ],
    );
  };

  const totalCal = meals.reduce((s, m) => s + m.calories, 0);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{t.meals.title}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {locale === 'fr' ? 'Suivi alimentaire du jour' : "Today's food tracker"}
          </Text>
        </View>

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          <Button
            title={t.meals.scanMeal}
            onPress={() => navigation.navigate('Scan')}
            variant="accent"
            size="md"
            style={{ flex: 1 }}
          />
          <Button
            title={t.meals.addMeal}
            onPress={() => navigation.navigate('AddMeal')}
            variant="secondary"
            size="md"
            style={{ flex: 1 }}
          />
        </View>

        {/* Total Card */}
        <Card>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
              {t.meals.totalCalories}
            </Text>
            <Text style={[styles.totalValue, { color: accent }]}>
              {totalCal} kcal
            </Text>
          </View>
        </Card>

        {/* Meals List */}
        <Card style={styles.mealsCard}>
          {meals.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {t.meals.noMeals}
            </Text>
          ) : (
            meals.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                style={[styles.mealRow, { borderBottomColor: theme.border }]}
                onLongPress={() => handleDelete(meal.id)}
              >
                <View style={styles.mealInfo}>
                  <Text style={[styles.mealName, { color: theme.text }]}>{meal.name}</Text>
                  <Text style={[styles.mealType, { color: theme.textSecondary }]}>
                    {meal.meal_type} · {meal.protein ?? 0}p / {meal.carbs ?? 0}g / {meal.fat ?? 0}f
                  </Text>
                </View>
                <View style={styles.mealCalContainer}>
                  <Text style={[styles.mealCal, { color: accent }]}>{meal.calories}</Text>
                  <Text style={[styles.mealCalUnit, { color: theme.textSecondary }]}>kcal</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing['4xl'] },
  header: { marginBottom: spacing.xs },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: spacing.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalValue: { fontSize: 22, fontWeight: '900', fontVariant: ['tabular-nums'] },
  mealsCard: { gap: 0 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: spacing['2xl'] },
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
});
