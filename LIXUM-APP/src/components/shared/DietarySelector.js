import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DIETS from '../../constants/DIETS';

// DietarySelector — 5 cards verticales cliquables (pattern Phase4Diet).
// Props :
//   value     : 'classic' | 'vegetarian' | 'vegan' | 'keto' | 'halal'
//   onChange  : function(newKey)
//   language  : 'FR' | 'EN', defaut 'FR'

function DietarySelector(props) {
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
      {DIETS.map(function(d) {
        var isSelected = value === d.key;
        var label = language === 'EN' ? d.labelEn : d.labelFr;
        var desc = language === 'EN' ? d.descEn : d.descFr;

        return (
          <TouchableOpacity
            key={d.key}
            activeOpacity={0.7}
            onPress={function() { handleSelect(d.key); }}
            style={{ marginBottom: 10 }}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              paddingHorizontal: 14,
              borderRadius: 12,
              borderWidth: 1.2,
              borderColor: isSelected ? d.color + '50' : '#3E4855',
              backgroundColor: isSelected ? d.color + '08' : '#0A0E14',
              gap: 12
            }}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                backgroundColor: isSelected ? d.color + '10' : 'rgba(62,72,85,0.12)',
                borderWidth: 1,
                borderColor: isSelected ? d.color + '20' : 'rgba(62,72,85,0.2)',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ fontSize: 26 }}>{d.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: isSelected ? d.color : '#EAEEF3',
                  fontSize: 14,
                  fontWeight: '700'
                }}>
                  {label}
                </Text>
                <Text style={{
                  color: '#555E6C',
                  fontSize: 10,
                  marginTop: 2
                }}>
                  {desc}
                </Text>
              </View>
              {isSelected ? (
                <Ionicons name="checkmark-circle" size={20} color={d.color} />
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default DietarySelector;
