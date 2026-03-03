import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { Card, Button } from '@/components/ui';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { supabase } from '@/lib/supabase';
import { useBiometric } from '@/hooks/useBiometric';
import { spacing, borderRadius } from '@/theme/spacing';
import type { UserProfile, RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { theme, mode, toggleTheme } = useTheme();
  const { t, locale, setLocale } = useLocale();
  const navigation = useNavigation<Nav>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAvailable: biometricAvailable, isEnabled: biometricEnabled, biometricType, toggleBiometric } = useBiometric();

  const accent = theme.accent;

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data } = await supabase.from('users_profile').select('*').eq('user_id', user.id).single();
      if (data) setProfile(data as UserProfile);
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      t.auth.logout,
      locale === 'fr' ? 'Voulez-vous vous déconnecter ?' : 'Do you want to log out?',
      [
        { text: t.common.cancel, style: 'cancel' },
        { text: t.auth.logout, style: 'destructive', onPress: signOut },
      ],
    );
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || '';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  const statRows = profile ? [
    { label: t.dashboard.target, value: `${profile.daily_calorie_target} kcal`, color: '#f59e0b' },
    { label: t.dashboard.bmr, value: `${Math.round(profile.bmr)} kcal`, color: theme.text },
    { label: t.dashboard.tdee, value: `${Math.round(profile.tdee)} kcal`, color: theme.text },
    { label: t.onboarding.weight, value: `${profile.weight} kg`, color: accent },
    { label: t.onboarding.height, value: `${profile.height} cm`, color: theme.text },
  ] : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{t.profile.title}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {locale === 'fr' ? 'Votre espace personnel' : 'Your personal space'}
          </Text>
        </View>

        {/* Avatar Card */}
        <Card style={styles.avatarCard}>
          <View style={[styles.avatarCircle, { borderColor: accent + '44' }]}>
            <Text style={{ fontSize: 40 }}>👤</Text>
          </View>
          <Text style={[styles.displayName, { color: theme.text }]}>{displayName}</Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>
          {profile?.is_premium && (
            <View style={[styles.premiumBadge, { borderColor: '#f59e0b44' }]}>
              <Text style={styles.premiumText}>PREMIUM</Text>
            </View>
          )}
        </Card>

        {/* Stats Card */}
        {profile && (
          <Card>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              {locale === 'fr' ? 'Données biométriques' : 'Biometric data'}
            </Text>
            {statRows.map((row, i) => (
              <View
                key={row.label}
                style={[
                  styles.statRow,
                  i < statRows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
                ]}
              >
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{row.label}</Text>
                <Text style={[styles.statValue, { color: row.color }]}>{row.value}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Settings Card */}
        <Card style={styles.settingsCard}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            {t.profile.settings}
          </Text>

          {/* Language */}
          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>{t.profile.language}</Text>
            <TouchableOpacity
              style={[styles.langBadge, { borderColor: accent + '44', backgroundColor: accent + '14' }]}
              onPress={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
            >
              <Text style={[styles.langBadgeText, { color: accent }]}>
                {locale.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Theme */}
          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>{t.profile.theme}</Text>
            <TouchableOpacity
              style={[styles.themeBadge, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
              onPress={toggleTheme}
            >
              <Text style={{ fontSize: 14 }}>{mode === 'dark' ? '🌙' : '☀️'}</Text>
              <Text style={[styles.themeBadgeText, { color: theme.text }]}>
                {mode === 'dark' ? t.profile.darkMode : t.profile.lightMode}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Biometric Login */}
          {biometricAvailable && (
            <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <View>
                <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>{t.profile.biometric}</Text>
                <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                  {biometricType === 'face' ? (locale === 'fr' ? 'Face ID' : 'Face ID') : (locale === 'fr' ? 'Empreinte digitale' : 'Fingerprint')}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.biometricToggle,
                  {
                    backgroundColor: biometricEnabled ? accent + '22' : theme.surfaceSecondary,
                    borderColor: biometricEnabled ? accent + '66' : theme.border,
                  },
                ]}
                onPress={toggleBiometric}
              >
                <Text style={{ fontSize: 14 }}>{biometricEnabled ? '🔓' : '🔒'}</Text>
                <Text style={[styles.themeBadgeText, { color: biometricEnabled ? accent : theme.textSecondary }]}>
                  {biometricEnabled ? t.profile.biometricEnabled : t.profile.biometricDisabled}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Edit Profile */}
          <Button
            title={t.profile.editProfile}
            onPress={() => navigation.navigate('Onboarding')}
            variant="secondary"
            fullWidth
            style={{ marginTop: spacing.md }}
          />

          {/* Logout */}
          <Button
            title={t.auth.logout}
            onPress={handleLogout}
            variant="danger"
            fullWidth
            style={{ marginTop: spacing.sm }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing['4xl'] },
  header: { marginBottom: spacing.xs },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },

  avatarCard: { alignItems: 'center', gap: spacing.sm },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,255,157,0.06)',
  },
  displayName: { fontSize: 20, fontWeight: '900' },
  email: { fontSize: 13, fontWeight: '500' },
  premiumBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    backgroundColor: 'rgba(245,158,11,0.12)',
    marginTop: spacing.xs,
  },
  premiumText: { color: '#f59e0b', fontSize: 11, fontWeight: '800', letterSpacing: 2 },

  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing.md },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  statLabel: { fontSize: 14, fontWeight: '500' },
  statValue: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },

  settingsCard: { gap: 0 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  settingLabel: { fontSize: 14, fontWeight: '500' },
  langBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, borderWidth: 1 },
  langBadgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  themeBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, borderWidth: 1 },
  themeBadgeText: { fontSize: 12, fontWeight: '700' },
  biometricToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, borderWidth: 1 },
});
