import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { usePreloadedData } from '@/context/DataPreloadContext';
import { Card } from '@/components/ui';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { CalorieOvershootAlert } from '@/components/CalorieOvershootAlert';
import { calculateDailyScore } from '@/utils/daily-score';
import { spacing, borderRadius } from '@/theme/spacing';
import type { RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
  const { theme } = useTheme();
  const { t, locale } = useLocale();
  const navigation = useNavigation<Nav>();
  const { profile, todayMeals: meals, todaySummary: summary, streak, projectedWeight, ready, refresh } = usePreloadedData();

  const [refreshing, setRefreshing] = useState(false);
  const [showOvershoot, setShowOvershoot] = useState(false);
  const overshootShownRef = useRef(false);
  const accent = theme.accent;

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (!ready) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.onboardingPrompt}>
          <Text style={[styles.onboardingText, { color: theme.text }]}>
            {t.dashboard.completeOnboarding}
          </Text>
          <TouchableOpacity
            style={[styles.onboardingBtn, { backgroundColor: accent }]}
            onPress={() => navigation.navigate('Onboarding')}
          >
            <Text style={styles.onboardingBtnText}>{t.dashboard.goToOnboarding}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const consumed = summary?.total_calories_consumed ?? meals.reduce((s, m) => s + m.calories, 0);
  const burned = summary?.total_calories_burned ?? 0;
  const target = profile.daily_calorie_target;
  const remaining = Math.max(0, target - consumed + burned);
  const netConsumed = consumed - burned;
  const overshootKcal = Math.max(0, netConsumed - target);
  const progress = Math.min(1, consumed / target);

  const dailyScore = calculateDailyScore(consumed, burned, target);

  // Show overshoot alert once when calories exceed target
  useEffect(() => {
    if (overshootKcal > 0 && !overshootShownRef.current) {
      overshootShownRef.current = true;
      setShowOvershoot(true);
    }
  }, [overshootKcal]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            {t.dashboard.welcome} {'👋'}
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            {profile.full_name || t.dashboard.title}
          </Text>
        </View>

        {/* Calories Card */}
        <Card style={styles.caloriesCard}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            {t.dashboard.dailyCalories}
          </Text>
          <View style={styles.caloriesRow}>
            <View style={styles.caloriesMain}>
              <Text style={[styles.caloriesBig, { color: accent }]}>
                {remaining}
              </Text>
              <Text style={[styles.caloriesUnit, { color: theme.textSecondary }]}>
                {t.dashboard.remaining}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progress * 100}%`,
                      backgroundColor: progress > 1 ? '#ef4444' : accent,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                {consumed} / {target} kcal
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatItem label={t.dashboard.consumed} value={`${consumed}`} color="#f59e0b" />
            <StatItem label={t.dashboard.burned} value={`${burned}`} color="#60a5fa" />
            <StatItem label={t.dashboard.goal} value={`${target}`} color={accent} />
          </View>
        </Card>

        {/* Discipline/day Score Card */}
        <Card style={styles.vitalityCard}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            {t.dashboard.vitalityScore}
          </Text>
          <View style={styles.vitalityRow}>
            <Text style={[styles.vitalityScore, { color: accent }]}>
              {dailyScore}
              <Text style={{ fontSize: 18 }}>/100</Text>
            </Text>
            <View style={styles.vitalityBadge}>
              <Text style={{ fontSize: 28 }}>
                {dailyScore >= 80 ? '💎' : dailyScore >= 60 ? '⚡' : dailyScore >= 40 ? '🔥' : '💤'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Streak + Weight Row */}
        <View style={styles.miniCardsRow}>
          <Card style={styles.miniCard}>
            <Text style={{ fontSize: 22 }}>{'🔥'}</Text>
            <Text style={[styles.miniValue, { color: accent }]}>{streak}</Text>
            <Text style={[styles.miniLabel, { color: theme.textSecondary }]}>
              {locale === 'fr' ? 'jours' : 'days'}
            </Text>
          </Card>

          <Card style={styles.miniCard}>
            <Text style={{ fontSize: 22 }}>{'⚖️'}</Text>
            <Text style={[styles.miniValue, { color: '#a78bfa' }]}>{projectedWeight.toFixed(1)}</Text>
            <Text style={[styles.miniLabel, { color: theme.textSecondary }]}>
              {t.dashboard.projectedWeight}
            </Text>
          </Card>
        </View>

        {/* BMR / TDEE stats */}
        <Card>
          <View style={styles.bioRow}>
            <BioStat label={t.dashboard.bmr} value={`${Math.round(profile.bmr)}`} />
            <BioStat label={t.dashboard.tdee} value={`${Math.round(profile.tdee)}`} />
            <BioStat label={t.dashboard.target} value={`${target}`} color="#f59e0b" />
          </View>
        </Card>

        {/* Today's Meals */}
        <Card style={styles.mealsCard}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            {t.dashboard.todayMeals}
          </Text>
          {meals.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {t.meals.noMeals}
            </Text>
          ) : (
            meals.slice(0, 5).map((meal) => (
              <View key={meal.id} style={[styles.mealRow, { borderBottomColor: theme.border }]}>
                <View>
                  <Text style={[styles.mealName, { color: theme.text }]}>{meal.name}</Text>
                  <Text style={[styles.mealMeta, { color: theme.textSecondary }]}>
                    {meal.meal_type}
                  </Text>
                </View>
                <Text style={[styles.mealCal, { color: accent }]}>{meal.calories} kcal</Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      {/* Calorie Overshoot Alert */}
      <CalorieOvershootAlert
        visible={showOvershoot}
        overshootKcal={overshootKcal}
        onClose={() => setShowOvershoot(false)}
      />
    </SafeAreaView>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BioStat({ label, value, color }: { label: string; value: string; color?: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.bioStatItem}>
      <Text style={[styles.bioValue, { color: color || theme.text }]}>{value}</Text>
      <Text style={[styles.bioLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing['4xl'] },
  header: { marginBottom: spacing.sm },
  greeting: { fontSize: 14, fontWeight: '500' },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },

  caloriesCard: { gap: spacing.lg },
  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },
  caloriesRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  caloriesMain: { alignItems: 'center' },
  caloriesBig: { fontSize: 48, fontWeight: '900', fontVariant: ['tabular-nums'] },
  caloriesUnit: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  progressBarContainer: { flex: 1, gap: spacing.xs },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 10, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 0.8 },

  vitalityCard: { gap: spacing.md },
  vitalityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vitalityScore: { fontSize: 44, fontWeight: '900', fontVariant: ['tabular-nums'] },
  vitalityBadge: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },

  miniCardsRow: { flexDirection: 'row', gap: spacing.md },
  miniCard: { flex: 1, alignItems: 'center', gap: spacing.xs },
  miniValue: { fontSize: 28, fontWeight: '900', fontVariant: ['tabular-nums'] },
  miniLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },

  bioRow: { flexDirection: 'row', justifyContent: 'space-around' },
  bioStatItem: { alignItems: 'center', gap: 2 },
  bioValue: { fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  bioLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },

  mealsCard: { gap: spacing.md },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: spacing.xl },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  mealName: { fontSize: 15, fontWeight: '600' },
  mealMeta: { fontSize: 12, marginTop: 2 },
  mealCal: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },

  onboardingPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing['3xl'] },
  onboardingText: { fontSize: 16, textAlign: 'center', marginBottom: spacing.xl },
  onboardingBtn: { paddingVertical: spacing.md, paddingHorizontal: spacing['2xl'], borderRadius: borderRadius.md },
  onboardingBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});
