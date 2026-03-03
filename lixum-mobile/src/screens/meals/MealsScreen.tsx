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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { usePreloadedData } from '@/context/DataPreloadContext';
import { Card } from '@/components/ui';
import { CalorieOvershootAlert } from '@/components/CalorieOvershootAlert';
import { supabase } from '@/lib/supabase';
import { spacing, borderRadius } from '@/theme/spacing';
import type { Meal, MealsStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<MealsStackParamList>;

export function MealsScreen() {
  const { theme } = useTheme();
  const { t, locale } = useLocale();
  const navigation = useNavigation<Nav>();
  const { todayMeals: preloadedMeals, refresh } = usePreloadedData();

  const [meals, setMeals] = useState<Meal[]>(preloadedMeals);
  const [refreshing, setRefreshing] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showOvershoot, setShowOvershoot] = useState(false);
  const overshootShownRef = React.useRef(false);
  const accent = theme.accent;

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

  // Ouvrir la galerie pour charger une photo
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

  // Ouvrir Lixum Scan (caméra)
  const handleLixumScan = () => {
    setShowScanModal(false);
    navigation.navigate('Scan', {});
  };

  const totalCal = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + (m.protein ?? 0), 0);
  const totalCarbs = meals.reduce((s, m) => s + (m.carbs ?? 0), 0);
  const totalFat = meals.reduce((s, m) => s + (m.fat ?? 0), 0);

  // Résumé calorique
  const { profile, todaySummary: summary } = usePreloadedData();
  const target = profile?.daily_calorie_target || 2000;
  const consumed = summary?.total_calories_consumed ?? totalCal;
  const burned = summary?.total_calories_burned ?? 0;
  const remaining = Math.max(0, target - consumed + burned);
  const progress = target > 0 ? consumed / target : 0;
  const overshootKcal = Math.max(0, (consumed - burned) - target);
  const lixumId = (profile as any)?.lixum_id || '';

  // Alerte dépassement calorique
  React.useEffect(() => {
    if (overshootKcal > 0 && !overshootShownRef.current) {
      overshootShownRef.current = true;
      setShowOvershoot(true);
    }
  }, [overshootKcal]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
      >
        {/* Header avec LXM ID */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              {locale === 'fr' ? 'Bonjour' : 'Hello'} {'👋'}
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>
              {profile?.full_name || 'LIXUM'}
            </Text>
          </View>
          {lixumId ? (
            <View style={[styles.lixumBadge, { borderColor: accent + '44', backgroundColor: accent + '12' }]}>
              <Text style={[styles.lixumText, { color: accent }]}>{lixumId}</Text>
            </View>
          ) : null}
        </View>

        {/* Résumé calorique circulaire */}
        {profile && (
          <Card style={styles.calorieCard}>
            <View style={styles.circularRow}>
              <CircularProgress progress={progress} size={120} strokeWidth={10} color={accent} bgColor={theme.border}>
                <Text style={[styles.circularValue, { color: accent }]}>{remaining}</Text>
                <Text style={[styles.circularLabel, { color: theme.textSecondary }]}>
                  {locale === 'fr' ? 'restant' : 'left'}
                </Text>
              </CircularProgress>
              <View style={styles.circularStats}>
                <View style={styles.circularStatItem}>
                  <Text style={{ fontSize: 14 }}>{'🍽️'}</Text>
                  <Text style={[styles.circularStatValue, { color: '#f59e0b' }]}>{consumed}</Text>
                  <Text style={[styles.circularStatLabel, { color: theme.textSecondary }]}>
                    {locale === 'fr' ? 'Mangé' : 'Eaten'}
                  </Text>
                </View>
                <View style={styles.circularStatItem}>
                  <Text style={{ fontSize: 14 }}>{'🏃'}</Text>
                  <Text style={[styles.circularStatValue, { color: '#60a5fa' }]}>{burned}</Text>
                  <Text style={[styles.circularStatLabel, { color: theme.textSecondary }]}>
                    {locale === 'fr' ? 'Brûlé' : 'Burned'}
                  </Text>
                </View>
                <View style={styles.circularStatItem}>
                  <Text style={{ fontSize: 14 }}>{'🎯'}</Text>
                  <Text style={[styles.circularStatValue, { color: accent }]}>{target}</Text>
                  <Text style={[styles.circularStatLabel, { color: theme.textSecondary }]}>
                    {locale === 'fr' ? 'Objectif' : 'Goal'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Bouton central unique "Scanner un plat" */}
        <TouchableOpacity
          style={[styles.mainScanBtn, { backgroundColor: accent }]}
          onPress={() => setShowScanModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.mainScanIcon}>{'🔍'}</Text>
          <Text style={styles.mainScanTitle}>
            {locale === 'fr' ? 'Scanner un plat' : 'Scan a meal'}
          </Text>
          <Text style={styles.mainScanSub}>
            {locale === 'fr' ? 'Analysez les calories en un clic' : 'Analyze calories in one click'}
          </Text>
        </TouchableOpacity>

        {/* Bouton ajout manuel */}
        <TouchableOpacity
          style={[styles.manualBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => navigation.navigate('AddMeal')}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 20 }}>{'+'}</Text>
          <Text style={[styles.manualBtnText, { color: theme.text }]}>
            {locale === 'fr' ? 'Ajout manuel' : 'Manual entry'}
          </Text>
        </TouchableOpacity>

        {/* Bilan du jour avec macros */}
        {meals.length > 0 && (
          <Card>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              {locale === 'fr' ? 'BILAN DU JOUR' : "TODAY'S SUMMARY"}
            </Text>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total</Text>
              <Text style={[styles.totalValue, { color: accent }]}>{totalCal} kcal</Text>
            </View>
            <View style={styles.macrosRow}>
              <MacroBadge label="P" value={totalProtein} color="#ef4444" />
              <MacroBadge label="G" value={totalCarbs} color="#f59e0b" />
              <MacroBadge label="L" value={totalFat} color="#60a5fa" />
            </View>
          </Card>
        )}

        {/* Liste des repas du jour */}
        {meals.length > 0 && (
          <Card style={styles.mealsCard}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              {locale === 'fr' ? 'REPAS DU JOUR' : "TODAY'S MEALS"}
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

        {meals.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={{ fontSize: 40 }}>{'🍽️'}</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {locale === 'fr' ? 'Aucun repas enregistré aujourd\'hui' : 'No meals recorded today'}
            </Text>
            <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>
              {locale === 'fr' ? 'Appuyez sur "Scanner un plat" pour commencer' : 'Tap "Scan a meal" to start'}
            </Text>
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
            <Text style={[styles.recipesBtnTitle, { color: theme.text }]}>{t.meals.recipes}</Text>
            <Text style={[styles.recipesBtnSub, { color: theme.textSecondary }]}>
              {locale === 'fr' ? 'Découvrir des idées de repas' : 'Discover meal ideas'}
            </Text>
          </View>
          <Text style={[styles.recipesArrow, { color: accent }]}>{'>'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Alerte dépassement calorique */}
      <CalorieOvershootAlert
        visible={showOvershoot}
        overshootKcal={overshootKcal}
        onClose={() => setShowOvershoot(false)}
      />

      {/* Modal de choix : Lixum Scan ou Charger Photo */}
      <Modal
        visible={showScanModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScanModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {locale === 'fr' ? 'Comment ajouter votre plat ?' : 'How to add your meal?'}
            </Text>

            {/* Option Lixum Scan */}
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: accent }]}
              onPress={handleLixumScan}
              activeOpacity={0.8}
            >
              <Text style={styles.modalOptionIcon}>{'📸'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalOptionTitle}>Lixum Scan</Text>
                <Text style={styles.modalOptionSub}>
                  {locale === 'fr' ? 'Ouvrir la caméra et scanner' : 'Open camera and scan'}
                </Text>
              </View>
              <Text style={styles.modalArrow}>{'>'}</Text>
            </TouchableOpacity>

            {/* Option Charger photo */}
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }]}
              onPress={handleUploadPhoto}
              activeOpacity={0.8}
            >
              <Text style={styles.modalOptionIcon}>{'🖼️'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalOptionTitle, { color: theme.text }]}>
                  {locale === 'fr' ? 'Charger une photo' : 'Upload a photo'}
                </Text>
                <Text style={[styles.modalOptionSub, { color: theme.textSecondary }]}>
                  {locale === 'fr' ? 'Depuis votre galerie' : 'From your gallery'}
                </Text>
              </View>
              <Text style={[styles.modalArrow, { color: theme.textSecondary }]}>{'>'}</Text>
            </TouchableOpacity>

            {/* Bouton fermer */}
            <TouchableOpacity
              style={[styles.modalCloseBtn, { borderColor: theme.border }]}
              onPress={() => setShowScanModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>
                {locale === 'fr' ? 'Annuler' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/** Barre de progression circulaire */
function CircularProgress({
  progress, size = 120, strokeWidth = 10, color, bgColor, children,
}: {
  progress: number; size?: number; strokeWidth?: number; color: string; bgColor: string; children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const strokeDashoffset = circumference * (1 - clampedProgress);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={bgColor} strokeWidth={strokeWidth} fill="transparent" />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={progress > 1 ? '#ef4444' : color}
          strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={`${circumference}`} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" rotation="-90" origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {children}
    </View>
  );
}

function MacroBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.macroBadge, { backgroundColor: color + '15', borderColor: color + '44' }]}>
      <Text style={[styles.macroBadgeLabel, { color }]}>{label}</Text>
      <Text style={[styles.macroBadgeValue, { color }]}>{value}g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing['4xl'] },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  greeting: { fontSize: 14, fontWeight: '500' },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  lixumBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, borderWidth: 1 },
  lixumText: { fontSize: 11, fontWeight: '900', letterSpacing: 2, fontFamily: 'monospace' },

  // Résumé circulaire
  calorieCard: { gap: spacing.sm },
  circularRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  circularValue: { fontSize: 26, fontWeight: '900', fontVariant: ['tabular-nums'] },
  circularLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  circularStats: { flex: 1, gap: spacing.sm },
  circularStatItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  circularStatValue: { fontSize: 14, fontWeight: '800', fontVariant: ['tabular-nums'] },
  circularStatLabel: { fontSize: 10, fontWeight: '600' },

  mainScanBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    borderRadius: 20,
    gap: spacing.sm,
  },
  mainScanIcon: { fontSize: 48 },
  mainScanTitle: { fontSize: 20, fontWeight: '900', color: '#000' },
  mainScanSub: { fontSize: 13, fontWeight: '600', color: 'rgba(0,0,0,0.6)' },

  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  manualBtnText: { fontSize: 15, fontWeight: '700' },

  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalValue: { fontSize: 22, fontWeight: '900', fontVariant: ['tabular-nums'] },
  macrosRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  macroBadge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    gap: 2,
  },
  macroBadgeLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  macroBadgeValue: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },

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

  emptyCard: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing['2xl'] },
  emptyText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  emptyHint: { fontSize: 13, textAlign: 'center' },

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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  modalTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center' },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    gap: spacing.md,
  },
  modalOptionIcon: { fontSize: 32 },
  modalOptionTitle: { fontSize: 16, fontWeight: '800', color: '#000' },
  modalOptionSub: { fontSize: 12, fontWeight: '500', color: 'rgba(0,0,0,0.6)', marginTop: 2 },
  modalArrow: { fontSize: 20, fontWeight: '700', color: '#000' },
  modalCloseBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  modalCloseText: { fontSize: 15, fontWeight: '600' },
});
