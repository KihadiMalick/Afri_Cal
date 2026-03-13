/**
 * LoginScreen — Design Test Preview (no auth, no Supabase)
 */
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
import { DARK, spacing, borderRadius } from '../theme';
import { Input, Button, GlassCard, LixumLogo } from '../ui';

const tk = DARK;

export function LoginScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Info', 'Remplis les champs email et mot de passe');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Test', 'Connexion simulee avec succes !');
      onNavigate?.('Dashboard');
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      Alert.alert('Test', 'Google login simule !');
    }, 1200);
  };

  const handleBiometric = () => {
    Alert.alert('Test', 'Authentification biometrique simulee !');
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
            <LixumLogo size={22} showSub={false} />
            <Text style={[styles.tagline, { color: tk.accentSub }]}>
              TRACK YOUR VITALITY
            </Text>
          </View>

          {/* Form Card */}
          <GlassCard padding="lg">
            <Text style={[styles.formTitle, { color: tk.t1 }]}>Connexion</Text>
            <Text style={[styles.formSubtitle, { color: tk.t3 }]}>
              Accede a ton dashboard de vitalite
            </Text>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
              secureTextEntry
            />

            <Button
              title="Se connecter"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
            />

            {/* Separator */}
            <View style={styles.separator}>
              <View style={[styles.separatorLine, { backgroundColor: tk.cardBorder }]} />
              <Text style={[styles.separatorText, { color: tk.t4 }]}>ou</Text>
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
                {googleLoading ? '...' : 'Continuer avec Google'}
              </Text>
            </TouchableOpacity>

            {/* Biometric */}
            <TouchableOpacity
              style={[styles.socialBtn, { borderColor: tk.accent + '33', backgroundColor: tk.rowBg, marginTop: spacing.sm }]}
              onPress={handleBiometric}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20 }}>{'\uD83D\uDD13'}</Text>
              <Text style={[styles.socialBtnText, { color: tk.accent }]}>
                Connexion biometrique
              </Text>
            </TouchableOpacity>

            {/* Switch to register */}
            <TouchableOpacity
              onPress={() => onNavigate?.('Register')}
              style={styles.switchAuth}
            >
              <Text style={[styles.switchText, { color: tk.t3 }]}>
                Pas de compte ?{' '}
                <Text style={{ color: tk.accent, fontWeight: '700' }}>S'inscrire</Text>
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
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
    width: 88, height: 88, borderRadius: 24,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  tagline: {
    fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 3, textAlign: 'center', marginTop: spacing.xs,
  },
  formTitle: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  formSubtitle: { fontSize: 13, fontWeight: '500', marginBottom: spacing.xl },
  separator: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  separatorLine: { flex: 1, height: 1 },
  separatorText: {
    marginHorizontal: spacing.md, fontSize: 12, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.md, borderWidth: 1, borderRadius: borderRadius.md,
  },
  googleIcon: { fontSize: 18, fontWeight: '800', color: '#4285F4', marginRight: spacing.sm },
  socialBtnText: { fontSize: 15, fontWeight: '700' },
  switchAuth: { marginTop: spacing['2xl'], alignItems: 'center' },
  switchText: { fontSize: 14 },
});
