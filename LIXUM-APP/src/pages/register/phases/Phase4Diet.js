import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../registerConstants';
import { registerStyles as s } from '../registerComponents';

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
        <Text style={s.phaseSubtitle}>{lang === 'fr' ? 'Quel r\u00e9gime suivez-vous ?' : 'What diet do you follow?'}</Text>
      </View>
      {t.diets.map(function(diet) {
        var sel = fd.diet === diet.key;
        return (
          <TouchableOpacity key={diet.key} onPress={function() { u('diet', diet.key); }} activeOpacity={0.7} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14,
              borderRadius: 12, borderWidth: 1.2, borderColor: sel ? diet.color + '50' : C.metalBorder,
              backgroundColor: sel ? diet.color + '08' : C.bgDeep, gap: 12 }}>
              <View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: sel ? diet.color + '10' : 'rgba(62,72,85,0.12)',
                borderWidth: 1, borderColor: sel ? diet.color + '20' : 'rgba(62,72,85,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 26 }}>{diet.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: sel ? diet.color : C.textPrimary, fontSize: 14, fontWeight: '700' }}>{diet.label}</Text>
                <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>{diet.desc}</Text>
              </View>
              {sel ? <Ionicons name="checkmark-circle" size={20} color={diet.color} /> : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default Phase4Diet;
