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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { useTokens } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { useBiometric } from '@/hooks/useBiometric';
import { Input, Button, GlassCard, LixumLogo } from '@/components/ui';
import { spacing, borderRadius } from '@/theme/spacing';
import type { AuthStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const tk = useTokens();
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
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Branding */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoBadge, { backgroundColor: tk.logoBoxBg, borderColor: tk.logoBoxBorder }]}>
              <LixumLogo size={22} showSub={false} />
            </View>
            <Text style={[styles.tagline, { color: tk.accentSub }]}>
              {t.common.tagline}
            </Text>
          </View>

          {/* Form Card */}
          <GlassCard padding="lg">
            <Text style={[styles.formTitle, { color: tk.t1 }]}>
              {locale === 'fr' ? 'Connexion' : 'Sign In'}
            </Text>
            <Text style={[styles.formSubtitle, { color: tk.t3 }]}>
              {locale === 'fr' ? 'Accede a ton dashboard de vitalite' : 'Access your vitality dashboard'}
            </Text>

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
              placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
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

            {/* Separator */}
            <View style={styles.separator}>
              <View style={[styles.separatorLine, { backgroundColor: tk.cardBorder }]} />
              <Text style={[styles.separatorText, { color: tk.t4 }]}>
                {locale === 'fr' ? 'ou' : 'or'}
              </Text>
              <View style={[styles.separatorLine, { backgroundColor: tk.cardBorder }]} />
            </View>

            {/* Google */}
            <TouchableOpacity
              style={[styles.socialBtn, { borderColor: tk.cardBorder, backgroundColor: tk.rowBg }]}
              onPress={handleGoogleLogin}
              disabled={googleLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={[styles.socialBtnText, { color: tk.t1 }]}>
                {googleLoading ? '...' : t.auth.googleLogin}
              </Text>
            </TouchableOpacity>

            {biometricEnabled && (
              <TouchableOpacity
                style={[styles.socialBtn, { borderColor: tk.accent + '33', backgroundColor: tk.rowBg, marginTop: spacing.sm }]}
                onPress={handleBiometricLogin}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 20 }}>{biometricType === 'face' ? '\u{1F510}' : '\u{1F446}'}</Text>
                <Text style={[styles.socialBtnText, { color: tk.accent }]}>
                  {t.auth.biometricLogin}
                </Text>
              </TouchableOpacity>
            )}

            {/* Switch to register — inside the card */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.switchAuth}
            >
              <Text style={[styles.switchText, { color: tk.t3 }]}>
                {t.auth.noAccount}{' '}
                <Text style={{ color: tk.accent, fontWeight: '700' }}>
                  {t.auth.register}
                </Text>
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: spacing.xl,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  separatorLine: { flex: 1, height: 1 },
  separatorText: {
    marginHorizontal: spacing.md,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
    marginRight: spacing.sm,
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  switchAuth: {
    marginTop: spacing['2xl'],
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
  },
});
