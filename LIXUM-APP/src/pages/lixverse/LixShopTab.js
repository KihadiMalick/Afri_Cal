// ──────────────────────────────────────────────────────────────────────────────
// LixShopTab.js — Onglet Lix : Boutique, Abonnements, Recharge, Historique
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, ActivityIndicator, Alert,
} from 'react-native';
import Svg, { Path, Rect, Line, Circle, Polygon } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { wp, fp } from '../../constants/layout';
import { useAuth } from '../../config/AuthContext';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/supabase';

// ── TIER CONFIG ──────────────────────────────────────────────────────────────
var TIER_COLORS = {
  free: '#888',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

var TIER_LABELS = {
  free: 'Free',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

var SUBSCRIPTIONS = [
  {
    tier: 'silver',
    price: '$4.99/mois',
    color: '#C0C0C0',
    badge: null,
    features: [
      '200 énergie/mois + 3 000 Lix',
      '3 fragments Standard',
      'Stats 30 jours inclus',
      'Historique hydratation',
    ],
  },
  {
    tier: 'gold',
    price: '$9.99/mois',
    color: '#FFD700',
    badge: 'Populaire',
    features: [
      '400 énergie/mois + 6 000 Lix',
      '3 Std + 2 Rare + 2 Elite frags',
      'Stats 1 an inclus',
      '-25% énergie',
      '1 profil enfant gratuit',
    ],
  },
  {
    tier: 'platinum',
    price: '$20/mois',
    color: '#E5E4E2',
    badge: 'VIP',
    features: [
      '800 énergie/mois + 12 000 Lix',
      '3 Std + 2 Rare + 3 Elite + 1 Myth',
      'Stats Origine inclus',
      '-50% énergie',
      'CartScan illimité',
      'Enfants illimités',
    ],
  },
];

var LIX_PACKS = [
  { name: 'Starter', amount: 1000, price: '$0.99', bonus: null },
  { name: 'Explorer', amount: 5500, price: '$4.99', bonus: '+10%' },
  { name: 'Aventurier', amount: 12000, price: '$9.99', bonus: '+20%' },
  { name: 'Champion', amount: 25000, price: '$19.99', bonus: '+25%' },
  { name: 'Légende', amount: 60000, price: '$49.99', bonus: '+20%' },
];

var ENERGY_PACKS = [
  { energy: 10, cost: 100 },
  { energy: 30, cost: 300 },
  { energy: 50, cost: 500 },
  { energy: 80, cost: 700 },
];

// ── ICONS ────────────────────────────────────────────────────────────────────
var DiamondIcon = function(p) {
  var size = p.size || wp(18);
  var color = p.color || '#00D984';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polygon points="12,2 22,9 12,22 2,9" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <Line x1="2" y1="9" x2="22" y2="9" stroke={color} strokeWidth="1.5" />
      <Line x1="12" y1="2" x2="8" y2="9" stroke={color} strokeWidth="1" opacity="0.5" />
      <Line x1="12" y1="2" x2="16" y2="9" stroke={color} strokeWidth="1" opacity="0.5" />
      <Line x1="12" y1="22" x2="8" y2="9" stroke={color} strokeWidth="1" opacity="0.5" />
      <Line x1="12" y1="22" x2="16" y2="9" stroke={color} strokeWidth="1" opacity="0.5" />
    </Svg>
  );
};

var BoltIcon = function(p) {
  var size = p.size || wp(18);
  var color = p.color || '#FFD93D';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  );
};

// ── COMPONENT ────────────────────────────────────────────────────────────────
var LixShopTab = function(p) {
  var showLixAlert = p.showLixAlert;
  var auth = useAuth();
  var userId = auth.userId;
  var lixBalance = auth.lixBalance;
  var userEnergy = auth.energy;
  var subscriptionTier = auth.subscriptionTier || 'free';
  var refreshLixFromServer = auth.refreshLixFromServer;

  var _transactions = useState([]);
  var transactions = _transactions[0]; var setTransactions = _transactions[1];
  var _txLoading = useState(false);
  var txLoading = _txLoading[0]; var setTxLoading = _txLoading[1];

  // ── FETCH TRANSACTIONS ──────────────────────────────────────────────────
  useEffect(function() {
    if (!userId) return;
    setTxLoading(true);
    fetch(SUPABASE_URL + '/rest/v1/transactions_lix?user_id=eq.' + userId + '&order=created_at.desc&limit=5', {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
    })
      .then(function(r) { return r.ok ? r.json() : []; })
      .then(function(data) { setTransactions(Array.isArray(data) ? data : []); })
      .catch(function() { setTransactions([]); })
      .finally(function() { setTxLoading(false); });
  }, [userId]);

  var alertPlaceholder = function(title) {
    Alert.alert(title, 'Les achats in-app seront disponibles très bientôt !\nEn attendant, vous pouvez acheter sur lixum.com');
  };

  var tierOrder = ['free', 'silver', 'gold', 'platinum'];
  var currentTierIdx = tierOrder.indexOf(subscriptionTier);

  var formatNum = function(n) {
    if (n >= 1000) return Math.floor(n / 1000) + ' ' + String(n % 1000).padStart(3, '0');
    return String(n);
  };

  var formatDate = function(d) {
    if (!d) return '';
    try {
      var dt = new Date(d);
      return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    } catch (e) { return ''; }
  };

  // ── RENDER ──────────────────────────────────────────────────────────────
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(60) }}>

      {/* ── HEADER : Mon portefeuille ── */}
      <View style={{
        backgroundColor: '#2A303B', borderRadius: wp(16), padding: wp(20),
        borderWidth: 1, borderColor: '#3A3F46', marginBottom: wp(16), alignItems: 'center',
      }}>
        <Text style={{ fontSize: fp(12), color: '#888', fontWeight: '500', marginBottom: wp(4) }}>Mon portefeuille</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8), marginBottom: wp(6) }}>
          <DiamondIcon size={wp(22)} color="#00D984" />
          <Text style={{ fontSize: fp(28), fontWeight: '700', color: '#00D984' }}>{formatNum(lixBalance || 0)}</Text>
          <Text style={{ fontSize: fp(14), color: '#888', fontWeight: '500' }}>Lix</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6), marginBottom: wp(10) }}>
          <BoltIcon size={wp(16)} color="#FFD93D" />
          <Text style={{ fontSize: fp(16), fontWeight: '600', color: '#FFD93D' }}>{userEnergy || 0}</Text>
          <Text style={{ fontSize: fp(12), color: '#888' }}>énergie</Text>
        </View>
        <View style={{
          backgroundColor: (TIER_COLORS[subscriptionTier] || '#888') + '20',
          borderRadius: wp(8), paddingHorizontal: wp(12), paddingVertical: wp(4),
        }}>
          <Text style={{ fontSize: fp(11), fontWeight: '700', color: TIER_COLORS[subscriptionTier] || '#888' }}>
            {TIER_LABELS[subscriptionTier] || 'Free'}
          </Text>
        </View>
      </View>

      {/* ── SECTION 1 : ABONNEMENTS ── */}
      <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Abonnements</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: wp(20) }}
        contentContainerStyle={{ paddingRight: wp(16) }}>
        {SUBSCRIPTIONS.map(function(sub) {
          var tierIdx = tierOrder.indexOf(sub.tier);
          var isCurrentTier = subscriptionTier === sub.tier;
          var isDowngrade = tierIdx < currentTierIdx;
          var btnText = isCurrentTier ? 'Abonnement actif' : (isDowngrade ? 'Downgrade' : (currentTierIdx > 0 ? 'Upgrader' : 'S\'abonner'));
          var btnDisabled = isCurrentTier;

          return (
            <View key={sub.tier} style={{
              width: wp(220), backgroundColor: '#2A303B',
              borderWidth: 1.5, borderColor: sub.color,
              borderRadius: wp(16), padding: wp(16), marginRight: wp(12),
              position: 'relative',
            }}>
              {sub.badge ? (
                <View style={{
                  position: 'absolute', top: -wp(10), right: wp(12),
                  backgroundColor: sub.color, paddingHorizontal: wp(10),
                  paddingVertical: wp(3), borderRadius: wp(8),
                }}>
                  <Text style={{ color: '#1A2029', fontSize: fp(9), fontWeight: '700' }}>{sub.badge}</Text>
                </View>
              ) : null}

              <Text style={{ fontSize: fp(18), fontWeight: '800', color: sub.color, marginBottom: wp(2) }}>
                {TIER_LABELS[sub.tier]}
              </Text>
              <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF', marginBottom: wp(12) }}>
                {sub.price}
              </Text>

              {sub.features.map(function(feat, fi) {
                return (
                  <View key={fi} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: wp(6) }}>
                    <Text style={{ color: sub.color, fontSize: fp(12), fontWeight: '700', marginRight: wp(6), marginTop: wp(1) }}>{'✓'}</Text>
                    <Text style={{ color: '#FFF', fontSize: fp(11), flex: 1 }}>{feat}</Text>
                  </View>
                );
              })}

              <Pressable
                delayPressIn={120}
                disabled={btnDisabled}
                onPress={function() { alertPlaceholder('Abonnement ' + TIER_LABELS[sub.tier]); }}
                style={function(state) { return {
                  borderWidth: 1.5,
                  borderColor: isCurrentTier ? '#00D984' : sub.color,
                  backgroundColor: isCurrentTier ? '#00D98420' : 'transparent',
                  borderRadius: wp(10), paddingVertical: wp(10),
                  alignItems: 'center', marginTop: wp(12),
                  opacity: state.pressed && !btnDisabled ? 0.7 : 1,
                }; }}
              >
                <Text style={{ fontSize: fp(13), fontWeight: '600', color: isCurrentTier ? '#00D984' : sub.color }}>
                  {btnText}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {/* ── SECTION 2 : PACKS LIX ── */}
      <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Acheter des Lix</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(8), marginBottom: wp(20) }}>
        {LIX_PACKS.map(function(pack) {
          return (
            <Pressable key={pack.name} delayPressIn={120}
              onPress={function() { alertPlaceholder('Pack ' + pack.name); }}
              style={function(state) { return {
                width: (wp(343) - wp(8)) / 2,
                backgroundColor: '#2A303B', borderRadius: wp(14), padding: wp(14),
                borderWidth: 1, borderColor: '#3A3F46',
                position: 'relative',
                transform: [{ scale: state.pressed ? 0.96 : 1 }],
              }; }}>
              {pack.bonus ? (
                <View style={{
                  position: 'absolute', top: wp(8), right: wp(8),
                  backgroundColor: '#FFD93D20', borderRadius: wp(6),
                  paddingHorizontal: wp(6), paddingVertical: wp(2),
                }}>
                  <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#FFD93D' }}>{pack.bonus}</Text>
                </View>
              ) : null}
              <DiamondIcon size={wp(24)} color="#00D984" />
              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#00D984', marginTop: wp(6) }}>
                {formatNum(pack.amount)}
              </Text>
              <Text style={{ fontSize: fp(10), color: '#888', marginTop: wp(2) }}>{pack.name}</Text>
              <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF', marginTop: wp(6) }}>{pack.price}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── SECTION 3 : RECHARGE ÉNERGIE ── */}
      <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Recharger l'énergie</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: wp(20) }}
        contentContainerStyle={{ paddingRight: wp(16) }}>
        {ENERGY_PACKS.map(function(ep) {
          var canAfford = (lixBalance || 0) >= ep.cost;
          return (
            <Pressable key={ep.energy} delayPressIn={120}
              onPress={function() {
                if (!canAfford) {
                  Alert.alert('Lix insuffisants', 'Il vous faut ' + ep.cost + ' Lix pour cette recharge. Solde actuel : ' + (lixBalance || 0) + ' Lix.');
                  return;
                }
                Alert.alert(
                  'Recharger +' + ep.energy + ' énergie',
                  ep.cost + ' Lix seront débités de votre solde.',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Recharger', onPress: function() {
                      alertPlaceholder('Recharge énergie');
                    }},
                  ]
                );
              }}
              style={function(state) { return {
                backgroundColor: '#2A303B', borderRadius: wp(14),
                padding: wp(14), marginRight: wp(10),
                borderWidth: 1, borderColor: '#3A3F46',
                alignItems: 'center', minWidth: wp(80),
                opacity: canAfford ? 1 : 0.5,
                transform: [{ scale: state.pressed ? 0.95 : 1 }],
              }; }}>
              <BoltIcon size={wp(22)} color="#FFD93D" />
              <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFD93D', marginTop: wp(6) }}>
                {'+' + ep.energy + 'é'}
              </Text>
              <Text style={{ fontSize: fp(12), color: '#888', marginTop: wp(4) }}>{ep.cost + ' Lix'}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── SECTION 4 : HISTORIQUE TRANSACTIONS ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(12) }}>
        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Historique</Text>
      </View>

      {txLoading ? (
        <View style={{ padding: wp(20), alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#00D984" />
        </View>
      ) : transactions.length === 0 ? (
        <View style={{
          backgroundColor: '#2A303B', borderRadius: wp(12), padding: wp(20),
          borderWidth: 1, borderColor: '#3A3F46', alignItems: 'center',
        }}>
          <Text style={{ fontSize: fp(12), color: '#888', fontStyle: 'italic' }}>
            Aucune transaction pour le moment
          </Text>
        </View>
      ) : (
        <View style={{
          backgroundColor: '#2A303B', borderRadius: wp(12),
          borderWidth: 1, borderColor: '#3A3F46', overflow: 'hidden',
        }}>
          {transactions.map(function(tx, i) {
            var isGain = tx.direction === 'credit' || (tx.amount && tx.amount > 0 && tx.direction !== 'debit');
            return (
              <View key={tx.id || i} style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: wp(14), paddingVertical: wp(12),
                borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#3A3F46',
              }}>
                <View style={{
                  width: wp(32), height: wp(32), borderRadius: wp(8),
                  backgroundColor: isGain ? '#00D98415' : '#FF6B6B15',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(10),
                }}>
                  <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                    {isGain ? (
                      <Path d="M12 19V5M5 12l7-7 7 7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <Path d="M12 5v14M19 12l-7 7-7-7" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(12), fontWeight: '500', color: '#FFF' }} numberOfLines={1}>
                    {tx.description || tx.source || 'Transaction'}
                  </Text>
                  <Text style={{ fontSize: fp(10), color: '#888', marginTop: wp(1) }}>{formatDate(tx.created_at)}</Text>
                </View>
                <Text style={{ fontSize: fp(13), fontWeight: '600', color: isGain ? '#00D984' : '#FF6B6B' }}>
                  {(isGain ? '+' : '-') + Math.abs(tx.amount || 0) + ' Lix'}
                </Text>
              </View>
            );
          })}
        </View>
      )}

    </ScrollView>
  );
};

export default LixShopTab;
