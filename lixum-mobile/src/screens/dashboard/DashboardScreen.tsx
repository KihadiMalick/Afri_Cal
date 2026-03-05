import React, { Component, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Animated as RNAnimated,
  Easing,
  LayoutChangeEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import Svg, { Path, Line as SvgLine } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocale } from '@/context/LocaleContext';
import { usePreloadedData } from '@/context/DataPreloadContext';
import { GlassCard, LixumLogo } from '@/components/ui';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { CalorieOvershootAlert } from '@/components/CalorieOvershootAlert';
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
          <Text style={{ color: '#8892A0', fontSize: 13, textAlign: 'center' }}>
            {this.state.error.message}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/*  Number formatting                                                  */
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
    caloriesBurned: "CALORIES\nBRÛLÉES",
    caloriesConsumed: 'CONSOMMÉ',
    caloriesRemaining: 'RESTANTS',
    bmrLabel: 'MÉTABOLISME (BMR)',
    vitalityScore: 'SCORE VITALITÉ',
    days: 'j',
    consumed_kcal: 'kcal consommés',
    ecgConsumed: 'Consommé',
    ecgBurned: 'Brûlé',
    ecgRemaining: 'Restant',
    dayLabels: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
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
    caloriesBurned: "CALORIES\nBURNED",
    caloriesConsumed: 'CONSUMED',
    caloriesRemaining: 'REMAINING',
    bmrLabel: 'METABOLISM (BMR)',
    vitalityScore: 'VITALITY SCORE',
    days: 'd',
    consumed_kcal: 'kcal consumed',
    ecgConsumed: 'Consumed',
    ecgBurned: 'Burned',
    ecgRemaining: 'Remaining',
    dayLabels: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  },
};

/* ================================================================== */
/*  ECG CHART COMPONENT                                                */
/* ================================================================== */
function ECGChart({ consumed, burned, remaining, goal }: {
  consumed: number; burned: number; remaining: number; goal: number;
}) {
  const [chartWidth, setChartWidth] = useState(300);
  const chartHeight = 80;
  const { locale } = useLocale();
  const txt = L[locale] ?? L.fr;

  const onLayout = (e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
  };

  const generateECGPath = (value: number, maxVal: number, offsetY: number = 0) => {
    const intensity = Math.min(value / Math.max(maxVal, 1), 1);
    const peakHeight = 8 + (intensity * 22);
    const baseline = chartHeight / 2 + offsetY;
    const segments = 6;
    const segmentWidth = chartWidth / segments;

    let path = `M 0 ${baseline}`;
    for (let i = 0; i < segments; i++) {
      const x = i * segmentWidth;
      path += ` L ${x + segmentWidth * 0.12} ${baseline}`;
      path += ` L ${x + segmentWidth * 0.22} ${baseline + peakHeight * 0.25}`;
      path += ` L ${x + segmentWidth * 0.32} ${baseline - peakHeight}`;
      path += ` L ${x + segmentWidth * 0.40} ${baseline + peakHeight * 0.4}`;
      path += ` L ${x + segmentWidth * 0.50} ${baseline}`;
      path += ` L ${x + segmentWidth * 1.0} ${baseline}`;
    }
    return path;
  };

  return (
    <View style={{ marginVertical: 10 }} onLayout={onLayout}>
      <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Baseline */}
        <SvgLine
          x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2}
          stroke="#1C2330" strokeWidth="0.5"
        />
        {/* Remaining (gray, background) */}
        <Path
          d={generateECGPath(remaining, goal, 3)}
          fill="none" stroke="#3E4855" strokeWidth="1.5" strokeLinecap="round" opacity={0.6}
        />
        {/* Burned (turquoise) */}
        <Path
          d={generateECGPath(burned, goal, 0)}
          fill="none" stroke="#00BFA6" strokeWidth="2" strokeLinecap="round" opacity={0.8}
        />
        {/* Consumed (emerald, front) */}
        <Path
          d={generateECGPath(consumed, goal, -3)}
          fill="none" stroke="#00D984" strokeWidth="2.5" strokeLinecap="round" opacity={1}
        />
      </Svg>

      {/* Legend */}
      <View style={ecgStyles.legend}>
        <View style={ecgStyles.legendItem}>
          <View style={[ecgStyles.legendDot, { backgroundColor: '#00D984' }]} />
          <Text style={ecgStyles.legendText}>{txt.ecgConsumed}</Text>
        </View>
        <View style={ecgStyles.legendItem}>
          <View style={[ecgStyles.legendDot, { backgroundColor: '#00BFA6' }]} />
          <Text style={ecgStyles.legendText}>{txt.ecgBurned}</Text>
        </View>
        <View style={ecgStyles.legendItem}>
          <View style={[ecgStyles.legendDot, { backgroundColor: '#3E4855' }]} />
          <Text style={ecgStyles.legendText}>{txt.ecgRemaining}</Text>
        </View>
      </View>
    </View>
  );
}

const ecgStyles = StyleSheet.create({
  legend: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 2.5, borderRadius: 1, marginRight: 5 },
  legendText: { color: '#8892A0', fontSize: 9, fontFamily: FONT_MEDIUM },
});

/* ================================================================== */
/*  STATUS DOT — pulsing live indicator                                */
/* ================================================================== */
const getStatusColor = (target: number, consumed: number, burned: number) => {
  const deficit = consumed - target;
  const hasActivity = burned > 0;
  if (hasActivity && deficit <= 50) return '#00D984';   // green
  if (!hasActivity && consumed <= target) return '#FFA94D'; // orange
  return '#FF4D4D'; // red
};

function StatusDot({ color }: { color: string }) {
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    const pulse = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        RNAnimated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <RNAnimated.View style={{
        position: 'absolute',
        width: 16, height: 16, borderRadius: 8,
        backgroundColor: color,
        opacity: RNAnimated.multiply(pulseAnim, new RNAnimated.Value(0.3)),
      }} />
      <RNAnimated.View style={{
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: color,
        opacity: pulseAnim,
        marginLeft: 4,
        marginRight: 8,
      }} />
    </View>
  );
}

/* ================================================================== */
/*  STAT BUTTON — keyboard-press bevel effect                          */
/* ================================================================== */
function StatButton({ label, value, unit, onPress }: {
  label: string; value: number | string; unit: string; onPress?: () => void;
}) {
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;

  const onPressIn = () => {
    RNAnimated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };
  const onPressOut = () => {
    RNAnimated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <RNAnimated.View style={{
        transform: [{ scale: scaleAnim }],
        flex: 1,
        marginHorizontal: 4,
      }}>
        {/* Outer bevel frame */}
        <View style={{
          borderRadius: 12,
          borderWidth: 1.5,
          borderTopColor: '#5A6577',
          borderLeftColor: '#4A5568',
          borderRightColor: '#2A303B',
          borderBottomColor: '#1A1F26',
          padding: 2,
          backgroundColor: '#13161B',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.6,
          shadowRadius: 10,
          elevation: 10,
        }}>
          {/* Inner emerald liseré */}
          <View style={{
            borderRadius: 10,
            borderWidth: 0.8,
            borderColor: 'rgba(0, 217, 132, 0.2)',
            overflow: 'hidden',
          }}>
            <LinearGradient
              colors={['#2E3440', '#1E232B', '#252B35', '#1E232B']}
              locations={[0, 0.35, 0.65, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 8,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 95,
              }}
            >
              {/* Top highlight */}
              <View style={{
                position: 'absolute', top: 0, left: 12, right: 12,
                height: 1, backgroundColor: '#6B7B8D', opacity: 0.3,
              }} />

              <Text style={s.statLabel}>{label}</Text>
              <Text style={s.statValue}>
                {typeof value === 'number' ? fmtNum(value) : value}
              </Text>
              <Text style={s.statUnit}>{unit}</Text>
            </LinearGradient>
          </View>
        </View>
      </RNAnimated.View>
    </TouchableWithoutFeedback>
  );
}

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
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration]);

  return display;
}

/* ================================================================== */
/*  DASHBOARD CONTENT                                                   */
/* ================================================================== */
function DashboardContent() {
  const { locale } = useLocale();
  const navigation = useNavigation<Nav>();
  const txt = L[locale] ?? L.fr;
  const {
    profile,
    todayMeals: meals,
    todaySummary: summary,
    streak,
    ready,
    refresh,
  } = usePreloadedData();

  const [refreshing, setRefreshing] = useState(false);
  const [showOvershoot, setShowOvershoot] = useState(false);
  const overshootShownRef = useRef(false);

  /* --- Computed values --- */
  const consumed = summary?.total_calories_consumed ?? (meals || []).reduce((a, m) => a + (m?.calories ?? 0), 0);
  const burned = summary?.total_calories_burned ?? 0;
  const target = profile?.daily_calorie_target ?? 0;
  const remaining = Math.max(0, target - consumed + burned);
  const netConsumed = consumed - burned;
  const overshootKcal = Math.max(0, netConsumed - target);
  const displayName = profile?.full_name?.split(' ')[0] || 'User';
  const sportRec = generateSportRecommendation(overshootKcal);

  const todayIndex = new Date().getDay();

  /* --- Overshoot alert trigger --- */
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

  /* --- Loading --- */
  if (!ready) return <View style={s.container}><DashboardSkeleton /></View>;

  /* --- Onboarding prompt --- */
  if (!profile) {
    return (
      <View style={s.container}>
        <View style={s.onboardingWrap}>
          <Text style={s.onboardingText}>{txt.completeOnboarding}</Text>
          <TouchableOpacity style={s.onboardingBtn} onPress={() => navigation.navigate('MealsList')}>
            <Text style={s.onboardingBtnLabel}>{txt.goToOnboarding}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D984" />
        }
      >
        {/* ============================================================ */}
        {/*  HEADER                                                       */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(400).delay(0)} style={s.header}>
          <LixumLogo size={16} showSub />
          <View style={s.headerRight}>
            <StatusDot color={getStatusColor(target, consumed, burned)} />
            <Text style={s.headerName}>{displayName}</Text>
          </View>
        </Animated.View>

        {/* ============================================================ */}
        {/*  CARD 1 — VITALITY SCORE with ECG (NOT clickable)             */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <GlassCard vitality padding="md">
            {/* Header: label + objective/consumed */}
            <View style={s.heroTopRow}>
              <Text style={s.heroLabel}>{txt.vitalityLabel}</Text>
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

            {/* ECG Chart — 3 distinct lines */}
            <ECGChart consumed={consumed} burned={burned} remaining={remaining} goal={target} />
          </GlassCard>
        </Animated.View>

        {/* ============================================================ */}
        {/*  3 STAT BUTTONS — single row (ONLY clickable elements)         */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <View style={s.statsRow}>
            <StatButton
              label={txt.caloriesBurned}
              value={burned}
              unit="KCAL"
            />
            <StatButton
              label={txt.caloriesConsumed}
              value={consumed}
              unit="KCAL"
              onPress={() => navigation.navigate('MealsList')}
            />
            <StatButton
              label={txt.caloriesRemaining}
              value={remaining}
              unit="KCAL"
            />
          </View>
        </Animated.View>

        {/* ============================================================ */}
        {/*  REPAS DU JOUR — NOT clickable (View, not TouchableOpacity)   */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
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
                  <View key={meal.id || i} style={[s.mealRow, i > 0 && s.mealRowBorder]}>
                    <Text style={s.mealName} numberOfLines={1}>
                      {meal.name || meal.meal_name || 'Repas'}
                    </Text>
                    <Text style={s.mealCal}>{fmtNum(meal.calories)} kcal</Text>
                  </View>
                ))
              )}
            </View>

            {/* Only this link is clickable */}
            <TouchableOpacity
              style={s.manageMealsBtn}
              onPress={() => navigation.navigate('MealsList')}
            >
              <Text style={s.manageMealsText}>{txt.manageMeals}</Text>
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

        {/* ============================================================ */}
        {/*  ACTIVITÉ & ÉNERGIE — NOT clickable                           */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <GlassCard padding="lg">
            <Text style={s.sectionTitle}>{txt.activityLabel}</Text>

            {/* Big calories burned number */}
            <View style={s.activityCenter}>
              <Text style={[s.activityBigNum, burned === 0 && s.activityBigNumGhost]}>
                {burned}
              </Text>
              <Text style={s.activityUnit}>KCAL</Text>
            </View>

            {/* Weekly bar chart */}
            <View style={s.weeklyChart}>
              {txt.dayLabels.map((day, i) => {
                const isToday = i === todayIndex;
                // Use seeded values for non-today days to avoid re-render randomness
                const seedVal = [120, 200, 320, 90, 280, 400, 180][i] || 100;
                const dayVal = isToday ? burned : seedVal;
                const maxVal = Math.max(400, burned);
                const barH = Math.max(6, (dayVal / maxVal) * 50);
                return (
                  <View key={i} style={s.weekBarCol}>
                    <View
                      style={[
                        s.weekBar,
                        {
                          height: barH,
                          width: 18,
                          backgroundColor: isToday ? '#00D984' : '#2A303B',
                          borderWidth: isToday ? 0 : 1,
                          borderColor: '#3E4855',
                        },
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
        </Animated.View>

        {/* ============================================================ */}
        {/*  SPORT RECOMMENDATION (conditional)                           */}
        {/* ============================================================ */}
        {sportRec && overshootKcal > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(500)}>
            <View style={s.sportCard}>
              <Text style={s.sportTitle}>{txt.sportTitle}</Text>
              <Text style={s.sportSubtitle}>+{overshootKcal} {txt.kcal}</Text>
              <View style={s.sportMetrics}>
                <SportMetricBox label={txt.walking} value={`${sportRec.walkingKm}`} unit={txt.km} />
                <SportMetricBox label={txt.running} value={`${sportRec.runningMinutes}`} unit={txt.min} />
                <SportMetricBox label={txt.steps} value={`${sportRec.steps}`} unit="" />
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

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
function SportMetricBox({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={s.sportBox}>
      <Text style={s.sportBoxLabel}>{label}</Text>
      <Text style={s.sportBoxValue}>{value}</Text>
      {unit ? <Text style={s.sportBoxUnit}>{unit}</Text> : null}
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
/*  STYLES                                                             */
/* ================================================================== */
const EMERALD = '#00D984';

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 100, gap: 14 },

  /* --- Header --- */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingBottom: 12,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerName: {
    fontSize: 12, fontFamily: FONT_SEMI, fontWeight: '500', letterSpacing: 0.5, color: '#8892A0',
  },

  /* --- Onboarding --- */
  onboardingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  onboardingText: { fontSize: 16, fontFamily: FONT_BODY, textAlign: 'center', marginBottom: 20, color: '#EAEEF3' },
  onboardingBtn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, backgroundColor: EMERALD },
  onboardingBtnLabel: { color: '#0D1117', fontFamily: FONT_BOLD, fontWeight: '700', fontSize: 15 },

  /* ================================================================ */
  /*  CARD 1 — VITALITY SCORE with ECG                                 */
  /* ================================================================ */
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  heroLabel: {
    fontSize: 11, fontFamily: FONT_SEMI, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 2, color: '#8892A0', maxWidth: 120,
  },
  heroStatsRight: { flexDirection: 'row', gap: 20 },
  heroStatCol: { alignItems: 'center' },
  heroStatLabel: {
    fontSize: 9, fontFamily: FONT_SEMI, fontWeight: '600',
    letterSpacing: 1, textTransform: 'uppercase', color: '#555E6C', marginBottom: 2,
  },
  heroStatValue: {
    fontSize: 20, fontFamily: FONT_BLACK, fontWeight: '800', color: EMERALD, marginTop: 2,
  },
  heroStatUnit: { fontSize: 10, fontFamily: FONT_MEDIUM, color: '#555E6C' },

  /* ================================================================ */
  /*  3 STAT BUTTONS — single row                                      */
  /* ================================================================ */
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 9, fontFamily: FONT_SEMI, fontWeight: '600',
    letterSpacing: 1.2, textAlign: 'center', textTransform: 'uppercase',
    color: '#8892A0', lineHeight: 13,
  },
  statValue: {
    fontSize: 24, fontFamily: FONT_BLACK, fontWeight: '800', marginTop: 6,
    color: EMERALD, textAlign: 'center',
  },
  statUnit: {
    fontSize: 10, fontFamily: FONT_MEDIUM, letterSpacing: 1.5, marginTop: 2,
    color: '#555E6C', textAlign: 'center',
  },

  /* ================================================================ */
  /*  SECTIONS — Repas + Activité (NOT clickable)                      */
  /* ================================================================ */
  sectionTitle: { fontSize: 18, fontFamily: FONT_BOLD, fontWeight: '700', color: EMERALD },
  sectionSubtitle: { fontSize: 13, fontFamily: FONT_MEDIUM, color: '#8892A0', marginTop: 2, marginBottom: 14 },

  /* Meals */
  mealsList: { gap: 0, marginBottom: 14 },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  mealRowBorder: { borderTopWidth: 1, borderTopColor: '#2A303B' },
  mealName: { fontSize: 15, fontFamily: FONT_BODY, color: '#EAEEF3', flex: 1, marginRight: 12 },
  mealCal: { fontSize: 15, fontFamily: FONT_BOLD, fontWeight: '700', color: EMERALD },
  noMealsText: { fontSize: 13, fontFamily: FONT_BODY, color: '#555E6C', textAlign: 'center', paddingVertical: 12 },
  manageMealsBtn: { marginTop: 0 },
  manageMealsText: {
    fontSize: 14, fontFamily: FONT_SEMI, fontWeight: '600', color: EMERALD, textAlign: 'right',
  },

  /* Activity */
  activityCenter: { alignItems: 'center', marginVertical: 16 },
  activityBigNum: {
    fontSize: 42, fontFamily: FONT_BLACK, fontWeight: '800', color: EMERALD, lineHeight: 48,
  },
  activityBigNumGhost: { color: 'rgba(255,255,255,0.12)' },
  activityUnit: { fontSize: 12, fontFamily: FONT_BOLD, letterSpacing: 2, color: '#555E6C' },

  /* Weekly chart */
  weeklyChart: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 70,
  },
  weekBarCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  weekBar: { borderRadius: 4, marginBottom: 6 },
  weekLabel: { fontSize: 10, fontFamily: FONT_MEDIUM, color: '#555E6C' },
  weekLabelToday: { color: EMERALD, fontWeight: '700' },

  /* Sport recommendation */
  sportCard: {
    borderRadius: 16, borderWidth: 1.2, padding: 20,
    backgroundColor: 'rgba(255,68,68,0.04)', borderColor: 'rgba(255,68,68,0.15)',
  },
  sportTitle: {
    fontSize: 10, fontFamily: FONT_BOLD, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 2, color: '#FF4444',
  },
  sportSubtitle: { fontSize: 12, fontFamily: FONT_SEMI, fontWeight: '600', marginBottom: 12, color: '#8892A0' },
  sportMetrics: { flexDirection: 'row', gap: 8 },
  sportBox: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,68,68,0.12)', backgroundColor: 'rgba(255,68,68,0.03)',
  },
  sportBoxLabel: {
    fontSize: 9, fontFamily: FONT_BOLD, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, color: '#8892A0',
  },
  sportBoxValue: { fontSize: 22, fontFamily: FONT_BLACK, fontWeight: '900', lineHeight: 26, color: '#FF4444' },
  sportBoxUnit: { fontSize: 9, fontFamily: FONT_SEMI, fontWeight: '600', marginTop: 2, color: '#555E6C' },
});
