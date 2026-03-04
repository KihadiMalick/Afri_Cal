import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTokens } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { GlassCard, SkeletonLoader } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { spacing, borderRadius } from '@/theme/spacing';
import type { SportActivity, ActivitiesStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<ActivitiesStackParamList>;

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#22c55e',
  medium: '#f59e0b',
  intense: '#ef4444',
};

const DIFFICULTY_LABELS_FR: Record<string, string> = {
  easy: 'Facile',
  medium: 'Moyen',
  intense: 'Intense',
};

export function ActivitiesScreen() {
  const tk = useTokens();
  const { locale } = useLocale();
  const navigation = useNavigation<Nav>();

  const [sports, setSports] = useState<SportActivity[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSports = useCallback(async () => {
    const { data } = await (supabase as any)
      .from('sport_catalog')
      .select('*')
      .order('name', { ascending: true });
    setSports((data as SportActivity[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadSports(); }, [loadSports]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSports();
    setRefreshing(false);
  };

  // Filtrage local en temps réel
  const filtered = sports.filter((s) => {
    const q = search.toLowerCase();
    const name = locale === 'fr' ? s.name_fr : s.name;
    return name.toLowerCase().includes(q);
  });

  const renderSportCard = ({ item }: { item: SportActivity }) => {
    const name = locale === 'fr' ? item.name_fr : item.name;
    const diffLabel = locale === 'fr' ? DIFFICULTY_LABELS_FR[item.difficulty] : item.difficulty;
    const diffColor = DIFFICULTY_COLORS[item.difficulty] ?? tk.t3;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ActivityDetail', { sport: item })}
      >
        <GlassCard style={styles.card}>
          {/* Sport Image with overlay gradient */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            {/* Bottom fade overlay */}
            <View
              style={[
                styles.imageFadeBottom,
                { backgroundColor: 'rgba(2,12,7,0.65)' },
              ]}
            />
            {/* Difficulty badge floating on image */}
            <View
              style={[
                styles.diffBadgeFloat,
                {
                  backgroundColor: diffColor + '20',
                  borderColor: diffColor + '60',
                },
              ]}
            >
              <View style={[styles.diffDot, { backgroundColor: diffColor }]} />
              <Text style={[styles.diffText, { color: diffColor }]}>
                {diffLabel}
              </Text>
            </View>
          </View>

          {/* Content area */}
          <View style={styles.cardContent}>
            <View style={styles.cardRow}>
              {/* Sport name */}
              <Text style={[styles.cardName, { color: tk.t1 }]} numberOfLines={1}>
                {name}
              </Text>
            </View>

            {/* Calories row */}
            <View style={styles.caloriesRow}>
              <View style={[styles.calorieDot, { backgroundColor: tk.accent }]} />
              <Text style={[styles.cardCalories, { color: tk.accent }]}>
                {item.calories_per_5min} kcal / 5 min
              </Text>
            </View>
          </View>

          {/* Subtle accent line at bottom */}
          <View style={[styles.accentLine, { backgroundColor: tk.accent + '18' }]} />
        </GlassCard>
      </TouchableOpacity>
    );
  };

  const renderSkeletonCards = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <GlassCard key={i} style={styles.skeletonCard}>
          <SkeletonLoader height={140} radius={0} />
          <View style={styles.skeletonContent}>
            <SkeletonLoader height={18} width="65%" radius={8} />
            <View style={styles.skeletonRow}>
              <SkeletonLoader height={12} width="30%" radius={6} />
              <SkeletonLoader height={12} width="35%" radius={6} />
            </View>
          </View>
        </GlassCard>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: tk.t1 }]}>
          {locale === 'fr' ? 'Activit\u00e9s sportives' : 'Sports activities'}
        </Text>
        <Text style={[styles.subtitle, { color: tk.accentSub }]}>
          {locale === 'fr' ? 'Catalogue d\u2019exercices' : 'Exercise catalog'}
        </Text>
      </View>

      {/* Search input */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchWrapper,
            {
              backgroundColor: tk.inputBg,
              borderColor: tk.cardBorder,
            },
          ]}
        >
          <Text style={[styles.searchIcon, { color: tk.t3 }]}>{'\u2315'}</Text>
          <TextInput
            style={[styles.searchInput, { color: tk.t1 }]}
            placeholder={locale === 'fr' ? 'Rechercher un sport...' : 'Search a sport...'}
            placeholderTextColor={tk.t3}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.clearIcon, { color: tk.t3 }]}>{'\u2715'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sport list */}
      {loading ? (
        renderSkeletonCards()
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderSportCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={tk.accent}
              colors={[tk.accent]}
            />
          }
          ListEmptyComponent={
            <GlassCard style={styles.emptyCard}>
              <View style={[styles.emptyIconCircle, { backgroundColor: tk.accent + '0A', borderColor: tk.accent + '20' }]}>
                <Text style={[styles.emptyIcon, { color: tk.t4 }]}>{'\u26A0'}</Text>
              </View>
              <Text style={[styles.emptyText, { color: tk.t2 }]}>
                {locale === 'fr' ? 'Aucune activit\u00e9 trouv\u00e9e' : 'No activity found'}
              </Text>
              <Text style={[styles.emptySubtext, { color: tk.t4 }]}>
                {locale === 'fr' ? 'Essayez un autre terme de recherche' : 'Try a different search term'}
              </Text>
            </GlassCard>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  /* -- Header -- */
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
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

  /* -- Search -- */
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* -- List -- */
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing['4xl'],
  },

  /* -- Card -- */
  card: {
    overflow: 'hidden',
    padding: 0,
    borderRadius: borderRadius.card,
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  imageFadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  diffBadgeFloat: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  diffDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  diffText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cardContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    letterSpacing: -0.2,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calorieDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  cardCalories: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Courier New',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.3,
  },
  accentLine: {
    height: 2,
    width: '100%',
  },

  /* -- Skeleton loading -- */
  skeletonContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  skeletonCard: {
    overflow: 'hidden',
    padding: 0,
    borderRadius: borderRadius.card,
  },
  skeletonContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  /* -- Empty state -- */
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyIcon: {
    fontSize: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: 12,
    fontWeight: '500',
  },
});
