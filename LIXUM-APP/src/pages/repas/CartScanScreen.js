import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Image,
  ScrollView, TextInput, Modal, StatusBar, Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Path, Circle, Line } from 'react-native-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLang } from '../../config/LanguageContext';
import { useAuth } from '../../config/AuthContext';
import { wp, fp } from '../../constants/layout';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/supabase';
import LixumModal from '../../components/shared/LixumModal';

export default function CartScanScreen({ visible, onClose }) {
  var _lc = useLang(); var lang = _lc.lang;
  var auth = useAuth(); var userId = auth.userId;

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
  const [showHistory, setShowHistory] = useState(false);
  const [historyReports, setHistoryReports] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryReport, setSelectedHistoryReport] = useState(null);
  const [capturingPhoto, setCapturingPhoto] = useState(false);
  var _modalCfg = useState({ visible: false, type: 'info', title: '', message: '' });
  var modalCfg = _modalCfg[0]; var setModalCfg = _modalCfg[1];
  var closeModal = function() { setModalCfg(function(p) { return Object.assign({}, p, { visible: false }); }); };

  var _camPerm = useCameraPermissions(); var permission = _camPerm[0]; var requestPermission = _camPerm[1];
  const cameraRef = useRef(null);

  // === LOAD RECENT STORES ON MOUNT ===
  useEffect(function() {
    if (visible && userId) {
      loadRecentStores();
    }
  }, [visible, userId]);

  // === FONCTIONS ===

  var getAuthHeaders = function() {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    };
  };

  var checkProductAlerts = async function(product) {
    if (!userId) return [];
    try {
      var response = await fetch(
        SUPABASE_URL + '/functions/v1/analyze-cart',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            action: 'check_product',
            user_id: userId,
            product: product,
          }),
        }
      );
      var result = await response.json();
      var alerts = result.alerts || [];
      // Update product in cart with alerts
      setCartProducts(function(prev) {
        return prev.map(function(p) {
          if (p.barcode === product.barcode) {
            return Object.assign({}, p, { alerts: alerts, has_danger: result.has_danger, has_warning: result.has_warning });
          }
          return p;
        });
      });
      return alerts;
    } catch (e) {
      console.error('Check product error:', e);
      return [];
    }
  };

  var lookupBarcode = async function(barcode) {
    if (cartProducts.find(function(p) { return p.barcode === barcode; })) {
      setScanError('Déjà scanné !');
      setTimeout(function() { setScanError(null); }, 1500);
      return;
    }

    setLookingUp(true);
    setScanError(null);

    try {
      var response = await fetch(
        SUPABASE_URL + '/functions/v1/lookup-barcode',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ barcode: barcode }),
        }
      );

      var result = await response.json();

      if (result.product) {
        var productName = (result.product.product_name || '').toLowerCase();
        var categories = (result.product.categories || '').toLowerCase();
        var nonFoodKeywords = ['medicine', 'medicament', 'pharmaceutical', 'cough',
          'tablet', 'capsule', 'syrup', 'cosmetic', 'shampoo', 'soap', 'detergent',
          'cleaning', 'nettoyant', 'savon', 'dentifrice', 'toothpaste'];

        var isNonFood = nonFoodKeywords.some(function(kw) {
          return productName.includes(kw) || categories.includes(kw);
        });

        if (isNonFood) {
          setScanError('Produit non-alimentaire détecté');
          setTimeout(function() { setScanError(null); }, 2000);
        } else {
          Vibration.vibrate(100);
          var newProduct = Object.assign({}, result.product, { alerts: [] });
          setCartProducts(function(prev) { return prev.concat([newProduct]); });
          checkProductAlerts(result.product);
        }
      } else {
        setFailedBarcode(barcode);
        setPhotoPromptVisible(true);
      }
    } catch (e) {
      console.error('Barcode lookup error:', e);
      setScanError('Erreur réseau');
      setTimeout(function() { setScanError(null); }, 2000);
    }

    setLookingUp(false);
  };

  var captureCartPhoto = async function() {
    if (capturingPhoto || !cameraRef.current) return;
    setCapturingPhoto(true);
    setScanError('Capture photo en cours...');
    try {
      var photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      setScanError(null);
      if (!photo || !photo.base64) {
        setScanError('Erreur capture photo');
        setTimeout(function() { setScanError(null); }, 2000);
        setCapturingPhoto(false);
        return;
      }
      // Send to scan-meal edge function
      var response = await fetch(
        SUPABASE_URL + '/functions/v1/scan-meal',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            photos_base64: [photo.base64],
            user_id: userId,
            user_country: 'BI',
            user_origin_country: 'BI',
            lang: 'fr',
          }),
        }
      );
      var result = await response.json();
      if (result.suggestions && result.suggestions.length > 0) {
        var sug = result.suggestions[0];
        var photoProduct = {
          barcode: 'photo_' + Date.now(),
          product_name: sug.food_name || sug.name || 'Produit scanné',
          kcal_per_100g: Math.round(sug.kcal || sug.calories || 0),
          protein_per_100g: parseFloat(sug.protein || 0),
          carbs_per_100g: parseFloat(sug.carbs || 0),
          fat_per_100g: parseFloat(sug.fat || 0),
          image_url: null,
          source: 'photo_scan',
          alerts: [],
        };
        Vibration.vibrate(100);
        setCartProducts(function(prev) { return prev.concat([photoProduct]); });
        setCartPhotoMode(false);
        setPhotoPromptVisible(false);
      } else {
        setScanError('Produit non reconnu');
        setTimeout(function() { setScanError(null); }, 2000);
      }
    } catch (e) {
      console.error('Cart photo error:', e);
      setScanError('Erreur analyse photo');
      setTimeout(function() { setScanError(null); }, 2000);
    }
    setCapturingPhoto(false);
  };

  var handleBarcodeScan = function(evt) {
    if (!scanningActive || lookingUp) return;
    if (evt.data === lastScannedCode) return;
    setLastScannedCode(evt.data);
    setScanningActive(false);
    lookupBarcode(evt.data).then(function() {
      setTimeout(function() {
        setScanningActive(true);
        setLastScannedCode(null);
      }, 1500);
    });
  };

  var loadRecentStores = async function() {
    if (!userId) return;
    try {
      var response = await fetch(
        SUPABASE_URL + '/functions/v1/analyze-cart',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            action: 'search_stores',
            user_id: userId,
          }),
        }
      );
      var result = await response.json();
      setRecentStores(result.stores || result.recent || []);
    } catch (e) {
      console.error('Load stores error:', e);
    }
  };

  var searchStoresApi = async function(query) {
    if (query.length < 2) {
      setStoreResults([]);
      return;
    }
    if (!userId) return;
    try {
      var response = await fetch(
        SUPABASE_URL + '/functions/v1/analyze-cart',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            action: 'search_stores',
            user_id: userId,
            query: query,
          }),
        }
      );
      var result = await response.json();
      setStoreResults(result.stores || []);
    } catch (e) {
      console.error('Search stores error:', e);
    }
  };

  var generateCartReport = async function() {
    if (cartProducts.length === 0 || generatingReport || !userId) return;
    setGeneratingReport(true);

    try {
      // Step 1: Global analysis
      var analysisResponse = await fetch(
        SUPABASE_URL + '/functions/v1/analyze-cart',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            user_id: userId,
            cart_products: cartProducts,
          }),
        }
      );
      var analysis = await analysisResponse.json();

      // Step 2: Generate and save report
      var reportResponse = await fetch(
        SUPABASE_URL + '/functions/v1/analyze-cart',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            action: 'generate_report',
            user_id: userId,
            cart_products: cartProducts,
            store_name: storeName || null,
            analysis: analysis,
          }),
        }
      );
      var reportResult = await reportResponse.json();

      // Use analysis data for display, reportResult for persistence confirmation
      setCartReport(Object.assign({}, analysis, { report_id: reportResult.report_id, store_id: reportResult.store_id }));
      setShowStoreInput(false);
      setShowCartReport(true);
    } catch (e) {
      console.error('Generate report error:', e);
      setModalCfg({ visible: true, type: 'error', title: 'Erreur', message: 'Impossible de générer le rapport. Réessayez.', onClose: closeModal });
    }
    setGeneratingReport(false);
  };

  var loadHistory = async function() {
    if (!userId) return;
    setHistoryLoading(true);
    try {
      var res = await supabase
        .from('cart_reports')
        .select('*')
        .eq('user_id', userId)
        .order('report_date', { ascending: false })
        .limit(10);
      setHistoryReports(res.data || []);
    } catch (e) {
      console.error('Load history error:', e);
    }
    setHistoryLoading(false);
  };

  var removeFromCart = function(barcode) {
    setCartProducts(function(prev) { return prev.filter(function(p) { return p.barcode !== barcode; }); });
  };

  var clearCart = function() {
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

  var closeCartScan = function() {
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

  var getCartTotals = function() {
    var totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    cartProducts.forEach(function(p) {
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

  var getNutriColor = function(score) {
    if (!score) return '#6B7280';
    var colors = { a: '#00D984', b: '#A8E06C', c: '#FFD93D', d: '#FF8C42', e: '#FF6B6B' };
    return colors[score.toLowerCase()] || '#6B7280';
  };

  var getAlertBadgeColor = function(alerts) {
    if (!alerts || alerts.length === 0) return null;
    if (alerts.some(a => a.type === 'danger')) return '#FF6B6B';
    if (alerts.some(a => a.type === 'warning')) return '#FF8C42';
    return '#FFD93D';
  };

  // === JSX ===

  if (!visible) return null;

  // Permission loading or not granted — show inside a closeable screen
  if (!permission || !permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1A1D22', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(30) }}>
        <StatusBar barStyle="light-content" backgroundColor="#1A1D22" />
        <TouchableOpacity
          onPress={onClose}
          style={{ position: 'absolute', top: wp(52), left: wp(16) }}
        >
          <Text style={{ fontSize: fp(14), color: '#9CA3AF' }}>✕ Fermer</Text>
        </TouchableOpacity>
        <Text style={{ color: '#EAEEF3', fontSize: fp(18), fontWeight: '800', textAlign: 'center', marginBottom: wp(12) }}>
          🛒 CARTSCAN
        </Text>
        <Text style={{ color: '#C0C4CC', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: wp(24) }}>
          {!permission
            ? 'Chargement des permissions caméra...'
            : 'CartScan a besoin d\'accéder à votre caméra pour scanner les code-barres'}
        </Text>
        {permission && !permission.granted ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={function() { requestPermission(); }}
            style={{ backgroundColor: 'rgba(0,217,132,0.06)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)', borderRadius: 10, paddingHorizontal: wp(24), paddingVertical: wp(12) }}
          >
            <Text style={{ color: '#00D984', fontSize: fp(14), fontWeight: '700' }}>Autoriser la caméra</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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

          {/* Bouton historique courses */}
          <TouchableOpacity
            onPress={function() { setShowHistory(true); loadHistory(); }}
            style={{
              marginHorizontal: wp(16), marginBottom: wp(6),
              borderWidth: 1, borderColor: '#00D984', borderRadius: 10,
              paddingVertical: wp(7), alignItems: 'center',
              backgroundColor: 'transparent',
            }}
          >
            <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '600' }}>📋 Mes courses récentes</Text>
          </TouchableOpacity>

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

      {/* ══════ MODAL RAPPORT CADDIE ══════ */}
      <Modal
        visible={showCartReport}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowCartReport(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#1A1D22' }}>
          <StatusBar barStyle="light-content" backgroundColor="#1A1D22" />

          {/* Header */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: wp(45), paddingBottom: wp(12), paddingHorizontal: wp(16),
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}>
            <TouchableOpacity onPress={() => setShowCartReport(false)}>
              <Text style={{ fontSize: fp(13), color: '#4DA6FF' }}>← Retour</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FFFFFF' }}>
              📋 Rapport
            </Text>
            <Text style={{ fontSize: fp(11), color: '#9CA3AF' }}>
              {cartProducts.length} produits
            </Text>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} bounces={false}>
            {cartReport && (
              <View style={{ padding: wp(16) }}>
                {/* Score global */}
                <View style={{
                  backgroundColor: '#252A30', borderRadius: wp(16),
                  borderWidth: 1, borderColor: '#4A4F55',
                  padding: wp(18), marginBottom: wp(14), alignItems: 'center',
                }}>
                  <Text style={{ fontSize: fp(10), color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: wp(8) }}>
                    Score santé du caddie
                  </Text>
                  <Text style={{ fontSize: fp(42), fontWeight: '900', color: cartReport.score >= 70 ? '#00D984' : cartReport.score >= 40 ? '#FFD93D' : '#FF6B6B' }}>
                    {cartReport.score || '—'}/100
                  </Text>
                  {storeName ? (
                    <Text style={{ fontSize: fp(10), color: '#6B7280', marginTop: wp(4) }}>
                      📍 {storeName}
                    </Text>
                  ) : null}
                </View>

                {/* Total macros */}
                <View style={{
                  flexDirection: 'row', justifyContent: 'space-around',
                  backgroundColor: '#252A30', borderRadius: wp(12),
                  borderWidth: 1, borderColor: '#4A4F55',
                  padding: wp(14), marginBottom: wp(14),
                }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(18), fontWeight: '800', color: '#FF8C42' }}>{getCartTotals().kcal}</Text>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>kcal</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(18), fontWeight: '800', color: '#FF6B6B' }}>{getCartTotals().protein}</Text>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>Prot (g)</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(18), fontWeight: '800', color: '#FFD93D' }}>{getCartTotals().carbs}</Text>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>Gluc (g)</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(18), fontWeight: '800', color: '#4DA6FF' }}>{getCartTotals().fat}</Text>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>Lip (g)</Text>
                  </View>
                </View>

                {/* Résumé IA */}
                {cartReport.summary && (
                  <View style={{
                    backgroundColor: 'rgba(77,166,255,0.06)', borderRadius: wp(12),
                    borderWidth: 1, borderColor: 'rgba(77,166,255,0.15)',
                    padding: wp(14), marginBottom: wp(14),
                  }}>
                    <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#4DA6FF', marginBottom: wp(6) }}>
                      Analyse IA
                    </Text>
                    <Text style={{ fontSize: fp(10), color: '#D1D5DB', lineHeight: fp(15) }}>
                      {cartReport.summary}
                    </Text>
                  </View>
                )}

                {/* Alertes globales */}
                {cartReport.alerts && cartReport.alerts.length > 0 && (
                  <View style={{ marginBottom: wp(14) }}>
                    <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FF6B6B', marginBottom: wp(8) }}>
                      Alertes ({cartReport.alerts.length})
                    </Text>
                    {cartReport.alerts.map((alert, idx) => (
                      <View key={idx} style={{
                        flexDirection: 'row',
                        backgroundColor: alert.type === 'danger' ? 'rgba(255,107,107,0.1)' : 'rgba(255,140,66,0.1)',
                        borderRadius: wp(8), padding: wp(10), marginBottom: wp(5),
                        borderWidth: 1,
                        borderColor: alert.type === 'danger' ? 'rgba(255,107,107,0.3)' : 'rgba(255,140,66,0.2)',
                      }}>
                        <Text style={{ fontSize: fp(14), marginRight: wp(8) }}>{alert.icon || '⚠️'}</Text>
                        <Text style={{ fontSize: fp(10), color: '#D1D5DB', flex: 1, lineHeight: fp(14) }}>
                          {alert.message_fr || alert.message}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Recommandations */}
                {cartReport.recommendations && cartReport.recommendations.length > 0 && (
                  <View style={{ marginBottom: wp(14) }}>
                    <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#00D984', marginBottom: wp(8) }}>
                      Recommandations
                    </Text>
                    {cartReport.recommendations.map((rec, idx) => (
                      <View key={idx} style={{
                        backgroundColor: 'rgba(0,217,132,0.06)',
                        borderRadius: wp(8), padding: wp(10), marginBottom: wp(5),
                        borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)',
                      }}>
                        <Text style={{ fontSize: fp(10), color: '#D1D5DB', lineHeight: fp(14) }}>
                          ✅ {rec}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={{ height: wp(100) }} />
          </ScrollView>

          {/* Bouton bas */}
          <View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            backgroundColor: '#252A30', borderTopWidth: 1, borderTopColor: '#4A4F55',
            paddingHorizontal: wp(16), paddingVertical: wp(12), paddingBottom: wp(25),
            flexDirection: 'row', gap: wp(10),
          }}>
            <TouchableOpacity
              onPress={() => {
                setShowCartReport(false);
                setCartPhotoMode(false);
              }}
              style={{
                flex: 1, paddingVertical: wp(13), borderRadius: wp(12),
                borderWidth: 1, borderColor: '#4A4F55', alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: fp(12), color: '#9CA3AF', fontWeight: '600' }}>
                + Scanner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowCartReport(false);
                closeCartScan();
              }}
              style={{
                flex: 2, paddingVertical: wp(13), borderRadius: wp(12),
                backgroundColor: '#00D984', alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#1A1D22' }}>
                Terminer ✓
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══════ MODAL HISTORIQUE COURSES ══════ */}
      <Modal
        visible={showHistory}
        animationType="slide"
        transparent={false}
        onRequestClose={function() { setShowHistory(false); setSelectedHistoryReport(null); }}
      >
        <View style={{ flex: 1, backgroundColor: '#1A1D22' }}>
          <StatusBar barStyle="light-content" backgroundColor="#1A1D22" />
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: wp(45), paddingBottom: wp(12), paddingHorizontal: wp(16),
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}>
            <TouchableOpacity onPress={function() { setShowHistory(false); setSelectedHistoryReport(null); }}>
              <Text style={{ fontSize: fp(13), color: '#00D984' }}>← Retour</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FFFFFF' }}>MES COURSES RÉCENTES</Text>
            <View style={{ width: 60 }} />
          </View>

          {historyLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#888', fontSize: fp(12) }}>Chargement...</Text>
            </View>
          ) : historyReports.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(30) }}>
              <Text style={{ fontSize: fp(36), marginBottom: wp(12) }}>🛒</Text>
              <Text style={{ color: '#888', fontSize: fp(12), textAlign: 'center' }}>
                Aucune course enregistrée — scannez vos produits pour commencer !
              </Text>
            </View>
          ) : (
            <ScrollView style={{ flex: 1, padding: wp(16) }} showsVerticalScrollIndicator={false}>
              {historyReports.map(function(report, idx) {
                var reportDate = report.report_date ? new Date(report.report_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date inconnue';
                return (
                  <TouchableOpacity
                    key={report.id || idx}
                    onPress={function() { setSelectedHistoryReport(report); }}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: '#2A303B', borderRadius: 14,
                      borderWidth: 1, borderColor: '#3A3F46',
                      padding: wp(14), marginBottom: wp(10),
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(6) }}>
                      <Text style={{ color: '#EAEEF3', fontSize: fp(13), fontWeight: '700' }}>{report.store_name || 'Magasin inconnu'}</Text>
                      <Text style={{ color: '#888', fontSize: fp(10) }}>{reportDate}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(10) }}>
                      <Text style={{ color: '#888', fontSize: fp(10) }}>{report.products_count || 0} produits</Text>
                      <Text style={{ color: '#FF8C42', fontSize: fp(10), fontWeight: '700' }}>{Math.round(report.total_kcal_estimated || 0)} kcal</Text>
                      {report.danger_count > 0 ? (
                        <View style={{ backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                          <Text style={{ color: '#FF6B6B', fontSize: fp(9), fontWeight: '700' }}>{report.danger_count} danger</Text>
                        </View>
                      ) : null}
                      {report.warning_count > 0 ? (
                        <View style={{ backgroundColor: 'rgba(255,140,66,0.15)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                          <Text style={{ color: '#FF8C42', fontSize: fp(9), fontWeight: '700' }}>{report.warning_count} avert.</Text>
                        </View>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: wp(40) }} />
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* ══════ MODAL DÉTAIL COURSE HISTORIQUE ══════ */}
      <Modal
        visible={selectedHistoryReport !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={function() { setSelectedHistoryReport(null); }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', paddingHorizontal: wp(16) }}>
          <View style={{
            backgroundColor: '#1A1D22', borderRadius: wp(18),
            borderWidth: 1, borderColor: '#4A4F55',
            padding: wp(18), maxHeight: '80%',
          }}>
            {selectedHistoryReport && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={{ color: '#EAEEF3', fontSize: fp(16), fontWeight: '800', marginBottom: wp(4) }}>
                  {selectedHistoryReport.store_name || 'Magasin inconnu'}
                </Text>
                <Text style={{ color: '#888', fontSize: fp(10), marginBottom: wp(12) }}>
                  {selectedHistoryReport.report_date ? new Date(selectedHistoryReport.report_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                  {' · '}{selectedHistoryReport.products_count || 0} produits
                  {' · '}{Math.round(selectedHistoryReport.total_kcal_estimated || 0)} kcal
                </Text>

                {selectedHistoryReport.budget_message ? (
                  <View style={{ backgroundColor: 'rgba(77,166,255,0.06)', borderRadius: 10, padding: wp(10), marginBottom: wp(10), borderWidth: 1, borderColor: 'rgba(77,166,255,0.15)' }}>
                    <Text style={{ color: '#4DA6FF', fontSize: fp(10) }}>{selectedHistoryReport.budget_message}</Text>
                  </View>
                ) : null}

                {selectedHistoryReport.products_json ? (
                  <View style={{ marginBottom: wp(10) }}>
                    <Text style={{ color: '#888', fontSize: fp(10), fontWeight: '700', marginBottom: wp(6) }}>PRODUITS</Text>
                    {(function() { try { return JSON.parse(selectedHistoryReport.products_json); } catch (e) { return []; } })().map(function(p, pi) {
                      return (
                        <View key={pi} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: wp(4), borderBottomWidth: 1, borderBottomColor: '#333A42' }}>
                          <Text style={{ color: '#EAEEF3', fontSize: fp(10), flex: 1 }} numberOfLines={1}>{p.product_name || p.name || 'Produit'}</Text>
                          <Text style={{ color: '#FF8C42', fontSize: fp(10), fontWeight: '700' }}>{Math.round(p.kcal_per_100g || p.kcal || 0)} kcal</Text>
                        </View>
                      );
                    })}
                  </View>
                ) : null}

                {selectedHistoryReport.alerts_json ? (
                  <View style={{ marginBottom: wp(10) }}>
                    <Text style={{ color: '#FF6B6B', fontSize: fp(10), fontWeight: '700', marginBottom: wp(6) }}>ALERTES</Text>
                    {(function() { try { return JSON.parse(selectedHistoryReport.alerts_json); } catch (e) { return []; } })().map(function(a, ai) {
                      return (
                        <View key={ai} style={{
                          backgroundColor: a.type === 'danger' ? 'rgba(255,107,107,0.1)' : 'rgba(255,140,66,0.1)',
                          borderRadius: 8, padding: wp(8), marginBottom: wp(4),
                          borderWidth: 1, borderColor: a.type === 'danger' ? 'rgba(255,107,107,0.3)' : 'rgba(255,140,66,0.2)',
                        }}>
                          <Text style={{ color: '#D1D5DB', fontSize: fp(10) }}>{a.icon || '⚠️'} {a.message_fr || a.message}</Text>
                        </View>
                      );
                    })}
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={function() { setSelectedHistoryReport(null); }}
                  style={{
                    paddingVertical: wp(12), borderRadius: 12,
                    backgroundColor: '#00D984', alignItems: 'center', marginTop: wp(6),
                  }}
                >
                  <Text style={{ color: '#1A1D22', fontSize: fp(13), fontWeight: '700' }}>Fermer</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      <LixumModal visible={modalCfg.visible} type={modalCfg.type} title={modalCfg.title} message={modalCfg.message} onClose={modalCfg.onClose || closeModal} />
    </View>
  );
}
