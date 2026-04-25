import React from 'react';
import { View, Text } from 'react-native';

export default function LixShopTabStub() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
      <Text style={{ fontSize: 64, marginBottom: 16 }}>💎</Text>
      <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>LixShop</Text>
      <Text style={{ color: '#9A9EA3', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
        Boutique Lix, abonnements, boosters.{'\n\n'}Bientôt disponible.
      </Text>
    </View>
  );
}
