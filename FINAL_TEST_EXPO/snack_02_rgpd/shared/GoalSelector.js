import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GOALS from './GOALS';

// GoalSelector — 3 cards horizontales cliquables encapsulant le pattern
// de Phase5Goals (LinearGradient overlay + cercle icone + dot selecteur).
// Props :
//   value     : 'lose' | 'maintain' | 'gain'
//   onChange  : function(newKey)
//   language  : 'FR' | 'EN', defaut 'FR'

function GoalSelector(props) {
  var value = props.value;
  var onChange = props.onChange;
  var language = props.language || 'FR';

  function handleSelect(key) {
    if (onChange) {
      onChange(key);
    }
  }

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {GOALS.map(function(g) {
        var isSelected = value === g.key;
        var label = language === 'EN' ? g.labelEn : g.labelFr;

        return (
          <TouchableOpacity
            key={g.key}
            activeOpacity={0.7}
            onPress={function() { handleSelect(g.key); }}
            style={{ flex: 1 }}
          >
            <View style={{
              paddingVertical: 20,
              paddingHorizontal: 8,
              borderRadius: 14,
              alignItems: 'center',
              borderWidth: isSelected ? 1.5 : 1,
              borderColor: isSelected ? g.color + '60' : '#3E4855',
              backgroundColor: '#0A0E14',
              overflow: 'hidden'
            }}>
              {isSelected ? (
                <LinearGradient
                  colors={[g.color + '15', g.color + '05', 'transparent']}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0
                  }}
                  pointerEvents="none"
                />
              ) : null}

              <View style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: isSelected ? g.color + '15' : 'rgba(62,72,85,0.15)',
                borderWidth: 1,
                borderColor: isSelected ? g.color + '30' : 'rgba(62,72,85,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8
              }}>
                <Ionicons
                  name={g.icon}
                  size={22}
                  color={isSelected ? g.color : '#555E6C'}
                />
              </View>

              <Text
                numberOfLines={1}
                style={{
                  color: isSelected ? g.color : '#8892A0',
                  fontSize: 10,
                  fontWeight: '700',
                  textAlign: 'center'
                }}
              >
                {label}
              </Text>

              {isSelected ? (
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: g.color,
                  marginTop: 6
                }} />
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default GoalSelector;
