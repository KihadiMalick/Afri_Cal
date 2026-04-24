import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../registerConstants';
import { registerStyles as s } from '../registerComponents';
import DietarySelector from '../../../components/shared/DietarySelector';

function Phase4Diet({ formData, setFormData, t, lang }) {
  var fd = formData;
  function u(k, v) { setFormData(function(prev) { var n = Object.assign({}, prev); n[k] = v; return n; }); }
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={[s.phaseIcon, { backgroundColor: 'rgba(0,191,166,0.08)', borderColor: 'rgba(0,191,166,0.2)' }]}>
          <Ionicons name="nutrition-outline" size={24} color={C.turquoise} />
        </View>
        <Text style={[s.phaseTitle, { marginTop: 8 }]}>{lang === 'fr' ? 'Votre alimentation' : 'Your diet'}</Text>
        <Text style={s.phaseSubtitle}>{lang === 'fr' ? 'Quel régime suivez-vous ?' : 'What diet do you follow?'}</Text>
      </View>
      <DietarySelector
        value={fd.diet}
        onChange={function(key) { u('diet', key); }}
        language={lang === 'en' ? 'EN' : 'FR'}
      />
    </ScrollView>
  );
}

export default Phase4Diet;
