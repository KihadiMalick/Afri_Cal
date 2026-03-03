import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { Card } from '@/components/ui';
import { spacing, borderRadius } from '@/theme/spacing';

type Tab = 'general' | 'recommendations';

export function RecipesScreen() {
  const { theme } = useTheme();
  const { t, locale } = useLocale();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const accent = theme.accent;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: accent }]}>{'<'} {t.common.back}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t.recipes.title}</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'general' && { backgroundColor: accent },
          ]}
          onPress={() => setActiveTab('general')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'general' ? '#000' : theme.textSecondary },
            ]}
          >
            {t.recipes.general}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'recommendations' && { backgroundColor: accent },
          ]}
          onPress={() => setActiveTab('recommendations')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'recommendations' ? '#000' : theme.textSecondary },
            ]}
          >
            {t.recipes.recommendations}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {activeTab === 'general' ? (
          <Card style={styles.contentCard}>
            <Text style={{ fontSize: 40, textAlign: 'center' }}>{'🍲'}</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t.recipes.general}
            </Text>
            <Text style={[styles.placeholder, { color: theme.textSecondary }]}>
              {t.recipes.comingSoon}
            </Text>
          </Card>
        ) : (
          <Card style={styles.contentCard}>
            <Text style={{ fontSize: 40, textAlign: 'center' }}>{'🎯'}</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t.recipes.recommendations}
            </Text>
            <Text style={[styles.placeholder, { color: theme.textSecondary }]}>
              {t.recipes.comingSoon}
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  backBtn: { marginBottom: spacing.sm },
  backText: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabText: { fontSize: 14, fontWeight: '700' },

  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing['4xl'] },
  contentCard: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing['2xl'] },
  sectionTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  placeholder: { fontSize: 14, textAlign: 'center' },
});
