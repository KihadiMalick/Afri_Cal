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
import { useTokens } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { usePreloadedData } from '@/context/DataPreloadContext';
import { GlassCard, LixumLogo, ProgressBar } from '@/components/ui';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { CalorieOvershootAlert } from '@/components/CalorieOvershootAlert';
import { calculateDailyScore } from '@/utils/daily-score';
import { generateSportRecommendation } from '@/utils/sport-recommendation';
import type { RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/* ------------------------------------------------------------------ */
/*  Mono number styling helper                                         */
/* ------------------------------------------------------------------ */
const MONO = { fontFamily: 'Courier New' as const, fontVariant: ['tabular-nums'] as ('tabular-nums')[] };

/* ------------------------------------------------------------------ */
/*  Bilingual micro-copy                                               */
/* ------------------------------------------------------------------ */
const L = {
  fr: {
    vitalityLabel: 'SCORE DE VITALITE',
    goal: 'Objectif',
    consumed: 'Consomme',
    burned: 'BRULEES',
    remaining: 'RESTANTS',
    bmr: 'BMR',
    streak: 'SERIE',
    kcal: 'kcal',
    mealsLabel: 'REPAS DU JOUR',
    activityLabel: 'ACTIVITE',
    streakLabel: 'SERIE VERTE',
    weightLabel: 'POIDS PROJETE',
    days: 'jours',
    kg: 'kg',
    seeAll: 'Voir tout >',
    noMeals: 'Aucun repas',
    sportTitle: 'RECOMMANDATION SPORT',
    walking: 'Marche',
    running: 'Course',
    steps: 'Pas',
    km: 'km',
    min: 'min',
    completeOnboarding: 'Complete ton profil pour commencer.',
    goToOnboarding: 'Commencer',
  },
  en: {
    vitalityLabel: 'VITALITY SCORE',
    goal: 'Goal',
    consumed: 'Consumed',
    burned: 'BURNED',
    remaining: 'REMAINING',
    bmr: 'BMR',
    streak: 'STREAK',
    kcal: 'kcal',
    mealsLabel: 'TODAY\'S MEALS',
    activityLabel: 'ACTIVITY',
    streakLabel: 'GREEN STREAK',
    weightLabel: 'PROJECTED WEIGHT',
    days: 'days',
    kg: 'kg',
    seeAll: 'See all >',
    noMeals: 'No meals yet',
    sportTitle: 'SPORT RECOMMENDATION',
    walking: 'Walking',
    running: 'Running',
    steps: 'Steps',
    km: 'km',
    min: 'min',
    completeOnboarding: 'Complete your profile to get started.',
    goToOnboarding: 'Get Started',
  },
};

/* ================================================================== */
/*  DASHBOARD SCREEN                                                   */
/* ================================================================== */
export function DashboardScreen() {
  const tk = useTokens();
  const { locale } = useLocale();
  const navigation = useNavigation<Nav>();
  const txt = L[locale] ?? L.fr;

  const {
    profile,
    todayMeals: meals,
    todaySummary: summary,
    streak,
    projectedWeight,
    ready,
    refresh,
  } = usePreloadedData();

  const [refreshing, setRefreshing] = useState(false);
  const [showOvershoot, setShowOvershoot] = useState(false);
  const overshootShownRef = useRef(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  /* --- Loading ---------------------------------------------------- */
  if (!ready) {
    return (
      <SafeAreaView style={s.safe}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  /* --- Onboarding prompt ------------------------------------------ */
  if (!profile) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.onboardingWrap}>
          <Text style={[s.onboardingText, { color: tk.t1 }]}>
            {txt.completeOnboarding}
          </Text>
          <TouchableOpacity
            style={[s.onboardingBtn, { backgroundColor: tk.accent }]}
            onPress={() => navigation.navigate('Onboarding')}
          >
            <Text style={s.onboardingBtnLabel}>{txt.goToOnboarding}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* --- Computed values -------------------------------------------- */
  const consumed = summary?.total_calories_consumed ?? meals.reduce((a, m) => a + m.calories, 0);
  const burned = summary?.total_calories_burned ?? 0;
  const target = profile.daily_calorie_target;
  const remaining = Math.max(0, target - consumed + burned);
  const netConsumed = consumed - burned;
  const overshootKcal = Math.max(0, netConsumed - target);
  const progressPct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const dailyScore = calculateDailyScore(consumed, burned, target);
  const displayName = profile.full_name?.split(' ')[0] || 'User';
  const weightDelta = projectedWeight - profile.weight;
  const sportRec = generateSportRecommendation(overshootKcal);

  /* --- Overshoot alert trigger ------------------------------------ */
  useEffect(() => {
    if (overshootKcal > 0 && !overshootShownRef.current) {
      overshootShownRef.current = true;
      setShowOvershoot(true);
    }
  }, [overshootKcal]);

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tk.accent}
          />
        }
      >
        {/* ======================================================== */}
        {/*  1. HEADER                                                */}
        {/* ======================================================== */}
        <View style={s.header}>
          <LixumLogo size={16} showSub={false} />
          <Text style={[s.headerName, { color: tk.t2 }]}>
            {displayName}
          </Text>
        </View>

        {/* ======================================================== */}
        {/*  2. VITALITY CARD                                         */}
        {/* ======================================================== */}
        <GlassCard vitality padding="lg">
          {/* -- Top row: score left, goal/consumed right ----------- */}
          <View style={s.vitalityTop}>
            {/* Left: score block */}
            <View style={s.vitalityScoreBlock}>
              <Text style={[s.vitalityLabel, { color: tk.accent }]}>
                {txt.vitalityLabel}
              </Text>
              <Text style={[s.vitalityNumber, { color: tk.accent }]}>
                {dailyScore}
              </Text>
              <Text style={[s.vitalityUser, { color: tk.t2 }]}>
                {displayName}
              </Text>
            </View>
            {/* Right: goal + consumed columns */}
            <View style={s.vitalityTargets}>
              <View style={s.vitalityCol}>
                <Text style={[s.vitalityColLabel, { color: tk.t3 }]}>
                  {txt.goal}
                </Text>
                <Text style={[s.vitalityColValue, { color: tk.amber }]}>
                  {target}
                </Text>
              </View>
              <View style={[s.vitalityColDivider, { backgroundColor: tk.cardBorder }]} />
              <View style={s.vitalityCol}>
                <Text style={[s.vitalityColLabel, { color: tk.t3 }]}>
                  {txt.consumed}
                </Text>
                <Text style={[s.vitalityColValue, { color: tk.amber }]}>
                  {consumed}
                </Text>
              </View>
            </View>
          </View>

          {/* -- Progress bar --------------------------------------- */}
          <ProgressBar
            percent={progressPct}
            height={10}
            gradientColors={[tk.amberDark, tk.amber, tk.amberLight]}
            style={{ marginTop: 16, marginBottom: 16 }}
          />

          {/* -- Stats row (4 columns with dividers) ---------------- */}
          <View style={s.statsRow}>
            <StatCell
              label={txt.burned}
              value={burned}
              unit={txt.kcal}
              tk={tk}
              showBorder
            />
            <StatCell
              label={txt.remaining}
              value={remaining}
              unit={txt.kcal}
              tk={tk}
              showBorder
            />
            <StatCell
              label={txt.bmr}
              value={Math.round(profile.bmr)}
              unit={txt.kcal}
              tk={tk}
              showBorder
            />
            <StatCell
              label={txt.streak}
              value={streak}
              unit={txt.days}
              tk={tk}
              showBorder={false}
            />
          </View>
        </GlassCard>

        {/* ======================================================== */}
        {/*  3. WIDGET GRID (2 columns)                               */}
        {/* ======================================================== */}
        <View style={s.widgetGrid}>
          {/* -- Meals Widget --------------------------------------- */}
          <View style={s.widgetHalf}>
            <GlassCard padding="sm">
              <Text style={[s.widgetLabel, { color: tk.amber }]}>
                {txt.mealsLabel}
              </Text>
              {meals.length === 0 ? (
                <Text style={[s.widgetEmpty, { color: tk.t4 }]}>
                  {txt.noMeals}
                </Text>
              ) : (
                meals.slice(0, 3).map((meal) => (
                  <View
                    key={meal.id}
                    style={[s.mealRow, { borderBottomColor: tk.cardBorder }]}
                  >
                    <Text
                      style={[s.mealName, { color: tk.t1 }]}
                      numberOfLines={1}
                    >
                      {meal.name}
                    </Text>
                    <Text style={[s.mealCal, { color: tk.amber }]}>
                      {meal.calories}
                    </Text>
                  </View>
                ))
              )}
              {meals.length > 0 && (
                <TouchableOpacity style={s.seeAllWrap} activeOpacity={0.7}>
                  <Text style={[s.seeAll, { color: tk.accent }]}>
                    {txt.seeAll}
                  </Text>
                </TouchableOpacity>
              )}
            </GlassCard>
          </View>

          {/* -- Activity Widget ------------------------------------ */}
          <View style={s.widgetHalf}>
            <GlassCard padding="sm">
              <Text style={[s.widgetLabel, { color: tk.blue }]}>
                {txt.activityLabel}
              </Text>
              <Text style={[s.activityBig, { color: tk.blue }]}>
                {burned}
              </Text>
              <Text style={[s.activityUnit, { color: tk.t4 }]}>
                {txt.kcal}
              </Text>
              {/* Mini bar chart placeholder (7 bars) */}
              <View style={s.miniChart}>
                {[0.3, 0.5, 0.7, 1, 0.6, 0.4, 0.8].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      s.miniBar,
                      {
                        height: h * 28,
                        backgroundColor:
                          i === 3 ? tk.blue : tk.blue + '44',
                      },
                    ]}
                  />
                ))}
              </View>
            </GlassCard>
          </View>

          {/* -- Streak Widget -------------------------------------- */}
          <View style={s.widgetHalf}>
            <GlassCard padding="sm">
              <Text style={[s.widgetLabel, { color: '#34d399' }]}>
                {txt.streakLabel}
              </Text>
              <Text style={[s.streakBig, { color: '#34d399' }]}>
                {streak}
              </Text>
              <Text style={[s.streakUnit, { color: tk.t4 }]}>
                {txt.days}
              </Text>
              <ProgressBar
                percent={Math.min(streak * 3.33, 100)}
                height={6}
                gradientColors={['#059669', '#34d399', '#6ee7b7']}
                style={{ marginTop: 8 }}
              />
            </GlassCard>
          </View>

          {/* -- Weight Widget -------------------------------------- */}
          <View style={s.widgetHalf}>
            <GlassCard padding="sm">
              <Text style={[s.widgetLabel, { color: tk.accent }]}>
                {txt.weightLabel}
              </Text>
              <Text style={[s.weightBig, { color: tk.accent }]}>
                {projectedWeight.toFixed(1)}
              </Text>
              <Text style={[s.weightUnit, { color: tk.t4 }]}>
                {txt.kg}
              </Text>
              {/* Change badge */}
              <View
                style={[
                  s.changeBadge,
                  {
                    backgroundColor:
                      weightDelta <= 0
                        ? 'rgba(52,211,153,0.12)'
                        : 'rgba(239,68,68,0.10)',
                    borderColor:
                      weightDelta <= 0
                        ? 'rgba(52,211,153,0.30)'
                        : 'rgba(239,68,68,0.25)',
                  },
                ]}
              >
                <Text
                  style={[
                    s.changeBadgeText,
                    {
                      color: weightDelta <= 0 ? '#34d399' : tk.red,
                    },
                  ]}
                >
                  {weightDelta <= 0 ? '' : '+'}
                  {weightDelta.toFixed(1)} {txt.kg}
                </Text>
              </View>
            </GlassCard>
          </View>
        </View>

        {/* ======================================================== */}
        {/*  4. SPORT RECOMMENDATION (conditional)                    */}
        {/* ======================================================== */}
        {sportRec && overshootKcal > 0 && (
          <View
            style={[
              s.sportCard,
              {
                backgroundColor: 'rgba(239,68,68,0.05)',
                borderColor: 'rgba(239,68,68,0.12)',
              },
            ]}
          >
            <Text style={[s.sportTitle, { color: tk.red }]}>
              {txt.sportTitle}
            </Text>
            <Text style={[s.sportSubtitle, { color: tk.t3 }]}>
              +{overshootKcal} {txt.kcal}
            </Text>

            <View style={s.sportMetrics}>
              <SportMetricBox
                label={txt.walking}
                value={`${sportRec.walkingKm}`}
                unit={txt.km}
                tk={tk}
              />
              <SportMetricBox
                label={txt.running}
                value={`${sportRec.runningMinutes}`}
                unit={txt.min}
                tk={tk}
              />
              <SportMetricBox
                label={txt.steps}
                value={`${sportRec.steps}`}
                unit=""
                tk={tk}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* ========================================================== */}
      {/*  5. CALORIE OVERSHOOT ALERT (modal)                        */}
      {/* ========================================================== */}
      <CalorieOvershootAlert
        visible={showOvershoot}
        overshootKcal={overshootKcal}
        onClose={() => setShowOvershoot(false)}
      />
    </SafeAreaView>
  );
}

/* ================================================================== */
/*  SUB-COMPONENTS                                                     */
/* ================================================================== */

/** Single stat cell inside the vitality card bottom row */
function StatCell({
  label,
  value,
  unit,
  tk,
  showBorder,
}: {
  label: string;
  value: number;
  unit: string;
  tk: ReturnType<typeof useTokens>;
  showBorder: boolean;
}) {
  return (
    <View
      style={[
        s.statCell,
        showBorder && { borderRightWidth: 1, borderRightColor: tk.cardBorder },
      ]}
    >
      <Text style={[s.statLabel, { color: tk.t2 }]}>{label}</Text>
      <Text style={[s.statValue, { color: tk.t1 }]}>{value}</Text>
      <Text style={[s.statUnit, { color: tk.t4 }]}>{unit}</Text>
    </View>
  );
}

/** Single sport metric box inside the sport recommendation card */
function SportMetricBox({
  label,
  value,
  unit,
  tk,
}: {
  label: string;
  value: string;
  unit: string;
  tk: ReturnType<typeof useTokens>;
}) {
  return (
    <View style={[s.sportBox, { borderColor: 'rgba(239,68,68,0.12)' }]}>
      <Text style={[s.sportBoxLabel, { color: tk.t3 }]}>{label}</Text>
      <Text style={[s.sportBoxValue, { color: tk.red }]}>{value}</Text>
      {unit ? (
        <Text style={[s.sportBoxUnit, { color: tk.t4 }]}>{unit}</Text>
      ) : null}
    </View>
  );
}

/* ================================================================== */
/*  STYLES                                                             */
/* ================================================================== */
const s = StyleSheet.create({
  /* --- Layout ----------------------------------------------------- */
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 48,
    gap: 12,
  },

  /* --- Header ----------------------------------------------------- */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
  },

  /* --- Onboarding ------------------------------------------------- */
  onboardingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  onboardingText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  onboardingBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  onboardingBtnLabel: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },

  /* --- Vitality Card ---------------------------------------------- */
  vitalityTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vitalityScoreBlock: {
    flex: 1,
  },
  vitalityLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  vitalityNumber: {
    fontSize: 60,
    fontWeight: '900',
    ...MONO,
    lineHeight: 66,
  },
  vitalityUser: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  vitalityTargets: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 6,
  },
  vitalityCol: {
    alignItems: 'center',
  },
  vitalityColLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  vitalityColValue: {
    fontSize: 24,
    fontWeight: '800',
    ...MONO,
  },
  vitalityColDivider: {
    width: 1,
    height: 32,
    opacity: 0.5,
  },

  /* --- Stats row -------------------------------------------------- */
  statsRow: {
    flexDirection: 'row',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '900',
    ...MONO,
    lineHeight: 40,
  },
  statUnit: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },

  /* --- Widget grid ------------------------------------------------ */
  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  widgetHalf: {
    width: '48%' as any,
    flexGrow: 1,
    flexBasis: '46%' as any,
  },
  widgetLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  widgetEmpty: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 16,
  },

  /* --- Meals widget ----------------------------------------------- */
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  mealName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  mealCal: {
    fontSize: 13,
    fontWeight: '700',
    ...MONO,
  },
  seeAllWrap: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  seeAll: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* --- Activity widget -------------------------------------------- */
  activityBig: {
    fontSize: 36,
    fontWeight: '900',
    ...MONO,
    lineHeight: 40,
  },
  activityUnit: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 32,
    marginTop: 4,
  },
  miniBar: {
    flex: 1,
    borderRadius: 3,
    minWidth: 6,
  },

  /* --- Streak widget ---------------------------------------------- */
  streakBig: {
    fontSize: 48,
    fontWeight: '900',
    ...MONO,
    lineHeight: 52,
  },
  streakUnit: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },

  /* --- Weight widget ---------------------------------------------- */
  weightBig: {
    fontSize: 36,
    fontWeight: '900',
    ...MONO,
    lineHeight: 40,
  },
  weightUnit: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  changeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  changeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    ...MONO,
  },

  /* --- Sport recommendation --------------------------------------- */
  sportCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
  },
  sportTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 2,
  },
  sportSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    ...MONO,
    marginBottom: 12,
  },
  sportMetrics: {
    flexDirection: 'row',
    gap: 8,
  },
  sportBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  sportBoxLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sportBoxValue: {
    fontSize: 22,
    fontWeight: '900',
    ...MONO,
    lineHeight: 26,
  },
  sportBoxUnit: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
});
