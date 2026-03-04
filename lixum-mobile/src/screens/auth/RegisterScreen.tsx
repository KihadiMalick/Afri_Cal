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
import { Input, Button, GlassCard, LixumLogo } from '@/components/ui';
import { spacing } from '@/theme/spacing';
import type { AuthStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export function RegisterScreen() {
  const { signUp } = useAuth();
  const tk = useTokens();
  const { t, locale } = useLocale();
  const navigation = useNavigation<Nav>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) return;
    if (password !== confirmPassword) {
      Alert.alert(
        locale === 'fr' ? 'Erreur' : 'Error',
        locale === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match',
      );
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    }
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
          </View>

          {/* Form Card */}
          <GlassCard padding="lg">
            <Text style={[styles.formTitle, { color: tk.t1 }]}>
              {locale === 'fr' ? 'Creer un compte' : 'Create Account'}
            </Text>
            <Text style={[styles.formSubtitle, { color: tk.t3 }]}>
              {locale === 'fr'
                ? 'Commence ton suivi nutritionnel'
                : 'Start your nutrition tracking journey'}
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
              autoComplete="password-new"
            />

            <Input
              label={t.auth.confirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
              secureTextEntry
            />

            <Button
              title={t.auth.register}
              onPress={handleRegister}
              loading={loading}
              fullWidth
              size="lg"
            />
          </GlassCard>

          {/* Switch to login */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.switchAuth}
          >
            <Text style={[styles.switchText, { color: tk.t3 }]}>
              {t.auth.hasAccount}{' '}
              <Text style={{ color: tk.accent, fontWeight: '700' }}>
                {t.auth.login}
              </Text>
            </Text>
          </TouchableOpacity>
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
  switchAuth: {
    marginTop: spacing['2xl'],
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
  },
});
