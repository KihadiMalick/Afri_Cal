import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

function EditProfilePageMock(props) {
  var visible = props.visible;
  var onClose = props.onClose;
  var profile = props.profile || {};

  var _editName = useState('');
  var editName = _editName[0];
  var setEditName = _editName[1];

  var _editAge = useState('');
  var editAge = _editAge[0];
  var setEditAge = _editAge[1];

  var _editWeight = useState('');
  var editWeight = _editWeight[0];
  var setEditWeight = _editWeight[1];

  var _editHeight = useState('');
  var editHeight = _editHeight[0];
  var setEditHeight = _editHeight[1];

  var _editLocation = useState('');
  var editLocation = _editLocation[0];
  var setEditLocation = _editLocation[1];

  var _focusedField = useState(null);
  var focusedField = _focusedField[0];
  var setFocusedField = _focusedField[1];

  // Pre-remplissage au mount (clone useEffect prod l.166-174)
  useEffect(function() {
    if (visible && profile) {
      setEditName(profile.display_name || '');
      setEditAge(profile.age ? String(profile.age) : '');
      setEditWeight(profile.weight ? String(profile.weight) : '');
      setEditHeight(profile.height ? String(profile.height) : '');
      setEditLocation(profile.city || profile.location || '');
    }
  }, [visible, profile]);

  // Validations (clone prod l.150-155)
  var ageNum = parseInt(editAge, 10);
  var weightNum = parseFloat(editWeight);
  var heightNum = parseFloat(editHeight);

  var ageValid = !isNaN(ageNum) && ageNum >= 1 && ageNum <= 120;
  var weightValid = !isNaN(weightNum) && weightNum >= 20 && weightNum <= 500;
  var heightValid = !isNaN(heightNum) && heightNum >= 50 && heightNum <= 250;
  var nameEmpty = !editName || editName.trim().length === 0;

  var isFormValid = !nameEmpty && ageValid && weightValid && heightValid;

  function handleSaveMock() {
    console.log('MOCK SAVE:', {
      display_name: editName.trim(),
      age: ageNum,
      weight: weightNum,
      height: heightNum,
      city: editLocation.trim()
    });
    if (onClose) {
      onClose();
    }
  }

  function handleClose() {
    if (onClose) {
      onClose();
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <Pressable
          style={{ flex: 1 }}
          onPress={handleClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ backgroundColor: '#1a1a1a', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' }}
        >
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>
                Modifier mon profil
              </Text>
              <Pressable onPress={handleClose} style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                <Svg width={20} height={20} viewBox="0 0 24 24">
                  <Path d="M6 6 L18 18 M18 6 L6 18" stroke="#999" strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </Pressable>
            </View>

            <Text style={{ color: '#999', fontSize: 12, marginBottom: 20 }}>
              Vos donnees sont privees et chiffrees
            </Text>

            <Text style={{ color: '#00D984', fontSize: 11, fontWeight: '700', marginBottom: 12, letterSpacing: 1 }}>
              {'IDENTITÉ'}
            </Text>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: '#ccc', fontSize: 13, marginBottom: 6 }}>
                Comment vous appeler
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                autoCapitalize="words"
                placeholder="Votre prénom"
                placeholderTextColor="#555"
                onFocus={function() { setFocusedField('name'); }}
                onBlur={function() { setFocusedField(null); }}
                style={{
                  backgroundColor: '#0f0f0f',
                  borderWidth: 1,
                  borderColor: focusedField === 'name' ? '#00D984' : '#333',
                  borderRadius: 10,
                  padding: 12,
                  color: '#fff',
                  fontSize: 15
                }}
              />
              <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>
                Visible uniquement par vous
              </Text>
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: '#ccc', fontSize: 13, marginBottom: 6 }}>
                Age
              </Text>
              <TextInput
                value={editAge}
                onChangeText={setEditAge}
                keyboardType="numeric"
                maxLength={3}
                placeholder="Ex : 30"
                placeholderTextColor="#555"
                onFocus={function() { setFocusedField('age'); }}
                onBlur={function() { setFocusedField(null); }}
                style={{
                  backgroundColor: '#0f0f0f',
                  borderWidth: 1,
                  borderColor: focusedField === 'age' ? '#00D984' : '#333',
                  borderRadius: 10,
                  padding: 12,
                  color: '#fff',
                  fontSize: 15
                }}
              />
              {editAge.length > 0 && !ageValid ? (
                <Text style={{ color: '#FF6B6B', fontSize: 11, marginTop: 4 }}>
                  Doit etre entre 1 et 120
                </Text>
              ) : null}
            </View>

            <Text style={{ color: '#00D984', fontSize: 11, fontWeight: '700', marginTop: 16, marginBottom: 12, letterSpacing: 1 }}>
              {'CORPS'}
            </Text>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: '#ccc', fontSize: 13, marginBottom: 6 }}>
                Poids (kg)
              </Text>
              <TextInput
                value={editWeight}
                onChangeText={setEditWeight}
                keyboardType="decimal-pad"
                maxLength={5}
                placeholder="Ex : 70"
                placeholderTextColor="#555"
                onFocus={function() { setFocusedField('weight'); }}
                onBlur={function() { setFocusedField(null); }}
                style={{
                  backgroundColor: '#0f0f0f',
                  borderWidth: 1,
                  borderColor: focusedField === 'weight' ? '#00D984' : '#333',
                  borderRadius: 10,
                  padding: 12,
                  color: '#fff',
                  fontSize: 15
                }}
              />
              {editWeight.length > 0 && !weightValid ? (
                <Text style={{ color: '#FF6B6B', fontSize: 11, marginTop: 4 }}>
                  Doit etre entre 20 et 500 kg
                </Text>
              ) : null}
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: '#ccc', fontSize: 13, marginBottom: 6 }}>
                Taille (cm)
              </Text>
              <TextInput
                value={editHeight}
                onChangeText={setEditHeight}
                keyboardType="numeric"
                maxLength={3}
                placeholder="Ex : 175"
                placeholderTextColor="#555"
                onFocus={function() { setFocusedField('height'); }}
                onBlur={function() { setFocusedField(null); }}
                style={{
                  backgroundColor: '#0f0f0f',
                  borderWidth: 1,
                  borderColor: focusedField === 'height' ? '#00D984' : '#333',
                  borderRadius: 10,
                  padding: 12,
                  color: '#fff',
                  fontSize: 15
                }}
              />
              {editHeight.length > 0 && !heightValid ? (
                <Text style={{ color: '#FF6B6B', fontSize: 11, marginTop: 4 }}>
                  Doit etre entre 50 et 250 cm
                </Text>
              ) : null}
            </View>

            <Text style={{ color: '#00D984', fontSize: 11, fontWeight: '700', marginTop: 16, marginBottom: 12, letterSpacing: 1 }}>
              {'LOCALISATION'}
            </Text>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#ccc', fontSize: 13, marginBottom: 6 }}>
                Ville
              </Text>
              <TextInput
                value={editLocation}
                onChangeText={setEditLocation}
                autoCapitalize="words"
                placeholder="Votre ville"
                placeholderTextColor="#555"
                onFocus={function() { setFocusedField('location'); }}
                onBlur={function() { setFocusedField(null); }}
                style={{
                  backgroundColor: '#0f0f0f',
                  borderWidth: 1,
                  borderColor: focusedField === 'location' ? '#00D984' : '#333',
                  borderRadius: 10,
                  padding: 12,
                  color: '#fff',
                  fontSize: 15
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={handleClose}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#444',
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#ccc', fontWeight: '600' }}>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveMock}
                disabled={!isFormValid}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: isFormValid ? '#00D984' : '#1f3a2f',
                  alignItems: 'center',
                  opacity: isFormValid ? 1 : 0.5
                }}
              >
                <Text style={{ color: isFormValid ? '#000' : '#777', fontWeight: '700' }}>
                  Enregistrer
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default EditProfilePageMock;
