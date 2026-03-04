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
import { useTokens } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { GlassCard } from '@/components/ui';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { supabase } from '@/lib/supabase';
import { useBiometric } from '@/hooks/useBiometric';
import { spacing, borderRadius } from '@/theme/spacing';
import type { UserProfile, RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const tk = useTokens();
  const { t, locale, setLocale } = useLocale();
  const navigation = useNavigation<Nav>();

  const [profile, setProfile] = useState<any>(null);
  const [lixumId, setLixumId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { isAvailable: biometricAvailable, isEnabled: biometricEnabled, biometricType, toggleBiometric } = useBiometric();

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data } = await supabase.from('users_profile').select('*').eq('user_id', user.id).single();
      if (data) {
        setProfile(data as UserProfile);
        setLixumId((data as any).lixum_id || '');
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      t.auth.logout,
      locale === 'fr' ? 'Voulez-vous vous d\u00e9connecter ?' : 'Do you want to log out?',
      [
        { text: t.common.cancel, style: 'cancel' },
        { text: t.auth.logout, style: 'destructive', onPress: signOut },
      ],
    );
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || '';

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  const statRows = profile ? [
    { label: t.dashboard.target, value: `${profile.daily_calorie_target} kcal`, color: tk.amber },
    { label: t.dashboard.bmr, value: `${Math.round(profile.bmr)} kcal`, color: tk.t1 },
    { label: t.dashboard.tdee, value: `${Math.round(profile.tdee)} kcal`, color: tk.t1 },
    { label: t.onboarding.weight, value: `${profile.weight} kg`, color: tk.accent },
    { label: t.onboarding.height, value: `${profile.height} cm`, color: tk.t1 },
  ] : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: tk.t1 }]}>{t.profile.title}</Text>
          <Text style={[styles.subtitle, { color: tk.accentSub }]}>
            {locale === 'fr' ? 'Votre espace personnel' : 'Your personal space'}
          </Text>
        </View>

        {/* ── Avatar Card ── */}
        <GlassCard style={styles.avatarCard}>
          {/* Avatar circle with glow */}
          <View style={styles.avatarGlowWrap}>
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: 'rgba(0,255,157,0.06)',
                  borderColor: 'rgba(0,255,157,0.25)',
                },
              ]}
            >
              <Text style={styles.avatarEmoji}>{'\u{1F464}'}</Text>
            </View>
          </View>

          {/* Display name */}
          <Text style={[styles.displayName, { color: tk.t1 }]}>{displayName}</Text>

          {/* LXM ID badge */}
          {lixumId ? (
            <View style={[styles.lixumIdBadge, { backgroundColor: tk.accent + '14', borderColor: tk.accent + '44' }]}>
              <Text style={[styles.lixumIdText, { color: tk.accent }]}>{lixumId}</Text>
            </View>
          ) : null}

          {/* Email */}
          <Text style={[styles.email, { color: tk.t3 }]}>{user?.email}</Text>

          {/* Premium badge */}
          {profile?.is_premium && (
            <View style={[styles.premiumBadge, { backgroundColor: tk.amber + '14', borderColor: tk.amber + '44' }]}>
              <Text style={[styles.premiumIcon]}>{'\u2B50'}</Text>
              <Text style={[styles.premiumText, { color: tk.amber }]}>PREMIUM</Text>
            </View>
          )}
        </GlassCard>

        {/* ── Biometric Data Card ── */}
        {profile && (
          <GlassCard>
            <Text style={[styles.sectionLabel, { color: tk.t3 }]}>
              {locale === 'fr' ? 'Donn\u00e9es biom\u00e9triques' : 'Biometric data'}
            </Text>
            {statRows.map((row, i) => (
              <View
                key={row.label}
                style={[
                  styles.statRow,
                  i < statRows.length - 1 && styles.statRowBorder,
                ]}
              >
                <Text style={[styles.statLabel, { color: tk.t3 }]}>{row.label}</Text>
                <Text style={[styles.statValue, { color: row.color }]}>{row.value}</Text>
              </View>
            ))}
          </GlassCard>
        )}

        {/* ── Settings Card ── */}
        <GlassCard style={styles.settingsCard}>
          <Text style={[styles.sectionLabel, { color: tk.t3 }]}>
            {t.profile.settings}
          </Text>

          {/* Language */}
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: tk.t3 }]}>{t.profile.language}</Text>
            <TouchableOpacity
              style={[styles.localeBadge, { backgroundColor: tk.accent + '14', borderColor: tk.accent + '44' }]}
              onPress={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              activeOpacity={0.7}
            >
              <Text style={[styles.localeBadgeText, { color: tk.accent }]}>
                {locale.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.settingDivider} />


          {/* Biometric Login */}
          {biometricAvailable && (
            <>
              <View style={styles.settingDivider} />
              <View style={styles.settingRow}>
                <View style={styles.settingLabelGroup}>
                  <Text style={[styles.settingLabel, { color: tk.t3 }]}>{t.profile.biometric}</Text>
                  <Text style={[styles.settingSublabel, { color: tk.t4 }]}>
                    {biometricType === 'face'
                      ? 'Face ID'
                      : (locale === 'fr' ? 'Empreinte digitale' : 'Fingerprint')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.biometricToggle,
                    {
                      backgroundColor: biometricEnabled ? tk.accent + '18' : tk.cardBg,
                      borderColor: biometricEnabled ? tk.accent + '55' : tk.cardBorder,
                    },
                  ]}
                  onPress={toggleBiometric}
                  activeOpacity={0.7}
                >
                  <Text style={styles.biometricIcon}>
                    {biometricEnabled ? '\u{1F513}' : '\u{1F512}'}
                  </Text>
                  <Text
                    style={[
                      styles.themeBadgeText,
                      { color: biometricEnabled ? tk.accent : tk.t3 },
                    ]}
                  >
                    {biometricEnabled ? t.profile.biometricEnabled : t.profile.biometricDisabled}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Spacer before buttons */}
          <View style={styles.buttonSpacer} />

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: tk.accent }]}
            onPress={() => navigation.navigate('Onboarding')}
            activeOpacity={0.8}
          >
            <Text style={styles.editBtnText}>{t.profile.editProfile}</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: tk.red + '12', borderColor: tk.red + '30' }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={[styles.logoutBtnText, { color: tk.red }]}>{t.auth.logout}</Text>
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
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

  /* -- Avatar Card -- */
  avatarCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['2xl'],
  },
  avatarGlowWrap: {
    shadowColor: '#00ff9d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: spacing.xs,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 36,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  lixumIdBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  lixumIdText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: 'Courier New',
    fontVariant: ['tabular-nums'],
  },
  email: {
    fontSize: 14,
    fontWeight: '500',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  premiumIcon: {
    fontSize: 12,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },

  /* -- Section Label -- */
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },

  /* -- Stat Rows -- */
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Courier New',
    fontVariant: ['tabular-nums'],
  },

  /* -- Settings Card -- */
  settingsCard: {
    gap: 0,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingLabelGroup: {
    gap: 2,
  },
  settingSublabel: {
    fontSize: 11,
    fontWeight: '500',
  },

  /* -- Locale Badge -- */
  localeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  localeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },

  /* -- Theme Badge -- */
  themeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  themeIcon: {
    fontSize: 14,
  },
  themeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* -- Biometric Toggle -- */
  biometricToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  biometricIcon: {
    fontSize: 14,
  },

  /* -- Buttons -- */
  buttonSpacer: {
    height: spacing.lg,
  },
  editBtn: {
    width: '100%',
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  logoutBtn: {
    width: '100%',
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
