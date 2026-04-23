import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../registerConstants';
import GoalSelector from '../../../components/shared/GoalSelector';
import TargetKgStepper from '../../../components/shared/TargetKgStepper';
import PaceSelector from '../../../components/shared/PaceSelector';
import PlanSummaryCard from '../../../components/shared/PlanSummaryCard';

function Phase5Goals({ formData, setFormData, calculations, t, lang }) {
  var fd = formData;
  var calc = calculations;
  var paceIcons = ['rocket-outline', 'speedometer-outline', 'leaf-outline'];
  var paceColors = ['#D4AF37', '#00D984', '#00BFA6'];
  function u(k, v) { setFormData(function(prev) { var n = Object.assign({}, prev); n[k] = v; return n; }); }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
      <View style={{ marginBottom: 20 }}>
        <GoalSelector
          value={fd.goal}
          onChange={function(key) { u('goal', key); }}
          language={lang === 'en' ? 'EN' : 'FR'}
        />
      </View>

      {fd.goal && fd.goal !== 'maintain' ? (
        <View>
          <View style={{ marginVertical: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: C.bgInput, borderWidth: 1, borderColor: 'rgba(62,72,85,0.2)' }}>
            <TargetKgStepper
              value={fd.targetKg}
              onChange={function(val) { u('targetKg', val); }}
              goal={fd.goal}
              language={lang === 'en' ? 'EN' : 'FR'}
            />
          </View>

          <Text style={{ color: '#8892A0', fontSize: 12, fontWeight: '600', marginBottom: 10, letterSpacing: 0.5 }}>{t.yourPace}</Text>
          <PaceSelector
            value={fd.paceMode}
            onChange={function(idx) { u('paceMode', idx); }}
            calculations={calc}
            language={lang === 'en' ? 'EN' : 'FR'}
          />

          <View style={{ marginTop: 16 }}>
            <PlanSummaryCard
              calculations={calc}
              language={lang === 'en' ? 'EN' : 'FR'}
            />
          </View>
        </View>
      ) : fd.goal === 'maintain' ? (
        <View>
          <View style={{ marginTop: 16, borderRadius: 14, overflow: 'hidden', borderWidth: 1.5,
            borderTopColor: 'rgba(0,217,132,0.3)', borderBottomColor: 'rgba(0,217,132,0.1)',
            borderLeftColor: 'rgba(0,217,132,0.15)', borderRightColor: 'rgba(0,217,132,0.15)',
            backgroundColor: C.bgInput }}>
            <LinearGradient colors={['rgba(0,217,132,0.08)', 'rgba(0,217,132,0.02)', 'transparent']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60 }} />
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Ionicons name="shield-checkmark-outline" size={14} color={C.emerald} />
                <Text style={{ color: C.emerald, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}>
                  {lang === 'fr' ? 'MAINTIEN \u00c9QUILIBR\u00c9' : 'BALANCED MAINTENANCE'}
                </Text>
              </View>
              <Text style={{ color: C.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 4 }}>{t.dailyGoal(calc.dailyTarget)}</Text>
              <Text style={{ color: C.textMuted, fontSize: 11, marginBottom: 14 }}>{t.bmrTdee(calc.bmr, calc.tdee)}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {[
                  { label: t.protein, value: calc.macros.protein, color: C.turquoise },
                  { label: t.carbs, value: calc.macros.carbs, color: C.emerald },
                  { label: t.fat, value: calc.macros.fat, color: C.gold },
                ].map(function(m, i) {
                  return (
                    <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ color: m.color, fontSize: 22, fontWeight: '800' }}>{m.value}</Text>
                      <Text style={{ color: C.textMuted, fontSize: 9, marginTop: 1 }}>{t.gUnit} {m.label}</Text>
                      <View style={{ width: '60%', height: 3, borderRadius: 1.5, marginTop: 6, backgroundColor: 'rgba(62,72,85,0.2)' }}>
                        <View style={{ width: Math.min(100, (m.value / 300) * 100) + '%', height: '100%', borderRadius: 1.5, backgroundColor: m.color }} />
                      </View>
                    </View>
                  );
                })}
              </View>
              <Text style={{ color: C.textMuted, fontSize: 10, textAlign: 'center', marginTop: 12, fontStyle: 'italic' }}>
                {lang === 'fr' ? 'Mangez selon votre TDEE pour maintenir votre poids actuel' : 'Eat according to your TDEE to maintain your current weight'}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 14, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(77,166,255,0.15)', backgroundColor: C.bgInput }}>
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <Ionicons name="calendar-outline" size={14} color="#4DA6FF" />
                <Text style={{ color: '#4DA6FF', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}>
                  {lang === 'fr' ? 'VOTRE SEMAINE TYPE' : 'YOUR TYPICAL WEEK'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
                backgroundColor: 'rgba(255,140,66,0.04)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(255,140,66,0.1)' }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,140,66,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="restaurant-outline" size={16} color="#FF8C42" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.textPrimary, fontSize: 12, fontWeight: '600' }}>{lang === 'fr' ? 'Consommation' : 'Intake'}</Text>
                  <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>
                    {lang === 'fr' ? '~' + Math.round(calc.dailyTarget / 3) + ' kcal par repas \u00d7 3/jour' : '~' + Math.round(calc.dailyTarget / 3) + ' kcal per meal \u00d7 3/day'}
                  </Text>
                </View>
                <Text style={{ color: '#FF8C42', fontSize: 14, fontWeight: '800' }}>{(calc.dailyTarget * 7).toLocaleString()}</Text>
                <Text style={{ color: C.textMuted, fontSize: 8 }}>{'kcal\n/sem'}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
                backgroundColor: 'rgba(0,217,132,0.04)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(0,217,132,0.1)' }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,217,132,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="fitness-outline" size={16} color="#00D984" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.textPrimary, fontSize: 12, fontWeight: '600' }}>{lang === 'fr' ? 'Activit\u00e9 recommand\u00e9e' : 'Recommended activity'}</Text>
                  <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>
                    {lang === 'fr' ? '150 min/semaine (OMS) \u2248 30 min \u00d7 5j' : '150 min/week (WHO) \u2248 30 min \u00d7 5d'}
                  </Text>
                </View>
                <Text style={{ color: '#00D984', fontSize: 14, fontWeight: '800' }}>~1500</Text>
                <Text style={{ color: C.textMuted, fontSize: 8 }}>{'kcal\n/sem'}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: 'rgba(77,166,255,0.04)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(77,166,255,0.1)' }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(77,166,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="water-outline" size={16} color="#4DA6FF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.textPrimary, fontSize: 12, fontWeight: '600' }}>{lang === 'fr' ? 'Hydratation' : 'Hydration'}</Text>
                  <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>
                    {fd.gender === 'male'
                      ? (lang === 'fr' ? 'Objectif : 2.5L / jour (homme)' : 'Goal: 2.5L / day (male)')
                      : (lang === 'fr' ? 'Objectif : 2.0L / jour (femme)' : 'Goal: 2.0L / day (female)')}
                  </Text>
                </View>
                <Text style={{ color: '#4DA6FF', fontSize: 14, fontWeight: '800' }}>{fd.gender === 'male' ? '2.5' : '2.0'}</Text>
                <Text style={{ color: C.textMuted, fontSize: 8 }}>{'L\n/jour'}</Text>
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

export default Phase5Goals;
