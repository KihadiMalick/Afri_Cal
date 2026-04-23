import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// TargetKgStepper — stepper +/- pour choisir kg a perdre/gagner (1 a 30).
// Props : value, onChange, goal ('lose'|'gain'), language ('FR'|'EN').

function TargetKgStepper(props) {
  var value = props.value;
  var onChange = props.onChange;
  var goal = props.goal || 'lose';
  var language = props.language || 'FR';

  var labelFr = goal === 'gain' ? 'KG À GAGNER' : 'KG À PERDRE';
  var labelEn = goal === 'gain' ? 'KG TO GAIN' : 'KG TO LOSE';
  var label = language === 'EN' ? labelEn : labelFr;

  function handleDecrement() {
    if (value > 1 && onChange) {
      onChange(Math.max(1, value - 1));
    }
  }

  function handleIncrement() {
    if (value < 30 && onChange) {
      onChange(Math.min(30, value + 1));
    }
  }

  return (
    <View style={{ alignItems: 'center', paddingVertical: 12 }}>
      <Text style={{
        color: '#8892A0',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 8
      }}>
        {label}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={value <= 1}
          activeOpacity={0.7}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: value > 1 ? '#10151D' : '#0A0E14',
            borderWidth: 1,
            borderColor: value > 1 ? '#00D984' : '#2a3440',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: value > 1 ? 1 : 0.4
          }}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={value > 1 ? '#00D984' : '#555E6C'}
          />
        </TouchableOpacity>

        <View style={{ marginHorizontal: 24, minWidth: 80, alignItems: 'center' }}>
          <Text style={{
            color: '#00D984',
            fontSize: 48,
            fontWeight: '800',
            lineHeight: 52
          }}>
            {value}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleIncrement}
          disabled={value >= 30}
          activeOpacity={0.7}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: value < 30 ? '#10151D' : '#0A0E14',
            borderWidth: 1,
            borderColor: value < 30 ? '#00D984' : '#2a3440',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: value < 30 ? 1 : 0.4
          }}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={value < 30 ? '#00D984' : '#555E6C'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default TargetKgStepper;
