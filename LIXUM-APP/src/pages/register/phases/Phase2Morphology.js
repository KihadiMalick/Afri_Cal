import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../registerConstants';
import { ScrollPicker } from '../registerComponents';

function Phase2Morphology({ formData, setFormData, t, lang }) {
  var fd = formData;
  var _uw = useState('kg'), uw = _uw[0], suw = _uw[1];
  var _uh = useState('cm'), uh = _uh[0], suh = _uh[1];
  function u(k, v) { setFormData(function(prev) { var n = Object.assign({}, prev); n[k] = v; return n; }); }

  function unitSwitch(l, r, val, onChange) {
    return (
      <View style={{ flexDirection: 'row', alignSelf: 'center', borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(62,72,85,0.3)', marginBottom: 8 }}>
        <TouchableOpacity onPress={function() { onChange(l.key); }}>
          <View style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: val === l.key ? 'rgba(0,217,132,0.15)' : 'transparent' }}>
            <Text style={{ color: val === l.key ? '#00D984' : '#555E6C', fontSize: 9, fontWeight: '700', letterSpacing: 1 }}>{l.label}</Text>
          </View>
        </TouchableOpacity>
        <View style={{ width: 1, backgroundColor: 'rgba(62,72,85,0.3)' }} />
        <TouchableOpacity onPress={function() { onChange(r.key); }}>
          <View style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: val === r.key ? 'rgba(0,217,132,0.15)' : 'transparent' }}>
            <Text style={{ color: val === r.key ? '#00D984' : '#555E6C', fontSize: 9, fontWeight: '700', letterSpacing: 1 }}>{r.label}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  var wVals = uw === 'kg' ? Array.from({ length: 171 }, function(_, i) { return 30 + i; }) : Array.from({ length: 371 }, function(_, i) { return 66 + i; });
  var hVals = uh === 'cm' ? Array.from({ length: 101 }, function(_, i) { return 120 + i; }) : Array.from({ length: 49 }, function(_, i) { return 48 + i; });
  var aVals = Array.from({ length: 83 }, function(_, i) { return 12 + i; });

  return (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2, paddingLeft: 30, paddingRight: 4 }}>
        <View style={{ flex: 1, alignItems: 'center' }}><Text style={{ color: '#EAEEF3', fontSize: 12, fontWeight: '800', letterSpacing: 3 }}>{t.weightLabel}</Text></View>
        <View style={{ flex: 1, alignItems: 'center' }}><Text style={{ color: '#EAEEF3', fontSize: 12, fontWeight: '800', letterSpacing: 3 }}>{t.heightLabel}</Text></View>
        <View style={{ flex: 0.8, alignItems: 'center' }}><Text style={{ color: '#EAEEF3', fontSize: 12, fontWeight: '800', letterSpacing: 3 }}>{t.ageLabel}</Text></View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, paddingLeft: 30, paddingRight: 4 }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          {unitSwitch({ key: 'kg', label: 'KG' }, { key: 'lb', label: 'LB' }, uw, function(nu) {
            if (nu !== uw) { var cv = parseFloat(fd.weight) || 70; u('weight', String(nu === 'lb' ? Math.round(cv * 2.205) : Math.round(cv / 2.205))); suw(nu); }
          })}
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          {unitSwitch({ key: 'cm', label: 'CM' }, { key: 'in', label: 'IN' }, uh, function(nu) {
            if (nu !== uh) { var cv = parseFloat(fd.height) || 175; u('height', String(nu === 'in' ? Math.round(cv / 2.54) : Math.round(cv * 2.54))); suh(nu); }
          })}
        </View>
        <View style={{ flex: 0.8, alignItems: 'center' }}><View style={{ height: 26 }} /></View>
      </View>
      <View style={{ flexDirection: 'row', flex: 1, maxHeight: 300 }}>
        <View style={{ width: 22, justifyContent: 'center', alignItems: 'center', marginRight: 6 }}>
          <Ionicons name="chevron-up" size={16} color="#8892A0" style={{ marginBottom: 8 }} />
          <View style={{ width: 2, height: 40, borderRadius: 1, backgroundColor: 'rgba(136,146,160,0.25)' }} />
          <Ionicons name="chevron-down" size={16} color="#8892A0" style={{ marginTop: 8 }} />
        </View>
        <View style={{ flex: 1 }}><ScrollPicker values={wVals} selectedValue={parseInt(fd.weight) || (uw === 'kg' ? 70 : 154)} onSelect={function(v) { u('weight', String(v)); }} unit={uw} color="#00D984" height={280} /></View>
        <View style={{ width: 8 }} />
        <View style={{ flex: 1 }}><ScrollPicker values={hVals} selectedValue={parseInt(fd.height) || (uh === 'cm' ? 175 : 69)} onSelect={function(v) { u('height', String(v)); }} unit={uh} color="#00BFA6" height={280} /></View>
        <View style={{ width: 8 }} />
        <View style={{ flex: 0.8 }}><ScrollPicker values={aVals} selectedValue={parseInt(fd.age) || 25} onSelect={function(v) { u('age', String(v)); }} unit={lang === 'fr' ? 'ans' : 'y'} color="#D4AF37" height={280} /></View>
      </View>
      <Text style={{ color: '#EAEEF3', fontSize: 12, fontWeight: '800', letterSpacing: 3, textAlign: 'center', marginTop: 16, marginBottom: 12 }}>SEXE</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 10 }}>
        {[
          { key: 'male', icon: 'male', label: lang === 'fr' ? 'Homme' : 'Male', color: '#4A90D9', bg: ['#4A90D9', '#2E6BB5'] },
          { key: 'female', icon: 'female', label: lang === 'fr' ? 'Femme' : 'Female', color: '#E875A0', bg: ['#E875A0', '#C95A82'] },
        ].map(function(g) {
          var sel = fd.gender === g.key;
          return (
            <TouchableOpacity key={g.key} onPress={function() { u('gender', g.key); }} activeOpacity={0.7}>
              <View style={{ alignItems: 'center' }}>
                {sel ? <View style={{ position: 'absolute', top: -3, left: -3, right: -3, bottom: -22, borderRadius: 43, borderWidth: 1.5, borderColor: g.color + '35' }} /> : null}
                <View style={{ width: 76, height: 76, borderRadius: 38, overflow: 'hidden', borderWidth: sel ? 0 : 1.5, borderColor: 'rgba(62,72,85,0.3)' }}>
                  {sel ? (
                    <LinearGradient colors={g.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={g.icon} size={30} color="#FFFFFF" />
                    </LinearGradient>
                  ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0E14' }}>
                      <Ionicons name={g.icon} size={26} color="#555E6C" />
                    </View>
                  )}
                </View>
                <Text style={{ color: sel ? g.color : '#555E6C', fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 6 }}>{g.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default Phase2Morphology;
