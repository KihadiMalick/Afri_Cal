import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';
import { MockAuthProvider } from './MockAuthContext';
import { MockLanguageProvider } from './MockLanguageContext';
import ProfilePageMock from './ProfilePageMock';
import RootOverlaysMock from './RootOverlaysMock';
import DeletionBanner from './components/DeletionBanner';

function AppContent() {
  var _showRestoreModal = useState(false);
  var showRestoreModal = _showRestoreModal[0];
  var setShowRestoreModal = _showRestoreModal[1];

  function handleBannerPress() {
    setShowRestoreModal(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0E14' }}>
      <DeletionBanner onPress={handleBannerPress} />
      <View style={{ flex: 1 }}>
        <ProfilePageMock />
      </View>
      <RootOverlaysMock
        showRestoreModal={showRestoreModal}
        setShowRestoreModal={setShowRestoreModal}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0E14' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E14" />
      <MockAuthProvider>
        <MockLanguageProvider>
          <AppContent />
        </MockLanguageProvider>
      </MockAuthProvider>
    </SafeAreaView>
  );
}
