import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
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
import { useBiometric } from '@/hooks/useBiometric';
import { Input, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { AuthStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const { theme } = useTheme();
  const { t, locale } = useLocale();
  const { isEnabled: biometricEnabled, authenticate, biometricType } = useBiometric();
  const navigation = useNavigation<Nav>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);
    if (error) Alert.alert('Error', error.message);
  };

  const handleBiometricLogin = async () => {
    await authenticate(t.auth.biometricPrompt);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoBadge, { borderColor: colors.lixum.neon + '33' }]}>
              <Text style={styles.logoText}>
                <Text style={{ color: '#8b949e' }}>LI</Text>
                <Text style={{ color: colors.lixum.neon }}>X</Text>
                <Text style={{ color: '#8b949e' }}>UM</Text>
              </Text>
            </View>
            <Text style={[styles.subtitle, { color: colors.lixum.neon + '88' }]}>
              {t.common.tagline}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label={t.auth.email}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label={t.auth.password}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
            />

            <Button
              title={t.auth.login}
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
            />

            {/* Séparateur */}
            <View style={styles.separator}>
              <View style={[styles.separatorLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.separatorText, { color: theme.textSecondary }]}>
                {locale === 'fr' ? 'ou' : 'or'}
              </Text>
              <View style={[styles.separatorLine, { backgroundColor: theme.border }]} />
            </View>

            {/* Google */}
            <TouchableOpacity
              style={[styles.googleBtn, { borderColor: theme.border }]}
              onPress={handleGoogleLogin}
              disabled={googleLoading}
            >
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#4285F4' }}>G</Text>
              <Text style={[styles.googleBtnText, { color: theme.text }]}>
                {googleLoading ? '...' : t.auth.googleLogin}
              </Text>
            </TouchableOpacity>

            {biometricEnabled && (
              <TouchableOpacity
                style={[styles.biometricBtn, { borderColor: theme.accent + '44' }]}
                onPress={handleBiometricLogin}
              >
                <Text style={{ fontSize: 24 }}>{biometricType === 'face' ? '🔐' : '👆'}</Text>
                <Text style={[styles.biometricText, { color: theme.accent }]}>
                  {t.auth.biometricLogin}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.switchAuth}
            >
              <Text style={[styles.switchText, { color: theme.textSecondary }]}>
                {t.auth.noAccount}{' '}
                <Text style={{ color: theme.accent, fontWeight: '700' }}>
                  {t.auth.register}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['3xl'],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(0,255,157,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  form: {
    width: '100%',
  },
  switchAuth: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  separator: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  separatorLine: { flex: 1, height: 1 },
  separatorText: { marginHorizontal: spacing.md, fontSize: 13, fontWeight: '600' },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: 12,
  },
  googleBtnText: { fontSize: 15, fontWeight: '700' },
  switchText: {
    fontSize: 14,
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: 12,
  },
  biometricText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
