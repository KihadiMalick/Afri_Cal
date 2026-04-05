import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LanguageProvider } from './src/config/LanguageContext';
import { AuthProvider } from './src/config/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <LanguageProvider>
          <AppNavigator />
        </LanguageProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
