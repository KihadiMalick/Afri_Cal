import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { spacing, borderRadius } from '@/theme/spacing';

interface SportRecommendation {
  name: string;
  icon: string;
  duration: number; // minutes
  distance?: number; // km (for walking/running)
  caloriesPerMin: number;
}

interface CalorieOvershootAlertProps {
  visible: boolean;
  overshootKcal: number;
  onClose: () => void;
  onSelectActivity?: (activityName: string, duration: number) => void;
}

/**
 * Calculates sport recommendations to compensate for calorie overshoot.
 * Always returns: walking, running, and a best-fit intense sport.
 */
function getRecommendations(overshootKcal: number, locale: string): SportRecommendation[] {
  // Walking: ~4 kcal/min, ~5 km/h average speed
  const walkingMinutes = Math.ceil(overshootKcal / 4);
  const walkingKm = Math.round((walkingMinutes / 60) * 5 * 10) / 10;

  // Running: ~10 kcal/min, ~9 km/h average speed
  const runningMinutes = Math.ceil(overshootKcal / 10);
  const runningKm = Math.round((runningMinutes / 60) * 9 * 10) / 10;

  // Best-fit intense sport: HIIT at ~12 kcal/min
  const hiitMinutes = Math.ceil(overshootKcal / 12);

  return [
    {
      name: locale === 'fr' ? 'Marche' : 'Walking',
      icon: '🚶',
      duration: walkingMinutes,
      distance: walkingKm,
      caloriesPerMin: 4,
    },
    {
      name: locale === 'fr' ? 'Course à pied' : 'Running',
      icon: '🏃',
      duration: runningMinutes,
      distance: runningKm,
      caloriesPerMin: 10,
    },
    {
      name: 'HIIT',
      icon: '💪',
      duration: hiitMinutes,
      caloriesPerMin: 12,
    },
  ];
}

export function CalorieOvershootAlert({
  visible,
  overshootKcal,
  onClose,
  onSelectActivity,
}: CalorieOvershootAlertProps) {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const accent = theme.accent;

  if (overshootKcal <= 0) return null;

  const recommendations = getRecommendations(overshootKcal, locale);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Warning icon */}
          <View style={styles.warningIcon}>
            <Text style={{ fontSize: 42 }}>{'⚠️'}</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: '#ef4444' }]}>
            {locale === 'fr'
              ? 'Objectif calorique dépassé !'
              : 'Calorie goal exceeded!'}
          </Text>

          {/* Overshoot amount */}
          <Text style={[styles.overshootText, { color: theme.text }]}>
            {locale === 'fr'
              ? `Tu as dépassé ton objectif de ${overshootKcal} calories aujourd'hui !`
              : `You exceeded your goal by ${overshootKcal} calories today!`}
          </Text>

          {/* Recommendations section */}
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            {locale === 'fr'
              ? 'Activités recommandées pour compenser'
              : 'Recommended activities to compensate'}
          </Text>

          <ScrollView style={styles.recList} showsVerticalScrollIndicator={false}>
            {recommendations.map((rec, i) => (
              <TouchableOpacity
                key={rec.name}
                style={[
                  styles.recCard,
                  {
                    backgroundColor: theme.background,
                    borderColor: i === 2 ? accent + '66' : theme.border,
                    borderWidth: i === 2 ? 2 : 1,
                  },
                ]}
                onPress={() => onSelectActivity?.(rec.name, rec.duration)}
                activeOpacity={0.7}
              >
                <Text style={styles.recIcon}>{rec.icon}</Text>
                <View style={styles.recInfo}>
                  <Text style={[styles.recName, { color: theme.text }]}>{rec.name}</Text>
                  <Text style={[styles.recDetails, { color: theme.textSecondary }]}>
                    {rec.duration} min
                    {rec.distance ? ` · ${rec.distance} km` : ''}
                    {' · '}{overshootKcal} kcal
                  </Text>
                </View>
                {i === 2 && (
                  <View style={[styles.bestBadge, { backgroundColor: accent + '22', borderColor: accent + '66' }]}>
                    <Text style={[styles.bestText, { color: accent }]}>
                      {locale === 'fr' ? 'OPTIMAL' : 'BEST'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Close button */}
          <TouchableOpacity
            style={[styles.closeBtn, { borderColor: theme.border }]}
            onPress={onClose}
          >
            <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>
              {locale === 'fr' ? 'Fermer' : 'Close'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modal: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    maxHeight: '80%',
  },
  warningIcon: { marginBottom: spacing.sm },
  title: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  overshootText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  recList: { width: '100%', marginBottom: spacing.lg },
  recCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  recIcon: { fontSize: 28, marginRight: spacing.md },
  recInfo: { flex: 1 },
  recName: { fontSize: 15, fontWeight: '700' },
  recDetails: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  bestBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  bestText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  closeBtn: {
    width: '100%',
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  closeBtnText: { fontSize: 15, fontWeight: '600' },
});
