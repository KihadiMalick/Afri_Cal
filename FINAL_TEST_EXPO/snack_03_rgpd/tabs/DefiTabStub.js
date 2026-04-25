import React from 'react';
import { View, Text } from 'react-native';

export default function DefiTabStub() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
      <Text style={{ fontSize: 64, marginBottom: 16 }}>🏆</Text>
      <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Défi</Text>
      <Text style={{ color: '#9A9EA3', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
        Wall of Health, classements mensuels, défis communautaires.{'\n\n'}Bientôt disponible.
      </Text>
    </View>
  );
}
