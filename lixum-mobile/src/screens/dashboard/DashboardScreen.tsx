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
    goal: 'OBJECTIF',
    consumed: 'CONSOMMÉ',
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
    caloriesBurned: 'CALORIES BRÛLÉES',
    caloriesRemaining: 'RESTANTS',
    vitalityScore: 'SCORE VITALITÉ',
    days: 'j',
  },
  en: {
    vitalityLabel: 'VITALITY SCORE',
    goal: 'GOAL',
    consumed: 'CONSUMED',
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
    caloriesBurned: 'CALORIES BURNED',
    caloriesRemaining: 'REMAINING',
    vitalityScore: 'VITALITY SCORE',
    days: 'd',
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
        {/*  CARD 1 — VITALITY SCORE (Hero, full width, smoked glass)  */}
        {/* ========================================================== */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <GlassCard vitality padding="lg">
            {/* Label */}
            <Text style={s.heroLabel}>
              {txt.vitalityLabel}
            </Text>

            {/* Giant centered score in emerald */}
            <View style={s.heroScoreWrap}>
              <Text style={s.heroScore}>
                {animatedScore}%
              </Text>
            </View>

            {/* Thin gradient progress bar */}
            <ProgressBar
              percent={progressPct}
              height={3}
              gradientColors={['#FF4444', '#f97316', '#eab308', '#00E5A0']}
              style={{ marginTop: 20, marginBottom: 16 }}
            />

            {/* Objective + Consumed in metallic orange */}
            <View style={s.heroStatsRow}>
              <Text style={s.heroStatLabel}>
                {txt.goal}{' '}
                <Text style={s.heroStatValue}>{fmtNum(target)} {txt.kcal}</Text>
              </Text>
              <Text style={s.heroStatDot}> · </Text>
              <Text style={s.heroStatLabel}>
                {txt.consumed}{' '}
                <Text style={s.heroStatValue}>{fmtNum(consumed)} {txt.kcal}</Text>
              </Text>
              <Text style={s.heroStatDot}> · </Text>
              <Text style={s.heroMicroRemaining}>
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
            <TouchableOpacity activeOpacity={0.85} style={s.metalCardTouch}>
              <GlassCard metalButton padding="md">
                <Text style={s.metalCardLabel}>
                  {txt.caloriesBurned}
                </Text>
                <Text style={[s.metalCardValue, { color: burned > 0 ? '#00E5A0' : 'rgba(255,255,255,0.25)' }]}>
                  {burned}
                </Text>
                <Text style={s.metalCardUnit}>{txt.kcal}</Text>
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>

          {/* ---- Card: Restants ---- */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            style={[s.metalCardWrap, isSmall && s.metalCardFull]}
          >
            <TouchableOpacity activeOpacity={0.85} style={s.metalCardTouch}>
              <GlassCard metalButton padding="md">
                <Text style={s.metalCardLabel}>
                  {txt.caloriesRemaining}
                </Text>
                <Text style={[s.metalCardValue, { color: '#00E5A0' }]}>
                  {fmtNum(remaining)}
                </Text>
                <Text style={s.metalCardUnit}>{txt.kcal}</Text>
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>

          {/* ---- Card: Score de Vitalité ---- */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(400)}
            style={[s.metalCardWrap, isSmall && s.metalCardFull]}
          >
            <TouchableOpacity activeOpacity={0.85} style={s.metalCardTouch}>
              <GlassCard metalButton padding="md">
                <Text style={s.metalCardLabel}>
                  {txt.vitalityScore}
                </Text>
                <Text style={[s.metalCardValue, { color: '#00E5A0' }]}>
                  {streak ?? 0}
                </Text>
                <Text style={s.metalCardUnit}>{txt.days}</Text>
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ========================================================== */}
        {/*  SPORT RECOMMENDATION (conditional)                        */}
        {/* ========================================================== */}
        {sportRec && overshootKcal > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(500)}>
            <View style={s.sportCard}>
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
/*  STYLES — Metallic Brushed Industrial Premium                       */
/* ================================================================== */
const EMERALD = '#00E5A0';
const METAL_ORANGE = '#D4915C';

const FONT_BODY = Platform.OS === 'web' ? 'Outfit_400Regular, sans-serif' : 'Outfit_400Regular';
const FONT_MEDIUM = Platform.OS === 'web' ? 'Outfit_500Medium, sans-serif' : 'Outfit_500Medium';
const FONT_SEMI = Platform.OS === 'web' ? 'Outfit_600SemiBold, sans-serif' : 'Outfit_600SemiBold';
const FONT_BOLD = Platform.OS === 'web' ? 'Outfit_700Bold, sans-serif' : 'Outfit_700Bold';
const FONT_BLACK = Platform.OS === 'web' ? 'Outfit_900Black, sans-serif' : 'Outfit_900Black';

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
    backgroundColor: EMERALD,
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0 0 6px rgba(0,229,160,0.40)',
      } as any,
      default: {},
    }),
  },
  headerName: {
    fontSize: 14,
    fontFamily: FONT_SEMI,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#9CA3AF',
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
  },
  onboardingBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  onboardingBtnLabel: {
    color: '#000',
    fontFamily: FONT_BOLD,
    fontWeight: '700',
    fontSize: 15,
  },

  /* ================================================================== */
  /*  CARD 1 — VITALITY SCORE (Hero)                                    */
  /* ================================================================== */
  heroLabel: {
    fontSize: 10,
    fontFamily: FONT_BOLD,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 4,
    color: 'rgba(160,170,185,0.50)',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroScoreWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroScore: {
    fontSize: 76,
    fontFamily: FONT_BLACK,
    fontWeight: '900',
    lineHeight: 84,
    textAlign: 'center',
    color: EMERALD,
    ...Platform.select({
      web: {
        // @ts-ignore
        textShadow: '0 0 40px rgba(0,229,160,0.25), 0 0 80px rgba(0,229,160,0.10)',
      } as any,
      default: {},
    }),
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
  },
  heroStatLabel: {
    fontSize: 11,
    fontFamily: FONT_SEMI,
    fontWeight: '600',
    color: METAL_ORANGE,
    letterSpacing: 0.5,
  },
  heroStatValue: {
    fontSize: 11,
    fontFamily: FONT_BOLD,
    fontWeight: '700',
    color: METAL_ORANGE,
  },
  heroStatDot: {
    fontSize: 11,
    color: 'rgba(160,170,185,0.30)',
  },
  heroMicroRemaining: {
    fontSize: 11,
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    color: 'rgba(160,170,185,0.45)',
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
        transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1)',
      } as any,
      default: {},
    }),
  },
  metalCardLabel: {
    fontSize: 9,
    fontFamily: FONT_BOLD,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(160,170,185,0.50)',
    textAlign: 'center',
    marginBottom: 8,
  },
  metalCardValue: {
    fontSize: 40,
    fontFamily: FONT_BLACK,
    fontWeight: '900',
    lineHeight: 44,
    textAlign: 'center',
    ...Platform.select({
      web: {
        // @ts-ignore
        textShadow: '0 0 20px rgba(0,229,160,0.20)',
      } as any,
      default: {},
    }),
  },
  metalCardUnit: {
    fontSize: 9,
    fontFamily: FONT_SEMI,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(160,170,185,0.35)',
    textAlign: 'center',
    marginTop: 4,
  },

  /* ================================================================== */
  /*  SPORT RECOMMENDATION                                              */
  /* ================================================================== */
  sportCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    backgroundColor: 'rgba(239,68,68,0.04)',
    borderColor: 'rgba(239,68,68,0.12)',
  },
  sportTitle: {
    fontSize: 10,
    fontFamily: FONT_BOLD,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 2,
  },
  sportSubtitle: {
    fontSize: 12,
    fontFamily: FONT_SEMI,
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
    fontFamily: FONT_BOLD,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sportBoxValue: {
    fontSize: 22,
    fontFamily: FONT_BLACK,
    fontWeight: '900',
    lineHeight: 26,
  },
  sportBoxUnit: {
    fontSize: 9,
    fontFamily: FONT_SEMI,
    fontWeight: '600',
    marginTop: 2,
  },
});
