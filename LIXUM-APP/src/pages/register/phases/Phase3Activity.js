import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../registerConstants';
import { registerStyles as s } from '../registerComponents';

function Phase3Activity({ formData, setFormData, t, lang }) {
  var fd = formData;
  function u(k, v) { setFormData(function(prev) { var n = Object.assign({}, prev); n[k] = v; return n; }); }
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={[s.phaseIcon, { backgroundColor: 'rgba(0,217,132,0.08)', borderColor: 'rgba(0,217,132,0.2)' }]}>
          <Ionicons name="fitness-outline" size={24} color={C.emerald} />
        </View>
        <Text style={[s.phaseTitle, { marginTop: 8 }]}>{lang === 'fr' ? 'Votre activit\u00e9' : 'Your activity'}</Text>
        <Text style={s.phaseSubtitle}>{lang === 'fr' ? 'Quel est votre rythme ?' : 'What is your rhythm?'}</Text>
      </View>
      <Text style={[s.inputLabel, { marginBottom: 12 }]}>{t.activityLabel}</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ width: 4, borderRadius: 2, backgroundColor: 'rgba(62,72,85,0.2)', overflow: 'hidden' }}>
          <LinearGradient colors={['#00A866', '#00D984', '#00FFB2']} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
            style={{ width: '100%', height: ((fd.activityLevel + 1) / 5 * 100) + '%', position: 'absolute', bottom: 0, borderRadius: 2 }} />
        </View>
        <View style={{ flex: 1 }}>
          {t.activityLevels.map(function(level, i) {
            var sel = fd.activityLevel === i;
            return (
              <TouchableOpacity key={i} onPress={function() { u('activityLevel', i); }} activeOpacity={0.7} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14,
                  borderRadius: 10, borderWidth: 1.2, borderColor: sel ? 'rgba(0,217,132,0.4)' : C.metalBorder,
                  backgroundColor: sel ? 'rgba(0,217,132,0.06)' : C.bgDeep, gap: 12 }}>
                  <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: sel ? 'rgba(0,217,132,0.12)' : 'rgba(62,72,85,0.15)',
                    borderWidth: 1, borderColor: sel ? 'rgba(0,217,132,0.25)' : 'rgba(62,72,85,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 24 }}>{level.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: sel ? C.emerald : C.textPrimary, fontSize: 13, fontWeight: '600' }}>{level.label}</Text>
                    <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 1 }}>{level.desc}</Text>
                  </View>
                  {sel ? <Ionicons name="checkmark-circle" size={20} color={C.emerald} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

export default Phase3Activity;
