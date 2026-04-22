import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useAuth } from './MockAuthContext';
import { useLang } from './MockLanguageContext';
import { T } from './mockT';
import DeleteAccountModal from './components/DeleteAccountModal';

function MockOptionRow(props) {
  return (
    <View style={{ backgroundColor: '#1A1D22', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2A303B', flexDirection: 'row', alignItems: 'center', opacity: 0.4 }}>
      <Text style={{ fontSize: 18, marginRight: 12 }}>{props.icon}</Text>
      <Text style={{ color: '#B8BEC5', fontSize: 14, flex: 1 }}>{props.label}</Text>
      <Text style={{ color: '#6B7280', fontSize: 18 }}>{'›'}</Text>
    </View>
  );
}

function ProfilePageMock() {
  var auth = useAuth();
  var lang = useLang();
  var t = lang.language === 'EN' ? T.en : T.fr;

  var _showDelete = useState(false);
  var showDelete = _showDelete[0];
  var setShowDelete = _showDelete[1];

  var _isDeletingAccount = useState(false);
  var isDeletingAccount = _isDeletingAccount[0];
  var setIsDeletingAccount = _isDeletingAccount[1];

  function handleDeleteConfirm(reasons, reasonOther) {
    setIsDeletingAccount(true);
    setTimeout(function() {
      setShowDelete(false);
      setIsDeletingAccount(false);
      var scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 30);
      auth.triggerAccountDeletedSuccess(scheduledDate.toISOString());
    }, 1500);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0E14' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 220 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#1A1D22', borderWidth: 3, borderColor: '#00D984', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 48 }}>{'👤'}</Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginTop: 12 }}>
            Malick
          </Text>
          <Text style={{ color: '#00D984', fontSize: 14, fontFamily: 'monospace', marginTop: 4 }}>
            LXM-QJLMVQ
          </Text>
        </View>

        <View style={{ backgroundColor: '#1A1D22', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2A303B' }}>
          <Text style={{ color: '#B8BEC5', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 }}>
            {t.profileStatsTitle}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#00D984', fontSize: 24, fontWeight: '800' }}>805</Text>
              <Text style={{ color: '#B8BEC5', fontSize: 11 }}>{t.profileStatXp}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#00D984', fontSize: 24, fontWeight: '800' }}>2500</Text>
              <Text style={{ color: '#B8BEC5', fontSize: 11 }}>{t.profileStatLix}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#00D984', fontSize: 24, fontWeight: '800' }}>5</Text>
              <Text style={{ color: '#B8BEC5', fontSize: 11 }}>{t.profileStatLevel}</Text>
            </View>
          </View>
        </View>

        <Text style={{ color: '#B8BEC5', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 }}>
          {t.profileSettingsTitle}
        </Text>
        <MockOptionRow icon={'🔔'} label={t.profileNotifications} />
        <MockOptionRow icon={'🌍'} label={t.profileLanguage + ' : ' + (lang.language === 'EN' ? 'English' : 'Français')} />
        <MockOptionRow icon={'💎'} label={t.profileSubscription + ' : Gold'} />
        <MockOptionRow icon={'🎨'} label={t.profilePreferences} />

        <View style={{ height: 20 }} />

        <Text style={{ color: '#B8BEC5', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 }}>
          {t.profileAccountTitle}
        </Text>
        <MockOptionRow icon={'🚪'} label={t.profileLogout} />

        <View style={{ height: 20 }} />

        <Pressable
          onPress={function() { setShowDelete(true); }}
          style={function(s) {
            return {
              backgroundColor: '#1A1D22',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: '#FF6B6B',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: s.pressed ? 0.8 : 1
            };
          }}
        >
          <Text style={{ fontSize: 18, marginRight: 8 }}>{'🗑'}</Text>
          <Text style={{ color: '#FF6B6B', fontSize: 15, fontWeight: '700' }}>
            {t.profileDeleteAccount}
          </Text>
        </Pressable>

        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Text style={{ color: '#6B7280', fontSize: 11 }}>
            {'Snack Test #02 — RGPD Flow'}
          </Text>
          <Text style={{ color: '#6B7280', fontSize: 10, marginTop: 4, fontStyle: 'italic' }}>
            {'Seul le bouton "' + t.profileDeleteAccount + '" est fonctionnel'}
          </Text>
        </View>
      </ScrollView>

      <DeleteAccountModal
        visible={showDelete}
        onClose={function() { if (!isDeletingAccount) setShowDelete(false); }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeletingAccount}
        language={lang.language}
      />
    </View>
  );
}

export default ProfilePageMock;
