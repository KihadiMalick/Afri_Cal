import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Pressable,
  Modal, TextInput, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import {
  W, wp, fp,
  SUGAR_CUBE_G, getCoeffColor,
  BEVERAGE_CATS, QUICK_VOLUMES,
  pad2, formatNumberFR,
} from './dashboardConstants';
import { DropletIcon } from './dashboardIcons';
import { useAuth } from '../../config/AuthContext';

const BeverageModal = ({
  visible,
  onClose,
  onBeverageAdded,
  initialCategory,
}) => {
  var auth = useAuth(); var userId = auth.userId;
  const [beverageCategory, setBeverageCategory] = useState(initialCategory || 'all');
  const [beverageList, setBeverageList] = useState([]);
  const [beverageSearch, setBeverageSearch] = useState('');
  const [selectedBeverage, setSelectedBeverage] = useState(null);
  const [beverageVolume, setBeverageVolume] = useState(250);
  const [sugarCubes, setSugarCubes] = useState(2);
  const [beverageLoading, setBeverageLoading] = useState(false);
  const [beverageSaving, setBeverageSaving] = useState(false);

  async function fetchBeveragesByCategory(cat) {
    setBeverageLoading(true);
    try {
      let query = supabase.from('beverages_master')
        .select('beverage_id,name,icon,category,sub_region,coeff,kcal_per_100ml,sugar_g_per_100ml,sugar_known,is_alcoholic,description')
        .order('name');
      if (cat !== 'all') query = query.eq('category', cat);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      setBeverageList(data || []);
    } catch (err) {
      console.warn('fetchBeverages error:', err);
      setBeverageList([]);
    }
    setBeverageLoading(false);
  }

  async function searchBeverages(q) {
    if (!q || q.length < 2) {
      fetchBeveragesByCategory(beverageCategory);
      return;
    }
    setBeverageLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_beverages_fuzzy', {
        p_query: q, p_limit: 15,
      });
      if (error) throw error;
      setBeverageList(data || []);
    } catch (err) {
      console.warn('searchBeverages error:', err);
    }
    setBeverageLoading(false);
  }

  const selectBeverage = (bev) => {
    setSelectedBeverage(bev);
    setBeverageVolume(250);
    setSugarCubes(bev.sugar_known ? 0 : 2);
  };

  const calcBeverageTotals = () => {
    if (!selectedBeverage) return { effectiveMl: 0, kcal: 0, sugarG: 0 };
    const vol = beverageVolume;
    const bev = selectedBeverage;
    const baseSugar = (bev.sugar_g_per_100ml * vol) / 100;
    const addedSugar = bev.sugar_known ? 0 : sugarCubes * SUGAR_CUBE_G;
    const totalSugar = baseSugar + addedSugar;
    const baseKcal = (bev.kcal_per_100ml * vol) / 100;
    const addedKcal = addedSugar * 4;
    const effectiveMl = Math.round(vol * bev.coeff);
    return {
      effectiveMl,
      kcal: Math.round(baseKcal + addedKcal),
      sugarG: Math.round(totalSugar * 10) / 10,
    };
  };

  async function saveBeverage() {
    if (!selectedBeverage || beverageSaving) return;
    setBeverageSaving(true);
    const totals = calcBeverageTotals();
    const bevName = selectedBeverage.name;
    const bevIcon = selectedBeverage.icon;
    const addedEffective = totals.effectiveMl;
    const bevCoeff = selectedBeverage.coeff;
    const bevSugarKnown = selectedBeverage.sugar_known;

    if (onBeverageAdded) onBeverageAdded(addedEffective, bevName, bevIcon, totals.kcal);

    setSelectedBeverage(null);
    setBeverageSearch('');
    setBeverageSaving(false);
    onClose();

    try {
      var Vibration = require('react-native').Vibration;
      Vibration.vibrate(30);
    } catch(e) {}

    try {
      const { error } = await supabase.rpc('add_beverage_log', {
        p_user_id: userId,
        p_beverage_name: bevName,
        p_amount_ml: beverageVolume,
        p_hydration_coeff: bevCoeff,
        p_source: 'manual',
        p_kcal: totals.kcal,
        p_sugar_g: totals.sugarG,
        p_sugar_estimated: !bevSugarKnown,
        p_sugar_cubes: bevSugarKnown ? 0 : sugarCubes,
      });
      if (error) console.warn('add_beverage_log error:', error.message);
    } catch (err) {
      console.warn('saveBeverage error:', err);
    }
  }

  useEffect(function() { fetchBeveragesByCategory('all'); }, []);

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <LinearGradient
        colors={['#1E2530', '#222A35', '#1A2029', '#222A35', '#1E2530']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: Platform.OS === 'android' ? 38 : 50,
          paddingHorizontal: wp(14), paddingBottom: 10,
          borderBottomWidth: 1, borderBottomColor: 'rgba(0,217,132,0.08)',
        }}>
          <Pressable onPress={() => { onClose(); setSelectedBeverage(null); }}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="close" size={18} color="#8892A0" />
          </Pressable>
          <Text style={{ color: '#EAEEF3', fontSize: fp(16), fontWeight: '800', letterSpacing: 1 }}>BOISSONS</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={{
          marginHorizontal: wp(14), marginTop: 10, marginBottom: 8,
          backgroundColor: 'rgba(37,42,48,0.8)', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(74,79,85,0.5)',
          flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
        }}>
          <Ionicons name="search" size={16} color="#8892A0" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Rechercher (bissap, chai, zobo...)"
            placeholderTextColor="#555E6C"
            value={beverageSearch}
            onChangeText={(t) => { setBeverageSearch(t); searchBeverages(t); }}
            style={{ flex: 1, color: '#EAEEF3', fontSize: fp(13), paddingVertical: 10 }}
          />
          {beverageSearch ? (
            <Pressable onPress={() => { setBeverageSearch(''); fetchBeveragesByCategory(beverageCategory); }}>
              <Ionicons name="close-circle" size={18} color="#555E6C" />
            </Pressable>
          ) : null}
        </View>

        <View style={{ height: 36, marginBottom: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp(14), alignItems: 'center', height: 36 }}>
            {BEVERAGE_CATS.map((cat) => {
              const active = beverageCategory === cat.id;
              return (
                <Pressable key={cat.id} onPress={() => { setBeverageCategory(cat.id); setBeverageSearch(''); fetchBeveragesByCategory(cat.id); }}
                  style={{ flexDirection: 'row', alignItems: 'center', height: 30, paddingHorizontal: 10, marginRight: 6, borderRadius: 15, backgroundColor: active ? 'rgba(0,217,132,0.15)' : 'rgba(51,58,66,0.6)', borderWidth: 1, borderColor: active ? 'rgba(0,217,132,0.4)' : 'rgba(74,79,85,0.4)' }}>
                  <Text style={{ fontSize: 11, marginRight: 3 }}>{cat.icon}</Text>
                  <Text style={{ color: active ? '#00D984' : '#AABBCC', fontSize: fp(10), fontWeight: '700' }}>{cat.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: wp(14) }} showsVerticalScrollIndicator={false}>
          {selectedBeverage ? (
            <View style={{ paddingTop: 6 }}>
              <Pressable onPress={() => setSelectedBeverage(null)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="arrow-back" size={18} color="#00D984" />
                <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '600', marginLeft: 6 }}>Retour aux boissons</Text>
              </Pressable>

              <View style={{ borderRadius: wp(16), overflow: 'hidden' }}>
                <LinearGradient colors={['#2A3038', '#222830', '#1E2228']} style={{ padding: wp(14), borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)', borderRadius: wp(16) }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ fontSize: 36, marginRight: 12 }}>{selectedBeverage.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#EAEEF3', fontSize: fp(16), fontWeight: '800' }}>{selectedBeverage.name}</Text>
                      {selectedBeverage.description ? (
                        <Text numberOfLines={2} style={{ color: '#6B7280', fontSize: fp(10), marginTop: 2 }}>{selectedBeverage.description}</Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={{ backgroundColor: 'rgba(77,166,255,0.06)', borderRadius: 8, padding: 8, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(77,166,255,0.1)' }}>
                    <Text style={{ color: '#4DA6FF', fontSize: fp(8), fontWeight: '600' }}>
                      📊 Hydratation : {(selectedBeverage.coeff * 100).toFixed(0)}% — Beverage Hydration Index (Maughan et al., 2016, Am J Clin Nutr)
                    </Text>
                  </View>

                  <Text style={{ color: '#8892A0', fontSize: fp(10), fontWeight: '700', letterSpacing: 1, marginBottom: 6 }}>VOLUME</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
                    {QUICK_VOLUMES.map((v) => (
                      <Pressable key={v} onPress={() => setBeverageVolume(v)}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, marginRight: 6, marginBottom: 5, backgroundColor: beverageVolume === v ? 'rgba(0,217,132,0.15)' : 'rgba(51,58,66,0.6)', borderWidth: 1, borderColor: beverageVolume === v ? 'rgba(0,217,132,0.4)' : 'rgba(74,79,85,0.3)' }}>
                        <Text style={{ color: beverageVolume === v ? '#00D984' : '#AABBCC', fontSize: fp(12), fontWeight: '700' }}>{v} ml</Text>
                      </Pressable>
                    ))}
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(51,58,66,0.6)', borderRadius: 14, paddingHorizontal: 8, borderWidth: 1, borderColor: 'rgba(74,79,85,0.3)' }}>
                      <TextInput placeholder="..." placeholderTextColor="#555" keyboardType="numeric"
                        value={QUICK_VOLUMES.includes(beverageVolume) ? '' : String(beverageVolume)}
                        onChangeText={(t) => { const n = parseInt(t); if (n > 0 && n <= 2000) setBeverageVolume(n); }}
                        style={{ color: '#EAEEF3', fontSize: fp(12), width: 35, textAlign: 'center' }} />
                      <Text style={{ color: '#555E6C', fontSize: fp(10) }}>ml</Text>
                    </View>
                  </View>

                  {!selectedBeverage.sugar_known ? (
                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ color: '#8892A0', fontSize: fp(10), fontWeight: '700', letterSpacing: 1, marginBottom: 6 }}>SUCRE AJOUTÉ</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                        {[0, 1, 2, 3, 4, 5].map((n) => (
                          <Pressable key={n} onPress={() => setSugarCubes(n)}
                            style={{
                              width: 36, height: 36, borderRadius: 10, marginRight: 5, marginBottom: 4,
                              backgroundColor: n === 0
                                ? (sugarCubes === 0 ? 'rgba(0,217,132,0.15)' : 'rgba(51,58,66,0.6)')
                                : (sugarCubes >= n ? 'rgba(255,217,61,0.2)' : 'rgba(51,58,66,0.6)'),
                              borderWidth: sugarCubes === n ? 1.5 : 1,
                              borderColor: n === 0
                                ? (sugarCubes === 0 ? '#00D984' : 'rgba(74,79,85,0.3)')
                                : (sugarCubes >= n ? '#FFD93D' : 'rgba(74,79,85,0.3)'),
                              justifyContent: 'center', alignItems: 'center',
                            }}>
                            <Text style={{ fontSize: 14 }}>{n === 0 ? '🚫' : '🧊'}</Text>
                          </Pressable>
                        ))}
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text style={{ color: '#FFD93D', fontSize: fp(10), fontWeight: '700' }}>
                          {sugarCubes === 0 ? 'Sans sucre' : sugarCubes === 1 ? 'Léger' : sugarCubes <= 3 ? 'Sucré' : 'Très sucré'}
                        </Text>
                        <Text style={{ color: '#6B7280', fontSize: fp(9) }}>
                          +{sugarCubes * SUGAR_CUBE_G}g → +{sugarCubes * SUGAR_CUBE_G * 4} kcal
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {(() => {
                    const t = calcBeverageTotals();
                    return (
                      <View style={{ backgroundColor: 'rgba(13,17,23,0.5)', borderRadius: wp(12), padding: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-around', borderWidth: 1, borderColor: 'rgba(74,79,85,0.2)' }}>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: '#00D984', fontSize: fp(18), fontWeight: '900' }}>{t.effectiveMl}</Text>
                          <Text style={{ color: '#6B7280', fontSize: fp(9) }}>ml effectifs</Text>
                        </View>
                        <View style={{ width: 1, backgroundColor: 'rgba(74,79,85,0.3)' }} />
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: '#FF8C42', fontSize: fp(18), fontWeight: '900' }}>{t.kcal}</Text>
                          <Text style={{ color: '#6B7280', fontSize: fp(9) }}>kcal</Text>
                        </View>
                        <View style={{ width: 1, backgroundColor: 'rgba(74,79,85,0.3)' }} />
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: '#FFD93D', fontSize: fp(18), fontWeight: '900' }}>{t.sugarG}g</Text>
                          <Text style={{ color: '#6B7280', fontSize: fp(9) }}>sucre</Text>
                        </View>
                      </View>
                    );
                  })()}

                  <Pressable onPress={saveBeverage} disabled={beverageSaving}
                    style={({ pressed }) => ({
                      backgroundColor: beverageSaving ? '#333A42' : '#00D984',
                      borderRadius: wp(12), paddingVertical: 14, alignItems: 'center',
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                      shadowColor: '#00D984', shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: beverageSaving ? 0 : 0.3, shadowRadius: 10, elevation: beverageSaving ? 0 : 6,
                    })}>
                    <Text style={{ color: beverageSaving ? '#555E6C' : '#0D1117', fontSize: fp(14), fontWeight: '900', letterSpacing: 0.5 }}>
                      {beverageSaving ? 'Enregistrement...' : '✓  AJOUTER ' + beverageVolume + 'ml'}
                    </Text>
                  </Pressable>
                </LinearGradient>
              </View>
            </View>
          ) : (
            <View>
              {beverageLoading ? (
                <View style={{ alignItems: 'center', marginTop: 60 }}>
                  <Text style={{ fontSize: 32 }}>🔄</Text>
                  <Text style={{ color: '#555E6C', fontSize: fp(13), marginTop: 8 }}>Chargement...</Text>
                </View>
              ) : beverageList.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 60 }}>
                  <Text style={{ fontSize: 32 }}>🔍</Text>
                  <Text style={{ color: '#555E6C', fontSize: fp(13), marginTop: 8 }}>Aucune boisson trouvée</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: wp(8), paddingTop: 6 }}>
                  {beverageList.map((bev) => {
                    const coeffColor = getCoeffColor(bev.coeff);
                    return (
                      <Pressable key={bev.beverage_id} onPress={() => selectBeverage(bev)}
                        style={{ width: (W - wp(14) * 2 - wp(8) * 2) / 3, paddingVertical: 10, paddingHorizontal: 6, borderRadius: wp(14), backgroundColor: 'rgba(30,34,40,0.8)', borderWidth: 1, borderColor: 'rgba(74,79,85,0.3)' }}>
                        <Text style={{ fontSize: 28, textAlign: 'center' }}>{bev.icon}</Text>
                        <Text numberOfLines={2} style={{ color: '#EAEEF3', fontSize: fp(10), fontWeight: '600', textAlign: 'center', marginTop: 4, minHeight: 28 }}>{bev.name}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 3 }}>
                          <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: coeffColor, marginRight: 3 }} />
                          <Text style={{ color: coeffColor, fontSize: fp(9), fontWeight: '800' }}>{(bev.coeff * 100).toFixed(0)}%</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
};

export default BeverageModal;
