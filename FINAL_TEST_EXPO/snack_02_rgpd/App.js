import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { MockAuthProvider } from './MockAuthContext';
import { MockLanguageProvider } from './MockLanguageContext';
import ProfilePageMock from './ProfilePageMock';
import RootOverlaysMock from './RootOverlaysMock';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0E14' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E14" />
      <MockAuthProvider>
        <MockLanguageProvider>
          <ProfilePageMock />
          <RootOverlaysMock />
        </MockLanguageProvider>
      </MockAuthProvider>
    </SafeAreaView>
  );
}
