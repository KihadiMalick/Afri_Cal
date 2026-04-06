import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fp } from '../../constants/layout';

var LixGem = function(props) {
  var s = props.size || 14;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24">
      <Path d="M12 2L3 9l9 13 9-13-9-7z" fill="#00D984" opacity={0.9} />
      <Path d="M12 2L3 9h18L12 2z" fill="#5DFFB4" opacity={0.5} />
      <Path d="M12 2l-4 7h8l-4-7z" fill="#FFFFFF" opacity={0.2} />
    </Svg>
  );
};

export default function PageHeader({ title, subtitle, titleColor, lixBalance, userEnergy, onLixPress, onProfilePress, onEnergyPress, rightExtra }) {
  var _dropdown = useState(false);
  var dropdownOpen = _dropdown[0]; var setDropdownOpen = _dropdown[1];
  var dropdownAnim = useRef(new RNAnimated.Value(0)).current;

  var toggleDropdown = function() {
    var toValue = dropdownOpen ? 0 : 1;
    RNAnimated.timing(dropdownAnim, { toValue: toValue, duration: 200, useNativeDriver: true }).start();
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, overflow: 'visible', zIndex: 999 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fp(20), fontWeight: '900', color: titleColor || '#EAEEF3', letterSpacing: 1 }}>{title}</Text>
        {subtitle ? <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.3)', letterSpacing: 2, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {rightExtra}
        <TouchableOpacity onPress={toggleDropdown} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: '#4A4F55', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
          <LixGem size={14} />
          <Text style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: fp(14), marginLeft: 4 }}>{lixBalance || 0}</Text>
          <Text style={{ color: '#888', fontSize: fp(10), marginLeft: 4 }}>▾</Text>
        </TouchableOpacity>
      </View>
      {dropdownOpen && (
        <TouchableOpacity activeOpacity={1} onPress={toggleDropdown} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: -500, zIndex: 998 }}>
          <RNAnimated.View style={{ position: 'absolute', top: 55, right: 14, backgroundColor: '#252A30', borderWidth: 1, borderColor: '#4A4F55', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, zIndex: 999, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 10, opacity: dropdownAnim, transform: [{ translateY: dropdownAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }] }}>
            <TouchableOpacity onPress={function() { toggleDropdown(); if (onLixPress) onLixPress(); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
              <LixGem size={13} />
              <Text style={{ color: '#D4AF37', fontWeight: '800', fontSize: 16, marginLeft: 6 }}>{lixBalance || 0}</Text>
              <Text style={{ color: '#6B7280', fontSize: 12, marginLeft: 4 }}>Lix</Text>
            </TouchableOpacity>
            {userEnergy !== undefined && (
              <TouchableOpacity onPress={function() { toggleDropdown(); if (onEnergyPress) onEnergyPress(); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
                <Svg width={13} height={13} viewBox="0 0 24 24">
                  <Path d="M13 2L3 14h7l-2 8 10-12h-7z" fill={userEnergy <= 5 ? '#FF6B6B' : '#FFB800'} />
                </Svg>
                <Text style={{ color: userEnergy <= 5 ? '#FF6B6B' : '#EAEEF3', fontWeight: '800', fontSize: 16, marginLeft: 6 }}>{userEnergy}</Text>
                <Text style={{ color: '#6B7280', fontSize: 12, marginLeft: 4 }}>énergie</Text>
              </TouchableOpacity>
            )}
            <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(74,79,85,0.4)', marginVertical: 4 }} />
            <TouchableOpacity onPress={function() { toggleDropdown(); if (onProfilePress) onProfilePress(); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#252A30', borderWidth: 1.5, borderColor: '#00D984', justifyContent: 'center', alignItems: 'center' }}>
                <Svg width={14} height={14} viewBox="0 0 24 24">
                  <Path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z" fill="#8892A0" />
                </Svg>
                <View style={{ position: 'absolute', bottom: -1, right: -1, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#00D984', borderWidth: 1.5, borderColor: '#252A30' }} />
              </View>
              <Text style={{ color: '#EAEEF3', fontSize: 13, fontWeight: '600', marginLeft: 6, flex: 1 }}>Mon Profil</Text>
              <Text style={{ color: '#6B7280', fontSize: 12 }}>→</Text>
            </TouchableOpacity>
          </RNAnimated.View>
        </TouchableOpacity>
      )}
    </View>
  );
}
