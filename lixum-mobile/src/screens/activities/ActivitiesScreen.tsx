import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { Card, Button } from '@/components/ui';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { supabase } from '@/lib/supabase';
import { generateSportRecommendation } from '@/utils/sport-recommendation';
import { updateDailySummary } from '@/utils/daily-summary';
import { spacing, borderRadius } from '@/theme/spacing';
import type { Activity } from '@/types';

export function ActivitiesScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, locale } = useLocale();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [surplus, setSurplus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [actName, setActName] = useState('');
  const [actDuration, setActDuration] = useState('');
  const [actCalories, setActCalories] = useState('');
  const [saving, setSaving] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const accent = theme.accent;

  const loadData = useCallback(async () => {
    if (!user) return;

    const [actRes, summaryRes] = await Promise.all([
      supabase.from('activities').select('*').eq('user_id', user.id).eq('date', todayStr)
        .order('created_at', { ascending: false }),
      (supabase as any).from('daily_summary').select('calorie_balance')
        .eq('user_id', user.id).eq('date', todayStr).single(),
    ]);

    setActivities((actRes.data as Activity[]) ?? []);
    if (summaryRes.data) {
      const balance = (summaryRes.data as { calorie_balance: number }).calorie_balance;
      setSurplus(balance > 0 ? balance : 0);
    }
    setLoading(false);
  }, [user, todayStr]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddActivity = async () => {
    if (!user || !actName.trim() || !actCalories.trim()) return;
    setSaving(true);
    await supabase.from('activities').insert({
      user_id: user.id,
      name: actName.trim(),
      duration_minutes: parseInt(actDuration, 10) || 0,
      calories_burned: parseInt(actCalories, 10) || 0,
      date: todayStr,
    });
    await updateDailySummary(supabase, user.id, todayStr);
    setActName('');
    setActDuration('');
    setActCalories('');
    setShowForm(false);
    setSaving(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    Alert.alert(t.common.delete, '', [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: async () => {
          await (supabase as any).from('activities').delete().eq('id', id);
          if (user) await updateDailySummary(supabase, user.id, todayStr);
          loadData();
        },
      },
    ]);
  };

  const recommendation = generateSportRecommendation(surplus);
  const totalBurned = activities.reduce((s, a) => s + a.calories_burned, 0);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{t.activities.title}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {locale === 'fr' ? 'Dépense énergétique du jour' : "Today's energy expenditure"}
          </Text>
        </View>

        {/* Total Burned */}
        <Card style={[styles.burnedCard, { borderColor: '#60a5fa33' }]}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            {t.activities.totalBurned}
          </Text>
          <Text style={[styles.burnedValue, { color: '#60a5fa' }]}>
            {totalBurned}
            <Text style={{ fontSize: 18, color: theme.textSecondary }}> kcal</Text>
          </Text>
        </Card>

        {/* Recommendation */}
        <Card style={[styles.recoCard, { borderColor: '#ef444433' }]}>
          <Text style={[styles.recoTitle, { color: '#f87171' }]}>{t.activities.recommendation}</Text>
          {recommendation ? (
            <>
              <Text style={[styles.recoText, { color: theme.textSecondary }]}>
                {locale === 'fr'
                  ? `Surplus de ${recommendation.surplus} kcal`
                  : `${recommendation.surplus} kcal surplus`}
              </Text>
              <View style={styles.recoStatsRow}>
                <RecoStat value={recommendation.walkingKm} label={locale === 'fr' ? 'km marche' : 'km walk'} color="#f59e0b" />
                <RecoStat value={recommendation.runningMinutes} label={locale === 'fr' ? 'min course' : 'min run'} color="#60a5fa" />
                <RecoStat value={recommendation.steps} label={locale === 'fr' ? 'pas' : 'steps'} color="#a78bfa" />
              </View>
            </>
          ) : (
            <Text style={{ color: accent, fontWeight: '600', fontSize: 14 }}>
              {locale === 'fr' ? 'Aucun surplus ! Objectif atteint.' : 'No surplus! On target.'}
            </Text>
          )}
        </Card>

        {/* Add Activity */}
        <Button
          title={t.activities.addActivity}
          onPress={() => setShowForm(!showForm)}
          variant="secondary"
          fullWidth
        />

        {showForm && (
          <Card style={styles.formCard}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: theme.border }]}
              placeholder={locale === 'fr' ? 'Nom (ex: Course à pied)' : 'Name (e.g. Running)'}
              placeholderTextColor={theme.textSecondary}
              value={actName}
              onChangeText={setActName}
            />
            <View style={styles.formRow}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: theme.border }]}
                placeholder={t.activities.duration}
                placeholderTextColor={theme.textSecondary}
                value={actDuration}
                onChangeText={setActDuration}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: theme.border }]}
                placeholder={t.activities.caloriesBurned}
                placeholderTextColor={theme.textSecondary}
                value={actCalories}
                onChangeText={setActCalories}
                keyboardType="numeric"
              />
            </View>
            <Button title={t.common.save} onPress={handleAddActivity} loading={saving} fullWidth />
          </Card>
        )}

        {/* Activities List */}
        <Card>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            {locale === 'fr' ? 'Activités du jour' : "Today's activities"}
          </Text>
          {activities.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t.common.noResults}</Text>
          ) : (
            activities.map((act) => (
              <TouchableOpacity
                key={act.id}
                style={[styles.actRow, { borderBottomColor: theme.border }]}
                onLongPress={() => handleDelete(act.id)}
              >
                <View>
                  <Text style={[styles.actName, { color: theme.text }]}>{act.name}</Text>
                  <Text style={[styles.actMeta, { color: theme.textSecondary }]}>
                    {act.duration_minutes} min
                  </Text>
                </View>
                <Text style={[styles.actCal, { color: '#60a5fa' }]}>{act.calories_burned} kcal</Text>
              </TouchableOpacity>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function RecoStat({ value, label, color }: { value: number; label: string; color: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.recoStat}>
      <Text style={[styles.recoStatValue, { color }]}>{value}</Text>
      <Text style={[styles.recoStatLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing['4xl'] },
  header: { marginBottom: spacing.xs },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing.md },
  burnedCard: { borderWidth: 1 },
  burnedValue: { fontSize: 48, fontWeight: '900', fontVariant: ['tabular-nums'] },
  recoCard: { borderWidth: 1, gap: spacing.md },
  recoTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  recoText: { fontSize: 13, fontWeight: '500' },
  recoStatsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  recoStat: { alignItems: 'center', gap: 2 },
  recoStatValue: { fontSize: 24, fontWeight: '900', fontVariant: ['tabular-nums'] },
  recoStatLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  formCard: { gap: spacing.md },
  formRow: { flexDirection: 'row', gap: spacing.md },
  input: { borderWidth: 1, borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: 15 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: spacing.xl },
  actRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  actName: { fontSize: 15, fontWeight: '600' },
  actMeta: { fontSize: 12, marginTop: 2 },
  actCal: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
