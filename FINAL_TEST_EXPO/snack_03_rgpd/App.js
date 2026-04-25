import React from 'react';
import { SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LixVersePage from './LixVersePage';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F1215' }}>
        <LixVersePage />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
