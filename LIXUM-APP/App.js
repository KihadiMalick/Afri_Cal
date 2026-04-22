import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from './src/config/LanguageContext';
import { AuthProvider } from './src/config/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import RootOverlays from './src/components/RootOverlays';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#1E2530" />
      <AuthProvider>
        <LanguageProvider>
          <AppNavigator />
          <RootOverlays />
        </LanguageProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
