import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Circle } from 'react-native-svg';
import { useTheme, useTokens } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { usePreloadedData } from '@/context/DataPreloadContext';
import { GlassCard, LixumLogo } from '@/components/ui';
import { CalorieOvershootAlert } from '@/components/CalorieOvershootAlert';
import { supabase } from '@/lib/supabase';
import { spacing, borderRadius } from '@/theme/spacing';
import { FONTS } from '@/theme/typography';
import type { Meal, MealsStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<MealsStackParamList>;

/* ─── helpers ─── */
const MONO = FONTS.mono;

function formatDate(locale: string): string {
  const now = new Date();
  const opts: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };
  const formatted = now.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', opts);
  // Capitalise first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN SCREEN
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function MealsScreen() {
  const tk = useTokens();
  useTheme(); // for context subscription
  const { t, locale } = useLocale();
  const navigation = useNavigation<Nav>();
  const { todayMeals: preloadedMeals, refresh } = usePreloadedData();

  const [meals, setMeals] = useState<Meal[]>(preloadedMeals);
  const [refreshing, setRefreshing] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showOvershoot, setShowOvershoot] = useState(false);
  const overshootShownRef = React.useRef(false);

  // Sync with preloaded data
  useEffect(() => {
    setMeals(preloadedMeals);
  }, [preloadedMeals]);

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

  // Open gallery to upload a photo
  const handleUploadPhoto = async () => {
    setShowScanModal(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      navigation.navigate('Scan', {
        imageUri: result.assets[0].uri,
        imageBase64: result.assets[0].base64 || undefined,
      });
    }
  };

  // Open Lixum Scan (camera)
  const handleLixumScan = () => {
    setShowScanModal(false);
    navigation.navigate('Scan', {});
  };

  /* ── calorie aggregation ── */
  const totalCal = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + (m.protein ?? 0), 0);
  const totalCarbs = meals.reduce((s, m) => s + (m.carbs ?? 0), 0);
  const totalFat = meals.reduce((s, m) => s + (m.fat ?? 0), 0);

  const { profile, todaySummary: summary } = usePreloadedData();
  const target = profile?.daily_calorie_target || 2000;
  const consumed = summary?.total_calories_consumed ?? totalCal;
  const burned = summary?.total_calories_burned ?? 0;
  const remaining = Math.max(0, target - consumed + burned);
  const progress = target > 0 ? consumed / target : 0;
  const overshootKcal = Math.max(0, consumed - burned - target);

  // Overshoot alert
  React.useEffect(() => {
    if (overshootKcal > 0 && !overshootShownRef.current) {
      overshootShownRef.current = true;
      setShowOvershoot(true);
    }
  }, [overshootKcal]);

  /* ━━━━━━━━━━ RENDER ━━━━━━━━━━ */
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tk.accent} />
        }
      >
        {/* ── 1. Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: tk.t1 }]}>Repas</Text>
            <Text style={[styles.headerDate, { color: tk.t3 }]}>{formatDate(locale)}</Text>
          </View>
          <LixumLogo size={12} showSub={false} />
        </View>

        {/* ── 2. Calorie Summary Card ── */}
        {profile && (
          <GlassCard padding="lg">
            <View style={styles.calRow}>
              <CircularProgress
                progress={progress}
                size={130}
                strokeWidth={11}
                color={tk.accent}
                bgColor={tk.cardBorder}
              >
                <Text style={[styles.calCenter, { color: tk.accent }]}>{remaining}</Text>
                <Text style={[styles.calCenterUnit, { color: tk.t3 }]}>
                  {locale === 'fr' ? 'kcal restant' : 'kcal left'}
                </Text>
              </CircularProgress>

              <View style={styles.calStats}>
                <StatLine
                  label={locale === 'fr' ? 'Consomme' : 'Consumed'}
                  value={consumed}
                  unit="kcal"
                  color={tk.amber}
                  t3={tk.t3}
                />
                <View style={[styles.statDivider, { backgroundColor: tk.cardBorder }]} />
                <StatLine
                  label={locale === 'fr' ? 'Brule' : 'Burned'}
                  value={burned}
                  unit="kcal"
                  color={tk.blue}
                  t3={tk.t3}
                />
                <View style={[styles.statDivider, { backgroundColor: tk.cardBorder }]} />
                <StatLine
                  label={locale === 'fr' ? 'Objectif' : 'Target'}
                  value={target}
                  unit="kcal"
                  color={tk.accent}
                  t3={tk.t3}
                />
              </View>
            </View>
          </GlassCard>
        )}

        {/* ── 3. Action Buttons ── */}
        <TouchableOpacity
          style={[styles.scanBtn, { backgroundColor: tk.accent }]}
          onPress={() => setShowScanModal(true)}
          activeOpacity={0.78}
        >
          <Text style={styles.scanIcon}>{'{'}</Text>
          <View style={styles.scanTextWrap}>
            <Text style={styles.scanBtnTitle}>
              {locale === 'fr' ? 'Scanner un plat' : 'Scan a meal'}
            </Text>
            <Text style={styles.scanBtnSub}>
              {locale === 'fr'
                ? 'Analysez les calories en un clic'
                : 'Analyze calories in one click'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.manualBtn, { backgroundColor: tk.cardBg, borderColor: tk.cardBorder }]}
          onPress={() => navigation.navigate('AddMeal')}
          activeOpacity={0.72}
        >
          <Text style={[styles.manualPlus, { color: tk.accent }]}>+</Text>
          <Text style={[styles.manualLabel, { color: tk.t1 }]}>
            {locale === 'fr' ? 'Ajout manuel' : 'Manual entry'}
          </Text>
        </TouchableOpacity>

        {/* ── 4. Day Summary Card ── */}
        {meals.length > 0 && (
          <GlassCard padding="lg">
            <Text style={[styles.sectionTag, { color: tk.t3 }]}>
              {locale === 'fr' ? 'BILAN DU JOUR' : "TODAY'S SUMMARY"}
            </Text>
            <Text style={[styles.summaryKcal, { color: tk.accent }]}>
              {totalCal}
              <Text style={styles.summaryKcalUnit}> kcal</Text>
            </Text>
            <View style={styles.macrosRow}>
              <MacroBadge label="P" value={totalProtein} color={tk.red} />
              <MacroBadge label="G" value={totalCarbs} color={tk.amber} />
              <MacroBadge label="L" value={totalFat} color={tk.blue} />
            </View>
          </GlassCard>
        )}

        {/* ── 5. Meals List Card ── */}
        {meals.length > 0 && (
          <GlassCard padding="lg" style={styles.mealsListCard}>
            <Text style={[styles.sectionTag, { color: tk.t3, marginBottom: spacing.md }]}>
              {locale === 'fr' ? 'REPAS DU JOUR' : "TODAY'S MEALS"}
            </Text>
            {meals.map((meal, idx) => (
              <TouchableOpacity
                key={meal.id}
                style={[
                  styles.mealRow,
                  idx < meals.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: tk.cardBorder },
                ]}
                onLongPress={() => handleDelete(meal.id)}
                activeOpacity={0.7}
              >
                <View style={styles.mealInfo}>
                  <Text style={[styles.mealName, { color: tk.t1 }]} numberOfLines={1}>
                    {meal.name}
                  </Text>
                  <Text style={[styles.mealMeta, { color: tk.t3 }]}>
                    {meal.meal_type}
                    {'  '}P:{meal.protein ?? 0}  G:{meal.carbs ?? 0}  L:{meal.fat ?? 0}
                  </Text>
                </View>
                <View style={styles.mealCalWrap}>
                  <Text style={[styles.mealCalVal, { color: tk.accent }]}>{meal.calories}</Text>
                  <Text style={[styles.mealCalUnit, { color: tk.t4 }]}>kcal</Text>
                </View>
              </TouchableOpacity>
            ))}
          </GlassCard>
        )}

        {/* ── 6. Empty State ── */}
        {meals.length === 0 && (
          <GlassCard padding="lg" style={styles.emptyCard}>
            <View style={[styles.emptyIconCircle, { borderColor: tk.cardBorder }]}>
              <Text style={styles.emptyIcon}>{'{ }'}</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: tk.t2 }]}>
              {locale === 'fr' ? 'Aucun repas enregistre' : 'No meals recorded'}
            </Text>
            <Text style={[styles.emptyHint, { color: tk.t4 }]}>
              {locale === 'fr'
                ? 'Appuyez sur "Scanner un plat" pour commencer'
                : 'Tap "Scan a meal" to get started'}
            </Text>
          </GlassCard>
        )}

        {/* ── 7. Recipes Button ── */}
        <TouchableOpacity activeOpacity={0.72} onPress={() => navigation.navigate('Recipes')}>
          <GlassCard padding="md">
            <View style={styles.recipesRow}>
              <View style={styles.recipesLeft}>
                <Text style={[styles.recipesTitle, { color: tk.t1 }]}>{t.meals.recipes}</Text>
                <Text style={[styles.recipesSub, { color: tk.t3 }]}>
                  {locale === 'fr' ? 'Decouvrir des idees de repas' : 'Discover meal ideas'}
                </Text>
              </View>
              <Text style={[styles.recipesArrow, { color: tk.accent }]}>{'>'}</Text>
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* bottom spacer */}
        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>

      {/* ── Calorie Overshoot Alert ── */}
      <CalorieOvershootAlert
        visible={showOvershoot}
        overshootKcal={overshootKcal}
        onClose={() => setShowOvershoot(false)}
      />

      {/* ── 8. Scan Modal (bottom sheet, glass morphism) ── */}
      <Modal
        visible={showScanModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScanModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowScanModal(false)}
          />
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: tk.cardBg, borderColor: tk.cardBorder },
            ]}
          >
            <View style={[styles.modalHandle, { backgroundColor: tk.t4 }]} />

            <Text style={[styles.modalTitle, { color: tk.t1 }]}>
              {locale === 'fr' ? 'Comment ajouter votre plat ?' : 'How to add your meal?'}
            </Text>

            {/* Option: Lixum Scan */}
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: tk.accent }]}
              onPress={handleLixumScan}
              activeOpacity={0.78}
            >
              <View style={styles.modalOptionIconWrap}>
                <Text style={styles.modalOptionIconText}>{'S'}</Text>
              </View>
              <View style={styles.modalOptionContent}>
                <Text style={styles.modalOptionTitle}>Lixum Scan</Text>
                <Text style={styles.modalOptionSub}>
                  {locale === 'fr' ? 'Ouvrir la camera et scanner' : 'Open camera and scan'}
                </Text>
              </View>
              <Text style={styles.modalOptionArrow}>{'>'}</Text>
            </TouchableOpacity>

            {/* Option: Upload photo */}
            <TouchableOpacity
              style={[
                styles.modalOption,
                {
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: tk.cardBorder,
                },
              ]}
              onPress={handleUploadPhoto}
              activeOpacity={0.78}
            >
              <View style={[styles.modalOptionIconWrap, { backgroundColor: tk.cardBorder }]}>
                <Text style={[styles.modalOptionIconText, { color: tk.t1 }]}>{'G'}</Text>
              </View>
              <View style={styles.modalOptionContent}>
                <Text style={[styles.modalOptionTitle, { color: tk.t1 }]}>
                  {locale === 'fr' ? 'Charger une photo' : 'Upload a photo'}
                </Text>
                <Text style={[styles.modalOptionSub, { color: tk.t3 }]}>
                  {locale === 'fr' ? 'Depuis votre galerie' : 'From your gallery'}
                </Text>
              </View>
              <Text style={[styles.modalOptionArrow, { color: tk.t3 }]}>{'>'}</Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              style={[styles.modalCancel, { borderColor: tk.cardBorder }]}
              onPress={() => setShowScanModal(false)}
              activeOpacity={0.72}
            >
              <Text style={[styles.modalCancelText, { color: tk.t3 }]}>
                {locale === 'fr' ? 'Annuler' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SUB-COMPONENTS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/** Circular SVG progress ring */
function CircularProgress({
  progress,
  size = 130,
  strokeWidth = 11,
  color,
  bgColor,
  children,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor: string;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const dashOffset = circumference * (1 - clamped);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progress > 1 ? '#ef4444' : color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {children}
    </View>
  );
}

/** Stat line inside the calorie card */
function StatLine({
  label,
  value,
  unit,
  color,
  t3,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  t3: string;
}) {
  return (
    <View style={styles.statLine}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={[styles.statLabel, { color: t3 }]}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statUnit, { color: t3 }]}>{unit}</Text>
    </View>
  );
}

/** Macro badge (P / G / L) */
function MacroBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={[styles.macroBadge, { backgroundColor: color + '10', borderColor: color + '40' }]}>
      <Text style={[styles.macroBadgeLabel, { color }]}>{label}</Text>
      <Text style={[styles.macroBadgeValue, { color }]}>{value}g</Text>
    </View>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STYLES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const styles = StyleSheet.create({
  /* layout */
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },

  /* ── 1. header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: FONTS.display,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerDate: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    fontWeight: '500',
  },

  /* ── 2. calorie summary ── */
  calRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  calCenter: {
    fontSize: 32,
    fontFamily: MONO,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  calCenterUnit: {
    fontSize: 9,
    fontFamily: FONTS.subheading,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  calStats: {
    flex: 1,
    gap: spacing.xs,
  },
  statLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 15,
    fontFamily: MONO,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statUnit: {
    fontSize: 9,
    fontFamily: FONTS.medium,
    fontWeight: '600',
  },
  statDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginVertical: 2,
  },

  /* ── 3. action buttons ── */
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    borderRadius: 20,
    gap: spacing.lg,
  },
  scanIcon: {
    fontSize: 36,
    fontFamily: MONO,
    fontWeight: '700',
    color: '#000',
  },
  scanTextWrap: {
    flex: 1,
    gap: 3,
  },
  scanBtnTitle: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    fontWeight: '800',
    color: '#000',
  },
  scanBtnSub: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.55)',
  },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  manualPlus: {
    fontSize: 22,
    fontFamily: MONO,
    fontWeight: '700',
  },
  manualLabel: {
    fontSize: 15,
    fontFamily: FONTS.heading,
    fontWeight: '700',
  },

  /* ── 4. day summary ── */
  sectionTag: {
    fontSize: 11,
    fontFamily: FONTS.subheading,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginBottom: spacing.sm,
  },
  summaryKcal: {
    fontSize: 22,
    fontFamily: MONO,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.md,
  },
  summaryKcalUnit: {
    fontSize: 13,
    fontWeight: '500',
  },
  macrosRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  macroBadge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    gap: 2,
  },
  macroBadgeLabel: {
    fontSize: 10,
    fontFamily: FONTS.subheading,
    fontWeight: '800',
    letterSpacing: 1,
  },
  macroBadgeValue: {
    fontSize: 14,
    fontFamily: MONO,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  /* ── 5. meals list ── */
  mealsListCard: {
    gap: 0,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  mealInfo: {
    flex: 1,
    gap: 2,
    marginRight: spacing.md,
  },
  mealName: {
    fontSize: 15,
    fontFamily: FONTS.subheading,
    fontWeight: '600',
  },
  mealMeta: {
    fontSize: 11,
    fontFamily: MONO,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.3,
  },
  mealCalWrap: {
    alignItems: 'flex-end',
  },
  mealCalVal: {
    fontSize: 18,
    fontFamily: MONO,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  mealCalUnit: {
    fontSize: 9,
    fontFamily: FONTS.medium,
    fontWeight: '600',
  },

  /* ── 6. empty state ── */
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing['3xl'],
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyIcon: {
    fontSize: 18,
    fontFamily: MONO,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: FONTS.subheading,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    fontFamily: FONTS.body,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.xl,
  },

  /* ── 7. recipes button ── */
  recipesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipesLeft: {
    flex: 1,
    gap: 2,
  },
  recipesTitle: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    fontWeight: '800',
  },
  recipesSub: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    fontWeight: '500',
  },
  recipesArrow: {
    fontSize: 22,
    fontFamily: MONO,
    fontWeight: '700',
  },

  /* ── 8. scan modal ── */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.heading,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    gap: spacing.md,
  },
  modalOptionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionIconText: {
    fontSize: 18,
    fontFamily: MONO,
    fontWeight: '700',
    color: '#000',
  },
  modalOptionContent: {
    flex: 1,
    gap: 2,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    fontWeight: '800',
    color: '#000',
  },
  modalOptionSub: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.55)',
  },
  modalOptionArrow: {
    fontSize: 20,
    fontFamily: MONO,
    fontWeight: '700',
    color: '#000',
  },
  modalCancel: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: FONTS.subheading,
    fontWeight: '600',
  },
});
