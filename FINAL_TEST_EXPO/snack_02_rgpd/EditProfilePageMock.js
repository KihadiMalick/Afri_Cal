import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScrollPicker from './shared/ScrollPicker';
import GoalSelector from './shared/GoalSelector';
import { T } from './mockT';

// Helpers identiques a la prod (hors composant)

function buildAgeValues() {
  var arr = [];
  var i;
  for (i = 12; i <= 94; i++) {
    arr.push(i);
  }
  return arr;
}

function buildWeightValues() {
  var arr = [];
  var i;
  for (i = 30; i <= 200; i++) {
    arr.push(i);
  }
  return arr;
}

function buildHeightValues() {
  var arr = [];
  var i;
  for (i = 120; i <= 220; i++) {
    arr.push(i);
  }
  return arr;
}

var AGE_VALUES = buildAgeValues();
var WEIGHT_VALUES = buildWeightValues();
var HEIGHT_VALUES = buildHeightValues();

function computeImc(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  var m = heightCm / 100;
  var imc = weightKg / (m * m);
  return Math.round(imc * 10) / 10;
}

function getImcCategory(imc, t) {
  if (imc === null || typeof imc === 'undefined') return null;
  if (imc < 18.5) return { label: t.editProfileImcUnderweight, color: '#4DA6FF' };
  if (imc < 25) return { label: t.editProfileImcNormal, color: '#00D984' };
  if (imc < 30) return { label: t.editProfileImcOverweight, color: '#FFA500' };
  return { label: t.editProfileImcObese, color: '#FF6B6B' };
}

function getImcPosition(imc) {
  if (imc === null || typeof imc === 'undefined') return 0;
  var clamped = Math.max(15, Math.min(40, imc));
  return ((clamped - 15) / (40 - 15)) * 100;
}

function EditProfilePageMock(props) {
  var visible = props.visible;
  var onClose = props.onClose;
  var profile = props.profile || null;
  var language = props.language || 'FR';
  var t = language === 'EN' ? T.en : T.fr;

  var _name = useState('');
  var name = _name[0];
  var setName = _name[1];

  var _age = useState(30);
  var age = _age[0];
  var setAge = _age[1];

  var _weight = useState(70);
  var weight = _weight[0];
  var setWeight = _weight[1];

  var _height = useState(170);
  var height = _height[0];
  var setHeight = _height[1];

  var _city = useState('');
  var city = _city[0];
  var setCity = _city[1];

  var _focusedField = useState(null);
  var focusedField = _focusedField[0];
  var setFocusedField = _focusedField[1];

  var _isSaving = useState(false);
  var isSaving = _isSaving[0];
  var setIsSaving = _isSaving[1];

  var _activeTab = useState('personal');
  var activeTab = _activeTab[0];
  var setActiveTab = _activeTab[1];

  var _goal = useState('maintain');
  var goal = _goal[0];
  var setGoal = _goal[1];

  useEffect(function() {
    if (visible && profile) {
      setName(profile.display_name || '');
      setAge(profile.age ? parseInt(profile.age, 10) : 30);
      setWeight(profile.weight ? Math.round(parseFloat(profile.weight)) : 70);
      setHeight(profile.height ? Math.round(parseFloat(profile.height)) : 170);
      setCity(profile.city || profile.location || '');
      setGoal(profile.goal || 'maintain');
      setFocusedField(null);
      setActiveTab('personal');
    }
  }, [visible, profile]);

  var imc = useMemo(function() {
    return computeImc(weight, height);
  }, [weight, height]);

  var imcCategory = useMemo(function() {
    return getImcCategory(imc, t);
  }, [imc, t]);

  var imcPosition = useMemo(function() {
    return getImcPosition(imc);
  }, [imc]);

  var nameValid = !!(name && name.trim().length > 0);
  var ageValid = age >= 10 && age <= 120;
  var weightValid = weight >= 20 && weight <= 500;
  var heightValid = height >= 50 && height <= 250;
  var goalValid = goal === 'lose' || goal === 'maintain' || goal === 'gain';
  var isFormValid = nameValid && ageValid && weightValid && heightValid && goalValid;

  function handleSaveMock() {
    if (isSaving || !isFormValid) return;
    setIsSaving(true);
    setTimeout(function() {
      console.log('MOCK SAVE:', {
        display_name: name.trim(),
        age: age,
        weight: weight,
        height: height,
        city: city.trim(),
        goal: goal,
        imc: imc
      });
      setIsSaving(false);
      if (onClose) onClose();
    }, 800);
  }

  function handleCancel() {
    if (isSaving) return;
    if (onClose) onClose();
  }

  var avatarInitial = ((name && name.charAt(0)) || 'U').toUpperCase();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)' }}>
        <Pressable style={{ flex: 1 }} onPress={handleCancel} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            backgroundColor: '#0A0E14',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: '88%',
            borderTopWidth: 1,
            borderTopColor: '#1a3a2f'
          }}
        >
          {/* Header premium (fixe hors scroll) */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, marginBottom: 14 }}>
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(77,166,255,0.12)',
              borderWidth: 1.5,
              borderColor: 'rgba(0,217,132,0.35)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Text style={{ color: '#4DA6FF', fontWeight: '900', fontSize: 16 }}>
                {avatarInitial}
              </Text>
            </View>
            <Text style={{ flex: 1, color: '#FFFFFF', fontSize: 19, fontWeight: '800' }}>
              {t.editProfileTitle}
            </Text>
            <Pressable
              onPress={handleCancel}
              style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
            >
              <Svg width={22} height={22} viewBox="0 0 24 24">
                <Path d="M6 6 L18 18 M18 6 L6 18" stroke="#8892A0" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </Pressable>
          </View>

          {/* Disclaimer */}
          <Text style={{ color: '#8892A0', fontSize: 12, marginBottom: 14, marginLeft: 68, paddingHorizontal: 20 }}>
            {'🔒 ' + t.editProfileSubtitle}
          </Text>

          {/* Tabs switcher */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: '#10151D',
            borderRadius: 12,
            padding: 4,
            marginHorizontal: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#1f2a36'
          }}>
            <Pressable
              onPress={function() { setActiveTab('personal'); }}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: activeTab === 'personal' ? '#00D984' : 'transparent'
              }}
            >
              <Ionicons
                name="person-outline"
                size={16}
                color={activeTab === 'personal' ? '#000' : '#8892A0'}
                style={{ marginRight: 6 }}
              />
              <Text style={{
                color: activeTab === 'personal' ? '#000' : '#8892A0',
                fontSize: 13,
                fontWeight: activeTab === 'personal' ? '700' : '500'
              }}>
                {t.editProfileTabPersonal}
              </Text>
            </Pressable>
            <Pressable
              onPress={function() { setActiveTab('goals'); }}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: activeTab === 'goals' ? '#00D984' : 'transparent'
              }}
            >
              <Ionicons
                name="flag-outline"
                size={16}
                color={activeTab === 'goals' ? '#000' : '#8892A0'}
                style={{ marginRight: 6 }}
              />
              <Text style={{
                color: activeTab === 'goals' ? '#000' : '#8892A0',
                fontSize: 13,
                fontWeight: activeTab === 'goals' ? '700' : '500'
              }}>
                {t.editProfileTabGoals}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'personal' ? (
              <View>
            {/* Section IDENTITE */}
            <Text style={{
              color: '#00D984',
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1.2,
              marginBottom: 10
            }}>
              {t.editProfileSectionIdentity}
            </Text>
            <View style={{
              backgroundColor: '#10151D',
              borderWidth: 1,
              borderColor: '#1f2a36',
              borderRadius: 14,
              padding: 14,
              marginBottom: 22
            }}>
              <Text style={{ color: '#EAEEF3', fontSize: 12, marginBottom: 6 }}>
                {t.editProfileLabelName}
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                onFocus={function() { setFocusedField('name'); }}
                onBlur={function() { setFocusedField(null); }}
                autoCapitalize="words"
                placeholder={t.editProfilePlaceholderName}
                placeholderTextColor="#555E6C"
                style={{
                  backgroundColor: '#0A0E14',
                  borderWidth: 1,
                  borderColor: focusedField === 'name' ? '#00D984' : (nameValid ? '#2a3440' : '#FF6B6B'),
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: '#FFFFFF',
                  fontSize: 15
                }}
              />
              <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 6 }}>
                {t.editProfileCaptionName}
              </Text>
              {!nameValid && name.length > 0 ? (
                <Text style={{ color: '#FF6B6B', fontSize: 11, marginTop: 4 }}>
                  {t.editProfileNameEmpty}
                </Text>
              ) : null}
            </View>

            {/* Section CORPS avec 3 ScrollPickers + IMC live */}
            <Text style={{
              color: '#00D984',
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1.2,
              marginBottom: 10
            }}>
              {t.editProfileSectionBody}
            </Text>
            <View style={{
              backgroundColor: '#10151D',
              borderWidth: 1,
              borderColor: '#1f2a36',
              borderRadius: 14,
              padding: 14,
              marginBottom: 22
            }}>
              <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                <Text style={{ flex: 1, color: '#8892A0', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center' }}>
                  {t.editProfileLabelAge}
                </Text>
                <Text style={{ flex: 1, color: '#8892A0', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center' }}>
                  {t.editProfileLabelWeight}
                </Text>
                <Text style={{ flex: 1, color: '#8892A0', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center' }}>
                  {t.editProfileLabelHeight}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <ScrollPicker
                    variant="large"
                    values={AGE_VALUES}
                    selectedValue={age}
                    onSelect={setAge}
                    unit={language === 'EN' ? 'y' : 'ans'}
                    color="#D4AF37"
                    height={180}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ScrollPicker
                    variant="large"
                    values={WEIGHT_VALUES}
                    selectedValue={weight}
                    onSelect={setWeight}
                    unit="kg"
                    color="#00D984"
                    height={180}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ScrollPicker
                    variant="large"
                    values={HEIGHT_VALUES}
                    selectedValue={height}
                    onSelect={setHeight}
                    unit="cm"
                    color="#00BFA6"
                    height={180}
                  />
                </View>
              </View>

              {imc !== null && imcCategory ? (
                <View style={{
                  marginTop: 16,
                  backgroundColor: '#0A0E14',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: imcCategory.color + '40',
                  padding: 14,
                  overflow: 'hidden'
                }}>
                  <LinearGradient
                    colors={[imcCategory.color + '12', imcCategory.color + '04', 'transparent']}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    pointerEvents="none"
                  />
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ color: '#00D984', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 }}>
                      {t.editProfileImcLabel}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                      <Text style={{ color: imcCategory.color, fontSize: 26, fontWeight: '900' }}>
                        {imc.toFixed(1)}
                      </Text>
                      <Text style={{ color: '#6B7280', fontSize: 11, marginLeft: 4 }}>
                        {'kg/m²'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{
                      backgroundColor: imcCategory.color + '20',
                      borderWidth: 1,
                      borderColor: imcCategory.color + '60',
                      borderRadius: 14,
                      paddingHorizontal: 12,
                      paddingVertical: 4
                    }}>
                      <Text style={{ color: imcCategory.color, fontSize: 11, fontWeight: '700' }}>
                        {imcCategory.label}
                      </Text>
                    </View>
                  </View>

                  <View style={{ height: 8, borderRadius: 4, overflow: 'hidden', flexDirection: 'row', marginBottom: 8 }}>
                    <View style={{ flex: 3.5, backgroundColor: '#4DA6FF', opacity: 0.35 }} />
                    <View style={{ flex: 6.5, backgroundColor: '#00D984', opacity: 0.35 }} />
                    <View style={{ flex: 5, backgroundColor: '#FFA500', opacity: 0.35 }} />
                    <View style={{ flex: 10, backgroundColor: '#FF6B6B', opacity: 0.35 }} />
                  </View>
                  <View style={{ position: 'relative', height: 12, marginBottom: 6 }}>
                    <View style={{
                      position: 'absolute',
                      left: imcPosition + '%',
                      marginLeft: -6,
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: imcCategory.color,
                      borderWidth: 2,
                      borderColor: '#0A0E14'
                    }} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#555E6C', fontSize: 10 }}>{'15'}</Text>
                    <Text style={{ color: '#555E6C', fontSize: 10 }}>{'18.5'}</Text>
                    <Text style={{ color: '#555E6C', fontSize: 10 }}>{'25'}</Text>
                    <Text style={{ color: '#555E6C', fontSize: 10 }}>{'30'}</Text>
                    <Text style={{ color: '#555E6C', fontSize: 10 }}>{'40'}</Text>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Section LOCALISATION */}
            <Text style={{
              color: '#00D984',
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1.2,
              marginBottom: 10
            }}>
              {t.editProfileSectionLocation}
            </Text>
            <View style={{
              backgroundColor: '#10151D',
              borderWidth: 1,
              borderColor: '#1f2a36',
              borderRadius: 14,
              padding: 14,
              marginBottom: 22
            }}>
              <Text style={{ color: '#EAEEF3', fontSize: 12, marginBottom: 6 }}>
                {t.editProfileLabelCity}
              </Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                onFocus={function() { setFocusedField('city'); }}
                onBlur={function() { setFocusedField(null); }}
                autoCapitalize="words"
                placeholder={t.editProfilePlaceholderCity}
                placeholderTextColor="#555E6C"
                style={{
                  backgroundColor: '#0A0E14',
                  borderWidth: 1,
                  borderColor: focusedField === 'city' ? '#00D984' : '#2a3440',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: '#FFFFFF',
                  fontSize: 15
                }}
              />
            </View>
              </View>
            ) : null}

            {activeTab === 'goals' ? (
              <View>
                <Text style={{
                  color: '#00D984',
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 1.2,
                  marginBottom: 10
                }}>
                  {t.editProfileSectionGoal}
                </Text>
                <View style={{
                  backgroundColor: '#10151D',
                  borderWidth: 1,
                  borderColor: '#1f2a36',
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 16
                }}>
                  <GoalSelector
                    value={goal}
                    onChange={setGoal}
                    language={language}
                  />
                  <Text style={{
                    color: '#555E6C',
                    fontSize: 11,
                    marginTop: 12,
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}>
                    {t.editProfileGoalCaption}
                  </Text>
                </View>

                {/* Hydration : Etape 6 */}
              </View>
            ) : null}
          </ScrollView>

          {/* Boutons globaux (fixes hors scroll) */}
          <View style={{
            flexDirection: 'row',
            gap: 12,
            paddingHorizontal: 20,
            paddingVertical: 14,
            paddingBottom: Platform.OS === 'ios' ? 28 : 14,
            borderTopWidth: 1,
            borderTopColor: '#1f2a36',
            backgroundColor: '#0A0E14'
          }}>
            <Pressable
              onPress={handleCancel}
              disabled={isSaving}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                borderWidth: 1.2,
                borderColor: '#3E4855',
                backgroundColor: '#10151D',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isSaving ? 0.5 : 1
              }}
            >
              <Text style={{ color: '#CCCCCC', fontSize: 15, fontWeight: '600' }}>
                {t.editProfileCancelButton}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSaveMock}
              disabled={!isFormValid || isSaving}
              style={{
                flex: 1.2,
                height: 52,
                borderRadius: 12,
                backgroundColor: (isFormValid && !isSaving) ? '#00D984' : '#1f3a2f',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: (isFormValid && !isSaving) ? 1 : 0.55
              }}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text style={{ color: '#000000', fontSize: 15, fontWeight: '800' }}>
                  {t.editProfileSaveButton}
                </Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default EditProfilePageMock;
