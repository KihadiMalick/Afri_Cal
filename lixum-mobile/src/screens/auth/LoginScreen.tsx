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
import { Input, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { AuthStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const { signIn } = useAuth();
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<Nav>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    }
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
  switchText: {
    fontSize: 14,
  },
});
