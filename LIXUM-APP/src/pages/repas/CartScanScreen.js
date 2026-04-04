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

  // === JSX (phases suivantes) ===

  if (!visible) return null;
  return null;
}
