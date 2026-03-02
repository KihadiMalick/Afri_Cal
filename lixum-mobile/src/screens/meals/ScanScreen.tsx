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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { Button, Card } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { checkScanLimit, incrementScanCount } from '@/utils/scan-limits';
import { updateDailySummary } from '@/utils/daily-summary';
import { spacing, borderRadius } from '@/theme/spacing';
import { colors } from '@/theme/colors';

type Phase = 'camera' | 'analyzing' | 'results';

interface ScanResult {
  ingredients: { name: string; calories: number; protein: number; carbs: number; fat: number }[];
  totalCalories: number;
  mealName: string;
}

export function ScanScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, locale } = useLocale();
  const navigation = useNavigation();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('camera');
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [saving, setSaving] = useState(false);

  const accent = theme.accent;

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !user) return;

    // Check scan limit
    const limit = await checkScanLimit(supabase, user.id);
    if (!limit.canScan) {
      Alert.alert(t.scan.limitReached, `${t.scan.scansRemaining}: 0`);
      return;
    }

    const pic = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
    if (!pic) return;

    setPhoto(pic.uri);
    setPhase('analyzing');

    try {
      // Send to vision API
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || ''}/api/vision/analyze`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            frames: [pic.base64],
            locale,
          }),
        },
      );

      if (!response.ok) throw new Error('API error');
      const data = await response.json();

      await incrementScanCount(supabase, user.id);

      setResult({
        ingredients: data.ingredients || [],
        totalCalories: data.totalCalories || 0,
        mealName: data.mealName || (locale === 'fr' ? 'Repas scanné' : 'Scanned meal'),
      });
      setPhase('results');
    } catch {
      Alert.alert('Error', locale === 'fr' ? 'Erreur d\'analyse' : 'Analysis error');
      setPhase('camera');
    }
  }, [user, locale, t]);

  const handleSave = async () => {
    if (!user || !result) return;
    setSaving(true);

    const todayStr = new Date().toISOString().split('T')[0];
    const totalProtein = result.ingredients.reduce((s, i) => s + (i.protein || 0), 0);
    const totalCarbs = result.ingredients.reduce((s, i) => s + (i.carbs || 0), 0);
    const totalFat = result.ingredients.reduce((s, i) => s + (i.fat || 0), 0);

    await supabase.from('meals').insert({
      user_id: user.id,
      name: result.mealName,
      calories: result.totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      meal_type: 'lunch',
      date: todayStr,
    });

    await updateDailySummary(supabase, user.id, todayStr);
    setSaving(false);
    navigation.goBack();
  };

  // Permission not granted
  if (!permission?.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.permissionContainer}>
          <Text style={{ fontSize: 48 }}>📷</Text>
          <Text style={[styles.permTitle, { color: theme.text }]}>
            {locale === 'fr' ? 'Accès caméra requis' : 'Camera access required'}
          </Text>
          <Text style={[styles.permDesc, { color: theme.textSecondary }]}>
            {locale === 'fr'
              ? 'LIXUM utilise la caméra pour scanner vos repas'
              : 'LIXUM uses the camera to scan your meals'}
          </Text>
          <Button
            title={locale === 'fr' ? 'Autoriser' : 'Allow'}
            onPress={requestPermission}
            size="lg"
          />
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }}>
            <Text style={{ color: theme.textSecondary }}>{t.common.back}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Camera Phase */}
      {phase === 'camera' && (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          />

          {/* HUD */}
          <View style={styles.cameraHud}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.closeBtnText}>✕</Text>
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

      {/* Analyzing Phase */}
      {phase === 'analyzing' && (
        <View style={styles.analyzingContainer}>
          {photo && (
            <Image source={{ uri: photo }} style={styles.previewImage} />
          )}
          <View style={styles.analyzingOverlay}>
            <ActivityIndicator size="large" color={accent} />
            <Text style={styles.analyzingText}>{t.scan.analyzing}</Text>
            <Text style={styles.analyzingSubtext}>
              {locale === 'fr' ? 'Moteur Vision LIXUM...' : 'LIXUM Vision Engine...'}
            </Text>
          </View>
        </View>
      )}

      {/* Results Phase */}
      {phase === 'results' && result && (
        <ScrollView contentContainerStyle={styles.resultsScroll}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: accent }]}>{t.common.back}</Text>
          </TouchableOpacity>

          <Text style={[styles.resultsTitle, { color: theme.text }]}>{result.mealName}</Text>

          <Card style={styles.totalCard}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
              {t.meals.totalCalories}
            </Text>
            <Text style={[styles.totalValue, { color: accent }]}>
              {result.totalCalories} kcal
            </Text>
          </Card>

          {result.ingredients.map((ing, i) => (
            <Card key={i} padding="sm" style={styles.ingCard}>
              <Text style={[styles.ingName, { color: theme.text }]}>{ing.name}</Text>
              <View style={styles.ingMacros}>
                <Text style={[styles.ingMacro, { color: '#f59e0b' }]}>{ing.calories} kcal</Text>
                <Text style={[styles.ingMacro, { color: theme.textSecondary }]}>
                  P:{ing.protein} C:{ing.carbs} F:{ing.fat}
                </Text>
              </View>
            </Card>
          ))}

          <Button
            title={t.scan.save}
            onPress={handleSave}
            loading={saving}
            fullWidth
            size="lg"
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraHud: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', padding: spacing.lg },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  scanHint: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  scanHintText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  captureBtn: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 3,
  },
  analyzingContainer: { flex: 1 },
  previewImage: { flex: 1 },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  analyzingText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  analyzingSubtext: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  resultsScroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing['4xl'] },
  backText: { fontSize: 15, fontWeight: '600' },
  resultsTitle: { fontSize: 24, fontWeight: '900' },
  totalCard: { alignItems: 'center', gap: spacing.xs },
  totalLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  totalValue: { fontSize: 36, fontWeight: '900', fontVariant: ['tabular-nums'] },
  ingCard: { gap: spacing.xs },
  ingName: { fontSize: 15, fontWeight: '600' },
  ingMacros: { flexDirection: 'row', justifyContent: 'space-between' },
  ingMacro: { fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  permissionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing['3xl'] },
  permTitle: { fontSize: 18, fontWeight: '800' },
  permDesc: { fontSize: 14, textAlign: 'center' },
});
