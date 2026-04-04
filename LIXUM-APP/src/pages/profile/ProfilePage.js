import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Platform, StatusBar, Modal, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  W, wp, fp,
  SUPABASE_URL, SUPABASE_ANON_KEY, TEST_USER_ID,
  CONNECTORS,
  activityLevelToIndex, activityIndexToKey,
  calculateBMR, calculateTDEE, calculateDailyTarget,
  XP_MILESTONES, getNextMilestone, getXPForLevel,
  ACTIVITY_LEVELS, DIETS, GOALS,
  T,
  getCharEmoji,
} from './profileConstants';

var ProfileScrollPicker = function(pickerProps) {
  var values = pickerProps.values, selectedValue = pickerProps.selectedValue, onSelect = pickerProps.onSelect, unit = pickerProps.unit;
  var color = pickerProps.color || '#00D984', pickerHeight = pickerProps.height || 160, ITEM_H = 40;
  var scrollRef = useRef(null);
  var initialIdx = Math.max(0, values.indexOf(selectedValue));
  useEffect(function() { var timer = setTimeout(function() { if (scrollRef.current) scrollRef.current.scrollTo({ y: initialIdx * ITEM_H, animated: false }); }, 150); return function() { clearTimeout(timer); }; }, []);
  var snapToNearest = useCallback(function(event) { var y = event.nativeEvent.contentOffset.y; var idx = Math.round(y / ITEM_H); var clamped = Math.max(0, Math.min(idx, values.length - 1)); if (values[clamped] !== selectedValue) onSelect(values[clamped]); }, [values, selectedValue, onSelect]);
  return (
    <View style={{ height: pickerHeight, borderRadius: wp(12), overflow: 'hidden', borderWidth: 1, borderColor: color + '18', backgroundColor: '#0A0E14' }}>
      <View style={{ position: 'absolute', top: pickerHeight / 2 - ITEM_H / 2, left: wp(4), right: wp(4), height: ITEM_H, borderRadius: wp(8), backgroundColor: color + '0D', zIndex: 0 }}>
        <View style={{ position: 'absolute', left: 0, top: wp(4), bottom: wp(4), width: wp(3), borderRadius: wp(2), backgroundColor: color }} />
      </View>
      <LinearGradient colors={['#0A0E14', 'rgba(10,14,20,0.5)', 'rgba(10,14,20,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: pickerHeight * 0.35, zIndex: 3 }} pointerEvents="none" />
      <LinearGradient colors={['rgba(10,14,20,0)', 'rgba(10,14,20,0.5)', '#0A0E14']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: pickerHeight * 0.35, zIndex: 3 }} pointerEvents="none" />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} snapToInterval={ITEM_H} decelerationRate={0.92} bounces={false} overScrollMode="never" nestedScrollEnabled={true} onMomentumScrollEnd={snapToNearest}
        onScrollEndDrag={function(e) { var v = e.nativeEvent.velocity; if (!v || Math.abs(v.y) < 0.1) snapToNearest(e); }}
        contentContainerStyle={{ paddingTop: pickerHeight / 2 - ITEM_H / 2, paddingBottom: pickerHeight / 2 - ITEM_H / 2 }}>
        {values.map(function(val, i) { var isSel = val === selectedValue; return (
          <View key={val + '-' + i} style={{ height: ITEM_H, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: isSel ? color : 'rgba(255,255,255,0.15)', fontSize: isSel ? fp(18) : fp(12), fontWeight: isSel ? '800' : '400' }}>{isSel ? val + ' ' + unit : String(val)}</Text>
          </View>
        ); })}
      </ScrollView>
    </View>
  );
};

export default function ProfilePage({ navigation }) {
  var _profile = useState(null), profile = _profile[0], setProfile = _profile[1];
  var _lixBalance = useState(0), lixBalance = _lixBalance[0], setLixBalance = _lixBalance[1];
  var _ownedCharacters = useState(0), ownedCharacters = _ownedCharacters[0], setOwnedCharacters = _ownedCharacters[1];
  var _userXP = useState({ user_xp: 0, user_level: 1, xp_progress: 0, xp_needed: 80, xp_percent: 0 }), userXP = _userXP[0], setUserXP = _userXP[1];
  var _activeCharSlug = useState(null), activeCharSlug = _activeCharSlug[0], setActiveCharSlug = _activeCharSlug[1];
  var _userEnergy = useState(20), userEnergy = _userEnergy[0], setUserEnergy = _userEnergy[1];
  var _showEditProfile = useState(false), showEditProfile = _showEditProfile[0], setShowEditProfile = _showEditProfile[1];
  var _showLocationPicker = useState(false), showLocationPicker = _showLocationPicker[0], setShowLocationPicker = _showLocationPicker[1];
  var _showGlossary = useState(false), showGlossary = _showGlossary[0], setShowGlossary = _showGlossary[1];
  var _showFeatures = useState(false), showFeatures = _showFeatures[0], setShowFeatures = _showFeatures[1];
  var _showSubscription = useState(false), showSubscription = _showSubscription[0], setShowSubscription = _showSubscription[1];
  var _showPrivacy = useState(false), showPrivacy = _showPrivacy[0], setShowPrivacy = _showPrivacy[1];
  var _showTerms = useState(false), showTerms = _showTerms[0], setShowTerms = _showTerms[1];
  var _showMilestones = useState(false), showMilestones = _showMilestones[0], setShowMilestones = _showMilestones[1];
  var _showLogoutConfirm = useState(false), showLogoutConfirm = _showLogoutConfirm[0], setShowLogoutConfirm = _showLogoutConfirm[1];
  var _showDeleteConfirm = useState(false), showDeleteConfirm = _showDeleteConfirm[0], setShowDeleteConfirm = _showDeleteConfirm[1];
  var _editName = useState(''), editName = _editName[0], setEditName = _editName[1];
  var _editAge = useState(''), editAge = _editAge[0], setEditAge = _editAge[1];
  var _editWeight = useState(''), editWeight = _editWeight[0], setEditWeight = _editWeight[1];
  var _editHeight = useState(''), editHeight = _editHeight[0], setEditHeight = _editHeight[1];
  var _editLocation = useState(''), editLocation = _editLocation[0], setEditLocation = _editLocation[1];
  var _lang = useState('fr'), lang = _lang[0], setLang = _lang[1];
  var _connectedApps = useState({}), connectedApps = _connectedApps[0], setConnectedApps = _connectedApps[1];
  var _toast = useState(null), toast = _toast[0], setToast = _toast[1];
  var t = T[lang] || T.fr;
  var showToast = function(message, color) { setToast({ message: message, color: color || '#00D984' }); setTimeout(function() { setToast(null); }, 2500); };
  var hdrs = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY };

  return (
    <View style={{ flex: 1, backgroundColor: '#1A1D22' }}>
      <Text style={{ color: '#FFF', padding: 20 }}>ProfilePage placeholder</Text>
    </View>
  );
}
