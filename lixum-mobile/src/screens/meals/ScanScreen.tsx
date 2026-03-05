import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

// expo-camera n'est pas disponible sur le web
let CameraView: any = null;
let useCameraPermissions: any = () => [{ granted: false }, () => {}];
if (Platform.OS !== 'web') {
  const cam = require('expo-camera');
  CameraView = cam.CameraView;
  useCameraPermissions = cam.useCameraPermissions;
}
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { Button, Card } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { checkScanLimit, incrementScanCount } from '@/utils/scan-limits';
import { updateDailySummary } from '@/utils/daily-summary';
import { spacing, borderRadius } from '@/theme/spacing';

type Phase = 'camera' | 'analyzing' | 'results';

interface Ingredient {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ScanResult {
  ingredients: Ingredient[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealName: string;
}

export function ScanScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, locale } = useLocale();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const cameraRef = useRef<any>(null);

  // Image passée depuis la galerie
  const passedImageUri = route.params?.imageUri as string | undefined;
  const passedImageBase64 = route.params?.imageBase64 as string | undefined;

  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>(passedImageUri ? 'analyzing' : 'camera');
  const [photo, setPhoto] = useState<string | null>(passedImageUri || null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editCalories, setEditCalories] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  const accent = theme.accent;

  // Si image passée depuis la galerie, analyser directement
  React.useEffect(() => {
    if (passedImageUri && passedImageBase64) {
      analyzeImage(passedImageBase64);
    }
  }, []);

  const analyzeImage = async (base64Data: string) => {
    if (!user) return;

    const limit = await checkScanLimit(supabase, user.id);
    if (!limit.canScan) {
      Alert.alert(t.scan.limitReached, `${t.scan.scansRemaining}: 0`);
      navigation.goBack();
      return;
    }

    setPhase('analyzing');

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || ''}/api/vision/analyze`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ frames: [base64Data], locale }),
        },
      );

      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      await incrementScanCount(supabase, user.id);

      const ingredients: Ingredient[] = data.ingredients || [];
      setResult({
        ingredients,
        totalCalories: data.totalCalories || ingredients.reduce((s, i) => s + i.calories, 0),
        totalProtein: ingredients.reduce((s, i) => s + (i.protein || 0), 0),
        totalCarbs: ingredients.reduce((s, i) => s + (i.carbs || 0), 0),
        totalFat: ingredients.reduce((s, i) => s + (i.fat || 0), 0),
        mealName: data.mealName || (locale === 'fr' ? 'Repas scanné' : 'Scanned meal'),
      });
      setPhase('results');
    } catch {
      Alert.alert('Error', locale === 'fr' ? 'Erreur d\'analyse. Réessayez.' : 'Analysis error. Try again.');
      setPhase('camera');
    }
  };

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !user) return;

    const pic = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
    if (!pic) return;

    setPhoto(pic.uri);
    analyzeImage(pic.base64 || '');
  }, [user, locale, t]);

  // Recalculer les totaux
  const recalcTotals = (ingredients: Ingredient[]): ScanResult => ({
    ingredients,
    totalCalories: ingredients.reduce((s, i) => s + i.calories, 0),
    totalProtein: ingredients.reduce((s, i) => s + (i.protein || 0), 0),
    totalCarbs: ingredients.reduce((s, i) => s + (i.carbs || 0), 0),
    totalFat: ingredients.reduce((s, i) => s + (i.fat || 0), 0),
    mealName: result?.mealName || '',
  });

  // Supprimer un ingrédient
  const handleRemoveIngredient = (index: number) => {
    if (!result) return;
    const updated = result.ingredients.filter((_, i) => i !== index);
    setResult(recalcTotals(updated));
  };

  // Commencer l'édition d'un ingrédient
  const handleStartEdit = (index: number) => {
    if (!result) return;
    const ing = result.ingredients[index];
    setEditingIndex(index);
    setEditName(ing.name);
    setEditCalories(String(ing.calories));
  };

  // Sauvegarder l'édition
  const handleSaveEdit = () => {
    if (!result || editingIndex === null) return;
    const updated = [...result.ingredients];
    updated[editingIndex] = {
      ...updated[editingIndex],
      name: editName,
      calories: parseInt(editCalories, 10) || 0,
    };
    setResult(recalcTotals(updated));
    setEditingIndex(null);
  };

  // Ajouter un nouvel ingrédient
  const handleAddIngredient = () => {
    if (!result) return;
    const newIng: Ingredient = {
      name: locale === 'fr' ? 'Nouvel ingrédient' : 'New ingredient',
      calories: 0, protein: 0, carbs: 0, fat: 0,
    };
    const updated = [...result.ingredients, newIng];
    setResult(recalcTotals(updated));
    setEditingIndex(updated.length - 1);
    setEditName(newIng.name);
    setEditCalories('0');
  };

  // Enregistrer le repas
  const handleSave = async () => {
    if (!user || !result) return;
    setSaving(true);

    const todayStr = new Date().toISOString().split('T')[0];

    await supabase.from('meals').insert({
      user_id: user.id,
      name: result.mealName,
      calories: result.totalCalories,
      protein: result.totalProtein,
      carbs: result.totalCarbs,
      fat: result.totalFat,
      meal_type: mealType,
      date: todayStr,
    });

    await updateDailySummary(supabase, user.id, todayStr);
    setSaving(false);
    navigation.goBack();
  };

  // Permission non accordée (mode caméra uniquement, natif seulement)
  if (Platform.OS !== 'web' && !passedImageUri && !permission?.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.permissionContainer}>
          <Text style={{ fontSize: 48 }}>{'📷'}</Text>
          <Text style={[styles.permTitle, { color: theme.text }]}>
            {locale === 'fr' ? 'Accès caméra requis' : 'Camera access required'}
          </Text>
          <Text style={[styles.permDesc, { color: theme.textSecondary }]}>
            {locale === 'fr'
              ? 'LIXUM utilise la caméra pour scanner vos repas'
              : 'LIXUM uses the camera to scan your meals'}
          </Text>
          <Button title={locale === 'fr' ? 'Autoriser' : 'Allow'} onPress={requestPermission} size="lg" />
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }}>
            <Text style={{ color: theme.textSecondary }}>{t.common.back}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Phase Caméra */}
      {phase === 'camera' && Platform.OS === 'web' && (
        <View style={styles.permissionContainer}>
          <Text style={{ fontSize: 48 }}>{'📷'}</Text>
          <Text style={[styles.permTitle, { color: theme.text }]}>
            {locale === 'fr' ? 'Caméra non disponible sur le web' : 'Camera not available on web'}
          </Text>
          <Text style={[styles.permDesc, { color: theme.textSecondary }]}>
            {locale === 'fr'
              ? 'Utilisez la galerie photo ou l\'app mobile pour scanner vos repas'
              : 'Use the photo gallery or mobile app to scan your meals'}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: accent, fontSize: 15, fontWeight: '600' }}>{t.common.back}</Text>
          </TouchableOpacity>
        </View>
      )}
      {phase === 'camera' && Platform.OS !== 'web' && (
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <View style={styles.cameraHud}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.closeBtnText}>{'✕'}</Text>
            </TouchableOpacity>
            <View style={styles.scanHint}>
              <Text style={styles.scanHintText}>
                {locale === 'fr' ? 'Cadrez votre plat' : 'Frame your dish'}
              </Text>
            </View>
            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
              <View style={[styles.captureBtnInner, { borderColor: accent }]} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Phase Analyse */}
      {phase === 'analyzing' && (
        <View style={styles.analyzingContainer}>
          {photo && <Image source={{ uri: photo }} style={styles.previewImage} />}
          <View style={styles.analyzingOverlay}>
            <ActivityIndicator size="large" color={accent} />
            <Text style={styles.analyzingText}>{t.scan.analyzing}</Text>
            <Text style={styles.analyzingSubtext}>
              {locale === 'fr' ? 'Moteur Vision LIXUM...' : 'LIXUM Vision Engine...'}
            </Text>
          </View>
        </View>
      )}

      {/* Phase Résultats — Carte Premium */}
      {phase === 'results' && result && (
        <ScrollView contentContainerStyle={styles.resultsScroll}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: accent }]}>{t.common.back}</Text>
          </TouchableOpacity>

          {/* Carte Premium avec photo et infos */}
          <Card style={styles.premiumCard}>
            {photo && <Image source={{ uri: photo }} style={styles.resultPhoto} />}
            <View style={styles.premiumContent}>
              <Text style={[styles.mealName, { color: theme.text }]}>{result.mealName}</Text>

              <View style={[styles.totalCalRow, { backgroundColor: accent + '15' }]}>
                <Text style={{ fontSize: 22 }}>{'🔥'}</Text>
                <Text style={[styles.totalCalValue, { color: accent }]}>
                  {result.totalCalories} kcal
                </Text>
              </View>

              <View style={styles.macrosDetailRow}>
                <MacroDetail label={locale === 'fr' ? 'Protéines' : 'Protein'} value={result.totalProtein} unit="g" color="#ef4444" />
                <MacroDetail label={locale === 'fr' ? 'Glucides' : 'Carbs'} value={result.totalCarbs} unit="g" color="#f59e0b" />
                <MacroDetail label={locale === 'fr' ? 'Lipides' : 'Fat'} value={result.totalFat} unit="g" color="#60a5fa" />
              </View>
            </View>
          </Card>

          {/* Type de repas */}
          <View>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              {locale === 'fr' ? 'TYPE DE REPAS' : 'MEAL TYPE'}
            </Text>
            <View style={styles.mealTypeRow}>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.mealTypeChip,
                    {
                      backgroundColor: mealType === type ? accent : theme.surface,
                      borderColor: mealType === type ? accent : theme.border,
                    },
                  ]}
                  onPress={() => setMealType(type)}
                >
                  <Text style={[styles.mealTypeText, { color: mealType === type ? '#000' : theme.textSecondary }]}>
                    {type === 'breakfast' ? (locale === 'fr' ? 'P.déj' : 'Bfast')
                      : type === 'lunch' ? (locale === 'fr' ? 'Déj' : 'Lunch')
                      : type === 'dinner' ? (locale === 'fr' ? 'Dîner' : 'Dinner')
                      : 'Snack'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ingrédients avec correction */}
          <View>
            <View style={styles.ingredientsHeader}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                {locale === 'fr' ? 'INGRÉDIENTS DÉTECTÉS' : 'DETECTED INGREDIENTS'}
              </Text>
              <TouchableOpacity onPress={handleAddIngredient}>
                <Text style={[styles.addIngBtn, { color: accent }]}>
                  + {locale === 'fr' ? 'Ajouter' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>

            {result.ingredients.map((ing, i) => (
              <Card key={i} padding="sm" style={styles.ingCard}>
                {editingIndex === i ? (
                  <View style={styles.editRow}>
                    <TextInput
                      style={[styles.editInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder={locale === 'fr' ? 'Nom' : 'Name'}
                      placeholderTextColor={theme.textSecondary}
                    />
                    <TextInput
                      style={[styles.editInputSmall, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                      value={editCalories}
                      onChangeText={setEditCalories}
                      keyboardType="numeric"
                      placeholder="kcal"
                      placeholderTextColor={theme.textSecondary}
                    />
                    <TouchableOpacity onPress={handleSaveEdit} style={[styles.editSaveBtn, { backgroundColor: accent }]}>
                      <Text style={styles.editSaveBtnText}>{'✓'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.ingRow}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => handleStartEdit(i)}>
                      <Text style={[styles.ingName, { color: theme.text }]}>{ing.name}</Text>
                      <Text style={[styles.ingMacro, { color: theme.textSecondary }]}>
                        P:{ing.protein}g C:{ing.carbs}g L:{ing.fat}g
                      </Text>
                    </TouchableOpacity>
                    <Text style={[styles.ingCal, { color: '#f59e0b' }]}>{ing.calories} kcal</Text>
                    <TouchableOpacity onPress={() => handleRemoveIngredient(i)} style={styles.removeIngBtn}>
                      <Text style={styles.removeIngText}>{'✕'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            ))}

            <Text style={[styles.editHint, { color: theme.textSecondary }]}>
              {locale === 'fr'
                ? 'Appuyez sur un ingrédient pour le modifier, ✕ pour le supprimer'
                : 'Tap an ingredient to edit, ✕ to remove'}
            </Text>
          </View>

          <Button title={t.scan.save} onPress={handleSave} loading={saving} fullWidth size="lg" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function MacroDetail({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <View style={[styles.macroDetailItem, { backgroundColor: color + '12', borderColor: color + '33' }]}>
      <Text style={[styles.macroDetailValue, { color }]}>{value}{unit}</Text>
      <Text style={[styles.macroDetailLabel, { color: color + 'bb' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraHud: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', padding: spacing.lg },
  closeBtn: {
    alignSelf: 'flex-end', width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  scanHint: {
    alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full,
  },
  scanHintText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  captureBtn: {
    alignSelf: 'center', width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  captureBtnInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', borderWidth: 3 },
  analyzingContainer: { flex: 1 },
  previewImage: { flex: 1 },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center', gap: spacing.md,
  },
  analyzingText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  analyzingSubtext: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  resultsScroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing['4xl'] },
  backText: { fontSize: 15, fontWeight: '600' },

  premiumCard: { overflow: 'hidden', padding: 0 },
  resultPhoto: { width: '100%', height: 200, backgroundColor: '#333' },
  premiumContent: { padding: spacing.lg, gap: spacing.md },
  mealName: { fontSize: 22, fontWeight: '900' },
  totalCalRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: borderRadius.md,
  },
  totalCalValue: { fontSize: 28, fontWeight: '900', fontVariant: ['tabular-nums'] },
  macrosDetailRow: { flexDirection: 'row', gap: spacing.sm },
  macroDetailItem: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm, borderWidth: 1, gap: 2,
  },
  macroDetailValue: { fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  macroDetailLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing.sm },
  mealTypeRow: { flexDirection: 'row', gap: spacing.sm },
  mealTypeChip: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1,
  },
  mealTypeText: { fontSize: 12, fontWeight: '700' },

  ingredientsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addIngBtn: { fontSize: 13, fontWeight: '700' },
  ingCard: { marginBottom: spacing.sm },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ingName: { fontSize: 14, fontWeight: '600' },
  ingMacro: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  ingCal: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  removeIngBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.15)', alignItems: 'center', justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  removeIngText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },
  editRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  editInput: {
    flex: 1, borderWidth: 1, borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, fontSize: 14,
  },
  editInputSmall: {
    width: 70, borderWidth: 1, borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, fontSize: 14, textAlign: 'center',
  },
  editSaveBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  editSaveBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  editHint: { fontSize: 11, textAlign: 'center', fontStyle: 'italic', marginTop: spacing.xs },

  permissionContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: spacing.lg, padding: spacing['3xl'],
  },
  permTitle: { fontSize: 18, fontWeight: '800' },
  permDesc: { fontSize: 14, textAlign: 'center' },
});
