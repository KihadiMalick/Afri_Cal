import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TouchableOpacity,
  Platform, Animated, Dimensions, PixelRatio, StatusBar,
  Modal, TextInput, ActivityIndicator, Image, Easing } from 'react-native';
import Svg, { Defs, Path, Circle, Rect, Line,
  LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { wp, fp } from '../../constants/layout';
import BottomTabs from '../../components/shared/NavBar';
import {
  SUPABASE_URL, SUPABASE_ANON_KEY, TEST_USER_ID,
  HEADERS, POST_HEADERS, ALL_CHARACTERS, CHAR_NAMES,
  CHAR_EMOJIS, FRAGS_NIV1, TIER_CONFIG, SLUGS_BY_TIER,
  randomSlugFromTier, NAV_TABS
} from './lixverseConstants';
import { LixGem } from './lixverseComponents';
import SpinTab from './SpinTab';
import DefiTab from './DefiTab';
import CharactersTab from './CharactersTab';
import HumanTab from './HumanTab';

const SCREEN_WIDTH = Dimensions.get('window').width;
const W = SCREEN_WIDTH;

export default function LixVersePage({ navigation }) {
  // placeholder - will be filled in next phases
  return (
    <View style={{ flex: 1, backgroundColor: '#141A22' }}>
      <Text style={{ color: '#FFF', padding: 20 }}>LixVersePage orchestrator placeholder</Text>
    </View>
  );
}
