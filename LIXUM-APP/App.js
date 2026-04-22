import React, { useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from './src/config/LanguageContext';
import { AuthProvider } from './src/config/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import RootOverlays from './src/components/RootOverlays';
import DeletionBanner from './src/components/DeletionBanner';

function AppContent() {
  var _showRestoreModal = useState(false);
  var showRestoreModal = _showRestoreModal[0];
  var setShowRestoreModal = _showRestoreModal[1];

  function handleBannerPress() {
    setShowRestoreModal(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <DeletionBanner onPress={handleBannerPress} />
      <View style={{ flex: 1 }}>
        <AppNavigator />
      </View>
      <RootOverlays
        showRestoreModal={showRestoreModal}
        setShowRestoreModal={setShowRestoreModal}
      />
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#1E2530" />
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
