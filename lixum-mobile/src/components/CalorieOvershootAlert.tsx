import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTokens } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { spacing, borderRadius } from '@/theme/spacing';

interface SportRecommendation {
  name: string;
  icon: string;
  duration: number;
  distance?: number;
  caloriesPerMin: number;
}

interface CalorieOvershootAlertProps {
  visible: boolean;
  overshootKcal: number;
  onClose: () => void;
  onSelectActivity?: (activityName: string, duration: number) => void;
}

function getRecommendations(overshootKcal: number, locale: string): SportRecommendation[] {
  const walkingMinutes = Math.ceil(overshootKcal / 4);
  const walkingKm = Math.round((walkingMinutes / 60) * 5 * 10) / 10;
  const runningMinutes = Math.ceil(overshootKcal / 10);
  const runningKm = Math.round((runningMinutes / 60) * 9 * 10) / 10;
  const hiitMinutes = Math.ceil(overshootKcal / 12);

  return [
    {
      name: locale === 'fr' ? 'Marche' : 'Walking',
      icon: '\u{1F6B6}',
      duration: walkingMinutes,
      distance: walkingKm,
      caloriesPerMin: 4,
    },
    {
      name: locale === 'fr' ? 'Course a pied' : 'Running',
      icon: '\u{1F3C3}',
      duration: runningMinutes,
      distance: runningKm,
      caloriesPerMin: 10,
    },
    {
      name: 'HIIT',
      icon: '\u{1F4AA}',
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
  const tk = useTokens();
  const { locale } = useLocale();

  if (overshootKcal <= 0) return null;

  const recommendations = getRecommendations(overshootKcal, locale);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: tk.cardBg, borderColor: tk.redBorder }]}>
          <View style={styles.warningIcon}>
            <Text style={{ fontSize: 42 }}>{'\u{26A0}\u{FE0F}'}</Text>
          </View>

          <Text style={[styles.title, { color: tk.red }]}>
            {locale === 'fr'
              ? 'Objectif calorique depasse !'
              : 'Calorie goal exceeded!'}
          </Text>

          <Text style={[styles.overshootText, { color: tk.t1 }]}>
            {locale === 'fr'
              ? `Tu as depasse ton objectif de ${overshootKcal} calories aujourd'hui !`
              : `You exceeded your goal by ${overshootKcal} calories today!`}
          </Text>

          <Text style={[styles.sectionLabel, { color: tk.t3 }]}>
            {locale === 'fr'
              ? 'Activites recommandees pour compenser'
              : 'Recommended activities to compensate'}
          </Text>

          <ScrollView style={styles.recList} showsVerticalScrollIndicator={false}>
            {recommendations.map((rec, i) => (
              <TouchableOpacity
                key={rec.name}
                style={[
                  styles.recCard,
                  {
                    backgroundColor: tk.rowBg,
                    borderColor: i === 2 ? tk.accent + '66' : tk.cardBorder,
                    borderWidth: i === 2 ? 2 : 1,
                  },
                ]}
                onPress={() => onSelectActivity?.(rec.name, rec.duration)}
                activeOpacity={0.7}
              >
                <Text style={styles.recIcon}>{rec.icon}</Text>
                <View style={styles.recInfo}>
                  <Text style={[styles.recName, { color: tk.t1 }]}>{rec.name}</Text>
                  <Text style={[styles.recDetails, { color: tk.t3 }]}>
                    {rec.duration} min
                    {rec.distance ? ` \u{00B7} ${rec.distance} km` : ''}
                    {' \u{00B7} '}{overshootKcal} kcal
                  </Text>
                </View>
                {i === 2 && (
                  <View style={[styles.bestBadge, { backgroundColor: tk.accent + '22', borderColor: tk.accent + '66' }]}>
                    <Text style={[styles.bestText, { color: tk.accent }]}>
                      {locale === 'fr' ? 'OPTIMAL' : 'BEST'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.closeBtn, { borderColor: tk.cardBorder }]}
            onPress={onClose}
          >
            <Text style={[styles.closeBtnText, { color: tk.t3 }]}>
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
    borderRadius: 28,
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
    borderRadius: 16,
    marginBottom: spacing.sm,
  },
  recIcon: { fontSize: 28, marginRight: spacing.md },
  recInfo: { flex: 1 },
  recName: { fontSize: 15, fontWeight: '700' },
  recDetails: { fontSize: 12, fontWeight: '500', marginTop: 2, fontFamily: 'Courier New' },
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
