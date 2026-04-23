import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ActivityLevelSelector — 5 cards verticales (sedentary..extreme)
// Props : value (string 'sedentary'..'extreme'), onChange(key), language.

var ACTIVITY_LEVELS = [
  {
    key: 'sedentary',
    labelFr: 'Sédentaire', labelEn: 'Sedentary',
    captionFr: 'Peu ou pas d\'exercice', captionEn: 'Little or no exercise',
    icon: 'bed-outline', color: '#8892A0'
  },
  {
    key: 'light',
    labelFr: 'Léger', labelEn: 'Light',
    captionFr: 'Exercice 1-3 jours/semaine', captionEn: 'Exercise 1-3 days/week',
    icon: 'walk-outline', color: '#00BFA6'
  },
  {
    key: 'moderate',
    labelFr: 'Modéré', labelEn: 'Moderate',
    captionFr: 'Exercice 3-5 jours/semaine', captionEn: 'Exercise 3-5 days/week',
    icon: 'bicycle-outline', color: '#00D984'
  },
  {
    key: 'active',
    labelFr: 'Actif', labelEn: 'Active',
    captionFr: 'Exercice 6-7 jours/semaine', captionEn: 'Exercise 6-7 days/week',
    icon: 'barbell-outline', color: '#FFA500'
  },
  {
    key: 'extreme',
    labelFr: 'Extrême', labelEn: 'Extreme',
    captionFr: 'Athlète / travail physique intense', captionEn: 'Athlete / heavy physical work',
    icon: 'flame-outline', color: '#FF6B6B'
  }
];

function ActivityLevelSelector(props) {
  var value = props.value;
  var onChange = props.onChange;
  var language = props.language || 'FR';

  function handleSelect(key) {
    if (onChange) {
      onChange(key);
    }
  }

  return (
    <View>
      {ACTIVITY_LEVELS.map(function(level) {
        var isSelected = value === level.key;
        var label = language === 'EN' ? level.labelEn : level.labelFr;
        var caption = language === 'EN' ? level.captionEn : level.captionFr;

        return (
          <TouchableOpacity
            key={level.key}
            activeOpacity={0.7}
            onPress={function() { handleSelect(level.key); }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              marginBottom: 8,
              borderRadius: 12,
              borderWidth: isSelected ? 1.5 : 1,
              borderColor: isSelected ? level.color + '60' : '#3E4855',
              backgroundColor: '#0A0E14'
            }}
          >
            <View style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: isSelected ? level.color + '15' : 'rgba(62,72,85,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Ionicons
                name={level.icon}
                size={20}
                color={isSelected ? level.color : '#555E6C'}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{
                color: isSelected ? level.color : '#ccc',
                fontSize: 14,
                fontWeight: '700'
              }}>
                {label}
              </Text>
              <Text style={{ color: '#8892A0', fontSize: 11, marginTop: 2 }}>
                {caption}
              </Text>
            </View>

            {isSelected ? (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={level.color}
              />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default ActivityLevelSelector;
