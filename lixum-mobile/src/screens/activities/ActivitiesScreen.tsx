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
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { supabase } from '@/lib/supabase';
import { spacing, borderRadius } from '@/theme/spacing';
import type { SportActivity, ActivitiesStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<ActivitiesStackParamList>;

const DIFFICULTY_COLORS = {
  easy: '#22c55e',
  medium: '#f59e0b',
  intense: '#ef4444',
};

const DIFFICULTY_LABELS_FR = {
  easy: 'Facile',
  medium: 'Moyen',
  intense: 'Intense',
};

export function ActivitiesScreen() {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const navigation = useNavigation<Nav>();

  const [sports, setSports] = useState<SportActivity[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const accent = theme.accent;

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
    const diffColor = DIFFICULTY_COLORS[item.difficulty];

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => navigation.navigate('ActivityDetail', { sport: item })}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.image_url }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={1}>
              {name}
            </Text>
            <View style={[styles.diffBadge, { backgroundColor: diffColor + '22', borderColor: diffColor + '66' }]}>
              <Text style={[styles.diffText, { color: diffColor }]}>{diffLabel}</Text>
            </View>
          </View>
          <Text style={[styles.cardCalories, { color: accent }]}>
            {item.calories_per_5min} kcal / 5 min
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {locale === 'fr' ? 'Activités sportives' : 'Sports activities'}
        </Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder={locale === 'fr' ? 'Rechercher un sport...' : 'Search a sport...'}
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      {/* Liste des sports */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderSportCard}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {loading
              ? (locale === 'fr' ? 'Chargement...' : 'Loading...')
              : (locale === 'fr' ? 'Aucune activité trouvée' : 'No activity found')}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  searchContainer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  searchInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
  },
  list: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing['4xl'] },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#333',
  },
  cardContent: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: { fontSize: 16, fontWeight: '800', flex: 1 },
  diffBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginLeft: spacing.sm,
  },
  diffText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardCalories: { fontSize: 13, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: spacing['3xl'] },
});
