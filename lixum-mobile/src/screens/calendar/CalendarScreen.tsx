import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { Card } from '@/components/ui';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { supabase } from '@/lib/supabase';
import { spacing, borderRadius } from '@/theme/spacing';
import type { DailySummary } from '@/types';

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const STATUS_COLORS: Record<string, string> = {
  green: '#22c55e',
  gold: '#f59e0b',
  red: '#ef4444',
};

export function CalendarScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, locale } = useLocale();

  const [summaries, setSummaries] = useState<Record<string, DailySummary>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const accent = theme.accent;
  const todayStr = new Date().toISOString().split('T')[0];
  const dayNames = locale === 'fr' ? DAYS_FR : DAYS_EN;
  const monthNames = locale === 'fr' ? MONTHS_FR : MONTHS_EN;

  const loadData = useCallback(async () => {
    if (!user) return;

    const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-31`;

    const { data } = await (supabase as any)
      .from('daily_summary')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate);

    const map: Record<string, DailySummary> = {};
    (data ?? []).forEach((d: DailySummary) => { map[d.date] = d; });
    setSummaries(map);
    setLoading(false);
  }, [user, currentMonth, currentYear]);

  useEffect(() => { loadData(); }, [loadData]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday-based

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const selected = selectedDate ? summaries[selectedDate] : null;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{t.calendar.title}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {locale === 'fr' ? 'Historique nutritionnel' : 'Nutritional history'}
          </Text>
        </View>

        {/* Month Navigation */}
        <Card>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <Text style={[styles.navBtnText, { color: accent }]}>◀</Text>
            </TouchableOpacity>
            <Text style={[styles.monthLabel, { color: theme.text }]}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <Text style={[styles.navBtnText, { color: accent }]}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* Day headers */}
          <View style={styles.dayHeaderRow}>
            {dayNames.map(d => (
              <Text key={d} style={[styles.dayHeader, { color: theme.textSecondary }]}>{d}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.grid}>
            {cells.map((day, i) => {
              if (day === null) {
                return <View key={`empty-${i}`} style={styles.cell} />;
              }
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const sum = summaries[dateStr];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    styles.cell,
                    isToday && { borderWidth: 2, borderColor: accent, borderRadius: borderRadius.sm },
                    isSelected && { backgroundColor: accent + '22' },
                  ]}
                  onPress={() => setSelectedDate(dateStr)}
                >
                  <Text style={[styles.dayNum, { color: theme.text }]}>{day}</Text>
                  {sum && (
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[sum.status] || '#888' }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Selected Day Detail */}
        {selectedDate && (
          <Card style={[styles.detailCard, { borderLeftColor: accent, borderLeftWidth: 4 }]}>
            <Text style={[styles.detailDate, { color: theme.text }]}>{selectedDate}</Text>
            {selected ? (
              <View style={styles.detailStats}>
                <DetailStat label={locale === 'fr' ? 'Consommées' : 'Consumed'} value={selected.total_calories_consumed} color="#f59e0b" />
                <DetailStat label={locale === 'fr' ? 'Brûlées' : 'Burned'} value={selected.total_calories_burned} color="#60a5fa" />
                <DetailStat label={locale === 'fr' ? 'Objectif' : 'Target'} value={selected.calorie_target} color={accent} />
              </View>
            ) : (
              <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
                {locale === 'fr' ? 'Pas de données' : 'No data'}
              </Text>
            )}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailStat({ label, value, color }: { label: string; value: number; color: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.detailStat}>
      <Text style={[styles.detailValue, { color }]}>{value}</Text>
      <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing['4xl'] },
  header: { marginBottom: spacing.xs },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },

  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  navBtn: { padding: spacing.sm },
  navBtnText: { fontSize: 18, fontWeight: '700' },
  monthLabel: { fontSize: 18, fontWeight: '800' },

  dayHeaderRow: { flexDirection: 'row', marginBottom: spacing.sm },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.285%', alignItems: 'center', paddingVertical: spacing.sm, gap: 3 },
  dayNum: { fontSize: 14, fontWeight: '600' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },

  detailCard: { gap: spacing.md },
  detailDate: { fontSize: 16, fontWeight: '700' },
  detailStats: { flexDirection: 'row', justifyContent: 'space-around' },
  detailStat: { alignItems: 'center', gap: 2 },
  detailValue: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  detailLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  noDataText: { fontSize: 13, fontStyle: 'italic' },
});
