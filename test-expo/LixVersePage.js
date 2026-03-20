// LIXUM - LixVerse Page
// Placeholder — à remplir

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LixVersePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LixVerse</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
