import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  Animated
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { hapticLight, hapticMedium, hapticSuccess, hapticError, hapticWarning } from '../../utils/haptics';
import ScrollPicker from '../../components/shared/ScrollPicker';
import GoalSelector from '../../components/shared/GoalSelector';
import TargetKgStepper from '../../components/shared/TargetKgStepper';
import PaceSelector from '../../components/shared/PaceSelector';
import PlanSummaryCard from '../../components/shared/PlanSummaryCard';
import ActivityLevelSelector from '../../components/shared/ActivityLevelSelector';
import DietarySelector from '../../components/shared/DietarySelector';
import { calculateBodyMetrics } from '../../constants/bodyMetrics';
import { useAuth } from '../../config/AuthContext';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/supabase';
import { T } from './profileConstants';

// === Helpers (hors composant pour eviter reconstruction a chaque render) ===

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

// === Composant principal ===

function EditProfilePage(props) {
  var visible = props.visible;
  var onClose = props.onClose;
  var profile = props.profile || null;
  var onSaveSuccess = props.onSaveSuccess;

  var auth = useAuth();
  var language = (auth && auth.language) || 'FR';
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

  var _saveError = useState(null);
  var saveError = _saveError[0];
  var setSaveError = _saveError[1];

  var _activeTab = useState('personal');
  var activeTab = _activeTab[0];
  var setActiveTab = _activeTab[1];

  var _goal = useState('maintain');
  var goal = _goal[0];
  var setGoal = _goal[1];

  var _targetKg = useState(5);
  var targetKg = _targetKg[0];
  var setTargetKg = _targetKg[1];

  var _paceMode = useState(1);
  var paceMode = _paceMode[0];
  var setPaceMode = _paceMode[1];

  var _activityLevel = useState('moderate');
  var activityLevel = _activityLevel[0];
  var setActivityLevel = _activityLevel[1];

  var _dietaryRegime = useState('classic');
  var dietaryRegime = _dietaryRegime[0];
  var setDietaryRegime = _dietaryRegime[1];

  // Hydration : valeur en L pour UI ("2.5 L"), conversion L->ml uniquement au PATCH
  var defaultHydroL = (profile && profile.gender === 'female') ? 2.0 : 2.5;

  var _hydroGoalL = useState(defaultHydroL);
  var hydroGoalL = _hydroGoalL[0];
  var setHydroGoalL = _hydroGoalL[1];

  var _originalHydroL = useState(defaultHydroL);
  var originalHydroL = _originalHydroL[0];
  var setOriginalHydroL = _originalHydroL[1];

  var _showHydrationMedicalModal = useState(false);
  var showHydrationMedicalModal = _showHydrationMedicalModal[0];
  var setShowHydrationMedicalModal = _showHydrationMedicalModal[1];

  var _hydrationModalType = useState('low');
  var hydrationModalType = _hydrationModalType[0];
  var setHydrationModalType = _hydrationModalType[1];

  var _bypassHydrationWarning = useState(false);
  var bypassHydrationWarning = _bypassHydrationWarning[0];
  var setBypassHydrationWarning = _bypassHydrationWarning[1];

  var _showDiscardModal = useState(false);
  var showDiscardModal = _showDiscardModal[0];
  var setShowDiscardModal = _showDiscardModal[1];

  // Animated.Value pour fade du tab switcher (useNativeDriver: false per LIXUM)
  var tabOpacity = useRef(new Animated.Value(1)).current;

  function switchTab(newTab) {
    if (newTab === activeTab) return;
    hapticLight();
    Animated.timing(tabOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false
    }).start(function() {
      setActiveTab(newTab);
      Animated.timing(tabOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false
      }).start();
    });
  }

  // Valeurs du picker : 0.5L a 5.0L step 0.1L
  var hydroValues = [];
  for (var hv = 5; hv <= 50; hv++) { hydroValues.push(hv / 10); }

  // Pre-remplissage au mount quand visible devient true
  useEffect(function() {
    if (visible && profile) {
      setName(profile.display_name || '');
      setAge(profile.age ? parseInt(profile.age, 10) : 30);
      setWeight(profile.weight ? Math.round(parseFloat(profile.weight)) : 70);
      setHeight(profile.height ? Math.round(parseFloat(profile.height)) : 170);
      setCity(profile.city || profile.location || '');
      setGoal(profile.goal || 'maintain');
      setTargetKg(profile.target_weight_loss > 0 ? Math.round(parseFloat(profile.target_weight_loss)) : 5);
      setPaceMode(typeof profile.pace_mode === 'number' ? profile.pace_mode : 1);
      setActivityLevel(profile.activity_level || 'moderate');
      setDietaryRegime(profile.dietary_regime || 'classic');
      var genderDefaultL = profile.gender === 'female' ? 2.0 : 2.5;
      var loadedHydroL = profile.custom_hydration_goal_ml
        ? (profile.custom_hydration_goal_ml / 1000)
        : genderDefaultL;
      setHydroGoalL(loadedHydroL);
      setOriginalHydroL(loadedHydroL);
      setBypassHydrationWarning(false);
      setShowHydrationMedicalModal(false);
      setFocusedField(null);
      setSaveError(null);
      setActiveTab('personal');
    }
  }, [visible, profile]);

  // IMC live
  var imc = useMemo(function() {
    return computeImc(weight, height);
  }, [weight, height]);

  var imcCategory = useMemo(function() {
    return getImcCategory(imc, t);
  }, [imc, t]);

  var imcPosition = useMemo(function() {
    return getImcPosition(imc);
  }, [imc]);

  // Calculs body metrics (BMR, TDEE, daily target, macros) pour tab Objectifs
  var calculations = useMemo(function() {
    if (!weight || !height || !age) return null;
    return calculateBodyMetrics({
      weight: weight,
      height: height,
      age: age,
      gender: (profile && profile.gender) || 'male',
      activityLevel: activityLevel,
      goal: goal,
      targetKg: targetKg,
      paceMode: paceMode
    });
  }, [weight, height, age, profile, activityLevel, goal, targetKg, paceMode]);

  // target_months dérivé (contrainte DB 1..12 après migration Sprint 5.2)
  var derivedMonths = useMemo(function() {
    if (!calculations || goal === 'maintain') return 3;
    var modes = calculations.modes;
    if (!modes) return 3;
    var modeKeys = ['ambitious', 'reasonable', 'realistic'];
    var key = modeKeys[paceMode] || 'reasonable';
    if (!modes[key] || !modes[key].days) return 3;
    return Math.max(1, Math.min(12, Math.ceil(modes[key].days / 30)));
  }, [calculations, paceMode, goal]);

  // Validations
  var nameValid = !!(name && name.trim().length > 0);
  var ageValid = age >= 10 && age <= 120;
  var weightValid = weight >= 20 && weight <= 500;
  var heightValid = height >= 50 && height <= 250;
  var goalValid = goal === 'lose' || goal === 'maintain' || goal === 'gain';
  var isFormValid = nameValid && ageValid && weightValid && heightValid && goalValid;

  async function handleSave(forceBypass) {
    if (isSaving || !isFormValid) return;
    // Gate médical hydration : modal si hors [1.5, 3.5] L (sauf bypass explicite)
    var shouldBypass = forceBypass === true || bypassHydrationWarning;
    if (!shouldBypass) {
      if (hydroGoalL < 1.5) {
        hapticWarning();
        setHydrationModalType('low');
        setShowHydrationMedicalModal(true);
        return;
      }
      if (hydroGoalL > 3.5) {
        hapticWarning();
        setHydrationModalType('high');
        setShowHydrationMedicalModal(true);
        return;
      }
    }
    hapticMedium();
    setIsSaving(true);
    setSaveError(null);
    try {
      var userId = auth && auth.userId;
      if (!userId) {
        setSaveError(t.editProfileSaveError);
        setIsSaving(false);
        return;
      }
      var session = await supabase.auth.getSession();
      var accessToken = session && session.data && session.data.session ? session.data.session.access_token : SUPABASE_ANON_KEY;
      // Hydration : null si valeur par défaut gender-aware, sinon conversion L->ml
      var hydroMl = null;
      if (hydroGoalL !== defaultHydroL) {
        hydroMl = Math.round(hydroGoalL * 1000);
      }
      var body = {
        display_name: name.trim(),
        age: age,
        weight: weight,
        height: height,
        city: city.trim(),
        goal: goal,
        activity_level: activityLevel,
        target_weight_loss: goal === 'maintain' ? 0 : targetKg,
        pace_mode: paceMode,
        target_months: derivedMonths,
        daily_calorie_target: calculations ? calculations.dailyTarget : null,
        bmr: calculations ? Math.round(calculations.bmr) : null,
        tdee: calculations ? Math.round(calculations.tdee) : null,
        custom_hydration_goal_ml: hydroMl,
        dietary_regime: dietaryRegime
      };
      var res = await fetch(
        SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + userId,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(body)
        }
      );
      if (!res.ok) {
        throw new Error('PATCH failed: ' + res.status);
      }
      var data = await res.json();
      setIsSaving(false);
      hapticSuccess();
      // Reset hydration baseline + bypass flag apres save reussi
      setOriginalHydroL(hydroGoalL);
      setBypassHydrationWarning(false);
      if (onSaveSuccess && data && data[0]) {
        onSaveSuccess(data[0]);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.warn('EditProfilePage saveProfile error:', err);
      hapticError();
      setSaveError(t.editProfileSaveError);
      setIsSaving(false);
    }
  }

  // Detecte si l'utilisateur a modifie un champ par rapport aux valeurs DB d'origine
  function hasModifications() {
    if (!profile) return false;
    var origName = profile.display_name || '';
    var origAge = profile.age ? parseInt(profile.age, 10) : 30;
    var origWeight = profile.weight ? Math.round(parseFloat(profile.weight)) : 70;
    var origHeight = profile.height ? Math.round(parseFloat(profile.height)) : 170;
    var origCity = profile.city || profile.location || '';
    var origGoal = profile.goal || 'maintain';
    var origTargetKg = profile.target_weight_loss > 0 ? Math.round(parseFloat(profile.target_weight_loss)) : 5;
    var origPaceMode = typeof profile.pace_mode === 'number' ? profile.pace_mode : 1;
    var origActivityLevel = profile.activity_level || 'moderate';
    var origDietaryRegime = profile.dietary_regime || 'classic';
    if (name.trim() !== origName) return true;
    if (age !== origAge) return true;
    if (weight !== origWeight) return true;
    if (height !== origHeight) return true;
    if (city.trim() !== origCity) return true;
    if (goal !== origGoal) return true;
    if (targetKg !== origTargetKg) return true;
    if (paceMode !== origPaceMode) return true;
    if (activityLevel !== origActivityLevel) return true;
    if (hydroGoalL !== originalHydroL) return true;
    if (dietaryRegime !== origDietaryRegime) return true;
    return false;
  }

  function handleCancel() {
    if (isSaving) return;
    // Garde: si modal medical hydratation ouverte, ne pas fermer parente
    if (showHydrationMedicalModal) {
      hapticWarning();
      return;
    }
    if (hasModifications()) {
      hapticWarning();
      setShowDiscardModal(true);
      return;
    }
    hapticLight();
    if (onClose) {
      onClose();
    }
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
          {/* [A] Header premium (fixe hors scroll) */}
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

          {/* [B] Disclaimer */}
          <Text style={{ color: '#8892A0', fontSize: 12, marginBottom: 14, marginLeft: 68, paddingHorizontal: 20 }}>
            {'🔒 ' + t.editProfileSubtitle}
          </Text>

          {/* [B bis] Tabs switcher */}
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
              onPress={function() { switchTab('personal'); }}
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
              onPress={function() { switchTab('goals'); }}
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
            <Animated.View style={{ opacity: tabOpacity }}>
            {activeTab === 'personal' ? (
              <View>
            {/* [C] Section IDENTITÉ */}
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

            {/* [D] Section CORPS avec 3 ScrollPickers */}
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

              {/* [E] IMC live */}
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

                  {/* Barre 4 segments + curseur */}
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

            {/* [F] Section LOCALISATION */}
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
                {/* Section OBJECTIF */}
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
                    onChange={function(val) { hapticLight(); setGoal(val); }}
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

                {/* Cas goal !== 'maintain' : TargetKg + Pace + Plan */}
                {goal && goal !== 'maintain' ? (
                  <View>
                    {/* Section POIDS CIBLE */}
                    <Text style={{
                      color: '#00D984',
                      fontSize: 11,
                      fontWeight: '700',
                      letterSpacing: 1.2,
                      marginBottom: 10
                    }}>
                      {t.editProfileSectionTargetKg}
                    </Text>
                    <View style={{
                      backgroundColor: '#10151D',
                      borderWidth: 1,
                      borderColor: '#1f2a36',
                      borderRadius: 14,
                      padding: 4,
                      marginBottom: 16
                    }}>
                      <TargetKgStepper
                        value={targetKg}
                        onChange={function(val) { hapticLight(); setTargetKg(val); }}
                        goal={goal}
                        language={language}
                      />
                    </View>

                    {/* Section RYTHME */}
                    <Text style={{
                      color: '#00D984',
                      fontSize: 11,
                      fontWeight: '700',
                      letterSpacing: 1.2,
                      marginBottom: 10
                    }}>
                      {t.editProfileSectionPace}
                    </Text>
                    <View style={{
                      backgroundColor: '#10151D',
                      borderWidth: 1,
                      borderColor: '#1f2a36',
                      borderRadius: 14,
                      padding: 14,
                      marginBottom: 16
                    }}>
                      <PaceSelector
                        value={paceMode}
                        onChange={function(val) { hapticLight(); setPaceMode(val); }}
                        calculations={calculations}
                        language={language}
                      />
                    </View>

                    {/* Section VOTRE PLAN */}
                    {calculations ? (
                      <PlanSummaryCard
                        calculations={calculations}
                        language={language}
                      />
                    ) : null}
                  </View>
                ) : null}

                {/* Cas goal === 'maintain' : carte Maintien équilibré */}
                {goal === 'maintain' ? (
                  <View style={{
                    backgroundColor: '#10151D',
                    borderWidth: 1,
                    borderColor: '#00D984',
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 16
                  }}>
                    <Text style={{
                      color: '#00D984',
                      fontSize: 14,
                      fontWeight: '700',
                      marginBottom: 8
                    }}>
                      {t.editProfileMaintainTitle}
                    </Text>
                    <Text style={{ color: '#ccc', fontSize: 12, lineHeight: 18 }}>
                      {t.editProfileMaintainBody}
                    </Text>
                  </View>
                ) : null}

                {/* Section NIVEAU D'ACTIVITÉ (toujours visible) */}
                <Text style={{
                  color: '#00D984',
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 1.2,
                  marginBottom: 10
                }}>
                  {t.editProfileSectionActivity}
                </Text>
                <View style={{
                  backgroundColor: '#10151D',
                  borderWidth: 1,
                  borderColor: '#1f2a36',
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 16
                }}>
                  <ActivityLevelSelector
                    value={activityLevel}
                    onChange={function(val) { hapticLight(); setActivityLevel(val); }}
                    language={language}
                  />
                </View>

                {/* Section HYDRATATION */}
                <Text style={{
                  color: '#00D984',
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 1.2,
                  marginBottom: 10
                }}>
                  {t.editProfileSectionHydration}
                </Text>
                <View style={{
                  backgroundColor: '#10151D',
                  borderWidth: 1,
                  borderColor: '#1f2a36',
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 16
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <ScrollPicker
                        variant="compact"
                        values={hydroValues}
                        selectedValue={hydroGoalL}
                        onSelect={function(val) { hapticLight(); setHydroGoalL(val); }}
                        unit="L"
                        color="#4DA6FF"
                        height={140}
                      />
                    </View>
                    <View style={{ marginLeft: 16, alignItems: 'center' }}>
                      <Text style={{ fontSize: 28, fontWeight: '800', color: '#4DA6FF' }}>
                        {hydroGoalL.toFixed(1)}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#8A8F98' }}>L</Text>
                      {hydroGoalL === defaultHydroL ? (
                        <View style={{ marginTop: 6, backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                          <Text style={{ fontSize: 9, fontWeight: '700', color: '#00D984' }}>
                            {t.editProfileHydrationRecommended}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <Text style={{ color: '#8892A0', fontSize: 11, marginTop: 10, fontStyle: 'italic', lineHeight: 16 }}>
                    {t.editProfileCaptionHydration}
                  </Text>
                </View>

                {/* Section RÉGIME ALIMENTAIRE */}
                <Text style={{
                  color: '#00D984',
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 1.2,
                  marginBottom: 10
                }}>
                  {t.editProfileSectionDietaryRegime}
                </Text>
                <View style={{
                  backgroundColor: '#10151D',
                  borderWidth: 1,
                  borderColor: '#1f2a36',
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 16
                }}>
                  <DietarySelector
                    value={dietaryRegime}
                    onChange={function(val) { hapticLight(); setDietaryRegime(val); }}
                    language={language}
                  />
                </View>
              </View>
            ) : null}
            </Animated.View>
          </ScrollView>

          {/* Erreur save (fixe au-dessus des boutons) */}
          {saveError ? (
            <View style={{
              backgroundColor: 'rgba(255,107,107,0.08)',
              borderWidth: 1,
              borderColor: 'rgba(255,107,107,0.3)',
              borderRadius: 10,
              padding: 10,
              marginHorizontal: 20,
              marginBottom: 10
            }}>
              <Text style={{ color: '#FF6B6B', fontSize: 12, textAlign: 'center' }}>
                {saveError}
              </Text>
            </View>
          ) : null}

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
              onPress={handleSave}
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

      {/* Modal avertissement médical hydratation (valeur hors [1.5, 3.5] L au save) */}
      <Modal
        visible={showHydrationMedicalModal}
        transparent={true}
        animationType="fade"
        onRequestClose={function() {
          setHydroGoalL(originalHydroL);
          setShowHydrationMedicalModal(false);
        }}
      >
        <Pressable
          onPress={function() {
            setHydroGoalL(originalHydroL);
            setShowHydrationMedicalModal(false);
          }}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}
        >
          <Pressable onPress={function() {}} style={{ width: '100%', maxWidth: 320, borderRadius: 20, padding: 24, overflow: 'hidden' }}>
            <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 }} />
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,68,68,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, color: '#FF4444' }}>⚕</Text>
              </View>
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '800', textAlign: 'center', marginTop: 16 }}>Avertissement médical</Text>
              <Text style={{ color: '#C0C4CC', fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 12 }}>
                {hydrationModalType === 'low'
                  ? 'Un objectif inférieur à 1.5L est généralement prescrit pour des conditions médicales spécifiques (insuffisance cardiaque, insuffisance rénale). Consultez votre médecin avant de modifier cet objectif.'
                  : 'Un apport supérieur à 3.5L par jour peut entraîner une hyponatrémie (baisse dangereuse du sodium sanguin). Consultez votre médecin.'}
              </Text>
              <Text style={{ color: '#666', fontSize: 10, fontStyle: 'italic', marginTop: 8 }}>Sources : EFSA 2010, NIH StatPearls 2025</Text>
              <View style={{ flexDirection: 'row', marginTop: 20, gap: 12 }}>
                <Pressable
                  delayPressIn={120}
                  onPress={function() {
                    hapticLight();
                    setHydroGoalL(originalHydroL);
                    setShowHydrationMedicalModal(false);
                  }}
                  style={{ flex: 1, borderWidth: 1, borderColor: '#4A4F55', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
                >
                  <Text style={{ color: '#8A8F98', fontSize: 14, fontWeight: '600' }}>Annuler</Text>
                </Pressable>
                <Pressable
                  delayPressIn={120}
                  onPress={function() {
                    hapticMedium();
                    setBypassHydrationWarning(true);
                    setShowHydrationMedicalModal(false);
                    handleSave(true);
                  }}
                  style={{ flex: 1, backgroundColor: '#00D984', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginLeft: 12 }}
                >
                  <Text style={{ color: '#000', fontSize: 14, fontWeight: '700' }}>Je confirme</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal discard : confirmation avant fermeture si modifs non sauvegardees */}
      <Modal
        visible={showDiscardModal}
        transparent={true}
        animationType="fade"
        onRequestClose={function() { setShowDiscardModal(false); }}
      >
        <Pressable
          onPress={function() { setShowDiscardModal(false); }}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}
        >
          <Pressable onPress={function() {}} style={{ width: '100%', maxWidth: 320, borderRadius: 20, padding: 24, overflow: 'hidden' }}>
            <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 }} />
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,140,66,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="warning" size={26} color="#FF8C42" />
              </View>
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '800', textAlign: 'center', marginTop: 16 }}>
                {t.editProfileDiscardTitle}
              </Text>
              <Text style={{ color: '#C0C4CC', fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 12 }}>
                {t.editProfileDiscardBody}
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 20, gap: 12 }}>
                <Pressable
                  delayPressIn={120}
                  onPress={function() {
                    hapticLight();
                    setShowDiscardModal(false);
                  }}
                  style={{ flex: 1, borderWidth: 1, borderColor: '#4A4F55', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
                >
                  <Text style={{ color: '#8A8F98', fontSize: 14, fontWeight: '600' }}>
                    {t.editProfileDiscardCancel}
                  </Text>
                </Pressable>
                <Pressable
                  delayPressIn={120}
                  onPress={function() {
                    hapticMedium();
                    setShowDiscardModal(false);
                    if (onClose) onClose();
                  }}
                  style={{ flex: 1, backgroundColor: '#FF8C42', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginLeft: 12 }}
                >
                  <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700' }}>
                    {t.editProfileDiscardConfirm}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Modal>
  );
}

export default EditProfilePage;
