import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// PlanSummaryCard — carte résumé "VOTRE PLAN" avec gradient or,
// kcal/jour, BMR+TDEE, 3 macros bars (grammes, normalises /300).
// Props : calculations ({bmr, tdee, dailyTarget, macros{protein,carbs,fat}}),
//         language ('FR'|'EN').

function PlanSummaryCard(props) {
  var calculations = props.calculations;
  var language = props.language || 'FR';

  if (!calculations) return null;

  var labels = language === 'EN'
    ? {
        title: 'YOUR PLAN',
        dailyGoalPrefix: 'Goal: ',
        kcalDay: 'kcal/day',
        bmrPrefix: 'BMR: ',
        tdeePrefix: ' · TDEE: ',
        protein: 'Protein',
        carbs: 'Carbs',
        fat: 'Fat',
        gUnit: 'g'
      }
    : {
        title: 'VOTRE PLAN',
        dailyGoalPrefix: 'Objectif : ',
        kcalDay: 'kcal/jour',
        bmrPrefix: 'BMR : ',
        tdeePrefix: ' · TDEE : ',
        protein: 'Protéines',
        carbs: 'Glucides',
        fat: 'Lipides',
        gUnit: 'g'
      };

  var macros = calculations.macros || { protein: 0, carbs: 0, fat: 0 };

  return (
    <View style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
      <LinearGradient
        colors={['rgba(212,175,55,0.15)', 'rgba(212,175,55,0.03)']}
        style={{
          padding: 16,
          borderWidth: 1,
          borderColor: 'rgba(212,175,55,0.30)',
          borderRadius: 14
        }}
      >
        <Text style={{
          color: '#D4AF37',
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 1.2,
          marginBottom: 10
        }}>
          {labels.title}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>
            {calculations.dailyTarget || 0}
          </Text>
          <Text style={{ color: '#8892A0', fontSize: 13, marginLeft: 6 }}>
            {labels.kcalDay}
          </Text>
        </View>

        <Text style={{ color: '#8892A0', fontSize: 11, marginBottom: 12 }}>
          {labels.bmrPrefix}{Math.round(calculations.bmr || 0)}
          {labels.tdeePrefix}{Math.round(calculations.tdee || 0)}
        </Text>

        {/* 3 macros bars (grammes, normalisees sur 300g pour largeur) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[
            { label: labels.protein, value: macros.protein || 0, color: '#00BFA6' },
            { label: labels.carbs, value: macros.carbs || 0, color: '#00D984' },
            { label: labels.fat, value: macros.fat || 0, color: '#D4AF37' }
          ].map(function(m, i) {
            var barPct = Math.min(100, Math.round((m.value / 300) * 100));
            return (
              <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: m.color, fontSize: 22, fontWeight: '800' }}>{m.value}</Text>
                <Text style={{ color: '#8892A0', fontSize: 9, marginTop: 1 }}>{labels.gUnit} {m.label}</Text>
                <View style={{ width: '60%', height: 3, borderRadius: 1.5, marginTop: 6, backgroundColor: 'rgba(62,72,85,0.25)' }}>
                  <View style={{
                    width: barPct + '%',
                    height: '100%',
                    borderRadius: 1.5,
                    backgroundColor: m.color
                  }} />
                </View>
              </View>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

export default PlanSummaryCard;
