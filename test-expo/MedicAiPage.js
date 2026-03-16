// ──────────────────────────────────────────────────────────────────────────────
// MedicAiPage.js — LIXUM MedicAi Chat Page with LixMan (Phase A)
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, KeyboardAvoidingView, Platform, Animated,
  Dimensions, StatusBar, SafeAreaView, ActivityIndicator,
  FlatList, PixelRatio, Keyboard,
} from 'react-native';
import Svg, {
  G, Line, Circle, Path, Rect, Ellipse, Defs,
  LinearGradient as SvgLinearGradient, Stop,
  Text as SvgText,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Responsive system ────────────────────────────────────────────────────────
const W = SCREEN_WIDTH;
const BASE_WIDTH = 320;
const wp = (size) => (W / BASE_WIDTH) * size;
const fp = (size) => {
  const scaled = (W / BASE_WIDTH) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

// ============================================
// CONFIG SUPABASE (même que les autres pages)
// ============================================
const SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';

// User test (même UUID que partout)
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// ============================================
// TABS CONFIG
// ============================================
const TABS = [
  { key: 'home', label: 'Accueil', iconActive: 'home', iconInactive: 'home-outline' },
  { key: 'meals', label: 'Repas', iconActive: 'restaurant', iconInactive: 'restaurant-outline' },
  { key: 'activity', label: 'Activité', iconActive: 'fitness', iconInactive: 'fitness-outline' },
  { key: 'medicai', label: 'MedicAi', iconActive: 'medkit', iconInactive: 'medkit-outline', locked: false, isMedicAi: true },
  { key: 'profile', label: 'Profil', iconActive: 'person', iconInactive: 'person-outline' },
];

// ============================================
// LOCK ICON
// ============================================
const LockIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="5" y="11" width="14" height="10" rx="2" fill="#8892A0" opacity={0.6} />
    <Path d="M8 11V7c0-2.21 1.79-4 4-4s4 1.79 4 4v4" fill="none" stroke="#8892A0" strokeWidth={2} strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1.5" fill="#EAEEF3" />
  </Svg>
);

// ============================================
// BOTTOM TABS (identique aux autres pages)
// ============================================
const BottomTabs = ({ activeTab, onTabPress }) => (
  <View
    style={{
      flexDirection: 'row',
      backgroundColor: '#141A22',
      borderTopWidth: 1,
      borderTopColor: 'rgba(74,79,85,0.5)',
      paddingTop: wp(10),
      paddingBottom: Platform.OS === 'android' ? 50 : 34,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 20,
    }}
  >
    {TABS.map((tab) => {
      const active = activeTab === tab.key;
      return (
        <TouchableOpacity
          key={tab.key}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: wp(4) }}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={0.7}
        >
          <View style={{ position: 'relative' }}>
            {tab.isMedicAi ? (
              <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24">
                <Defs>
                  <SvgLinearGradient id="medicGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                    <Stop offset="0%" stopColor="#FF6B8A" />
                    <Stop offset="100%" stopColor="#FF3B5C" />
                  </SvgLinearGradient>
                </Defs>
                <Rect x="8" y="2" width="8" height="20" rx="2" fill="url(#medicGrad)" opacity={active ? 1 : 0.5} />
                <Rect x="2" y="8" width="20" height="8" rx="2" fill="url(#medicGrad)" opacity={active ? 1 : 0.5} />
                <Path d="M12 11.5c.5-.8 1.5-1 2-.5s.5 1.5 0 2.5l-2 2-2-2c-.5-1-.5-2 0-2.5s1.5-.3 2 .5z"
                  fill="white" opacity={0.7} />
              </Svg>
            ) : (
              <Ionicons
                name={active ? tab.iconActive : tab.iconInactive}
                size={wp(22)}
                color={active ? '#00D984' : '#6B7B8D'}
              />
            )}
            {tab.locked && (
              <View style={{
                position: 'absolute', top: -3, right: -6,
                backgroundColor: 'rgba(21,27,35,0.9)', borderRadius: 6,
                width: 12, height: 12, justifyContent: 'center', alignItems: 'center',
              }}>
                <LockIcon size={10} />
              </View>
            )}
          </View>
          <Text style={[
            { color: '#6B7B8D', fontSize: fp(9), fontWeight: '600', letterSpacing: wp(0.3), marginTop: -2 },
            active && (tab.isMedicAi ? { color: '#FF3B5C' } : { color: '#00D984' }),
            tab.isMedicAi && !active && { color: '#8892A0' },
          ]}>{tab.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ============================================
// RENDU FORMATÉ — Markdown + Liens Recettes
// Gère : **bold**, - listes, [RECETTE:nom], sauts de ligne
// ============================================
const FormattedText = ({ text, style, onRecipePress }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <View>
      {lines.map((line, lineIndex) => {
        if (line.trim() === '') {
          return <View key={lineIndex} style={{ height: 6 }} />;
        }

        // Détecter [RECETTE:nom_du_plat]
        const recipeMatch = line.match(/\[RECETTE:(.*?)\]/);
        if (recipeMatch) {
          const recipeName = recipeMatch[1];
          return (
            <TouchableOpacity
              key={lineIndex}
              onPress={() => onRecipePress && onRecipePress(recipeName)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(0,217,132,0.1)',
                borderWidth: 1,
                borderColor: 'rgba(0,217,132,0.3)',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginVertical: 4,
              }}
            >
              <Text style={{ fontSize: 16, marginRight: 8 }}>🍽️</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#00D984', fontSize: 13, fontWeight: 'bold' }}>
                  {recipeName}
                </Text>
                <Text style={{ color: '#888', fontSize: 9 }}>
                  Appuyez pour voir la recette →
                </Text>
              </View>
              <Text style={{ color: '#00D984', fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          );
        }

        // Ligne "- " = puce de liste
        const isBullet = line.trim().startsWith('- ');
        const cleanLine = isBullet ? line.trim().substring(2) : line;

        // Parser **bold**
        const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

        return (
          <View key={lineIndex} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 2, paddingLeft: isBullet ? 4 : 0 }}>
            {isBullet && (
              <Text style={[style, { marginRight: 6 }]}>•</Text>
            )}
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <Text key={partIndex} style={[style, { fontWeight: 'bold', color: '#FFF' }]}>
                    {part.slice(2, -2)}
                  </Text>
                );
              }
              return <Text key={partIndex} style={style}>{part}</Text>;
            })}
          </View>
        );
      })}
    </View>
  );
};

// ============================================
// FOND VIVANT — Circuits animés du cabinet digital
// ============================================
const CabinetBackground = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 2000, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  return (
    <View style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#060810',
    }}>
      {/* Lignes de circuit verticales */}
      {[0.15, 0.35, 0.65, 0.85].map((pos, i) => (
        <Animated.View key={`v${i}`} style={{
          position: 'absolute',
          left: `${pos * 100}%`,
          top: 0,
          bottom: 0,
          width: 0.5,
          backgroundColor: '#00D984',
          opacity: pulseAnim,
        }} />
      ))}

      {/* Lignes horizontales */}
      {[0.2, 0.5, 0.8].map((pos, i) => (
        <Animated.View key={`h${i}`} style={{
          position: 'absolute',
          top: `${pos * 100}%`,
          left: 0,
          right: 0,
          height: 0.5,
          backgroundColor: '#00D984',
          opacity: Animated.multiply(pulseAnim, 0.5),
        }} />
      ))}

      {/* Noeuds de circuit (petits cercles aux intersections) */}
      {[
        { x: '15%', y: '20%' }, { x: '35%', y: '50%' },
        { x: '65%', y: '20%' }, { x: '85%', y: '80%' },
        { x: '15%', y: '80%' }, { x: '65%', y: '50%' },
      ].map((node, i) => (
        <Animated.View key={`n${i}`} style={{
          position: 'absolute',
          left: node.x,
          top: node.y,
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: '#00D984',
          opacity: pulseAnim,
        }} />
      ))}

      {/* Overlay gradient sombre pour que le contenu soit lisible */}
      <View style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(6, 8, 16, 0.85)',
      }} />
    </View>
  );
};

// ============================================
// INDICATEUR DE RÉFLEXION — Cerveau qui pulse
// ============================================
const ThinkingIndicator = () => {
  const brainPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(brainPulse, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(brainPulse, { toValue: 0.4, duration: 800, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ alignSelf: 'flex-start', marginBottom: 10 }}>
      {/* Avatar + nom */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, marginLeft: 4 }}>
        <Image
          source={require('./assets/lixman-avatar.png')}
          style={{ width: 20, height: 20, borderRadius: 10, marginRight: 5, borderWidth: 1.5, borderColor: '#00D984' }}
          resizeMode="cover"
        />
        <Text style={{ color: '#00D984', fontSize: 11, fontWeight: 'bold' }}>LixMan</Text>
      </View>

      {/* Bulle avec animation cerveau */}
      <View style={{
        backgroundColor: 'rgba(40,40,50,0.8)',
        borderRadius: 16,
        borderTopLeftRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(60,60,70,0.5)',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        {/* Icône cerveau qui pulse en vert */}
        <Animated.View style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: 'rgba(0,217,132,0.15)',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 10,
          borderWidth: 1.5,
          borderColor: 'rgba(0,217,132,0.5)',
          opacity: brainPulse,
        }}>
          <Text style={{ fontSize: 14 }}>🧠</Text>
        </Animated.View>

        {/* Texte + points animés */}
        <View>
          <Text style={{ color: '#00D984', fontSize: 12, fontWeight: 'bold' }}>
            Analyse en cours
          </Text>
          <Text style={{ color: '#666', fontSize: 9, marginTop: 1 }}>
            LixMan consulte vos données...
          </Text>
        </View>
      </View>
    </View>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function MedicAiPage() {
  // Messages du chat
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Données utilisateur (chargées au mount)
  const [userProfile, setUserProfile] = useState(null);
  const [todaySummary, setTodaySummary] = useState(null);
  const [tokenUsed, setTokenUsed] = useState(0);
  const [tokenLimit, setTokenLimit] = useState(1000);

  // Plats disponibles + modal recette
  const [availableMeals, setAvailableMeals] = useState([]);
  const [recipeModal, setRecipeModal] = useState(null);

  // Navigation
  const [activeTab, setActiveTab] = useState('medicai');

  // Clavier
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Refs
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);

  // ── Chargement des données au mount ──────────────────────────────────────
  useEffect(() => {
    loadUserData();
    loadTokenQuota();
    loadAvailableMeals();
  }, []);

  // ── Keyboard listener ────────────────────────────────────────────────────
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const addBotMessage = useCallback((text) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: text,
      timestamp: new Date(),
    }]);
  }, []);

  const loadUserData = async () => {
    try {
      // Profil utilisateur
      const profileRes = await fetch(
        `${SUPABASE_URL}/rest/v1/users_profile?id=eq.${TEST_USER_ID}&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const profileData = await profileRes.json();
      if (profileData.length > 0) setUserProfile(profileData[0]);

      // Résumé du jour
      const today = new Date().toISOString().split('T')[0];
      const summaryRes = await fetch(
        `${SUPABASE_URL}/rest/v1/daily_summary?user_id=eq.${TEST_USER_ID}&date=eq.${today}&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const summaryData = await summaryRes.json();
      if (summaryData.length > 0) setTodaySummary(summaryData[0]);

      // Générer le message d'accueil après chargement
      generateGreeting(profileData[0], summaryData[0]);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      addBotMessage("Bonjour ! Je suis LixMan, votre coach nutritionniste IA personnel. Comment puis-je vous aider aujourd'hui ?");
    }
  };

  const loadTokenQuota = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/medic_token_quotas?user_id=eq.${TEST_USER_ID}&date=eq.${today}&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const data = await res.json();
      if (data.length > 0) {
        setTokenUsed(data[0].tokens_used);
        setTokenLimit(data[0].tokens_limit);
      }
    } catch (error) {
      // Pas grave, on affiche les défauts
    }
  };

  const loadAvailableMeals = async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/meals_master?select=id,name,category,calories_per_serving&order=name`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const data = await res.json();
      if (Array.isArray(data)) setAvailableMeals(data);
    } catch (error) {
      console.error('Erreur chargement plats:', error);
    }
  };

  // ── Message d'accueil intelligent ────────────────────────────────────────
  const generateGreeting = (profile, summary) => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
    const name = profile?.first_name || 'cher membre';

    let greeting = '';

    if (!summary || summary.total_calories === 0) {
      if (hour > 13) {
        greeting = `${timeGreeting} ${name} ! Ravi de vous revoir dans votre espace santé. 👋\n\nJe remarque que vous n'avez encore rien mangé aujourd'hui... Tout va bien ?\n\nN'oubliez pas que sauter des repas n'est jamais bon pour le métabolisme. Même un fruit ou un yaourt, c'est mieux que rien. 🍎`;
      } else {
        greeting = `Bienvenue ${name} dans votre espace santé intelligent ! 👋\n\nJe suis LixMan, votre coach nutritionniste IA personnel. Ici, tout est confidentiel et pensé pour votre bien-être.\n\nParlez-moi de vos objectifs santé, je suis tout ouïe.`;
      }
    } else {
      const calories = summary.total_calories || 0;
      const tdee = profile?.tdee || 2000;
      const percentage = Math.round((calories / tdee) * 100);

      greeting = `${timeGreeting} ${name} ! Content de vous revoir. 👋\n\nJ'ai jeté un œil à vos données du jour depuis votre espace santé : vous êtes à ${calories} kcal sur ${tdee} kcal (${percentage}%).\n\n`;

      if (percentage < 30 && hour > 14) {
        greeting += `C'est un peu bas pour cette heure-ci. Vous avez prévu de manger bientôt ? 🤔`;
      } else if (percentage > 100) {
        greeting += `Vous avez dépassé votre objectif calorique aujourd'hui. Ce n'est pas grave si c'est occasionnel ! On en discute ? 😊`;
      } else {
        greeting += `Vous êtes bien parti ! De quoi voulez-vous qu'on parle ? 😊`;
      }
    }

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    }]);
  };

  // ── Construire le contexte utilisateur ───────────────────────────────────
  const buildUserContext = () => {
    if (!userProfile) return 'Données utilisateur non disponibles.';

    const today = new Date().toLocaleDateString('fr-FR');
    const cal = todaySummary?.total_calories || 0;
    const protein = todaySummary?.total_protein || 0;
    const carbs = todaySummary?.total_carbs || 0;
    const fat = todaySummary?.total_fat || 0;

    // Liste des plats disponibles
    const mealsList = availableMeals.length > 0
      ? availableMeals.map(m => `${m.name} (${m.calories_per_serving || '?'} kcal)`).join(', ')
      : 'Liste non chargée';

    return `
DONNÉES UTILISATEUR (${today}) :
- Nom : ${userProfile.first_name || 'N/A'} ${userProfile.last_name || ''}
- Âge : ${userProfile.age || 'N/A'} ans | Sexe : ${userProfile.gender || 'N/A'}
- Poids : ${userProfile.weight || 'N/A'} kg | Taille : ${userProfile.height || 'N/A'} cm
- Objectif : ${userProfile.goal || 'N/A'}
- BMR : ${userProfile.bmr || 'N/A'} kcal | TDEE : ${userProfile.tdee || 'N/A'} kcal

MACROS AUJOURD'HUI :
- Calories : ${cal} / ${userProfile.tdee || 2000} kcal
- Protéines : ${protein}g | Glucides : ${carbs}g | Lipides : ${fat}g

PLATS DISPONIBLES DANS L'APP (liste de la base de recettes) :
${mealsList}
    `;
  };

  // ── Gestion clic recette ─────────────────────────────────────────────────
  const handleRecipePress = (recipeName) => {
    setRecipeModal({ name: recipeName });
  };

  const confirmNavigateToRecipe = () => {
    const recipeName = recipeModal?.name;
    setRecipeModal(null);
    setActiveTab('repas');
    // TODO EAS Build avec React Navigation :
    // navigation.navigate('Repas', { recipe: recipeName, section: 'recettes' });
  };

  // ── Envoi de message et appel IA ─────────────────────────────────────────
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Construire le contexte utilisateur
      const userContext = buildUserContext();

      // Construire l'historique pour l'API (les 20 derniers messages max)
      const chatHistory = [...messages, userMessage]
        .slice(-20)
        .map(m => ({ role: m.role, content: m.content }));

      // Appel à l'Edge Function LixMan
      const response = await fetch(`${SUPABASE_URL}/functions/v1/lixman-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: chatHistory,
          userId: TEST_USER_ID,
          userContext: userContext,
        }),
      });

      const data = await response.json();

      if (data.error) {
        addBotMessage("Désolé, j'ai atteint la limite de tokens pour aujourd'hui. Revenez demain ou utilisez des Lix pour continuer. 🔋");
      } else {
        addBotMessage(data.message || data.content?.[0]?.text || "Hmm, je n'ai pas pu traiter votre message. Réessayez ?");
        if (data.tokens_used) setTokenUsed(prev => prev + data.tokens_used);
      }
    } catch (error) {
      console.error('Erreur LixMan:', error);
      addBotMessage("Oups, une erreur est survenue. Vérifiez votre connexion et réessayez. 🔄");
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      {/* Fond vivant du cabinet */}
      <CabinetBackground />

      <StatusBar barStyle="light-content" />

      {/* ===== HEADER ===== */}
      <View style={{
        paddingTop: Platform.OS === 'android' ? 35 : 50,
        paddingHorizontal: 16,
        paddingBottom: 8,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: '#FFF', fontSize: 22, fontWeight: 'bold' }}>MedicAi</Text>
            <Text style={{ color: 'rgba(0,217,132,0.5)', fontSize: 9, letterSpacing: 1 }}>
              ESPACE SANTÉ INTELLIGENT
            </Text>
          </View>
          <View style={{
            backgroundColor: 'rgba(0,217,132,0.15)',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: 'rgba(0,217,132,0.3)',
          }}>
            <Text style={{ color: '#00D984', fontSize: 12 }}>🟢 En ligne</Text>
          </View>
        </View>
      </View>

      {/* ===== BARRE DE TOKENS — Style circuit ===== */}
      <View style={{
        marginHorizontal: 16,
        marginBottom: 6,
        backgroundColor: 'rgba(15,18,28,0.8)',
        borderRadius: 10,
        padding: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,217,132,0.15)',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ color: 'rgba(0,217,132,0.6)', fontSize: 10, letterSpacing: 0.5 }}>
            ⚡ ÉNERGIE DISPONIBLE
          </Text>
          <Text style={{ color: '#AAA', fontSize: 10 }}>{tokenUsed} / {tokenLimit}</Text>
        </View>
        <View style={{
          height: 3,
          backgroundColor: 'rgba(0,217,132,0.1)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <View style={{
            height: '100%',
            width: `${Math.min((tokenUsed / tokenLimit) * 100, 100)}%`,
            backgroundColor: (tokenUsed / tokenLimit) < 0.6 ? '#00D984' : (tokenUsed / tokenLimit) < 0.85 ? '#FF8C00' : '#FF4444',
            borderRadius: 2,
          }} />
        </View>
      </View>

      {/* ===== ZONE DE CHAT ===== */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {/* ZONE LIXMAN — Image + Dossiers connectés par circuits */}
            <View style={{ alignItems: 'center', marginVertical: 8 }}>

              {/* Zone LixMan avec circuits */}
              <View style={{ width: SCREEN_WIDTH - 32, position: 'relative' }}>

                {/* Image LixMan — Grande image paysage */}
                <Image
                  source={require('./assets/lixman-doctor.png')}
                  style={{
                    width: '100%',
                    height: 160,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(0,217,132,0.3)',
                  }}
                  resizeMode="cover"
                />

                {/* Sous-titre cabinet */}
                <Text style={{
                  color: 'rgba(0,217,132,0.6)',
                  fontSize: 9,
                  textAlign: 'center',
                  marginTop: 4,
                  fontStyle: 'italic',
                  letterSpacing: 0.5,
                }}>
                  LixMan — Votre espace santé intelligent
                </Text>

                {/* Deux dossiers connectés par des circuits */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 8,
                  paddingHorizontal: 10,
                }}>
                  {/* MediBook */}
                  <TouchableOpacity
                    onPress={() => {
                      addBotMessage("Le MediBook sera disponible dans une prochaine mise à jour. Il vous permettra de stocker vos ordonnances, rendez-vous et rappels de médicaments. 📋");
                    }}
                    style={{
                      flex: 1,
                      marginRight: 6,
                      backgroundColor: 'rgba(0,217,132,0.08)',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: 'rgba(0,217,132,0.25)',
                      padding: 10,
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Circuit connecteur vers le haut (vers l'image LixMan) */}
                    <View style={{
                      position: 'absolute',
                      top: -9,
                      left: '50%',
                      width: 1,
                      height: 9,
                      backgroundColor: 'rgba(0,217,132,0.4)',
                    }} />
                    <View style={{
                      position: 'absolute',
                      top: -12,
                      left: '48%',
                      width: 5,
                      height: 5,
                      borderRadius: 2.5,
                      backgroundColor: '#00D984',
                      opacity: 0.6,
                    }} />

                    <Text style={{ fontSize: 22, marginBottom: 4 }}>📋</Text>
                    <Text style={{ color: '#00D984', fontSize: 11, fontWeight: 'bold' }}>MediBook</Text>
                    <Text style={{ color: '#666', fontSize: 8, textAlign: 'center', marginTop: 2 }}>
                      Dossier médical
                    </Text>
                  </TouchableOpacity>

                  {/* Secret Pocket */}
                  <TouchableOpacity
                    onPress={() => {
                      addBotMessage("Le Secret Pocket sera disponible dans une prochaine mise à jour. Vos données sensibles seront chiffrées et accessibles uniquement par empreinte digitale. 🔐");
                    }}
                    style={{
                      flex: 1,
                      marginLeft: 6,
                      backgroundColor: 'rgba(255,180,0,0.06)',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: 'rgba(255,180,0,0.2)',
                      padding: 10,
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Circuit connecteur vers le haut */}
                    <View style={{
                      position: 'absolute',
                      top: -9,
                      left: '50%',
                      width: 1,
                      height: 9,
                      backgroundColor: 'rgba(255,180,0,0.3)',
                    }} />
                    <View style={{
                      position: 'absolute',
                      top: -12,
                      left: '48%',
                      width: 5,
                      height: 5,
                      borderRadius: 2.5,
                      backgroundColor: '#FFB400',
                      opacity: 0.5,
                    }} />

                    <Text style={{ fontSize: 22, marginBottom: 4 }}>🔐</Text>
                    <Text style={{ color: '#FFB400', fontSize: 11, fontWeight: 'bold' }}>Secret Pocket</Text>
                    <Text style={{ color: '#666', fontSize: 8, textAlign: 'center', marginTop: 2 }}>
                      Coffre-fort santé
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

          {/* MESSAGES */}
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                marginBottom: 10,
              }}
            >
              {/* Label LixMan ou Vous */}
              {msg.role === 'user' ? (
                <Text style={{
                  color: '#888',
                  fontSize: 10,
                  marginBottom: 2,
                  textAlign: 'right',
                }}>
                  Vous
                </Text>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, marginLeft: 4 }}>
                  <Image
                    source={require('./assets/lixman-avatar.png')}
                    style={{ width: 20, height: 20, borderRadius: 10, marginRight: 5, borderWidth: 1.5, borderColor: '#00D984' }}
                    resizeMode="cover"
                  />
                  <Text style={{ color: '#00D984', fontSize: 11, fontWeight: 'bold' }}>LixMan</Text>
                </View>
              )}

              {/* Bulle — Style cabinet médical */}
              {msg.role === 'user' ? (
                <View style={{
                  backgroundColor: 'rgba(0,217,132,0.12)',
                  borderRadius: 14,
                  borderTopRightRadius: 4,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(0,217,132,0.2)',
                }}>
                  <Text style={{
                    color: '#E0E0E0',
                    fontSize: 14,
                    lineHeight: 20,
                  }}>
                    {msg.content}
                  </Text>
                </View>
              ) : (
                <View style={{
                  backgroundColor: 'rgba(25,30,40,0.85)',
                  borderRadius: 14,
                  borderTopLeftRadius: 4,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(0,217,132,0.15)',
                  borderLeftWidth: 3,
                  borderLeftColor: '#00D984',
                }}>
                  <FormattedText
                    text={msg.content}
                    style={{ color: '#E0E0E0', fontSize: 14, lineHeight: 20 }}
                    onRecipePress={handleRecipePress}
                  />
                </View>
              )}

              {/* Heure */}
              <Text style={{
                color: '#555',
                fontSize: 9,
                marginTop: 2,
                textAlign: msg.role === 'user' ? 'right' : 'left',
                marginLeft: msg.role === 'user' ? 0 : 4,
              }}>
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
              </Text>
            </View>
          ))}

          {/* Indicateur "LixMan réfléchit..." — Cerveau qui pulse */}
          {isTyping && <ThinkingIndicator />}
        </ScrollView>

        {/* ===== BARRE DE SAISIE — Style cabinet ===== */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: keyboardVisible ? 8 : 75,
          backgroundColor: 'rgba(10,12,20,0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,217,132,0.15)',
        }}>
          {/* Bouton pièce jointe */}
          <TouchableOpacity
            style={{ padding: 6, marginRight: 4 }}
            onPress={() => {
              addBotMessage("La fonction d'import de documents sera disponible prochainement dans le MediBook. Restez connecté ! 📋");
            }}
          >
            <Text style={{ fontSize: 20 }}>📎</Text>
          </TouchableOpacity>

          {/* Champ de texte */}
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(20,25,35,0.8)',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(0,217,132,0.2)',
            paddingHorizontal: 14,
            paddingVertical: Platform.OS === 'ios' ? 10 : 6,
          }}>
            <TextInput
              ref={inputRef}
              style={{
                flex: 1,
                color: '#FFFFFF',
                fontSize: 14,
                maxHeight: 80,
                paddingVertical: 0,
              }}
              placeholder="Consultez LixMan..."
              placeholderTextColor="#555"
              selectionColor="#00D984"
              value={inputText}
              onChangeText={setInputText}
              multiline
              returnKeyType="default"
              blurOnSubmit={false}
            />
          </View>

          {/* Bouton micro */}
          <TouchableOpacity
            style={{ padding: 6, marginLeft: 4 }}
            onPress={() => {
              addBotMessage("La reconnaissance vocale sera disponible prochainement. En attendant, tapez votre message ! 🎤");
            }}
          >
            <Text style={{ fontSize: 18 }}>🎤</Text>
          </TouchableOpacity>

          {/* Bouton envoyer */}
          <TouchableOpacity
            style={{
              marginLeft: 4,
              backgroundColor: inputText.trim() ? '#00D984' : '#333',
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={{ color: inputText.trim() ? '#000' : '#666', fontSize: 16, fontWeight: 'bold' }}>
              ➤
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ===== BOTTOM TAB BAR ===== */}
      {!keyboardVisible && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <BottomTabs activeTab={activeTab} onTabPress={setActiveTab} />
        </View>
      )}

      {/* === MODAL CONFIRMATION RECETTE === */}
      {recipeModal && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
        }}>
          <View style={{
            backgroundColor: '#1A1A2E',
            borderRadius: 16,
            padding: 20,
            width: SCREEN_WIDTH * 0.85,
            borderWidth: 1,
            borderColor: '#333',
          }}>
            {/* Avatar LixMan */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Image
                source={require('./assets/lixman-avatar.png')}
                style={{ width: 30, height: 30, borderRadius: 15, marginRight: 10, borderWidth: 1, borderColor: '#00D984' }}
                resizeMode="cover"
              />
              <Text style={{ color: '#00D984', fontSize: 14, fontWeight: 'bold' }}>LixMan</Text>
            </View>

            {/* Message */}
            <Text style={{ color: '#E0E0E0', fontSize: 14, lineHeight: 20, marginBottom: 16 }}>
              Tu veux voir la recette "{recipeModal.name}" dans la section Repas ? 🍽️
            </Text>

            {/* Boutons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => setRecipeModal(null)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#333',
                  alignItems: 'center',
                  marginRight: 8,
                }}
              >
                <Text style={{ color: '#888', fontSize: 13 }}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmNavigateToRecipe}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: '#00D984',
                  alignItems: 'center',
                  marginLeft: 8,
                }}
              >
                <Text style={{ color: '#000', fontSize: 13, fontWeight: 'bold' }}>Voir la recette</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
