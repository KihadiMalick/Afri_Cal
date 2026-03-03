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
import { useTokens } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { GlassCard } from '@/components/ui';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { supabase } from '@/lib/supabase';
import { spacing, borderRadius } from '@/theme/spacing';
import type { DailySummary } from '@/types';

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTHS_FR = ['Janvier','F\u00e9vrier','Mars','Avril','Mai','Juin','Juillet','Ao\u00fbt','Septembre','Octobre','Novembre','D\u00e9cembre'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const STATUS_COLORS: Record<string, string> = {
  green: '#22c55e',
  gold: '#f59e0b',
  red: '#ef4444',
};

export function CalendarScreen() {
  const { user } = useAuth();
  const tk = useTokens();
  const { t, locale } = useLocale();

  const [summaries, setSummaries] = useState<Record<string, DailySummary>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

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
      <SafeAreaView style={styles.container} edges={['top']}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: tk.t1 }]}>{t.calendar.title}</Text>
          <Text style={[styles.subtitle, { color: tk.accentSub }]}>
            {locale === 'fr' ? 'Historique nutritionnel' : 'Nutritional history'}
          </Text>
        </View>

        {/* Calendar Card */}
        <GlassCard style={styles.calendarCard}>
          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity
              onPress={prevMonth}
              style={[styles.navBtn, { backgroundColor: tk.cardBg, borderColor: tk.cardBorder }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.navArrow, { color: tk.accent }]}>{'\u25C0'}</Text>
            </TouchableOpacity>

            <View style={styles.monthLabelContainer}>
              <Text style={[styles.monthLabel, { color: tk.t1 }]}>
                {monthNames[currentMonth]}
              </Text>
              <Text style={[styles.yearLabel, { color: tk.t3 }]}>
                {currentYear}
              </Text>
            </View>

            <TouchableOpacity
              onPress={nextMonth}
              style={[styles.navBtn, { backgroundColor: tk.cardBg, borderColor: tk.cardBorder }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.navArrow, { color: tk.accent }]}>{'\u25B6'}</Text>
            </TouchableOpacity>
          </View>

          {/* Separator */}
          <View style={[styles.separator, { backgroundColor: tk.cardBorder }]} />

          {/* Day headers */}
          <View style={styles.dayHeaderRow}>
            {dayNames.map(d => (
              <Text key={d} style={[styles.dayHeader, { color: tk.t3 }]}>{d}</Text>
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
                    isToday && [styles.todayCell, { borderColor: tk.accent }],
                    isSelected && { backgroundColor: tk.accent + '22', borderRadius: 10 },
                  ]}
                  onPress={() => setSelectedDate(dateStr)}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.dayNum,
                      { color: isToday ? tk.accent : sum ? tk.t1 : tk.t2 },
                      isToday && { fontWeight: '800' },
                    ]}
                  >
                    {day}
                  </Text>
                  {sum && (
                    <View style={styles.dotRow}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: STATUS_COLORS[sum.status] || tk.t4 },
                        ]}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* Selected Day Detail */}
        {selectedDate && (
          <GlassCard style={styles.detailCard}>
            {/* Accent left border indicator */}
            <View style={[styles.detailAccentBorder, { backgroundColor: tk.accent }]} />

            <View style={styles.detailInner}>
              {/* Date header */}
              <View style={styles.detailHeader}>
                <Text style={[styles.detailDate, { color: tk.t1 }]}>{selectedDate}</Text>
                {selected && (
                  <View style={[styles.statusPill, { backgroundColor: (STATUS_COLORS[selected.status] || tk.t4) + '20', borderColor: (STATUS_COLORS[selected.status] || tk.t4) + '50' }]}>
                    <View style={[styles.statusPillDot, { backgroundColor: STATUS_COLORS[selected.status] || tk.t4 }]} />
                    <Text style={[styles.statusPillText, { color: STATUS_COLORS[selected.status] || tk.t4 }]}>
                      {selected.status}
                    </Text>
                  </View>
                )}
              </View>

              {selected ? (
                <View style={styles.detailStats}>
                  <DetailStat
                    label={locale === 'fr' ? 'Consomm\u00e9es' : 'Consumed'}
                    value={selected.total_calories_consumed}
                    color={tk.amber}
                  />
                  <View style={[styles.statDivider, { backgroundColor: tk.cardBorder }]} />
                  <DetailStat
                    label={locale === 'fr' ? 'Br\u00fbl\u00e9es' : 'Burned'}
                    value={selected.total_calories_burned}
                    color={tk.blue}
                  />
                  <View style={[styles.statDivider, { backgroundColor: tk.cardBorder }]} />
                  <DetailStat
                    label={locale === 'fr' ? 'Objectif' : 'Target'}
                    value={selected.calorie_target}
                    color={tk.accent}
                  />
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={[styles.noDataText, { color: tk.t4 }]}>
                    {locale === 'fr' ? 'Pas de donn\u00e9es pour ce jour' : 'No data for this day'}
                  </Text>
                </View>
              )}
            </View>
          </GlassCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailStat({ label, value, color }: { label: string; value: number; color: string }) {
  const tk = useTokens();
  return (
    <View style={styles.detailStat}>
      <Text style={[styles.detailValue, { color }]}>{value}</Text>
      <Text style={[styles.detailLabel, { color: tk.t3 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing['4xl'],
  },

  /* -- Header -- */
  header: {
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.4,
  },

  /* -- Calendar Card -- */
  calendarCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },

  /* -- Month Navigation -- */
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    fontSize: 14,
    fontWeight: '700',
  },
  monthLabelContainer: {
    alignItems: 'center',
    gap: 1,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  yearLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Courier New',
    fontVariant: ['tabular-nums'],
  },

  /* -- Separator -- */
  separator: {
    height: 1,
    marginBottom: spacing.md,
  },

  /* -- Day Headers -- */
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* -- Grid -- */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.285%',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    gap: 3,
  },
  todayCell: {
    borderWidth: 2,
    borderRadius: 10,
  },
  dayNum: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Courier New',
    fontVariant: ['tabular-nums'],
  },
  dotRow: {
    flexDirection: 'row',
    gap: 2,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },

  /* -- Detail Card -- */
  detailCard: {
    padding: 0,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  detailAccentBorder: {
    width: 4,
  },
  detailInner: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailDate: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Courier New',
    fontVariant: ['tabular-nums'],
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  statusPillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  detailStat: {
    alignItems: 'center',
    gap: 4,
  },
  detailValue: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Courier New',
    fontVariant: ['tabular-nums'],
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  noDataContainer: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});
