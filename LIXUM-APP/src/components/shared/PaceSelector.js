import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// PaceSelector — 3 cards verticales (ambitious/reasonable/realistic)
// Props : value (0|1|2), onChange(idx), calculations (optional, pour sublabel),
//         language ('FR'|'EN').

var PACE_MODES = [
  { index: 0, key: 'ambitious', labelFr: 'Ambitieux', labelEn: 'Ambitious', icon: 'rocket-outline', color: '#D4AF37' },
  { index: 1, key: 'reasonable', labelFr: 'Raisonnable', labelEn: 'Reasonable', icon: 'speedometer-outline', color: '#00D984' },
  { index: 2, key: 'realistic', labelFr: 'Réaliste', labelEn: 'Realistic', icon: 'leaf-outline', color: '#00BFA6' }
];

function PaceSelector(props) {
  var value = props.value;
  var onChange = props.onChange;
  var calculations = props.calculations;
  var language = props.language || 'FR';

  function handleSelect(index) {
    if (onChange) {
      onChange(index);
    }
  }

  return (
    <View>
      {PACE_MODES.map(function(mode) {
        var isSelected = value === mode.index;
        var label = language === 'EN' ? mode.labelEn : mode.labelFr;

        var subLabel = '';
        if (calculations && calculations.modes && calculations.modes[mode.key]) {
          var m = calculations.modes[mode.key];
          var weeksText = language === 'EN' ? 'weeks' : 'semaines';
          if (m.dailyDelta && m.weeksLabel) {
            subLabel = m.dailyDelta + ' kcal/jour · ' + m.weeksLabel + ' ' + weeksText;
          }
        }

        return (
          <TouchableOpacity
            key={mode.key}
            activeOpacity={0.7}
            onPress={function() { handleSelect(mode.index); }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              marginBottom: 8,
              borderRadius: 12,
              borderWidth: isSelected ? 1.5 : 1,
              borderColor: isSelected ? mode.color + '60' : '#3E4855',
              backgroundColor: '#0A0E14'
            }}
          >
            <View style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: isSelected ? mode.color + '15' : 'rgba(62,72,85,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Ionicons
                name={mode.icon}
                size={20}
                color={isSelected ? mode.color : '#555E6C'}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{
                color: isSelected ? mode.color : '#ccc',
                fontSize: 14,
                fontWeight: '700'
              }}>
                {label}
              </Text>
              {subLabel.length > 0 ? (
                <Text style={{ color: '#8892A0', fontSize: 11, marginTop: 2 }}>
                  {subLabel}
                </Text>
              ) : null}
            </View>

            {isSelected ? (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={mode.color}
              />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default PaceSelector;
