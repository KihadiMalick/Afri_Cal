import React, { Component, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { useTokens } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { usePreloadedData } from '@/context/DataPreloadContext';
import { GlassCard, LixumLogo, ProgressBar } from '@/components/ui';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { CalorieOvershootAlert } from '@/components/CalorieOvershootAlert';
import { calculateDailyScore } from '@/utils/daily-score';
import { generateSportRecommendation } from '@/utils/sport-recommendation';
import type { MealsStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<MealsStackParamList>;

/* ------------------------------------------------------------------ */
/*  Error Boundary                                                     */
/* ------------------------------------------------------------------ */
interface EBState { error: Error | null }
class DashboardErrorBoundary extends Component<{ children: React.ReactNode }, EBState> {
  state: EBState = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ color: '#f87171', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            Dashboard Error
          </Text>
          <Text style={{ color: '#ccc', fontSize: 13, textAlign: 'center' }}>
            {this.state.error.message}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/*  Number formatting (1200 → 1 200)                                   */
/* ------------------------------------------------------------------ */
const fmtNum = (n: number) => {
  if (n == null || isNaN(n)) return '0';
  try { return n.toLocaleString('fr-FR'); } catch { return String(n); }
};

/* ------------------------------------------------------------------ */
/*  Bilingual micro-copy                                               */
/* ------------------------------------------------------------------ */
const L = {
  fr: {
    vitalityLabel: 'SCORE DE VITALITÉ',
    goal: 'objectif',
    consumed: 'consommés',
    remaining: 'restants',
    kcal: 'kcal',
    mealsLabel: 'REPAS DU JOUR',
    activityLabel: 'ACTIVITÉ',
    burnedLabel: 'KCAL BRÛLÉES',
    manageMeals: 'Gérer mes repas →',
    noMeals: 'Aucun repas enregistré',
    completeOnboarding: 'Complète ton profil pour commencer.',
    goToOnboarding: 'Commencer',
    sportTitle: 'RECOMMANDATION SPORT',
    walking: 'Marche',
    running: 'Course',
    steps: 'Pas',
    km: 'km',
    min: 'min',
  },
  en: {
    vitalityLabel: 'VITALITY SCORE',
    goal: 'goal',
    consumed: 'consumed',
    remaining: 'remaining',
    kcal: 'kcal',
    mealsLabel: 'TODAY\'S MEAL',
    activityLabel: 'ACTIVITY',
    burnedLabel: 'KCAL BURNED',
    manageMeals: 'Manage meals →',
    noMeals: 'No meals logged',
    completeOnboarding: 'Complete your profile to get started.',
    goToOnboarding: 'Get Started',
    sportTitle: 'SPORT RECOMMENDATION',
    walking: 'Walking',
    running: 'Running',
    steps: 'Steps',
    km: 'km',
    min: 'min',
  },
};

/* ================================================================== */
/*  DASHBOARD SCREEN                                                    */
/* ================================================================== */
export function DashboardScreen() {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated count-up hook                                             */
/* ------------------------------------------------------------------ */
function useCountUp(target: number, duration: number = 800) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return display;
}

/* ================================================================== */
/*  DASHBOARD CONTENT                                                   */
/* ================================================================== */
function DashboardContent() {
  const tk = useTokens();
  const { locale } = useLocale();
  const navigation = useNavigation<Nav>();
  const txt = L[locale] ?? L.fr;
  const { width: screenWidth } = useWindowDimensions();
  const isSmall = screenWidth < 600;

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

  /* --- Computed values ----------------------------------------------- */
  const consumed = summary?.total_calories_consumed ?? (meals || []).reduce((a, m) => a + (m?.calories ?? 0), 0);
  const burned = summary?.total_calories_burned ?? 0;
  const target = profile?.daily_calorie_target ?? 0;
  const remaining = Math.max(0, target - consumed + burned);
  const netConsumed = consumed - burned;
  const overshootKcal = Math.max(0, netConsumed - target);
  const progressPct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const dailyScore = calculateDailyScore(consumed, burned, target);
  const displayName = profile?.full_name?.split(' ')[0] || 'User';
  const sportRec = generateSportRecommendation(overshootKcal);

  // Last/main meal for the simplified card
  const lastMeal = (meals || []).length > 0 ? (meals || [])[(meals || []).length - 1] : null;

  // Animated score count-up
  const animatedScore = useCountUp(ready && profile ? dailyScore : 0, 800);

  /* --- Overshoot alert trigger --------------------------------------- */
  useEffect(() => {
    if (overshootKcal > 0 && !overshootShownRef.current) {
      overshootShownRef.current = true;
      setShowOvershoot(true);
    }
  }, [overshootKcal]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  /* --- Loading ------------------------------------------------------- */
  if (!ready) {
    return (
      <View style={s.container}>
        <DashboardSkeleton />
      </View>
    );
  }

  /* --- Onboarding prompt --------------------------------------------- */
  if (!profile) {
    return (
      <View style={s.container}>
        <View style={s.onboardingWrap}>
          <Text style={[s.onboardingText, { color: tk.t1 }]}>
            {txt.completeOnboarding}
          </Text>
          <TouchableOpacity
            style={[s.onboardingBtn, { backgroundColor: tk.accent }]}
            onPress={() => navigation.navigate('MealsList')}
          >
            <Text style={s.onboardingBtnLabel}>{txt.goToOnboarding}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ================================================================== */
  /*  RENDER                                                             */
  /* ================================================================== */
  return (
    <View style={s.container}>
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
        {/* ========================================================== */}
        {/*  HEADER — username right-aligned + emerald dot              */}
        {/* ========================================================== */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(0)}
          style={s.header}
        >
          <LixumLogo size={16} showSub />
          <View style={s.headerRight}>
            <View style={[s.onlineDot, { backgroundColor: '#00E5A0' }]} />
            <Text style={[s.headerName, { color: tk.t2 }]}>
              {displayName}
            </Text>
          </View>
        </Animated.View>

        {/* ========================================================== */}
        {/*  CARD 1 — VITALITY SCORE (Hero, full width)                */}
        {/* ========================================================== */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <GlassCard vitality padding="lg">
            {/* Label */}
            <Text style={s.heroLabel}>
              {txt.vitalityLabel}
            </Text>

            {/* Giant centered score */}
            <View style={s.heroScoreWrap}>
              <Text style={[s.heroScore, { color: '#00E5A0' }]}>
                {animatedScore}
              </Text>
            </View>

            {/* Thin gradient progress bar */}
            <ProgressBar
              percent={progressPct}
              height={3}
              gradientColors={['#FF4444', '#f97316', '#eab308', '#00E5A0']}
              style={{ marginTop: 20, marginBottom: 16 }}
            />

            {/* 3 inline micro-stats */}
            <Text style={s.heroMicroStats}>
              {fmtNum(target)} {txt.kcal} {txt.goal}  ·  {fmtNum(consumed)} {txt.kcal} {txt.consumed}  ·  {fmtNum(remaining)} {txt.kcal} {txt.remaining}
            </Text>
          </GlassCard>
        </Animated.View>

        {/* ========================================================== */}
        {/*  CARDS 2 & 3 — REPAS + ACTIVITÉ side by side               */}
        {/* ========================================================== */}
        <View style={[s.bottomRow, isSmall && s.bottomRowStacked]}>
          {/* ---- Card 2: REPAS DU JOUR (55%) ---- */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(200)}
            style={[
              s.cardLeft,
              isSmall && s.cardFullWidth,
            ]}
          >
            <GlassCard padding="md">
              <Text style={s.cardLabel}>
                {txt.mealsLabel}
              </Text>

              {lastMeal ? (
                <>
                  <Text
                    style={[s.mealName, { color: tk.t1 }]}
                    numberOfLines={1}
                  >
                    {lastMeal.name}
                  </Text>
                  <Text style={[s.mealCalories, { color: '#00E5A0' }]}>
                    {fmtNum(consumed)} {txt.kcal}
                  </Text>
                </>
              ) : (
                <Text style={[s.mealEmpty, { color: tk.t4 }]}>
                  {txt.noMeals}
                </Text>
              )}

              <TouchableOpacity
                style={s.manageMealsWrap}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('MealsList')}
              >
                <Text style={s.manageMealsText}>
                  {txt.manageMeals}
                </Text>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>

          {/* ---- Card 3: ACTIVITÉ (40%) ---- */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            style={[
              s.cardRight,
              isSmall && s.cardFullWidth,
            ]}
          >
            <GlassCard padding="md">
              <Text style={s.cardLabel}>
                {txt.activityLabel}
              </Text>

              <Text
                style={[
                  s.activityBig,
                  { color: burned > 0 ? '#00E5A0' : tk.t1, opacity: burned > 0 ? 1 : 0.3 },
                ]}
              >
                {burned}
              </Text>
              <Text style={s.activityUnit}>
                {txt.burnedLabel}
              </Text>

              {/* 7-bar sparkline */}
              <View style={s.sparkline}>
                {[0.2, 0.4, 0.3, 0.6, 0.5, 0.25, 1].map((h, i) => {
                  const isToday = i === 6;
                  return (
                    <View
                      key={i}
                      style={[
                        s.sparkBar,
                        {
                          height: h * 32,
                          backgroundColor: isToday
                            ? '#00E5A0'
                            : 'rgba(255,255,255,0.10)',
                        },
                      ]}
                    />
                  );
                })}
              </View>
            </GlassCard>
          </Animated.View>
        </View>

        {/* ========================================================== */}
        {/*  SPORT RECOMMENDATION (conditional)                        */}
        {/* ========================================================== */}
        {sportRec && overshootKcal > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(400)}>
            <View
              style={[
                s.sportCard,
                {
                  backgroundColor: 'rgba(239,68,68,0.04)',
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
          </Animated.View>
        )}
      </ScrollView>

      {/* ============================================================ */}
      {/*  CALORIE OVERSHOOT ALERT (modal)                             */}
      {/* ============================================================ */}
      <CalorieOvershootAlert
        visible={showOvershoot}
        overshootKcal={overshootKcal}
        onClose={() => setShowOvershoot(false)}
      />
    </View>
  );
}

/* ================================================================== */
/*  SUB-COMPONENTS                                                     */
/* ================================================================== */

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
const EMERALD = '#00E5A0';

const s = StyleSheet.create({
  /* --- Layout ------------------------------------------------------- */
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
    gap: 24,
  },

  /* --- Header ------------------------------------------------------- */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  /* --- Onboarding --------------------------------------------------- */
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

  /* ================================================================== */
  /*  CARD 1 — VITALITY SCORE (Hero)                                    */
  /* ================================================================== */
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.50)',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroScoreWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroScore: {
    fontSize: 80,
    fontWeight: '900',
    lineHeight: 88,
    textAlign: 'center',
    ...Platform.select({
      web: {
        // @ts-ignore
        textShadow: '0 0 40px rgba(0,229,160,0.30)',
      } as any,
      default: {},
    }),
  },
  heroMicroStats: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  /* ================================================================== */
  /*  CARDS 2 & 3 — Bottom row                                         */
  /* ================================================================== */
  bottomRow: {
    flexDirection: 'row',
    gap: 16,
  },
  bottomRowStacked: {
    flexDirection: 'column',
  },
  cardLeft: {
    flex: 55,
  },
  cardRight: {
    flex: 45,
  },
  cardFullWidth: {
    flex: undefined,
    width: '100%',
  },

  /* Shared card label */
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.50)',
    marginBottom: 12,
  },

  /* ================================================================== */
  /*  CARD 2 — REPAS DU JOUR                                           */
  /* ================================================================== */
  mealName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  mealCalories: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  mealEmpty: {
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 20,
  },
  manageMealsWrap: {
    marginTop: 'auto' as any,
  },
  manageMealsText: {
    fontSize: 13,
    fontWeight: '600',
    color: EMERALD,
    letterSpacing: 0.3,
  },

  /* ================================================================== */
  /*  CARD 3 — ACTIVITÉ                                                */
  /* ================================================================== */
  activityBig: {
    fontSize: 52,
    fontWeight: '900',
    lineHeight: 56,
    textAlign: 'center',
    marginTop: 4,
  },
  activityUnit: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.40)',
    textAlign: 'center',
    marginBottom: 16,
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 36,
    gap: 4,
    marginTop: 'auto' as any,
  },
  sparkBar: {
    flex: 1,
    borderRadius: 3,
    minWidth: 6,
  },

  /* ================================================================== */
  /*  SPORT RECOMMENDATION                                              */
  /* ================================================================== */
  sportCard: {
    borderRadius: 24,
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
    lineHeight: 26,
  },
  sportBoxUnit: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
});
