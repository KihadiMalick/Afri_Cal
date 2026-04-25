import React from 'react';
import { View, Text, Pressable, StatusBar } from 'react-native';
import { AuthProvider } from './MockAuthContext';
import { LanguageProvider } from './MockLanguageContext';
import { t } from './mockT';
import { hapticLight } from './utils/haptics';

import CharactersTab from './tabs/CharactersTab';
import DefiTabStub from './tabs/DefiTabStub';
import HumanTabStub from './tabs/HumanTabStub';
import LixShopTabStub from './tabs/LixShopTabStub';

function LixVersePageInner() {
  var _activeTab = React.useState('characters');
  var activeTab = _activeTab[0];
  var setActiveTab = _activeTab[1];

  var _lixBalance = React.useState(16750);
  var lixBalance = _lixBalance[0];

  function selectTab(tabKey) {
    if (tabKey === activeTab) return;
    hapticLight();
    setActiveTab(tabKey);
  }

  function renderHeader() {
    return (
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 }}>{t('lixverse_title')}</Text>
          <Text style={{ color: '#9A9EA3', fontSize: 11, letterSpacing: 2.5, marginTop: 2 }}>{t('lixverse_subtitle')}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ position: 'relative', marginRight: 14 }}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
            <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#FF3B30', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFF', fontSize: 9, fontWeight: 'bold' }}>1</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1D22', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#3A3F46' }}>
            <Text style={{ fontSize: 14, marginRight: 4 }}>💧</Text>
            <Text style={{ color: '#00D984', fontWeight: 'bold', fontSize: 14 }}>{lixBalance}</Text>
            <Text style={{ color: '#6B6F75', fontSize: 12, marginLeft: 2 }}>▾</Text>
          </View>
        </View>
      </View>
    );
  }

  function renderTab(key, label, emoji, isActive) {
    function handleTabPress() {
      selectTab(key);
    }
    return (
      <Pressable
        key={key}
        onPress={handleTabPress}
        style={{
          flex: 1,
          marginHorizontal: 4,
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: 'center',
          backgroundColor: isActive ? '#1F242B' : '#14181C',
          borderWidth: isActive ? 1.5 : 1,
          borderColor: isActive ? '#D4AF37' : '#2A2F36'
        }}
      >
        <Text style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</Text>
        <Text style={{
          color: isActive ? '#FFFFFF' : '#9A9EA3',
          fontSize: 11,
          fontWeight: isActive ? 'bold' : '500',
          letterSpacing: 0.5
        }}>{label}</Text>
      </Pressable>
    );
  }

  function renderTabBar() {
    return (
      <View style={{ flexDirection: 'row', paddingHorizontal: 12, marginBottom: 16 }}>
        {renderTab('defi', t('tab_defi'), '🏆', activeTab === 'defi')}
        {renderTab('human', t('tab_human'), '🤝', activeTab === 'human')}
        {renderTab('characters', t('tab_characters'), '🎴', activeTab === 'characters')}
        {renderTab('lixshop', t('tab_lixshop'), '💎', activeTab === 'lixshop')}
      </View>
    );
  }

  function renderActiveTab() {
    if (activeTab === 'defi') return <DefiTabStub />;
    if (activeTab === 'human') return <HumanTabStub />;
    if (activeTab === 'characters') return <CharactersTab />;
    if (activeTab === 'lixshop') return <LixShopTabStub />;
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0F1215' }}>
      <StatusBar barStyle="light-content" />
      {renderHeader()}
      {renderTabBar()}
      <View style={{ flex: 1 }}>
        {renderActiveTab()}
      </View>
    </View>
  );
}

export default function LixVersePage() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <LixVersePageInner />
      </LanguageProvider>
    </AuthProvider>
  );
}
