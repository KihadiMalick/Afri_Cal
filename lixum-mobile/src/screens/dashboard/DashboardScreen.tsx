import React, { Component, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
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
          <Text style={{ color: '#FF4444', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            Dashboard Error
          </Text>
          <Text style={{ color: '#888', fontSize: 13, textAlign: 'center' }}>
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
    goal: 'OBJECTIF',
    consumed: 'CONSOMMÉ',
    remaining: 'restants',
    kcal: 'kcal',
    mealsLabel: 'Repas du Jour',
    activityLabel: 'Activité & Énergie',
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
    caloriesBurned: 'CALORIES BRÛLÉES',
    caloriesRemaining: 'RESTANTS',
    vitalityScore: 'SCORE VITALITÉ',
    days: 'j',
    consumed_kcal: 'kcal consommés',
    weekDays: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
  },
  en: {
    vitalityLabel: 'VITALITY SCORE',
    goal: 'GOAL',
    consumed: 'CONSUMED',
    remaining: 'remaining',
    kcal: 'kcal',
    mealsLabel: 'Today\'s Meals',
    activityLabel: 'Activity & Energy',
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
    caloriesBurned: 'CALORIES BURNED',
    caloriesRemaining: 'REMAINING',
    vitalityScore: 'VITALITY SCORE',
    days: 'd',
    consumed_kcal: 'kcal consumed',
    weekDays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
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

  const lastMeal = (meals || []).length > 0 ? (meals || [])[(meals || []).length - 1] : null;

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
          <Text style={s.onboardingText}>
            {txt.completeOnboarding}
          </Text>
          <TouchableOpacity
            style={s.onboardingBtn}
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
            tintColor="#00C896"
          />
        }
      >
        {/* ========================================================== */}
        {/*  HEADER — LX logo left + username right (metallic engraved) */}
        {/* ========================================================== */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(0)}
          style={s.header}
        >
          <LixumLogo size={16} showSub />
          <View style={s.headerRight}>
            <View style={s.onlineDot} />
            <Text style={s.headerName}>
              {displayName}
            </Text>
          </View>
        </Animated.View>

        {/* ========================================================== */}
        {/*  CARD 1 — VITALITY SCORE (Hero, full width, metallic)      */}
        {/* ========================================================== */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <GlassCard vitality padding="lg">
            {/* Top row: Label left, Stats right */}
            <View style={s.heroTopRow}>
              <Text style={s.heroLabel}>
                {txt.vitalityLabel}
              </Text>
              <View style={s.heroStatsRight}>
                <View style={s.heroStatCol}>
                  <Text style={s.heroStatLabel}>{txt.goal}</Text>
                  <Text style={s.heroStatValue}>{fmtNum(target)}</Text>
                  <Text style={s.heroStatUnit}>{txt.kcal}</Text>
                </View>
                <View style={s.heroStatCol}>
                  <Text style={s.heroStatLabel}>{txt.consumed}</Text>
                  <Text style={s.heroStatValue}>{fmtNum(consumed)}</Text>
                  <Text style={s.heroStatUnit}>{txt.kcal}</Text>
                </View>
              </View>
            </View>

            {/* Giant centered score in emerald */}
            <View style={s.heroScoreWrap}>
              <Text style={s.heroScore}>
                {animatedScore}
              </Text>
              <Text style={s.heroScorePercent}>%</Text>
            </View>

            {/* Username display */}
            <Text style={s.heroUsername}>{displayName}</Text>

            {/* Thin gradient progress bar */}
            <ProgressBar
              percent={progressPct}
              height={4}
              gradientColors={['#FF4444', '#FF8C00', '#FFD700', '#00C896']}
              style={{ marginTop: 16, marginBottom: 12 }}
            />

            {/* Micro stats below bar */}
            <View style={s.heroMicroRow}>
              <Text style={s.heroMicroText}>
                {fmtNum(target)} {txt.kcal} {txt.goal.toLowerCase()}
              </Text>
              <Text style={s.heroMicroDot}>·</Text>
              <Text style={s.heroMicroText}>
                {fmtNum(consumed)} {txt.kcal} {txt.consumed.toLowerCase()}
              </Text>
              <Text style={s.heroMicroDot}>·</Text>
              <Text style={s.heroMicroHighlight}>
                {fmtNum(remaining)} {txt.kcal} {txt.remaining}
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* ========================================================== */}
        {/*  3 METAL BUTTON CARDS — Brushed panels with neon backlight */}
        {/* ========================================================== */}
        <View style={[s.metalCardsRow, isSmall && s.metalCardsStacked]}>
          {/* ---- Card: Calories Brûlées ---- */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(200)}
            style={[s.metalCardWrap, isSmall && s.metalCardFull]}
          >
            <Pressable
              style={({ pressed }) => [
                s.metalCardTouch,
                pressed && s.metalCardPressed,
              ]}
            >
              <GlassCard metalButton padding="md">
                <Text style={s.metalCardLabel}>
                  {txt.caloriesBurned}
                </Text>
                <Text style={[s.metalCardValue, burned === 0 && s.metalCardValueGhost]}>
                  {burned}
                </Text>
                <Text style={s.metalCardUnit}>{txt.kcal}</Text>
              </GlassCard>
            </Pressable>
          </Animated.View>

          {/* ---- Card: Restants ---- */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            style={[s.metalCardWrap, isSmall && s.metalCardFull]}
          >
            <Pressable
              style={({ pressed }) => [
                s.metalCardTouch,
                pressed && s.metalCardPressed,
              ]}
            >
              <GlassCard metalButton padding="md">
                <Text style={s.metalCardLabel}>
                  {txt.caloriesRemaining}
                </Text>
                <Text style={s.metalCardValue}>
                  {fmtNum(remaining)}
                </Text>
                <Text style={s.metalCardUnit}>{txt.kcal}</Text>
              </GlassCard>
            </Pressable>
          </Animated.View>

          {/* ---- Card: Score de Vitalité ---- */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(400)}
            style={[s.metalCardWrap, isSmall && s.metalCardFull]}
          >
            <Pressable
              style={({ pressed }) => [
                s.metalCardTouch,
                pressed && s.metalCardPressed,
              ]}
            >
              <GlassCard metalButton padding="md">
                <Text style={s.metalCardLabel}>
                  {txt.vitalityScore}
                </Text>
                <Text style={s.metalCardValue}>
                  {streak ?? 0}
                </Text>
                <Text style={s.metalCardUnit}>{txt.days}</Text>
              </GlassCard>
            </Pressable>
          </Animated.View>
        </View>

        {/* ========================================================== */}
        {/*  REPAS DU JOUR — Meals card                                */}
        {/* ========================================================== */}
        <Animated.View entering={FadeInDown.duration(500).delay(500)}>
          <Pressable
            style={({ pressed }) => [pressed && s.cardPressed]}
            onPress={() => navigation.navigate('MealsList')}
          >
            <GlassCard padding="lg">
              <Text style={s.sectionTitle}>{txt.mealsLabel}</Text>
              <Text style={s.sectionSubtitle}>
                {fmtNum(consumed)} {txt.consumed_kcal}
              </Text>

              {/* Meal list */}
              <View style={s.mealsList}>
                {(meals || []).length === 0 ? (
                  <Text style={s.noMealsText}>{txt.noMeals}</Text>
                ) : (
                  (meals || []).map((meal, i) => (
                    <View key={meal.id || i} style={s.mealRow}>
                      <Text style={s.mealName} numberOfLines={1}>
                        {meal.name || meal.meal_name || 'Repas'}
                      </Text>
                      <Text style={s.mealCal}>
                        {fmtNum(meal.calories)} {txt.kcal}
                      </Text>
                    </View>
                  ))
                )}
              </View>

              {/* Manage meals link */}
              <TouchableOpacity
                style={s.manageMealsBtn}
                onPress={() => navigation.navigate('MealsList')}
              >
                <Text style={s.manageMealsText}>{txt.manageMeals}</Text>
              </TouchableOpacity>
            </GlassCard>
          </Pressable>
        </Animated.View>

        {/* ========================================================== */}
        {/*  ACTIVITÉ & ÉNERGIE — Activity card with weekly chart      */}
        {/* ========================================================== */}
        <Animated.View entering={FadeInDown.duration(500).delay(600)}>
          <Pressable
            style={({ pressed }) => [pressed && s.cardPressed]}
          >
            <GlassCard padding="lg">
              <Text style={s.sectionTitle}>{txt.activityLabel}</Text>

              {/* Big calories burned number */}
              <View style={s.activityCenter}>
                <Text style={[s.activityBigNum, burned === 0 && s.activityBigNumGhost]}>
                  {burned}
                </Text>
                <Text style={s.activityUnit}>KCAL</Text>
              </View>

              {/* Weekly sparkline bars */}
              <View style={s.weeklyChart}>
                {txt.weekDays.map((day, i) => {
                  const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6);
                  const barHeight = isToday ? Math.max(8, Math.min(burned / 10, 40)) : Math.random() * 20 + 4;
                  return (
                    <View key={i} style={s.weekBarCol}>
                      <View
                        style={[
                          s.weekBar,
                          {
                            height: barHeight,
                            backgroundColor: isToday ? '#00C896' : '#2A2A2A',
                          },
                          isToday && s.weekBarToday,
                        ]}
                      />
                      <Text style={[s.weekLabel, isToday && s.weekLabelToday]}>
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          </Pressable>
        </Animated.View>

        {/* ========================================================== */}
        {/*  SPORT RECOMMENDATION (conditional)                        */}
        {/* ========================================================== */}
        {sportRec && overshootKcal > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(700)}>
            <View style={s.sportCard}>
              <Text style={s.sportTitle}>
                {txt.sportTitle}
              </Text>
              <Text style={s.sportSubtitle}>
                +{overshootKcal} {txt.kcal}
              </Text>

              <View style={s.sportMetrics}>
                <SportMetricBox
                  label={txt.walking}
                  value={`${sportRec.walkingKm}`}
                  unit={txt.km}
                />
                <SportMetricBox
                  label={txt.running}
                  value={`${sportRec.runningMinutes}`}
                  unit={txt.min}
                />
                <SportMetricBox
                  label={txt.steps}
                  value={`${sportRec.steps}`}
                  unit=""
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
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <View style={s.sportBox}>
      <Text style={s.sportBoxLabel}>{label}</Text>
      <Text style={s.sportBoxValue}>{value}</Text>
      {unit ? (
        <Text style={s.sportBoxUnit}>{unit}</Text>
      ) : null}
    </View>
  );
}

/* ================================================================== */
/*  FONT HELPERS                                                       */
/* ================================================================== */
const FONT_BODY = Platform.OS === 'web' ? 'Poppins_400Regular, sans-serif' : 'Poppins_400Regular';
const FONT_MEDIUM = Platform.OS === 'web' ? 'Poppins_500Medium, sans-serif' : 'Poppins_500Medium';
const FONT_SEMI = Platform.OS === 'web' ? 'Poppins_600SemiBold, sans-serif' : 'Poppins_600SemiBold';
const FONT_BOLD = Platform.OS === 'web' ? 'Poppins_700Bold, sans-serif' : 'Poppins_700Bold';
const FONT_BLACK = Platform.OS === 'web' ? 'Poppins_900Black, sans-serif' : 'Poppins_900Black';

/* ================================================================== */
/*  STYLES — Premium Metallic Brushed Industrial                       */
/* ================================================================== */
const EMERALD = '#00C896';
const EMERALD_LIGHT = '#00E6A8';

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
    gap: 20,
  },

  /* --- Header ------------------------------------------------------- */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    paddingBottom: 12,
    marginBottom: 4,
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
    backgroundColor: EMERALD,
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0 0 6px rgba(0,200,150,0.40)',
      } as any,
      default: {},
    }),
  },
  headerName: {
    fontSize: 13,
    fontFamily: FONT_SEMI,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#888888',
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
    fontFamily: FONT_BODY,
    textAlign: 'center',
    marginBottom: 20,
    color: '#E8E8E8',
  },
  onboardingBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: EMERALD,
  },
  onboardingBtnLabel: {
    color: '#0D0D0D',
    fontFamily: FONT_BOLD,
    fontWeight: '700',
    fontSize: 15,
  },

  /* ================================================================== */
  /*  CARD 1 — VITALITY SCORE (Hero)                                    */
  /* ================================================================== */
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 10,
    fontFamily: FONT_BOLD,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#888888',
  },
  heroStatsRight: {
    flexDirection: 'row',
    gap: 20,
  },
  heroStatCol: {
    alignItems: 'center',
  },
  heroStatLabel: {
    fontSize: 9,
    fontFamily: FONT_SEMI,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#D4915C',
    marginBottom: 2,
  },
  heroStatValue: {
    fontSize: 20,
    fontFamily: FONT_BLACK,
    fontWeight: '900',
    color: '#D4915C',
  },
  heroStatUnit: {
    fontSize: 9,
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    color: '#D4915C',
    letterSpacing: 1,
    opacity: 0.7,
  },
  heroScoreWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: 4,
  },
  heroScore: {
    fontSize: 72,
    fontFamily: FONT_BLACK,
    fontWeight: '900',
    lineHeight: 80,
    textAlign: 'center',
    color: EMERALD,
    ...Platform.select({
      web: {
        // @ts-ignore
        textShadow: '0 0 40px rgba(0,200,150,0.25), 0 0 80px rgba(0,200,150,0.10)',
      } as any,
      default: {
        textShadowColor: 'rgba(0,200,150,0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
      },
    }),
  },
  heroScorePercent: {
    fontSize: 28,
    fontFamily: FONT_BOLD,
    fontWeight: '700',
    color: EMERALD,
    marginLeft: 2,
    opacity: 0.7,
  },
  heroUsername: {
    fontSize: 11,
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 2,
  },
  heroMicroRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  heroMicroText: {
    fontSize: 10,
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    color: '#666666',
    letterSpacing: 0.3,
  },
  heroMicroDot: {
    fontSize: 10,
    color: '#3A3A3A',
  },
  heroMicroHighlight: {
    fontSize: 10,
    fontFamily: FONT_SEMI,
    fontWeight: '600',
    color: EMERALD,
    letterSpacing: 0.3,
  },

  /* ================================================================== */
  /*  METAL BUTTON CARDS — 3 in a row                                   */
  /* ================================================================== */
  metalCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metalCardsStacked: {
    flexDirection: 'column',
  },
  metalCardWrap: {
    flex: 1,
  },
  metalCardFull: {
    flex: undefined,
    width: '100%',
  },
  metalCardTouch: {
    flex: 1,
    ...Platform.select({
      web: {
        // @ts-ignore
        cursor: 'pointer',
        transition: 'transform 0.15s ease-out',
      } as any,
      default: {},
    }),
  },
  metalCardPressed: {
    ...Platform.select({
      web: {
        // @ts-ignore
        transform: [{ scale: 0.97 }],
      } as any,
      default: {
        transform: [{ scale: 0.97 }],
        opacity: 0.9,
      },
    }),
  },
  metalCardLabel: {
    fontSize: 9,
    fontFamily: FONT_BOLD,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 8,
  },
  metalCardValue: {
    fontSize: 36,
    fontFamily: FONT_BLACK,
    fontWeight: '900',
    lineHeight: 40,
    textAlign: 'center',
    color: EMERALD,
    ...Platform.select({
      web: {
        // @ts-ignore
        textShadow: '0 0 20px rgba(0,200,150,0.20)',
      } as any,
      default: {
        textShadowColor: 'rgba(0,200,150,0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
      },
    }),
  },
  metalCardValueGhost: {
    color: 'rgba(255,255,255,0.20)',
    ...Platform.select({
      web: {
        // @ts-ignore
        textShadow: 'none',
      } as any,
      default: {
        textShadowRadius: 0,
      },
    }),
  },
  metalCardUnit: {
    fontSize: 9,
    fontFamily: FONT_SEMI,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
  },

  /* ================================================================== */
  /*  SECTIONS — Repas du Jour & Activité                               */
  /* ================================================================== */
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONT_BOLD,
    fontWeight: '700',
    color: EMERALD,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    color: '#888888',
    marginBottom: 16,
  },
  cardPressed: {
    ...Platform.select({
      web: {
        // @ts-ignore
        transform: [{ scale: 0.99 }],
      } as any,
      default: {
        transform: [{ scale: 0.99 }],
        opacity: 0.95,
      },
    }),
  },

  /* --- Meals list --- */
  mealsList: {
    gap: 10,
    marginBottom: 16,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58,58,58,0.4)',
  },
  mealName: {
    fontSize: 14,
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    color: '#E8E8E8',
    flex: 1,
    marginRight: 12,
  },
  mealCal: {
    fontSize: 14,
    fontFamily: FONT_BOLD,
    fontWeight: '700',
    color: EMERALD,
  },
  noMealsText: {
    fontSize: 13,
    fontFamily: FONT_BODY,
    color: '#666666',
    textAlign: 'center',
    paddingVertical: 12,
  },
  manageMealsBtn: {
    alignSelf: 'flex-end',
  },
  manageMealsText: {
    fontSize: 13,
    fontFamily: FONT_SEMI,
    fontWeight: '600',
    color: EMERALD,
    letterSpacing: 0.3,
  },

  /* --- Activity --- */
  activityCenter: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityBigNum: {
    fontSize: 48,
    fontFamily: FONT_BLACK,
    fontWeight: '900',
    color: EMERALD,
    lineHeight: 52,
    ...Platform.select({
      web: {
        // @ts-ignore
        textShadow: '0 0 30px rgba(0,200,150,0.20)',
      } as any,
      default: {
        textShadowColor: 'rgba(0,200,150,0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
      },
    }),
  },
  activityBigNumGhost: {
    color: 'rgba(255,255,255,0.15)',
    ...Platform.select({
      web: {
        // @ts-ignore
        textShadow: 'none',
      } as any,
      default: {
        textShadowRadius: 0,
      },
    }),
  },
  activityUnit: {
    fontSize: 10,
    fontFamily: FONT_BOLD,
    fontWeight: '700',
    letterSpacing: 3,
    color: '#888888',
    marginTop: 4,
  },

  /* --- Weekly chart --- */
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    height: 70,
  },
  weekBarCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  weekBar: {
    width: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  weekBarToday: {
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0 0 8px rgba(0,200,150,0.30)',
      } as any,
      default: {
        shadowColor: EMERALD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
    }),
  },
  weekLabel: {
    fontSize: 9,
    fontFamily: FONT_SEMI,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 1,
  },
  weekLabelToday: {
    color: EMERALD,
  },

  /* ================================================================== */
  /*  SPORT RECOMMENDATION                                              */
  /* ================================================================== */
  sportCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    backgroundColor: 'rgba(255,68,68,0.04)',
    borderColor: 'rgba(255,68,68,0.15)',
  },
  sportTitle: {
    fontSize: 10,
    fontFamily: FONT_BOLD,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 2,
    color: '#FF4444',
  },
  sportSubtitle: {
    fontSize: 12,
    fontFamily: FONT_SEMI,
    fontWeight: '600',
    marginBottom: 12,
    color: '#888888',
  },
  sportMetrics: {
    flexDirection: 'row',
    gap: 8,
  },
  sportBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.12)',
    backgroundColor: 'rgba(255,68,68,0.03)',
  },
  sportBoxLabel: {
    fontSize: 9,
    fontFamily: FONT_BOLD,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    color: '#888888',
  },
  sportBoxValue: {
    fontSize: 22,
    fontFamily: FONT_BLACK,
    fontWeight: '900',
    lineHeight: 26,
    color: '#FF4444',
  },
  sportBoxUnit: {
    fontSize: 9,
    fontFamily: FONT_SEMI,
    fontWeight: '600',
    marginTop: 2,
    color: '#666666',
  },
});
