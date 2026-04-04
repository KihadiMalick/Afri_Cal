import React, { useRef } from 'react';
import { View, Text, ScrollView, Pressable, Platform,
  Animated, Dimensions, PixelRatio, Modal, ActivityIndicator,
  Easing } from 'react-native';
import Svg, { Defs, Path, Circle, G, Polygon, Line,
  LinearGradient as SvgLinearGradient, RadialGradient,
  Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  LixGem, renderLixGemSegment, renderSegmentIcon
} from './lixverseComponents';
import {
  SUPABASE_URL, POST_HEADERS, HEADERS,
  NORMAL_SEGMENTS, SUPER_SEGMENTS, MEGA_SEGMENTS,
  SLUGS_BY_TIER, CHAR_NAMES, CHAR_EMOJIS, FRAGS_NIV1,
  SEGMENT_GRADIENTS, TEST_USER_ID,
  getSegmentAngles, describeArc, getSegmentRewardType
} from './lixverseConstants';
import { wp, fp } from '../../constants/layout';

const W = Dimensions.get('window').width;
