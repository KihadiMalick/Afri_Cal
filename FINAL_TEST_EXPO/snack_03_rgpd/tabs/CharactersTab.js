import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
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

  React.useEffect(function() {
    fetchCollection(true);
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
            return <CharacterCard key={ch.slug} character={ch} onPress={openDetail} />;
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
        <ActiveCharacterBanner character={activeChar} />

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
      />
    </View>
  );
}
