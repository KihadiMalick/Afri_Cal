import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Pressable,
  Animated as RNAnimated, Easing, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { supabase } from '../../config/supabase';
import { W, H, wp, fp } from './dashboardConstants';
import { MoodIcon } from './dashboardIcons';

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

const FloatingHeart = ({ heart, tubeCenter }) => {
  const anim = useRef(new RNAnimated.Value(0)).current;
  const heartSize = 18 + Math.random() * 8;
  const startX = heart.x;
  const startY = heart.y;
  const endX = tubeCenter?.x || W / 2;
  const endY = tubeCenter?.y || H * 0.45;
  const controlX = startX + (endX - startX) * 0.5 + (Math.random() - 0.5) * 100;
  const controlY = Math.min(startY, endY) - 50 - Math.random() * 60;

  useEffect(() => {
    RNAnimated.timing(anim, {
      toValue: 1, duration: 700 + Math.random() * 200,
      easing: Easing.inOut(Easing.ease), useNativeDriver: true,
    }).start();
  }, []);

  const translateX = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [startX, startX + (controlX - startX) * 0.44, controlX * 0.5 + (startX + endX) * 0.25, endX + (controlX - endX) * 0.19, endX],
  });
  const translateY = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [startY, startY + (controlY - startY) * 0.44, controlY * 0.5 + (startY + endY) * 0.25, endY + (controlY - endY) * 0.19, endY],
  });
  const scale = anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [1.2, 1, 0.5, 0] });
  const opacity = anim.interpolate({ inputRange: [0, 0.2, 0.85, 1], outputRange: [0.9, 1, 0.8, 0] });

  return (
    <RNAnimated.Text style={{
      position: 'absolute', left: 0, top: 0, fontSize: heartSize, zIndex: 100,
      transform: [{ translateX }, { translateY }, { scale }], opacity,
    }}>{heart.emoji}</RNAnimated.Text>
  );
};

const EnergyParticle = ({ x, y, emoji }) => {
  const anim = useRef(new RNAnimated.Value(0)).current;
  const drift = useRef((Math.random() - 0.5) * 50).current;
  useEffect(() => {
    RNAnimated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);
  return (
    <RNAnimated.Text style={{
      position: 'absolute', left: x - 8, top: y ? y - 8 : 20, fontSize: 16, zIndex: 100,
      transform: [
        { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -60 - Math.random() * 40] }) },
        { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, drift] }) },
      ],
      opacity: anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0.8, 0] }),
    }}>{emoji}</RNAnimated.Text>
  );
};
