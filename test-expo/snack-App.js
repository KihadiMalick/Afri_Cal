import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';

/* ══════════════════════════════════════════
   COULEURS LIXUM (theme sombre metallique)
   ══════════════════════════════════════════ */
const C = {
  bg: '#0D1117',
  card: '#1B1F26',
  border: '#3E4855',
  input: 'rgba(21,27,35,0.75)',
  accent: '#00D984',
  accentSub: 'rgba(0,217,132,0.50)',
  logoBoxBg: 'rgba(0,217,132,0.12)',
  logoBoxBorder: 'rgba(0,217,132,0.25)',
  t1: '#EAEEF3',
  t3: '#8892A0',
  t4: '#555E6C',
  row: 'rgba(255,255,255,0.02)',
};

/* ══════════════════════════════════════════
   COMPOSANT : GlassCard (carte metallique)
   ══════════════════════════════════════════ */
function GlassCard({ children, style }) {
  return (
    <View style={[cardStyles.shadow, style]}>
      <View style={{ borderRadius: 16, overflow: 'hidden' }}>
        <LinearGradient
          colors={['#2E3440', '#1B1F26', '#252B35', '#1B1F26']}
          locations={[0, 0.3, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={cardStyles.inner}
        >
          <View style={cardStyles.highlight} />
          {children}
        </LinearGradient>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 12,
  },
  inner: {
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#3E4855',
    overflow: 'hidden',
    padding: 24,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: '#6B7B8D',
    opacity: 0.35,
  },
});

/* ══════════════════════════════════════════
   COMPOSANT : Logo LX avec glow neon
   ══════════════════════════════════════════ */
function LixumLogo({ size }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text
        style={{
          fontSize: size || 22,
          color: '#9CA3AF',
          fontWeight: '700',
          letterSpacing: 1,
        }}>
        L
      </Text>
      <Text
        style={{
          fontSize: size || 22,
          color: '#00D984',
          fontWeight: '900',
          letterSpacing: 1,
          textShadowColor: 'rgba(0,217,132,0.5)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10,
        }}>
        X
      </Text>
    </View>
  );
}

/* ══════════════════════════════════════════
   ECRAN : LOGIN
   ══════════════════════════════════════════ */
function LoginScreen() {
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
      Alert.alert('Succes', 'Connexion simulee !');
    }, 1500);
  };

  const handleGoogle = () => {
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      Alert.alert('Test', 'Google login simule !');
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* ─── Logo ─── */}
        <View style={s.logoWrap}>
          <View style={s.logoBadge}>
            <LixumLogo size={28} />
          </View>
          <Text style={s.tagline}>TRACK YOUR VITALITY</Text>
        </View>

        {/* ─── Formulaire ─── */}
        <GlassCard>
          <Text style={s.formTitle}>Connexion</Text>
          <Text style={s.formSub}>Accede a ton dashboard de vitalite</Text>

          {/* Email */}
          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            placeholderTextColor={C.t4}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Mot de passe */}
          <Text style={s.label}>Mot de passe</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={C.t4}
            secureTextEntry
          />

          {/* Bouton connexion */}
          <TouchableOpacity
            style={s.primaryBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.7}>
            {loading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={s.primaryBtnText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* Separateur */}
          <View style={s.sepRow}>
            <View style={s.sepLine} />
            <Text style={s.sepText}>ou</Text>
            <View style={s.sepLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={s.socialBtn}
            onPress={handleGoogle}
            disabled={googleLoading}
            activeOpacity={0.7}>
            <Text style={s.googleG}>G</Text>
            <Text style={s.socialText}>
              {googleLoading ? '...' : 'Continuer avec Google'}
            </Text>
          </TouchableOpacity>

          {/* Biometrique */}
          <TouchableOpacity
            style={[s.socialBtn, { borderColor: 'rgba(0,217,132,0.2)', marginTop: 8 }]}
            onPress={() => Alert.alert('Test', 'Biometrique simule !')}
            activeOpacity={0.7}>
            <Text style={{ fontSize: 20 }}>{'\uD83D\uDD13'}</Text>
            <Text style={[s.socialText, { color: C.accent }]}>
              Connexion biometrique
            </Text>
          </TouchableOpacity>

          {/* Inscription */}
          <TouchableOpacity style={s.switchAuth}>
            <Text style={s.switchText}>
              Pas de compte ?{' '}
              <Text style={{ color: C.accent, fontWeight: '700' }}>
                S'inscrire
              </Text>
            </Text>
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ══════════════════════════════════════════
   APP PRINCIPALE
   ══════════════════════════════════════════ */
export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <LoginScreen />
    </View>
  );
}

/* ══════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════ */
const s = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },

  /* Logo */
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.logoBoxBorder,
    backgroundColor: C.logoBoxBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '700',
    color: C.accentSub,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: 4,
  },

  /* Form */
  formTitle: { fontSize: 24, fontWeight: '900', color: C.t1, marginBottom: 4 },
  formSub: { fontSize: 13, fontWeight: '500', color: C.t3, marginBottom: 20 },

  /* Input */
  label: { fontSize: 14, fontWeight: '600', color: C.t3, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.input,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: C.t1,
    marginBottom: 16,
  },

  /* Primary button */
  primaryBtn: {
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#000' },

  /* Separator */
  sepRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  sepLine: { flex: 1, height: 1, backgroundColor: C.border },
  sepText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    color: C.t4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* Social buttons */
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    backgroundColor: C.row,
  },
  googleG: { fontSize: 18, fontWeight: '800', color: '#4285F4', marginRight: 8 },
  socialText: { fontSize: 15, fontWeight: '700', color: C.t1 },

  /* Switch auth */
  switchAuth: { marginTop: 24, alignItems: 'center' },
  switchText: { fontSize: 14, color: C.t3 },
});
