/**
 * LIXUM — Test Expo Preview App
 * Navigate between screens to test design, buttons, and animations.
 * No auth, no Supabase, no native modules — pure UI.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';
import { ActivityIndicator } from 'react-native';
import { DARK } from './theme';

// Screens
import { LoginScreen } from './screens/LoginScreen';

const tk = DARK;

type Screen = 'menu' | 'Login' | 'Onboarding' | 'Dashboard' | 'Meals' | 'Activities' | 'Calendar' | 'Profile';

const SCREENS: { key: Screen; label: string; emoji: string; ready: boolean }[] = [
  { key: 'Login',       label: 'Connexion',    emoji: '\uD83D\uDD11', ready: true },
  { key: 'Onboarding',  label: 'Onboarding',   emoji: '\uD83C\uDF1F', ready: false },
  { key: 'Dashboard',   label: 'Dashboard',    emoji: '\uD83D\uDCCA', ready: false },
  { key: 'Meals',       label: 'Repas',        emoji: '\uD83C\uDF5D', ready: false },
  { key: 'Activities',  label: 'Activites',    emoji: '\uD83C\uDFC3', ready: false },
  { key: 'Calendar',    label: 'Calendrier',   emoji: '\uD83D\uDCC5', ready: false },
  { key: 'Profile',     label: 'Profil',       emoji: '\uD83D\uDC64', ready: false },
];

function ScreenMenu({ onSelect }: { onSelect: (s: Screen) => void }) {
  return (
    <SafeAreaView style={menuStyles.safe}>
      <ScrollView contentContainerStyle={menuStyles.scroll}>
        <View style={menuStyles.logoWrap}>
          <Text style={menuStyles.logoL}>L</Text>
          <Text style={menuStyles.logoX}>X</Text>
        </View>
        <Text style={menuStyles.title}>LIXUM Design Preview</Text>
        <Text style={menuStyles.subtitle}>Testez le design de chaque ecran</Text>

        {SCREENS.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[
              menuStyles.card,
              !s.ready && menuStyles.cardDisabled,
            ]}
            onPress={() => s.ready && onSelect(s.key)}
            activeOpacity={s.ready ? 0.7 : 1}
          >
            <Text style={menuStyles.cardEmoji}>{s.emoji}</Text>
            <View style={menuStyles.cardContent}>
              <Text style={[menuStyles.cardLabel, !s.ready && menuStyles.cardLabelDisabled]}>
                {s.label}
              </Text>
              <Text style={menuStyles.cardStatus}>
                {s.ready ? 'Pret a tester' : 'En attente'}
              </Text>
            </View>
            <Text style={[menuStyles.cardArrow, { color: s.ready ? tk.accent : tk.t4 }]}>
              {s.ready ? '\u25B6' : '\u25CB'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');

  const [fontsLoaded, fontError] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
        <ActivityIndicator size="large" color="#00D984" />
      </View>
    );
  }

  const goBack = () => setCurrentScreen('menu');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Login':
        return <LoginScreen onNavigate={(s) => setCurrentScreen(s as Screen)} />;
      // Future screens will be added here as we validate each one
      default:
        return <ScreenMenu onSelect={setCurrentScreen} />;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0D1117' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      {currentScreen !== 'menu' && (
        <SafeAreaView style={navStyles.backBar}>
          <TouchableOpacity onPress={goBack} style={navStyles.backBtn}>
            <Text style={navStyles.backText}>{'\u25C0'} Menu</Text>
          </TouchableOpacity>
          <Text style={navStyles.screenName}>
            {SCREENS.find(s => s.key === currentScreen)?.label}
          </Text>
          <View style={{ width: 70 }} />
        </SafeAreaView>
      )}
      {renderScreen()}
    </GestureHandlerRootView>
  );
}

/* ─── Menu Styles ─── */
const menuStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D1117' },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  logoWrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  logoL: { fontSize: 32, fontWeight: '700', color: '#9CA3AF', letterSpacing: 2 },
  logoX: {
    fontSize: 32, fontWeight: '900', color: '#00D984', letterSpacing: 2,
    textShadowColor: 'rgba(0,217,132,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  title: {
    fontSize: 20, fontWeight: '900', color: '#EAEEF3',
    textAlign: 'center', marginBottom: 4,
  },
  subtitle: {
    fontSize: 13, fontWeight: '500', color: '#8892A0',
    textAlign: 'center', marginBottom: 32,
  },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1B1F26', borderRadius: 16, borderWidth: 1.2,
    borderColor: '#3E4855', padding: 16, marginBottom: 12, gap: 14,
  },
  cardDisabled: { opacity: 0.4 },
  cardEmoji: { fontSize: 24 },
  cardContent: { flex: 1, gap: 2 },
  cardLabel: { fontSize: 16, fontWeight: '800', color: '#EAEEF3' },
  cardLabelDisabled: { color: '#555E6C' },
  cardStatus: { fontSize: 11, fontWeight: '600', color: '#8892A0', letterSpacing: 0.5 },
  cardArrow: { fontSize: 16, fontWeight: '700' },
});

/* ─── Nav bar Styles ─── */
const navStyles = StyleSheet.create({
  backBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8,
    backgroundColor: '#0D1117', borderBottomWidth: 1, borderBottomColor: '#1C2330',
  },
  backBtn: { paddingVertical: 6, paddingRight: 12 },
  backText: { fontSize: 14, fontWeight: '700', color: '#00D984' },
  screenName: {
    fontSize: 14, fontWeight: '800', color: '#EAEEF3',
    textTransform: 'uppercase', letterSpacing: 1,
  },
});
