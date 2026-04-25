import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, Animated, Easing } from 'react-native';
import { useAuth } from '../MockAuthContext';
import { t } from '../mockT';
import { SUPABASE_URL, POST_HEADERS, TIER_ORDER, TIER_CONFIG } from '../lixverseConstants';
import { hapticLight } from '../utils/haptics';

import CharacterCard from '../components/CharacterCard';
import ActiveCharacterBanner from '../components/ActiveCharacterBanner';
import CharacterDetailModal from '../components/CharacterDetailModal';

export default function CharactersTab() {
  var auth = useAuth();
  var _collection = React.useState([]);
  var collection = _collection[0];
  var setCollection = _collection[1];

  var _loading = React.useState(true);
  var loading = _loading[0];
  var setLoading = _loading[1];

  var _refreshing = React.useState(false);
  var refreshing = _refreshing[0];
  var setRefreshing = _refreshing[1];

  var _selectedChar = React.useState(null);
  var selectedChar = _selectedChar[0];
  var setSelectedChar = _selectedChar[1];

  // === PHASE 3 ANIMATIONS GLOBALES ===
  // Partagées entre toutes les cards pour optimiser (pas 16 instances)
  var breathAnim = React.useRef(new Animated.Value(0)).current;
  var floatAnim = React.useRef(new Animated.Value(0)).current;
  var auraAnim = React.useRef(new Animated.Value(0)).current;
  var particleAnim1 = React.useRef(new Animated.Value(0)).current;
  var particleAnim2 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(function() {
    fetchCollection(true);
  }, []);

  React.useEffect(function() {
    // Breath : 1.00 → 1.02 / 3s (A1 validé)
    var breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(breathAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: false })
      ])
    );

    // Float : 0 → -2px / 4s (désynchronisé du breath)
    var floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: false })
      ])
    );

    // Aura pulse : 0 → 1 / 3.5s (intensité gérée par tier dans CharacterCard)
    var auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auraAnim, { toValue: 1, duration: 1750, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(auraAnim, { toValue: 0, duration: 1750, easing: Easing.inOut(Easing.sin), useNativeDriver: false })
      ])
    );

    // Particules 1 : cycle 5s
    var particleLoop1 = Animated.loop(
      Animated.timing(particleAnim1, { toValue: 1, duration: 5000, easing: Easing.linear, useNativeDriver: false })
    );

    // Particules 2 : cycle 7s (parallax)
    var particleLoop2 = Animated.loop(
      Animated.timing(particleAnim2, { toValue: 1, duration: 7000, easing: Easing.linear, useNativeDriver: false })
    );

    breathLoop.start();
    floatLoop.start();
    auraLoop.start();
    particleLoop1.start();
    particleLoop2.start();

    // Cleanup au unmount (anti memory leak)
    return function() {
      breathLoop.stop();
      floatLoop.stop();
      auraLoop.stop();
      particleLoop1.stop();
      particleLoop2.stop();
    };
  }, []);

  async function fetchCollection(showLoader) {
    if (showLoader) setLoading(true);
    try {
      var res = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_user_collection', {
        method: 'POST',
        headers: POST_HEADERS,
        body: JSON.stringify({ p_user_id: auth.userId })
      });
      var data = await res.json();
      var parsed = Array.isArray(data) ? data : (data && data.get_user_collection) || [];
      setCollection(parsed);
    } catch (e) {
      console.warn('[CharactersTab] fetch error:', e);
    }
    setLoading(false);
    setRefreshing(false);
  }

  function onRefresh() {
    setRefreshing(true);
    fetchCollection(false);
  }

  function openDetail(character) {
    hapticLight();
    setSelectedChar(character);
  }

  function closeDetail() {
    setSelectedChar(null);
  }

  function getActiveCharacter() {
    var i;
    for (i = 0; i < collection.length; i++) {
      if (collection[i].is_active === true) return collection[i];
    }
    return null;
  }

  function getOwnedCount() {
    var count = 0;
    var i;
    for (i = 0; i < collection.length; i++) {
      if (collection[i].owned === true) count++;
    }
    return count;
  }

  function renderTierSection(tier) {
    var charsInTier = [];
    var i;
    for (i = 0; i < collection.length; i++) {
      if (collection[i].tier === tier) charsInTier.push(collection[i]);
    }
    charsInTier.sort(function(a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });

    if (charsInTier.length === 0) return null;

    var config = TIER_CONFIG[tier];
    var ownedInTier = 0;
    var j;
    for (j = 0; j < charsInTier.length; j++) {
      if (charsInTier[j].owned) ownedInTier++;
    }

    return (
      <View key={tier} style={{ marginBottom: 24 }}>
        <View style={{ paddingHorizontal: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: config.primary, fontSize: 12, fontWeight: 'bold', letterSpacing: 2 }}>
            {config.label}
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: config.secondary, marginLeft: 12, opacity: 0.4 }} />
          <Text style={{ color: '#9A9EA3', fontSize: 11, marginLeft: 8 }}>
            {ownedInTier} / {charsInTier.length}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 }}>
          {charsInTier.map(function(ch) {
            return <CharacterCard
              key={ch.slug}
              character={ch}
              onPress={openDetail}
              breathAnim={breathAnim}
              floatAnim={floatAnim}
              auraAnim={auraAnim}
              particleAnim1={particleAnim1}
              particleAnim2={particleAnim2}
            />;
          })}
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00D984" />
        <Text style={{ color: '#9A9EA3', marginTop: 12, fontSize: 13 }}>
          Chargement de ta collection...
        </Text>
      </View>
    );
  }

  var activeChar = getActiveCharacter();
  var ownedCount = getOwnedCount();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00D984"
            colors={['#00D984']}
          />
        }
      >
        <ActiveCharacterBanner character={activeChar} breathAnim={breathAnim} />

        <View style={{ paddingHorizontal: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 }}>
            {t('my_collection')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D4AF37', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, marginRight: 4 }}>🧩</Text>
            <Text style={{ color: '#D4AF37', fontSize: 13, fontWeight: 'bold' }}>
              {ownedCount}/16
            </Text>
          </View>
        </View>

        {TIER_ORDER.map(function(tier) { return renderTierSection(tier); })}

        <View style={{ height: 60 }} />
      </ScrollView>

      <CharacterDetailModal
        character={selectedChar}
        collection={collection}
        onClose={closeDetail}
        onRefresh={function() { fetchCollection(false); }}
        breathAnim={breathAnim}
        floatAnim={floatAnim}
        auraAnim={auraAnim}
        particleAnim1={particleAnim1}
        particleAnim2={particleAnim2}
      />
    </View>
  );
}
