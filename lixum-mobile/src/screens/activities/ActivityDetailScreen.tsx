import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { Button, Card } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { updateDailySummary } from '@/utils/daily-summary';
import { spacing, borderRadius } from '@/theme/spacing';
import type { SportActivity } from '@/types';

const DIFFICULTY_COLORS = {
  easy: '#22c55e',
  medium: '#f59e0b',
  intense: '#ef4444',
};

export function ActivityDetailScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { locale } = useLocale();
  const navigation = useNavigation();
  const route = useRoute<any>();

  const sport: SportActivity = route.params?.sport;
  const accent = theme.accent;
  const name = locale === 'fr' ? sport.name_fr : sport.name;
  const desc = locale === 'fr' ? sport.description_fr : sport.description;
  const diffColor = DIFFICULTY_COLORS[sport.difficulty];

  const handleAdd = async () => {
    if (!user) return;
    const todayStr = new Date().toISOString().split('T')[0];
    // Ajouter 30 min par défaut
    const caloriesBurned = sport.calories_per_5min * 6;
    await supabase.from('activities').insert({
      user_id: user.id,
      name: name,
      duration_minutes: 30,
      calories_burned: caloriesBurned,
      date: todayStr,
    });
    await updateDailySummary(supabase, user.id, todayStr);
    Alert.alert(
      locale === 'fr' ? 'Ajouté' : 'Added',
      locale === 'fr' ? `${name} ajouté à votre programme` : `${name} added to your program`
    );
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Image grande */}
        <Image source={{ uri: sport.image_url }} style={styles.heroImage} />

        {/* Bouton retour */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>{'<'}</Text>
        </TouchableOpacity>

        {/* Infos */}
        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
            <View style={[styles.diffBadge, { backgroundColor: diffColor + '22', borderColor: diffColor + '66' }]}>
              <Text style={[styles.diffText, { color: diffColor }]}>
                {locale === 'fr'
                  ? (sport.difficulty === 'easy' ? 'Facile' : sport.difficulty === 'medium' ? 'Moyen' : 'Intense')
                  : sport.difficulty}
              </Text>
            </View>
          </View>

          {/* Calories */}
          <Card style={styles.calCard}>
            <Text style={{ fontSize: 28 }}>{'🔥'}</Text>
            <View>
              <Text style={[styles.calValue, { color: accent }]}>
                {sport.calories_per_5min} kcal / 5 min
              </Text>
              <Text style={[styles.calSub, { color: theme.textSecondary }]}>
                ~{sport.calories_per_5min * 6} kcal / 30 min
              </Text>
            </View>
          </Card>

          {/* Muscles ciblés */}
          <Card>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              {locale === 'fr' ? 'MUSCLES CIBLÉS' : 'TARGET MUSCLES'}
            </Text>
            <View style={styles.tagsRow}>
              {sport.muscle_groups.map((mg, i) => (
                <View key={i} style={[styles.tag, { backgroundColor: accent + '18', borderColor: accent + '44' }]}>
                  <Text style={[styles.tagText, { color: accent }]}>{mg}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Bienfaits */}
          <Card>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              {locale === 'fr' ? 'BIENFAITS' : 'BENEFITS'}
            </Text>
            {sport.benefits.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <Text style={{ color: '#22c55e', fontSize: 14 }}>{'✓'}</Text>
                <Text style={[styles.benefitText, { color: theme.text }]}>{b}</Text>
              </View>
            ))}
          </Card>

          {/* Description */}
          <Text style={[styles.desc, { color: theme.textSecondary }]}>{desc}</Text>

          {/* Bouton ajouter */}
          <Button
            title={locale === 'fr' ? 'Ajouter à mon programme' : 'Add to my program'}
            onPress={handleAdd}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: spacing['4xl'] },
  heroImage: { width: '100%', height: 240, backgroundColor: '#333' },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  content: { padding: spacing.lg, gap: spacing.lg },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 26, fontWeight: '900', flex: 1 },
  diffBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginLeft: spacing.sm,
  },
  diffText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  calCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  calValue: { fontSize: 20, fontWeight: '900' },
  calSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing.md },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, borderWidth: 1 },
  tagText: { fontSize: 12, fontWeight: '700' },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  benefitText: { fontSize: 14, fontWeight: '500' },
  desc: { fontSize: 14, lineHeight: 22 },
});
