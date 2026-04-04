import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Image,
  ScrollView, TextInput, Modal, StatusBar, Vibration, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Path, Circle, Line } from 'react-native-svg';
import { CameraView } from 'expo-camera';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';

const SUPABASE_URL = 'https://yuhordnzfpcswztujozi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';

export default function CartScanScreen({ visible, onClose }) {
  var _lc = useLang(); var lang = _lc.lang;

  // === ÉTATS ===
  const [cartPhotoMode, setCartPhotoMode] = useState(false);
  const [photoPromptVisible, setPhotoPromptVisible] = useState(false);
  const [failedBarcode, setFailedBarcode] = useState(null);
  const [cartProducts, setCartProducts] = useState([]);
  const [scanningActive, setScanningActive] = useState(true);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [selectedCartProduct, setSelectedCartProduct] = useState(null);
  const [showStoreInput, setShowStoreInput] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [recentStores, setRecentStores] = useState([]);
  const [storeResults, setStoreResults] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [cartReport, setCartReport] = useState(null);
  const [showCartReport, setShowCartReport] = useState(false);

  const cameraRef = useRef(null);

  // === FONCTIONS ===

  const checkProductAlerts = async (product) => {
    try {
      const userId = '00000000-0000-0000-0000-000000000001';
      const response = await fetch(
        SUPABASE_URL + '/functions/v1/analyze-cart',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            action: 'check_product',
            user_id: userId,
            product: product,
          }),
        }
      );
      const result = await response.json();
      return result.alerts || [];
    } catch (e) {
      console.error('Check product error:', e);
      return [];
    }
  };

  const lookupBarcode = async (barcode) => {
    if (cartProducts.find(p => p.barcode === barcode)) {
      setScanError('Déjà scanné !');
      setTimeout(() => setScanError(null), 1500);
      return;
    }

    setLookingUp(true);
    setScanError(null);

    try {
      const response = await fetch(
        SUPABASE_URL + '/functions/v1/lookup-barcode',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ barcode }),
        }
      );

      const result = await response.json();

      if (result.product) {
        const productName = (result.product.product_name || '').toLowerCase();
        const categories = (result.product.categories || '').toLowerCase();
        const nonFoodKeywords = ['medicine', 'medicament', 'pharmaceutical', 'cough',
          'tablet', 'capsule', 'syrup', 'cosmetic', 'shampoo', 'soap', 'detergent',
          'cleaning', 'nettoyant', 'savon', 'dentifrice', 'toothpaste'];

        const isNonFood = nonFoodKeywords.some(kw =>
          productName.includes(kw) || categories.includes(kw)
        );

        if (isNonFood) {
          setScanError('Produit non-alimentaire détecté');
          setTimeout(() => setScanError(null), 2000);
        } else {
          Vibration.vibrate(100);
          setCartProducts(prev => [...prev, result.product]);
          checkProductAlerts(result.product);
        }
      } else {
        setFailedBarcode(barcode);
        setPhotoPromptVisible(true);
      }
    } catch (e) {
      console.error('Barcode lookup error:', e);
      setScanError('Erreur réseau');
      setTimeout(() => setScanError(null), 2000);
    }

    setLookingUp(false);
  };

  const captureCartPhoto = async () => {
    try {
      setScanError('Capture photo en cours...');
      setTimeout(() => {
        setScanError(null);
        Alert.alert(
          '📸 Mode Photo CartScan',
          'La capture photo pour CartScan sera disponible dans la version build (EAS). ' +
          'En attendant, utilisez le scan code-barres pour les produits emballés.',
          [
            {
              text: 'Retour au barcode',
              onPress: () => setCartPhotoMode(false),
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ]
        );
      }, 500);
    } catch (e) {
      console.error('Cart photo error:', e);
      setScanError('Erreur capture photo');
      setTimeout(() => setScanError(null), 2000);
    }
  };

  const handleBarcodeScan = ({ type, data }) => {
    if (!scanningActive || lookingUp) return;
    if (data === lastScannedCode) return;
    setLastScannedCode(data);
    setScanningActive(false);
    lookupBarcode(data).then(() => {
      setTimeout(() => {
        setScanningActive(true);
        setLastScannedCode(null);
      }, 1500);
    });
  };

  const loadRecentStores = async () => {
    try {
      const userId = '00000000-0000-0000-0000-000000000001';
      const response = await fetch(
        SUPABASE_URL + '/functions/v1/analyze-cart',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            action: 'search_stores',
            user_id: userId,
          }),
        }
      );
      const result = await response.json();
      setRecentStores(result.recent || []);
    } catch (e) {
      console.error('Load stores error:', e);
    }
  };

  const searchStoresApi = async (query) => {
    if (query.length < 2) {
      setStoreResults([]);
      return;
    }
    try {
      const userId = '00000000-0000-0000-0000-000000000001';
      const response = await fetch(
        SUPABASE_URL + '/functions/v1/analyze-cart',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            action: 'search_stores',
            user_id: userId,
            query: query,
          }),
        }
      );
      const result = await response.json();
      setStoreResults(result.stores || []);
    } catch (e) {
      console.error('Search stores error:', e);
    }
  };

  const generateCartReport = async () => {
    if (cartProducts.length === 0 || generatingReport) return;
    setGeneratingReport(true);

    try {
      const userId = '00000000-0000-0000-0000-000000000001';
      const response = await fetch(
        SUPABASE_URL + '/functions/v1/analyze-cart',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            action: 'generate_report',
            user_id: userId,
            cart_products: cartProducts,
            store_name: storeName || 'Non spécifié',
          }),
        }
      );
      const result = await response.json();
      setCartReport(result);
      setShowStoreInput(false);
      setShowCartReport(true);
    } catch (e) {
      console.error('Generate report error:', e);
    }
    setGeneratingReport(false);
  };

  const removeFromCart = (barcode) => {
    setCartProducts(prev => prev.filter(p => p.barcode !== barcode));
  };

  const clearCart = () => {
    setCartProducts([]);
    setCartPhotoMode(false);
    setPhotoPromptVisible(false);
    setFailedBarcode(null);
    setCartReport(null);
    setShowCartReport(false);
    setShowStoreInput(false);
    setStoreName('');
    setStoreResults([]);
    setScanError(null);
    setLastScannedCode(null);
    setScanningActive(true);
    setSelectedCartProduct(null);
  };

  const closeCartScan = () => {
    setCartPhotoMode(false);
    setPhotoPromptVisible(false);
    setFailedBarcode(null);
    setCartProducts([]);
    setSelectedCartProduct(null);
    setShowStoreInput(false);
    setStoreName('');
    setStoreResults([]);
    setGeneratingReport(false);
    setCartReport(null);
    setShowCartReport(false);
    setScanError(null);
    setLastScannedCode(null);
    setScanningActive(true);
    onClose();
  };

  const getCartTotals = () => {
    const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    cartProducts.forEach(p => {
      totals.kcal += Math.round(p.kcal_per_100g || 0);
      totals.protein += parseFloat(p.protein_per_100g || 0);
      totals.carbs += parseFloat(p.carbs_per_100g || 0);
      totals.fat += parseFloat(p.fat_per_100g || 0);
    });
    return {
      kcal: Math.round(totals.kcal),
      protein: totals.protein.toFixed(1),
      carbs: totals.carbs.toFixed(1),
      fat: totals.fat.toFixed(1),
    };
  };

  const getNutriColor = (score) => {
    if (!score) return '#6B7280';
    const colors = { a: '#00D984', b: '#A8E06C', c: '#FFD93D', d: '#FF8C42', e: '#FF6B6B' };
    return colors[score.toLowerCase()] || '#6B7280';
  };

  const getAlertBadgeColor = (alerts) => {
    if (!alerts || alerts.length === 0) return null;
    if (alerts.some(a => a.type === 'danger')) return '#FF6B6B';
    if (alerts.some(a => a.type === 'warning')) return '#FF8C42';
    return '#FFD93D';
  };

  // === JSX ===

  if (!visible) return null;
  return (
    <>
      {/* ══════ MODAL CARTSCAN v3 — Caméra Unifiée ══════ */}
      <Modal
        visible={!showStoreInput && !showCartReport}
        animationType="slide"
        transparent={false}
        onRequestClose={closeCartScan}
      >
        <View style={{ flex: 1, backgroundColor: '#1A1D22' }}>
          <StatusBar barStyle="light-content" backgroundColor="#1A1D22" translucent={false} />

          {/* HEADER */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: wp(52), paddingBottom: wp(10), paddingHorizontal: wp(16),
          }}>
            <TouchableOpacity onPress={closeCartScan}>
              <Text style={{ fontSize: fp(14), color: '#9CA3AF' }}>✕ Fermer</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FFFFFF' }}>🛒 CARTSCAN</Text>
              <Text style={{ fontSize: fp(9), color: '#4DA6FF' }}>Assistant de courses</Text>
            </View>
            <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#4DA6FF' }}>
              {cartProducts.length} 📦
            </Text>
          </View>

          {/* ══════ ZONE CAMÉRA POLYVALENTE ══════ */}
          <View style={{
            height: wp(200), marginHorizontal: wp(16), borderRadius: wp(16),
            overflow: 'hidden', borderWidth: 2,
            borderColor: cartPhotoMode ? '#FF8C42' : lookingUp ? '#FF8C42' : scanError ? '#FF6B6B' : '#4DA6FF',
            backgroundColor: '#000',
          }}>
            <CameraView
              style={{ flex: 1 }} facing="back"
              ref={cameraRef}
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
              }}
              onBarcodeScanned={!cartPhotoMode && scanningActive && !lookingUp ? handleBarcodeScan : undefined}
            />

            {/* Ligne de scan / réticule photo */}
            {!cartPhotoMode ? (
              <View style={{ position: 'absolute', top: '48%', left: wp(20), right: wp(20), height: 2, backgroundColor: '#4DA6FF', opacity: 0.8 }} />
            ) : (
              <View style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -wp(20), marginLeft: -wp(20) }}>
                <View style={{ width: wp(40), height: wp(40), borderRadius: wp(20), borderWidth: 2, borderColor: 'rgba(255,140,66,0.6)', alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: wp(2), height: wp(16), backgroundColor: 'rgba(255,140,66,0.6)', position: 'absolute' }} />
                  <View style={{ width: wp(16), height: wp(2), backgroundColor: 'rgba(255,140,66,0.6)', position: 'absolute' }} />
                </View>
              </View>
            )}

            {/* Coins */}
            <View style={{ position: 'absolute', top: wp(10), left: wp(10), width: wp(22), height: wp(22), borderTopWidth: 3, borderLeftWidth: 3, borderColor: cartPhotoMode ? '#FF8C42' : '#4DA6FF', borderTopLeftRadius: wp(4) }} />
            <View style={{ position: 'absolute', top: wp(10), right: wp(10), width: wp(22), height: wp(22), borderTopWidth: 3, borderRightWidth: 3, borderColor: cartPhotoMode ? '#FF8C42' : '#4DA6FF', borderTopRightRadius: wp(4) }} />
            <View style={{ position: 'absolute', bottom: wp(10), left: wp(10), width: wp(22), height: wp(22), borderBottomWidth: 3, borderLeftWidth: 3, borderColor: cartPhotoMode ? '#FF8C42' : '#4DA6FF', borderBottomLeftRadius: wp(4) }} />
            <View style={{ position: 'absolute', bottom: wp(10), right: wp(10), width: wp(22), height: wp(22), borderBottomWidth: 3, borderRightWidth: 3, borderColor: cartPhotoMode ? '#FF8C42' : '#4DA6FF', borderBottomRightRadius: wp(4) }} />

            {/* Mode photo : bouton capture central + retour barcode */}
            {cartPhotoMode && (
              <View style={{
                position: 'absolute', bottom: wp(10), left: 0, right: 0,
                flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(16),
              }}>
                <TouchableOpacity
                  onPress={() => { setCartPhotoMode(false); setPhotoPromptVisible(false); }}
                  style={{ backgroundColor: 'rgba(77,166,255,0.9)', borderRadius: wp(14), paddingHorizontal: wp(12), paddingVertical: wp(6) }}
                >
                  <Text style={{ fontSize: fp(10), color: '#FFF', fontWeight: '600' }}>📊 Barcode</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={captureCartPhoto}
                  style={{
                    backgroundColor: '#FF8C42', borderRadius: wp(28),
                    width: wp(56), height: wp(56), alignItems: 'center', justifyContent: 'center',
                    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
                  }}
                >
                  <View style={{
                    width: wp(44), height: wp(44), borderRadius: wp(22),
                    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <View style={{
                      width: wp(36), height: wp(36), borderRadius: wp(18),
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    }} />
                  </View>
                </TouchableOpacity>

                <View style={{ backgroundColor: 'rgba(255,140,66,0.9)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(4) }}>
                  <Text style={{ fontSize: fp(9), color: '#FFF', fontWeight: '700' }}>50 Lix</Text>
                </View>
              </View>
            )}

            {/* Overlays statut */}
            {lookingUp && (
              <View style={{ position: 'absolute', bottom: wp(55), alignSelf: 'center', backgroundColor: 'rgba(255,140,66,0.9)', borderRadius: wp(8), paddingHorizontal: wp(12), paddingVertical: wp(4) }}>
                <Text style={{ fontSize: fp(10), color: '#FFF', fontWeight: '600' }}>Recherche...</Text>
              </View>
            )}
            {scanError && !photoPromptVisible && (
              <View style={{ position: 'absolute', bottom: wp(55), alignSelf: 'center', backgroundColor: 'rgba(255,107,107,0.9)', borderRadius: wp(8), paddingHorizontal: wp(12), paddingVertical: wp(4) }}>
                <Text style={{ fontSize: fp(10), color: '#FFF', fontWeight: '600' }}>{scanError}</Text>
              </View>
            )}
          </View>

          {/* ══════ BANDEAU MODE PHOTO — sous la caméra ══════ */}
          <TouchableOpacity
            onPress={() => {
              setCartPhotoMode(true);
              setPhotoPromptVisible(false);
            }}
            activeOpacity={0.85}
            style={{
              marginHorizontal: wp(16),
              marginTop: wp(6),
              marginBottom: wp(4),
              borderRadius: wp(10),
              paddingVertical: wp(8),
              paddingHorizontal: wp(14),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: photoPromptVisible
                ? 'rgba(255,140,66,0.15)'
                : 'rgba(255,255,255,0.04)',
              borderWidth: photoPromptVisible ? 1 : 0,
              borderColor: 'rgba(255,140,66,0.3)',
            }}
          >
            {photoPromptVisible ? (
              <>
                <Text style={{ fontSize: fp(11), color: '#FF8C42', fontWeight: '600', flex: 1 }}>
                  Produit non trouvé ou sans code-barres ? Prenez une photo !
                </Text>
                <View style={{
                  backgroundColor: '#FF8C42',
                  borderRadius: wp(6),
                  paddingHorizontal: wp(10),
                  paddingVertical: wp(4),
                  marginLeft: wp(8),
                }}>
                  <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#FFF' }}>📸 Photo</Text>
                </View>
                <Text style={{ fontSize: fp(8), color: '#FF8C42', marginLeft: wp(4) }}>50 Lix</Text>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setPhotoPromptVisible(false);
                    setScanningActive(true);
                    setLastScannedCode(null);
                  }}
                  style={{ marginLeft: wp(6), padding: wp(4) }}
                >
                  <Text style={{ fontSize: fp(12), color: '#6B7280' }}>✕</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontSize: fp(10), color: '#6B7280' }}>
                  📸 Pas de code-barres ?
                </Text>
                <Text style={{ fontSize: fp(10), color: '#FF8C42', fontWeight: '600', marginLeft: wp(4) }}>
                  Prendre une photo
                </Text>
                <Text style={{ fontSize: fp(8), color: '#6B7280', marginLeft: wp(4) }}>
                  · 50 Lix
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* ══════ GRILLE PRODUITS ══════ */}
          <View style={{ flex: 1, paddingHorizontal: wp(16), marginTop: wp(8) }}>
            {cartProducts.length === 0 && !photoPromptVisible ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                <Text style={{ fontSize: fp(40), marginBottom: wp(10) }}>🛒</Text>
                <Text style={{ fontSize: fp(12), color: '#9CA3AF', textAlign: 'center' }}>
                  Pointez vers un code-barres pour commencer
                </Text>
                <Text style={{ fontSize: fp(10), color: '#6B7280', textAlign: 'center', marginTop: wp(4) }}>
                  Ou tapez 📸 pour scanner sans code-barres
                </Text>
              </View>
            ) : (
              <FlatList
                data={cartProducts}
                keyExtractor={(item) => item.barcode || item.product_name}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const alerts = item.alerts || [];
                  const hasDanger = alerts.some(a => a.type === 'danger');
                  const hasWarning = alerts.some(a => a.type === 'warning');
                  return (
                    <TouchableOpacity
                      onPress={() => setSelectedCartProduct(item)}
                      activeOpacity={0.85}
                      style={{
                        width: '48%', backgroundColor: '#252A30', borderRadius: wp(12),
                        borderWidth: 1, marginBottom: wp(10), overflow: 'hidden',
                        borderColor: hasDanger ? '#FF6B6B' : hasWarning ? '#FF8C42' : '#4A4F55',
                      }}
                    >
                      <View style={{ height: wp(65), backgroundColor: '#333A42', alignItems: 'center', justifyContent: 'center' }}>
                        {item.image_url ? (
                          <Image source={{ uri: item.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                        ) : (
                          <Text style={{ fontSize: fp(24) }}>📦</Text>
                        )}
                        {item.nutriscore && (
                          <View style={{ position: 'absolute', top: wp(4), right: wp(4), backgroundColor: getNutriColor(item.nutriscore), borderRadius: wp(4), width: wp(18), height: wp(18), alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: fp(10), fontWeight: '800', color: '#1A1D22' }}>{item.nutriscore.toUpperCase()}</Text>
                          </View>
                        )}
                        {alerts.length > 0 && (
                          <View style={{ position: 'absolute', top: wp(4), left: wp(4), backgroundColor: hasDanger ? '#FF6B6B' : hasWarning ? '#FF8C42' : '#4DA6FF', borderRadius: wp(10), width: wp(20), height: wp(20), alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: fp(11), fontWeight: '800', color: '#FFF' }}>!</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ padding: wp(7) }}>
                        <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#FFFFFF', marginBottom: wp(2) }} numberOfLines={2}>{item.product_name}</Text>
                        <Text style={{ fontSize: fp(11), fontWeight: '800', color: '#FF8C42' }}>{Math.round(item.kcal_per_100g || 0)} kcal</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListFooterComponent={<View style={{ height: wp(80) }} />}
              />
            )}
          </View>

          {/* ══════ BARRE BAS ══════ */}
          {cartProducts.length > 0 && (
            <View style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              backgroundColor: '#252A30', borderTopWidth: 1, borderTopColor: '#4A4F55',
              paddingHorizontal: wp(16), paddingVertical: wp(12), paddingBottom: wp(25),
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(10), color: '#9CA3AF' }}>
                    {cartProducts.length} produit{cartProducts.length > 1 ? 's' : ''}
                  </Text>
                  {cartProducts.filter(p => p.alerts && p.alerts.length > 0).length > 0 && (
                    <Text style={{ fontSize: fp(10), color: '#FF8C42', marginLeft: wp(4) }}>
                      · {cartProducts.filter(p => p.alerts && p.alerts.length > 0).length} alerte{cartProducts.filter(p => p.alerts && p.alerts.length > 0).length > 1 ? 's' : ''}
                    </Text>
                  )}
                </View>
                <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FF8C42' }}>
                  {getCartTotals().kcal} kcal
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowStoreInput(true)}
                style={{ backgroundColor: '#4DA6FF', borderRadius: wp(12), paddingHorizontal: wp(22), paddingVertical: wp(12) }}
              >
                <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#1A1D22' }}>Générer Rapport 📋</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* ══════ MODAL DÉTAIL PRODUIT ══════ */}
      <Modal
        visible={selectedCartProduct !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedCartProduct(null)}
      >
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
          justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(16),
        }}>
          <View style={{
            width: '100%', backgroundColor: '#1A1D22',
            borderRadius: wp(18), borderWidth: 1, borderColor: '#4A4F55',
            padding: wp(18), maxHeight: '80%',
          }}>
            {selectedCartProduct && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image + Nom */}
                <View style={{ flexDirection: 'row', marginBottom: wp(14) }}>
                  <View style={{
                    width: wp(65), height: wp(65), borderRadius: wp(10),
                    backgroundColor: '#333A42', alignItems: 'center', justifyContent: 'center',
                    marginRight: wp(12), overflow: 'hidden',
                  }}>
                    {selectedCartProduct.image_url ? (
                      <Image source={{ uri: selectedCartProduct.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                    ) : (
                      <Text style={{ fontSize: fp(28) }}>📦</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFFFFF', marginBottom: wp(3) }}>
                      {selectedCartProduct.product_name}
                    </Text>
                    {selectedCartProduct.brand && (
                      <Text style={{ fontSize: fp(10), color: '#6B7280' }}>
                        {selectedCartProduct.brand}{selectedCartProduct.quantity ? ` · ${selectedCartProduct.quantity}` : ''}
                      </Text>
                    )}
                    {selectedCartProduct.nutriscore && (
                      <View style={{
                        alignSelf: 'flex-start', backgroundColor: getNutriColor(selectedCartProduct.nutriscore),
                        borderRadius: wp(4), paddingHorizontal: wp(8), paddingVertical: wp(2), marginTop: wp(4),
                      }}>
                        <Text style={{ fontSize: fp(10), fontWeight: '800', color: '#1A1D22' }}>
                          Nutri-Score {selectedCartProduct.nutriscore.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Macros */}
                <View style={{
                  flexDirection: 'row', justifyContent: 'space-around',
                  backgroundColor: '#252A30', borderRadius: wp(10), padding: wp(12),
                  marginBottom: wp(14), borderWidth: 1, borderColor: '#4A4F55',
                }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FF8C42' }}>{Math.round(selectedCartProduct.kcal_per_100g || 0)}</Text>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>kcal</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FF6B6B' }}>{parseFloat(selectedCartProduct.protein_per_100g || 0).toFixed(1)}</Text>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>Prot</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FFD93D' }}>{parseFloat(selectedCartProduct.carbs_per_100g || 0).toFixed(1)}</Text>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>Gluc</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#4DA6FF' }}>{parseFloat(selectedCartProduct.fat_per_100g || 0).toFixed(1)}</Text>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>Lip</Text>
                  </View>
                </View>

                {/* Alertes du produit */}
                {selectedCartProduct.alerts && selectedCartProduct.alerts.length > 0 && (
                  <View style={{ marginBottom: wp(14) }}>
                    <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FF6B6B', marginBottom: wp(8) }}>
                      Alertes ({selectedCartProduct.alerts.length})
                    </Text>
                    {selectedCartProduct.alerts.map((alert, idx) => (
                      <View key={idx} style={{
                        flexDirection: 'row',
                        backgroundColor: alert.type === 'danger' ? 'rgba(255,107,107,0.1)' : alert.type === 'warning' ? 'rgba(255,140,66,0.1)' : 'rgba(77,166,255,0.06)',
                        borderRadius: wp(8), padding: wp(10), marginBottom: wp(5),
                        borderWidth: 1,
                        borderColor: alert.type === 'danger' ? 'rgba(255,107,107,0.3)' : alert.type === 'warning' ? 'rgba(255,140,66,0.2)' : 'rgba(77,166,255,0.15)',
                      }}>
                        <Text style={{ fontSize: fp(14), marginRight: wp(8) }}>{alert.icon}</Text>
                        <Text style={{ fontSize: fp(10), color: '#D1D5DB', flex: 1, lineHeight: fp(14) }}>
                          {alert.message_fr}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {selectedCartProduct.alerts && selectedCartProduct.alerts.length === 0 && (
                  <View style={{
                    backgroundColor: 'rgba(0,217,132,0.08)', borderRadius: wp(10),
                    padding: wp(12), marginBottom: wp(14), alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: fp(11), color: '#00D984', fontWeight: '600' }}>
                      ✅ Aucune alerte pour ce produit
                    </Text>
                  </View>
                )}

                {/* Boutons */}
                <View style={{ flexDirection: 'row', gap: wp(10) }}>
                  <TouchableOpacity
                    onPress={() => {
                      removeFromCart(selectedCartProduct.barcode);
                      setSelectedCartProduct(null);
                    }}
                    style={{
                      flex: 1, paddingVertical: wp(12), borderRadius: wp(10),
                      borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: fp(11), color: '#FF6B6B', fontWeight: '600' }}>Retirer 🗑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSelectedCartProduct(null)}
                    style={{
                      flex: 1.5, paddingVertical: wp(12), borderRadius: wp(10),
                      backgroundColor: '#4DA6FF', alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: fp(11), color: '#1A1D22', fontWeight: '700' }}>OK ✓</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ══════ MODAL SAISIE MAGASIN ══════ */}
      <Modal
        visible={showStoreInput}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStoreInput(false)}
      >
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: '#1A1D22',
            borderTopLeftRadius: wp(20), borderTopRightRadius: wp(20),
            borderWidth: 1, borderColor: '#4A4F55',
            padding: wp(20), paddingBottom: wp(35),
          }}>
            <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: wp(4) }}>
              📍 Dans quel magasin ?
            </Text>
            <Text style={{ fontSize: fp(10), color: '#9CA3AF', textAlign: 'center', marginBottom: wp(16) }}>
              Le rapport sera associé à ce magasin
            </Text>

            {/* Champ de saisie */}
            <TextInput
              value={storeName}
              onChangeText={(text) => {
                setStoreName(text);
                searchStoresApi(text);
              }}
              placeholder="Ex: Carrefour Market, Auchan..."
              placeholderTextColor="#6B7280"
              style={{
                backgroundColor: '#252A30',
                borderRadius: wp(12), borderWidth: 1, borderColor: '#4A4F55',
                paddingHorizontal: wp(14), paddingVertical: wp(12),
                fontSize: fp(13), color: '#FFFFFF',
                marginBottom: wp(10),
              }}
            />

            {/* Suggestions de magasins récents */}
            {storeName.length === 0 && recentStores.length > 0 && (
              <View style={{ marginBottom: wp(10) }}>
                <Text style={{ fontSize: fp(9), color: '#6B7280', marginBottom: wp(6) }}>Récents</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(6) }}>
                  {recentStores.slice(0, 5).map((store, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setStoreName(store)}
                      style={{
                        backgroundColor: 'rgba(77,166,255,0.08)',
                        borderRadius: wp(8), borderWidth: 1, borderColor: 'rgba(77,166,255,0.2)',
                        paddingHorizontal: wp(10), paddingVertical: wp(6),
                      }}
                    >
                      <Text style={{ fontSize: fp(10), color: '#4DA6FF' }}>{store}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Résultats de recherche */}
            {storeResults.length > 0 && (
              <View style={{ marginBottom: wp(10), maxHeight: wp(100) }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {storeResults.map((store, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => {
                        setStoreName(store.name || store);
                        setStoreResults([]);
                      }}
                      style={{
                        paddingVertical: wp(8), paddingHorizontal: wp(12),
                        borderBottomWidth: 1, borderBottomColor: '#333A42',
                      }}
                    >
                      <Text style={{ fontSize: fp(11), color: '#FFFFFF' }}>{store.name || store}</Text>
                      {store.address && (
                        <Text style={{ fontSize: fp(9), color: '#6B7280' }}>{store.address}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Boutons */}
            <View style={{ flexDirection: 'row', gap: wp(10), marginTop: wp(6) }}>
              <TouchableOpacity
                onPress={() => {
                  setShowStoreInput(false);
                  setStoreName('');
                  setStoreResults([]);
                }}
                style={{
                  flex: 1, paddingVertical: wp(13), borderRadius: wp(12),
                  borderWidth: 1, borderColor: '#4A4F55', alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: fp(12), color: '#9CA3AF', fontWeight: '600' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={generateCartReport}
                disabled={generatingReport}
                style={{
                  flex: 2, paddingVertical: wp(13), borderRadius: wp(12),
                  backgroundColor: generatingReport ? '#333A42' : '#4DA6FF',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#1A1D22' }}>
                  {generatingReport ? 'Analyse en cours...' : 'Générer 📋'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* === PHASE 7 : Modal rapport === */}
    </>
  );
}
