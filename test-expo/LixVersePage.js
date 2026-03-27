import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, Pressable, TouchableOpacity, Platform, Animated, Dimensions, PixelRatio, StatusBar, Alert, Modal, TextInput, ActivityIndicator, Image, Easing } from 'react-native';
import Svg, { Defs, Rect, Path, Circle, Line, Ellipse, G, Polygon, Text as SvgText, LinearGradient as SvgLinearGradient, RadialGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// ═══ DROP GEM — Icône Lix officielle LIXUM ═══
const LixGem = ({ size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 1C16 7 20 12 20 16C20 20.4 16.4 23 12 23C7.6 23 4 20.4 4 16C4 12 8 7 12 1Z" fill="#007A50" stroke="#00D984" strokeWidth={1.2} />
    <Path d="M12 5C14.5 9 17 12.5 17 15.5C17 18.5 14.8 20.5 12 20.5C9.2 20.5 7 18.5 7 15.5C7 12.5 9.5 9 12 5Z" fill="#009960" stroke="#33E8A0" strokeWidth={0.5} />
    <Ellipse cx={9.5} cy={11} rx={2.5} ry={4} fill="#5DFFB4" opacity={0.3} transform="rotate(-20, 9.5, 11)" />
    <Circle cx={9} cy={8} r={1.5} fill="#FFF" opacity={0.55} />
  </Svg>
);

// ═══ DROP GEM pour segments SVG (rendu inline dans <Svg>) ═══
const renderLixGemSegment = (x, y, s) => {
  const sc = s / 24;
  const t = 'translate(' + (x - s/2) + ', ' + (y - s/2) + ') scale(' + sc + ')';
  return (
    <G transform={t}>
      <Path d="M12 1C16 7 20 12 20 16C20 20.4 16.4 23 12 23C7.6 23 4 20.4 4 16C4 12 8 7 12 1Z" fill="#007A50" stroke="#00D984" strokeWidth={1.2} />
      <Path d="M12 5C14.5 9 17 12.5 17 15.5C17 18.5 14.8 20.5 12 20.5C9.2 20.5 7 18.5 7 15.5C7 12.5 9.5 9 12 5Z" fill="#009960" />
      <Circle cx={9} cy={8} r={1.5} fill="#FFF" opacity={0.5} />
    </G>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const W = SCREEN_WIDTH;
const BASE_WIDTH = 320;
const wp = (size) => (W / BASE_WIDTH) * size;
const fp = (size) => Math.round(PixelRatio.roundToNearestPixel((W / BASE_WIDTH) * size));

const SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const HEADERS = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY };
const POST_HEADERS = { ...HEADERS, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

const ALL_CHARACTERS = [
  { id: 'emerald_owl', name: 'EMERALD OWL', tier: 'standard', color: '#00D984', emoji: '🦉', image: require('./assets/emerald_owl.webp'), desc: '3 recettes perso gratuites', bonus_abonne: 'Recettes 5→3 Lix', bonus_non_abonne: '3 recettes gratuites', uses: 3, unlock_hours: 0 },
  { id: 'hawk_eye', name: 'HAWK EYE', tier: 'standard', color: '#4DA6FF', emoji: '🦅', desc: '2 Xscans gratuits', bonus_abonne: 'Xscan 20→15 Lix', bonus_non_abonne: '2 Xscans gratuits', uses: 2, unlock_hours: 0 },
  { id: 'ruby_tiger', name: 'RUBY TIGER', tier: 'standard', color: '#FF4757', emoji: '🐯', desc: '1 programme sport gratuit', bonus_abonne: 'Programme 40→30 Lix', bonus_non_abonne: '1 programme sport', uses: 1, unlock_hours: 0 },
  { id: 'jade_phoenix', name: 'JADE PHOENIX', tier: 'rare', color: '#2ED573', emoji: '🔥', desc: '5 messages ALIXEN gratuits', bonus_abonne: 'Énergie ALIXEN -2/message', bonus_non_abonne: '5 messages ALIXEN', uses: 5, unlock_hours: 0 },
  { id: 'silver_wolf', name: 'SILVER WOLF', tier: 'rare', color: '#A4B0BE', emoji: '🐺', desc: 'MediBook 48h consultation', bonus_abonne: 'Recherche médicament 50→35 Lix', bonus_non_abonne: 'MediBook 48h', uses: 0, unlock_hours: 48 },
  { id: 'amber_fox', name: 'AMBER FOX', tier: 'rare', color: '#FF8C42', emoji: '🦊', desc: '2 recommandations locales', bonus_abonne: 'Localisation 15→10 Lix', bonus_non_abonne: '2 recommandations locales', uses: 2, unlock_hours: 0 },
  { id: 'iron_rhino', name: 'IRON RHINO', tier: 'rare', color: '#747D8C', emoji: '🦏', desc: 'Secret Pocket 48h lecture', bonus_abonne: 'MediBook PDF 500→400 Lix', bonus_non_abonne: 'Secret Pocket 48h', uses: 0, unlock_hours: 48 },
  { id: 'coral_dolphin', name: 'CORAL DOLPHIN', tier: 'rare', color: '#FF6B81', emoji: '🐬', desc: '1 profil enfant 48h', bonus_abonne: 'Ajout enfant 5000→4000 Lix', bonus_non_abonne: '1 profil enfant 48h', uses: 1, unlock_hours: 48 },
  { id: 'obsidian_dragon', name: 'OBSIDIAN DRAGON', tier: 'elite', color: '#5352ED', emoji: '🐉', desc: '10 messages ALIXEN premium', bonus_abonne: 'Énergie complexe -5', bonus_non_abonne: '10 messages ALIXEN premium', uses: 10, unlock_hours: 0 },
  { id: 'gold_chicken', name: 'GOLD CHICKEN', tier: 'elite', color: '#D4AF37', emoji: '🐔', desc: '3 Spins + 5 recherches prix', bonus_abonne: '+1 Spin gratuit/jour', bonus_non_abonne: '3 Spins + 5 recherches', uses: 8, unlock_hours: 0 },
  { id: 'licornium', name: 'LICORNIUM', tier: 'elite', color: '#00D984', emoji: '🦄', desc: '2 scans médicaux', bonus_abonne: 'Scan médical 30→20 Lix', bonus_non_abonne: '2 scans médicaux', uses: 2, unlock_hours: 0 },
  { id: 'diamond_lion', name: 'DIAMOND LION', tier: 'hyper', color: '#00CEC9', emoji: '🦁', desc: 'TOUT 7 jours (5 msgs/j, 2 scans/j)', bonus_abonne: '+25% énergie 30 jours', bonus_non_abonne: 'TOUT 7 jours limité', uses: 0, unlock_hours: 168 },
  { id: 'tardigrum', name: 'TARDIGRUM', tier: 'ultimate', color: '#DFE6E9', emoji: '🔱', desc: 'TOUT 365 jours — Le Graal', bonus_abonne: '+50% énergie 365 jours', bonus_non_abonne: 'TOUT 365j (8msg/j, 3scan/j)', uses: 0, unlock_hours: 8760 },
];

const LIXSIGNS = {
  sport: {
    label: 'Sport & Effort',
    color: '#FF8C42',
    signs: [
      { id: 'sport_moved', text: "J'ai bougé", svgPath: 'M13 4a2 2 0 110 4 2 2 0 010-4zm-1 8l-4 4 1.4 1.4L12 14.8V22h2v-7.2l2.6 2.6L18 16l-4-4h-2z', viewBox: '0 0 24 24' },
      { id: 'sport_hard', text: "C'était dur", svgPath: 'M7 2v11h3v9l7-12h-4l3-8H7z', viewBox: '0 0 24 24' },
      { id: 'sport_record', text: "Record battu !", svgPath: 'M12 2l2.4 7.4h7.6l-6 4.6 2.3 7L12 16.4 5.7 21l2.3-7L2 9.4h7.6z', viewBox: '0 0 24 24' },
      { id: 'sport_rest', text: "Repos mérité", svgPath: 'M12 3a9 9 0 109 9c0-5-4-9-9-9zm0 16a7 7 0 110-14 7 7 0 010 14zm1-10h-2v3H8v2h3v3h2v-3h3v-2h-3V9z', viewBox: '0 0 24 24' },
      { id: 'sport_again', text: "On y retourne", svgPath: 'M17.65 6.35A7.96 7.96 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z', viewBox: '0 0 24 24' },
    ],
  },
  nutrition: {
    label: 'Nutrition',
    color: '#00D984',
    signs: [
      { id: 'nutri_good', text: "Bien mangé", svgPath: 'M8.1 13.34l2.83-2.83L3.91 3.5a4 4 0 000 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L4 19.75 5.41 21.17 12 14.58l6.59 6.59L20 19.75l-5.12-5.12z', viewBox: '0 0 24 24' },
      { id: 'nutri_scanned', text: "Repas scanné", svgPath: 'M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13z', viewBox: '0 0 24 24' },
      { id: 'nutri_cheat', text: "J'ai craqué", svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31A7.902 7.902 0 0112 20zm6.31-3.1L7.1 5.69A7.902 7.902 0 0112 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z', viewBox: '0 0 24 24' },
      { id: 'nutri_water', text: "Hydraté !", svgPath: 'M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z', viewBox: '0 0 24 24' },
      { id: 'nutri_homemade', text: "Cuisine maison", svgPath: 'M8.1 13.34l2.83-2.83-7.02-7.01a4 4 0 000 5.66l4.19 4.18zm14.28-4.03c-1.91-1.91-4.65-2.28-6.12-.81l-1.38 1.38c-1.59 1.59-2.09 3.74-1.38 5.27L4 24.75 5.41 26.17 21 10.58z', viewBox: '0 0 24 24' },
    ],
  },
  encouragement: {
    label: 'Encouragement',
    color: '#D4AF37',
    signs: [
      { id: 'enc_bravo', text: "Bravo !", svgPath: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z', viewBox: '0 0 24 24' },
      { id: 'enc_continue', text: "Continue !", svgPath: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z', viewBox: '0 0 24 24' },
      { id: 'enc_proud', text: "Fier de toi", svgPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', viewBox: '0 0 24 24' },
      { id: 'enc_inspire', text: "Tu m'inspires", svgPath: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z', viewBox: '0 0 24 24' },
      { id: 'enc_noquit', text: "On lâche rien", svgPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', viewBox: '0 0 24 24' },
    ],
  },
  mood: {
    label: 'Humeur & État',
    color: '#9B6DFF',
    signs: [
      { id: 'mood_great', text: "En forme !", svgPath: 'M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z', viewBox: '0 0 24 24' },
      { id: 'mood_tired', text: "Fatigué", svgPath: 'M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v9.33C7 15.4 7.6 16 8.33 16h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM13 12.5h-2v-2h2v2zM13 9h-2V5.5h2V9zM10 17l2 3 2-3h-4z', viewBox: '0 0 24 24' },
      { id: 'mood_motivated', text: "Motivé !", svgPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', viewBox: '0 0 24 24' },
      { id: 'mood_stressed', text: "Stressé", svgPath: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z', viewBox: '0 0 24 24' },
      { id: 'mood_zen', text: "Zen", svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', viewBox: '0 0 24 24' },
    ],
  },
  social: {
    label: 'Social',
    color: '#4DA6FF',
    signs: [
      { id: 'soc_hello', text: "Coucou !", svgPath: 'M7 24h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zM16 .01L8 0C6.9 0 6 .9 6 2v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V2c0-1.1-.9-1.99-2-1.99z', viewBox: '0 0 24 24' },
      { id: 'soc_thanks', text: "Merci !", svgPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', viewBox: '0 0 24 24' },
      { id: 'soc_challenge', text: "Défi accepté !", svgPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', viewBox: '0 0 24 24' },
      { id: 'soc_miss', text: "Tu me manques", svgPath: 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z', viewBox: '0 0 24 24' },
      { id: 'soc_check', text: "Check !", svgPath: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z', viewBox: '0 0 24 24' },
    ],
  },
  celebration: {
    label: 'Célébration',
    color: '#FF6B81',
    signs: [
      { id: 'cel_goal', text: "Objectif atteint !", svgPath: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z', viewBox: '0 0 24 24' },
      { id: 'cel_streak', text: "Streak !", svgPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', viewBox: '0 0 24 24' },
      { id: 'cel_bonus', text: "Bonus Lix !", svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.87c0 1.87-1.38 2.84-3.12 3.17z', viewBox: '0 0 24 24' },
      { id: 'cel_duo_record', text: "Record duo !", svgPath: 'M12 7.13l.97 2.29.47 1.11 1.2.1 2.47.21-1.88 1.63-.91.79.27 1.18.56 2.41-2.12-1.28-1.03-.64-1.03.62-2.12 1.28.56-2.41.27-1.18-.91-.79-1.88-1.63 2.47-.21 1.2-.1.47-1.11z', viewBox: '0 0 24 24' },
    ],
  },
};

const WORLD_DOTS = [
  // Amérique du Nord
  { x: 130, y: 120, size: 'large' },
  { x: 175, y: 140, size: 'medium' },
  { x: 200, y: 100, size: 'small' },
  // Amérique du Sud
  { x: 220, y: 260, size: 'medium' },
  { x: 240, y: 290, size: 'small' },
  { x: 230, y: 320, size: 'small' },
  // Europe
  { x: 380, y: 80, size: 'medium' },
  { x: 400, y: 95, size: 'small' },
  { x: 370, y: 100, size: 'small' },
  // Afrique — plus de points (notre base)
  { x: 390, y: 150, size: 'large' },
  { x: 410, y: 180, size: 'large' },
  { x: 420, y: 210, size: 'medium' },
  { x: 400, y: 240, size: 'medium' },
  { x: 380, y: 190, size: 'small' },
  { x: 430, y: 195, size: 'small' },
  { x: 370, y: 220, size: 'small' },
  { x: 415, y: 260, size: 'small' },
  { x: 440, y: 170, size: 'small' },
  // Moyen Orient
  { x: 460, y: 130, size: 'medium' },
  { x: 475, y: 145, size: 'small' },
  // Asie
  { x: 520, y: 90, size: 'medium' },
  { x: 570, y: 100, size: 'large' },
  { x: 600, y: 120, size: 'medium' },
  { x: 550, y: 140, size: 'small' },
  { x: 630, y: 135, size: 'small' },
  // Asie du Sud-Est
  { x: 620, y: 180, size: 'medium' },
  { x: 640, y: 200, size: 'small' },
  // Australie
  { x: 660, y: 290, size: 'medium' },
  { x: 680, y: 310, size: 'small' },
];

const FAKE_MATCH = {
  lixtag: 'LXM-8F2K9B',
  display_name: 'LXM-8F2K9B',
  country: 'Sénégal',
  country_flag: '🇸🇳',
  vitality_score: 78,
  goal: 'Perte de poids',
  distance_km: 4200,
  common_points: [
    { icon: 'target', text: 'Même objectif : Perte de poids' },
    { icon: 'food', text: 'Régime similaire : Équilibré' },
    { icon: 'water', text: 'Hydratation régulière' },
  ],
  today_calories_eaten: 1450,
  today_calories_burned: 320,
  today_mood: '😊',
  today_weather: '☀️',
  streak_days: 12,
};

const BINOME_LEADERBOARD = [
  { rank: 1, names: 'LXM-8F2K9B & LXM-2K7F4A', flags: '🇸🇳🇧🇮', flames: 42, pts: 520 },
  { rank: 2, names: 'LXM-3G5H7J & LXM-9R4T2M', flags: '🇬🇭🇲🇱', flames: 38, pts: 480 },
  { rank: 3, names: 'LXM-6N8P1Q & LXM-4D7F3S', flags: '🇰🇪🇰🇪', flames: 35, pts: 440 },
  { rank: 4, names: 'LXM-2W5X8Y & LXM-7B3C6E', flags: '🇲🇱🇧🇫', flames: 28, pts: 360 },
  { rank: 5, names: 'LXM-5K9L2N & LXM-1H4J7M', flags: '🇨🇲🇨🇩', flames: 22, pts: 280 },
];

const TIER_CONFIG = {
  standard: { label: 'Standard', color: '#00D984', bg: 'rgba(0,217,132,0.1)', border: 'rgba(0,217,132,0.3)' },
  rare: { label: 'Rare', color: '#4DA6FF', bg: 'rgba(77,166,255,0.1)', border: 'rgba(77,166,255,0.3)' },
  elite: { label: 'Elite', color: '#D4AF37', bg: 'rgba(212,175,55,0.1)', border: 'rgba(212,175,55,0.3)' },
  hyper: { label: 'Hyper Rare', color: '#00CEC9', bg: 'rgba(0,206,201,0.1)', border: 'rgba(0,206,201,0.3)' },
  ultimate: { label: 'Ultime', color: '#DFE6E9', bg: 'rgba(223,230,233,0.08)', border: 'rgba(223,230,233,0.25)' },
};

const CRATES = [
  { id: 'bronze', name: 'Caisse Bronze', cost: 300, color: '#CD7F32', emoji: '📦', desc: 'Lix + Énergie + chance carte Standard', rewards: { lix_min: 50, lix_max: 100, energy_min: 10, energy_max: 20, card_chance: 0.30, card_tiers: ['standard'] } },
  { id: 'silver', name: 'Caisse Argent', cost: 800, color: '#A4B0BE', emoji: '🎁', desc: 'Lix + Énergie + chance carte Rare', rewards: { lix_min: 100, lix_max: 250, energy_min: 20, energy_max: 40, card_chance: 0.25, card_tiers: ['standard', 'rare'] } },
  { id: 'gold', name: 'Caisse Or', cost: 2000, color: '#D4AF37', emoji: '💎', desc: 'Lix + Énergie + chance carte Elite', rewards: { lix_min: 250, lix_max: 500, energy_min: 30, energy_max: 60, card_chance: 0.20, card_tiers: ['rare', 'elite'] } },
  { id: 'platinum', name: 'Caisse Platine', cost: 5000, color: '#00CEC9', emoji: '👑', desc: 'Lix + Énergie + chance Hyper/Ultime', rewards: { lix_min: 500, lix_max: 1000, energy_min: 50, energy_max: 100, card_chance: 0.15, card_tiers: ['elite', 'hyper', 'ultimate'] } },
];

const SPIN_RESULTS = [
  { label: '5 Lix', weight: 30, type: 'lix', value: 5, color: '#00D984' },
  { label: '10 Lix', weight: 18, type: 'lix', value: 10, color: '#00D984' },
  { label: '25 Lix', weight: 8, type: 'lix', value: 25, color: '#4DA6FF' },
  { label: '50 Lix', weight: 2, type: 'lix', value: 50, color: '#D4AF37' },
  { label: '+10 Énergie', weight: 12, type: 'energy', value: 10, color: '#FF8C42' },
  { label: '+20 Énergie', weight: 5, type: 'energy', value: 20, color: '#FF8C42' },
  { label: 'Caisse Standard', weight: 10, type: 'crate', value: 'standard', color: '#00D984' },
  { label: 'Caisse Rare', weight: 5, type: 'crate', value: 'rare', color: '#4DA6FF' },
  { label: 'Caisse Elite', weight: 1.5, type: 'crate', value: 'elite', color: '#D4AF37' },
  { label: 'Caisse Hyper', weight: 0.3, type: 'crate', value: 'hyper', color: '#00CEC9' },
  { label: 'Rien...', weight: 8.2, type: 'nothing', value: 0, color: '#666' },
];

const NORMAL_SEGMENTS = [
  { label: '3', icon: '⚡', chance: 27, color: '#2A4A3A', reward: { type: 'energy', amount: 3 } },
  { label: '30', icon: '💰', chance: 20, color: '#3A4A2A', reward: { type: 'lix', amount: 30 } },
  { label: '1', icon: '🧩', chance: 15, color: '#3A2A4A', subLabel: 'Frag Std', reward: { type: 'fragment', tier: 'standard', amount: 1 } },
  { label: '1', icon: '📸', chance: 15, color: '#4A3A2A', subLabel: 'scan', reward: { type: 'scan', amount: 1 } },
  { label: '1', icon: '🎁', chance: 10, color: '#4A2A2A', subLabel: 'spin', reward: { type: 'free_spin', amount: 1 } },
  { label: '1', icon: '🧩', chance: 8, color: '#2A3A4A', subLabel: 'Frag Rare', reward: { type: 'fragment', tier: 'rare', amount: 1 } },
  { label: '10', icon: '⚡⚡', chance: 5, color: '#4A4A2A', subLabel: 'énergie', reward: { type: 'energy', amount: 10 } },
];

const SUPER_SEGMENTS = [
  { label: '5', icon: '⚡', chance: 30, color: '#2A4A3A', reward: { type: 'energy', amount: 5 } },
  { label: '50', icon: '💰', chance: 20, color: '#3A4A2A', reward: { type: 'lix', amount: 50 } },
  { label: '1', icon: '🃏', chance: 7, color: '#3A2A4A', subLabel: 'carte Std', reward: { type: 'card', tier: 'standard', amount: 1 } },
  { label: '2', icon: '📸', chance: 18, color: '#4A3A2A', subLabel: 'scans', reward: { type: 'scan', amount: 2 } },
  { label: '1', icon: '🎁', chance: 10, color: '#4A2A2A', subLabel: 'super', reward: { type: 'free_spin', amount: 1 } },
  { label: '1', icon: '🧩', chance: 8, color: '#2A3A4A', subLabel: 'Frag Elite', reward: { type: 'fragment', tier: 'elite', amount: 1 } },
  { label: '25', icon: '⚡⚡', chance: 7, color: '#4A4A2A', subLabel: 'énergie', reward: { type: 'energy', amount: 25 } },
];

const MEGA_SEGMENTS = [
  { label: '10', icon: '⚡', chance: 30, color: '#2A4A3A', reward: { type: 'energy', amount: 10 } },
  { label: '100', icon: '💰', chance: 20, color: '#3A4A2A', reward: { type: 'lix', amount: 100 } },
  { label: '2', icon: '🧩', chance: 15, color: '#3A2A4A', subLabel: 'Frag Rare', reward: { type: 'fragment', tier: 'rare', amount: 2 } },
  { label: '1', icon: '🧩', chance: 13, color: '#4A3A2A', subLabel: 'Frag Elite', reward: { type: 'fragment', tier: 'elite', amount: 1 } },
  { label: '1', icon: '🃏', chance: 5, color: '#4A2A2A', subLabel: 'carte Rare', reward: { type: 'card', tier: 'rare', amount: 1 } },
  { label: '1', icon: '🧩', chance: 7, color: '#2A3A4A', subLabel: 'Frag Myth', reward: { type: 'fragment', tier: 'mythique', amount: 1 } },
  { label: '50', icon: '⚡⚡', chance: 10, color: '#4A4A2A', subLabel: 'énergie', reward: { type: 'energy', amount: 50 } },
];

// === SLUGS PAR TIER — pour distribution aléatoire de fragments ===
const SLUGS_BY_TIER = {
  standard: ['emerald_owl', 'hawk_eye', 'ruby_tiger', 'amber_fox', 'gipsy'],
  rare: ['jade_phoenix', 'silver_wolf', 'boukki', 'iron_rhino', 'coral_dolphin'],
  elite: ['licornium', 'jaane_snake', 'mosquito'],
  mythique: ['diamond_simba', 'alburax'],
  ultimate: ['tardigrum'],
};

const CHAR_EMOJIS = {
  'emerald_owl': '🦉', 'hawk_eye': '🦅', 'ruby_tiger': '🐯',
  'amber_fox': '🦊', 'gipsy': '🕷️',
  'jade_phoenix': '🔥', 'silver_wolf': '🐺', 'boukki': '🦴',
  'iron_rhino': '🦏', 'coral_dolphin': '🐬',
  'licornium': '🦄', 'jaane_snake': '🐍', 'mosquito': '🦟',
  'diamond_simba': '🦁', 'alburax': '🐴',
  'tardigrum': '🧬',
};

const CHAR_NAMES = {
  'emerald_owl': 'Emerald Owl', 'hawk_eye': 'Hawk Eye', 'ruby_tiger': 'Ruby Tiger',
  'amber_fox': 'Amber Fox', 'gipsy': 'Gipsy',
  'jade_phoenix': 'Jade Phoenix', 'silver_wolf': 'Silver Wolf', 'boukki': 'Boukki',
  'iron_rhino': 'Iron Rhino', 'coral_dolphin': 'Coral Dolphin',
  'licornium': 'LICORNIUM', 'jaane_snake': 'Jaane Snake', 'mosquito': 'MOSQUITO',
  'diamond_simba': 'Diamond Simba', 'alburax': 'Alburax',
  'tardigrum': 'TARDIGRUM',
};

const FRAGS_NIV1 = { standard: 3, rare: 4, elite: 5, mythique: 8, ultimate: 15 };

const TIER_COLORS = {
  standard: '#00D984', rare: '#4DA6FF', elite: '#B388FF',
  mythique: '#D4AF37', ultimate: '#FF6B8A',
};

// ═══ IMAGES PERSONNAGES — fallback emoji si fichier absent ═══
const CHARACTER_IMAGES = {
  'emerald_owl': { img: require('./assets/emerald_owl.webp'), emoji: '🦉' },
  'hawk_eye': { img: null, emoji: '🦅' },
  'ruby_tiger': { img: null, emoji: '🐯' },
  'amber_fox': { img: null, emoji: '🦊' },
  'gipsy': { img: null, emoji: '🕷️' },
  'jade_phoenix': { img: null, emoji: '🔥' },
  'silver_wolf': { img: null, emoji: '🐺' },
  'boukki': { img: null, emoji: '🦴' },
  'iron_rhino': { img: null, emoji: '🦏' },
  'coral_dolphin': { img: null, emoji: '🐬' },
  'licornium': { img: null, emoji: '🦄' },
  'jaane_snake': { img: null, emoji: '🐍' },
  'mosquito': { img: null, emoji: '🦟' },
  'diamond_simba': { img: null, emoji: '🦁' },
  'alburax': { img: null, emoji: '🐴' },
  'tardigrum': { img: null, emoji: '🧬' },
};

// Helper : récupérer image ou emoji
const getCharImage = (slug) => CHARACTER_IMAGES[slug] || { img: null, emoji: '🃏' };

const randomSlugFromTier = (tier) => {
  const slugs = SLUGS_BY_TIER[tier];
  if (!slugs || slugs.length === 0) return null;
  return slugs[Math.floor(Math.random() * slugs.length)];
};

const pickReward = (segments) => {
  const total = segments.reduce((sum, s) => sum + s.chance, 0);
  let roll = Math.random() * total;
  for (const seg of segments) {
    roll -= seg.chance;
    if (roll <= 0) return seg;
  }
  return segments[0];
};

const SEGMENT_GRADIENTS = {
  '#2A4A3A': { inner: '#3A5A4A', outer: '#1A3A2A' },
  '#3A4A2A': { inner: '#4A5A3A', outer: '#2A3A1A' },
  '#3A2A4A': { inner: '#4A3A5A', outer: '#2A1A3A' },
  '#4A3A2A': { inner: '#5A4A3A', outer: '#3A2A1A' },
  '#4A2A2A': { inner: '#5A3A3A', outer: '#3A1A1A' },
  '#2A3A4A': { inner: '#3A4A5A', outer: '#1A2A3A' },
  '#4A4A2A': { inner: '#5A5A3A', outer: '#3A3A1A' },
};

// SVG segment icons (rendered inside <Svg> as <G> groups)
const renderSegmentIcon = (type, tier, x, y, s, angle) => {
  const sc = s / 24;
  const t = `translate(${x - s / 2}, ${y - s / 2}) scale(${sc})`;
  if (type === 'energy') return (
    <G transform={t}><Path d="M13 2L3 14h7l-2 8 10-12h-7z" fill="#B0B8C4" /></G>
  );
  if (type === 'lix') return renderLixGemSegment(x, y, s);
  if (type === 'fragment') return (
    <G transform={t}><Path d="M20 6h-3.17c.11-.31.17-.65.17-1a3 3 0 00-6 0c0 .35.06.69.17 1H8a2 2 0 00-2 2v3.17c-.31-.11-.65-.17-1-.17a3 3 0 000 6c.35 0 .69-.06 1-.17V20a2 2 0 002 2h3.17c-.11-.31-.17-.65-.17-1a3 3 0 016 0c0 .35-.06.69-.17 1H20a2 2 0 002-2v-3.17c.31.11.65.17 1 .17a3 3 0 000-6c-.35 0-.69.06-1 .17V8a2 2 0 00-2-2z" fill="#B0B8C4" /></G>
  );
  if (type === 'scan') return (
    <G transform={t}><Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" fill="none" stroke="#B0B8C4" strokeWidth={2} /><Circle cx={12} cy={13} r={4} fill="none" stroke="#B0B8C4" strokeWidth={2} /></G>
  );
  if (type === 'free_spin') return (
    <G transform={t}><Path d="M20 12v10H4V12" fill="none" stroke="#B0B8C4" strokeWidth={2} /><Path d="M2 7h20v5H2z" fill="none" stroke="#B0B8C4" strokeWidth={2} /><Path d="M12 22V7" stroke="#B0B8C4" strokeWidth={2} /><Path d="M12 7c-1.5-2-4-3-4-3s1 3 4 3z" fill="#B0B8C4" /><Path d="M12 7c1.5-2 4-3 4-3s-1 3-4 3z" fill="#B0B8C4" /></G>
  );
  if (type === 'card') return (
    <G transform={t}>
      {/* Carte sombre */}
      <Rect x={2} y={0} width={20} height={24} rx={3} fill="#1A1D22" stroke="#4A4F55" strokeWidth={1.2} />
      {/* Silhouette créature mystère */}
      <Circle cx={12} cy={8} r={4} fill="#2A2F38" />
      <Path d="M6,14 Q4,18 7,20 L10,16 L12,22 L14,16 L17,20 Q20,18 18,14 Q15,12 12,13 Q9,12 6,14Z" fill="#2A2F38" />
      {/* Point d'interrogation doré */}
      <SvgText x={12} y={16} fill="#D4AF37" fontSize={10} fontWeight="700" textAnchor="middle" alignmentBaseline="central">?</SvgText>
      {/* Reflet subtil coin haut gauche */}
      <Rect x={4} y={2} width={6} height={2} rx={1} fill="#4A4F55" opacity={0.3} />
    </G>
  );
  // Default: energy
  return (
    <G transform={t}><Path d="M13 2L3 14h7l-2 8 10-12h-7z" fill="#B0B8C4" /></G>
  );
};

const getSegmentRewardType = (seg) => seg.reward.type || 'energy';

const getSegmentTypeLabel = (seg) => {
  if (seg.subLabel) return seg.subLabel;
  if (seg.reward.type === 'energy') return 'énergie';
  if (seg.reward.type === 'lix') return 'Lix';
  if (seg.reward.type === 'card') return 'Carte';
  if (seg.reward.type === 'scan') return 'scan';
  if (seg.reward.type === 'free_spin') return 'spin';
  if (seg.reward.type === 'fragment') {
    if (seg.reward.tier === 'mythique') return 'Frag Myth';
    if (seg.reward.tier === 'elite') return 'Frag Elite';
    if (seg.reward.tier === 'standard') return 'Frag Std';
    return 'Frag Rare';
  }
  return '';
};

const getSegmentAngles = (segments) => {
  const total = segments.reduce((sum, s) => sum + s.chance, 0);
  let currentAngle = 0;
  return segments.map(seg => {
    const sweepAngle = (seg.chance / total) * 360;
    const startAngle = currentAngle;
    currentAngle += sweepAngle;
    return { ...seg, startAngle, sweepAngle };
  });
};

const describeArc = (cx, cy, radius, startAngle, endAngle) => {
  const startRad = (startAngle - 90) * Math.PI / 180;
  const endRad = (endAngle - 90) * Math.PI / 180;
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
  return 'M ' + cx + ' ' + cy + ' L ' + x1 + ' ' + y1 + ' A ' + radius + ' ' + radius + ' 0 ' + largeArc + ' 1 ' + x2 + ' ' + y2 + ' Z';
};

const LIX_PACKS = [
  { name: 'Micro', price: '$0.99', lix: 990, bonus: '', color: '#00D984' },
  { name: 'Basic', price: '$4.99', lix: 5240, bonus: '+5%', color: '#4DA6FF' },
  { name: 'Standard', price: '$9.99', lix: 10990, bonus: '+10%', color: '#9B6DFF' },
  { name: 'Mega', price: '$29.99', lix: 35990, bonus: '+20%', color: '#D4AF37' },
  { name: 'Ultra', price: '$99.99', lix: 129990, bonus: '+30%', color: '#D4AF37' },
];

const NAV_TABS = [
  { key: 'home', label: 'Accueil', iconDefault: 'home-outline', iconActive: 'home' },
  { key: 'meals', label: 'Repas', iconDefault: 'restaurant-outline', iconActive: 'restaurant' },
  { key: 'medicai', label: 'MedicAi', isMedicAi: true },
  { key: 'activity', label: 'Activité', iconDefault: 'fitness-outline', iconActive: 'fitness' },
  { key: 'lixverse', label: 'LixVerse', isSpecial: true, isLixVerse: true },
];

export default function LixVersePage() {
  const [activeTab, setActiveTab] = useState('defi');
  const [activeNavTab, setActiveNavTab] = useState('lixverse');
  const [lixBalance, setLixBalance] = useState(500);
  const [userEnergy, setUserEnergy] = useState(20);
  const [ownedCharacters, setOwnedCharacters] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [leaderboardTab, setLeaderboardTab] = useState('groups');
  const [showCharacterDetail, setShowCharacterDetail] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [freeSpinUsed, setFreeSpinUsed] = useState(false);
  const [spinTier, setSpinTier] = useState('normal');
  const [timeToFree, setTimeToFree] = useState('');
  const [showSpinResultModal, setShowSpinResultModal] = useState(false);
  const [spinWinnerSeg, setSpinWinnerSeg] = useState(null);
  const spinResultPulse = useRef(new Animated.Value(1)).current;
  const [fragmentResult, setFragmentResult] = useState(null);
  const [showFragmentModal, setShowFragmentModal] = useState(false);
  const [fragmentSaving, setFragmentSaving] = useState(false);
  const [spinLoading, setSpinLoading] = useState(false);
  const [serverResult, setServerResult] = useState(null);
  const [freeSpinAvailable, setFreeSpinAvailable] = useState(true);
  const fragmentSlideAnim = useRef(new Animated.Value(0)).current;
  const [winnerGlowIdx, setWinnerGlowIdx] = useState(null);
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const arrowBounce = useRef(new Animated.Value(0)).current;
  const spinBtnScale = useRef(new Animated.Value(1)).current;
  const freeBtnPulse = useRef(new Animated.Value(1)).current;
  const [wallStickers, setWallStickers] = useState([]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [shakingSticker, setShakingSticker] = useState(null);
  const [comboCount, setComboCount] = useState({});
  const [comboTimer, setComboTimer] = useState({});
  const [strikeActive, setStrikeActive] = useState({});
  const stickerShakeAnims = useRef({}).current;
  const [lixAlert, setLixAlert] = useState({ visible: false, title: '', message: '', emoji: '', buttons: [] });
  const showLixAlert = (title, message, buttons = [], emoji = '') => {
    setLixAlert({ visible: true, title, message, emoji, buttons });
  };
  const hideLixAlert = () => setLixAlert(prev => ({ ...prev, visible: false }));
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifList, setNotifList] = useState([
    { id: '1', type: 'binome_request', title: 'Demande de Binôme', message: 'LXM-4D7F3S souhaite devenir votre Binôme', time: 'Il y a 2h', read: false, color: '#D4AF37', emoji: '🤝' },
    { id: '2', type: 'health_alert', title: 'Alerte Santé — LIXUM × MinSanté', message: 'Canicule prévue cette semaine. Hydratez-vous davantage.', time: 'Il y a 5h', read: false, color: '#FF6B6B', emoji: '🔴' },
    { id: '3', type: 'gift', title: 'Cadeau reçu !', message: 'LXM-3G5H7J vous a offert 50 Lix sur le Wall of Health', time: 'Hier', read: true, color: '#D4AF37', emoji: '🎁' },
    { id: '4', type: 'update', title: 'Nouveauté LIXUM', message: 'La section Binôme est maintenant disponible ! Trouvez votre partenaire santé.', time: 'Il y a 2j', read: true, color: '#4DA6FF', emoji: '✨' },
    { id: '5', type: 'challenge', title: 'Défi terminé', message: 'La Mission Hydratation est terminée. Votre équipe est 3ème !', time: 'Il y a 3j', read: true, color: '#00D984', emoji: '🏆' },
  ]);
  const unreadCount = notifList.filter(n => !n.read).length;
  const [stickerCatalog, setStickerCatalog] = useState([]);
  const [myCertification, setMyCertification] = useState(null);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [showStickerCreation, setShowStickerCreation] = useState(false);
  const [selectedStickerChoice, setSelectedStickerChoice] = useState(null);
  const [stickerMessage, setStickerMessage] = useState('');
  const notifScrollX = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  // Binôme states — flow complet 6 états
  const [binomeStatus, setBinomeStatus] = useState('none');
  // 'none' | 'searching' | 'proposed' | 'pending_sent' | 'pending_received' | 'declined' | 'matched'
  const [binomePartner, setBinomePartner] = useState(null);
  const [binomeCommonPoints, setBinomeCommonPoints] = useState([]);
  const [binomeDistance, setBinomeDistance] = useState(null);
  const [binomePokes, setBinomePokes] = useState([]);
  const [showLixSignPicker, setShowLixSignPicker] = useState(false);
  const [lixSignCategory, setLixSignCategory] = useState('encouragement');
  const [binomeMessages, setBinomeMessages] = useState([]);
  const [showBinomeAlert, setShowBinomeAlert] = useState({ visible: false, title: '', message: '', icon: null, buttons: [] });
  const [showBreakConfirm, setShowBreakConfirm] = useState(false);
  const [tooltipSign, setTooltipSign] = useState(null);
  // Animation states — recherche tech
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStep, setSearchStep] = useState(0);
  const [searchCoords, setSearchCoords] = useState({ lat: '—', lng: '—' });
  const [compatibilityScore, setCompatibilityScore] = useState(0);
  const [scanLines, setScanLines] = useState([]);
  const [retryAfterTime, setRetryAfterTime] = useState(null);
  const [retryCountdown, setRetryCountdown] = useState('');
  const radarAnim = useRef(new Animated.Value(0)).current;
  const radarScale = useRef(new Animated.Value(0.2)).current;
  const radarOpacity = useRef(new Animated.Value(0.8)).current;
  const pulseRing1 = useRef(new Animated.Value(0)).current;
  const pulseRing2 = useRef(new Animated.Value(0)).current;
  const pulseRing3 = useRef(new Animated.Value(0)).current;
  const coordsFlicker = useRef(new Animated.Value(1)).current;
  const compatAnim = useRef(new Animated.Value(0)).current;
  const pendingPulse = useRef(new Animated.Value(0.6)).current;
  const dotPulseAnims = useRef(Array.from({ length: 30 }, () => new Animated.Value(0.2))).current;
  const dotGlowAnims = useRef(Array.from({ length: 30 }, () => new Animated.Value(0))).current;

  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showCharDetail, setShowCharDetail] = useState(false);
  const [charRecharging, setCharRecharging] = useState(false);
  const rechargeProgress = useRef(new Animated.Value(0)).current;

  // Données simulées Emerald Owl (sera remplacé par Supabase)
  const [ownedChars, setOwnedChars] = useState({
    emerald_owl: {
      id: 'emerald_owl', name: 'Emerald Owl', tier: 'standard',
      specialty: 'Recettes personnalisées', reduction_percent: 30,
      level: 2, xp: 620, xp_next: 1000, uses_remaining: 5, uses_max: 8,
      is_avatar: true, recharge_energy_cost: 10,
      powers: [
        { level: 0, text: '3 recettes gratuites', unlocked: true },
        { level: 1, text: 'Suggestions améliorées', unlocked: true },
        { level: 2, text: 'Détails étendus (temps de préparation)', unlocked: true },
        { level: 3, text: 'Accès recettes Chef', unlocked: false },
        { level: 4, text: 'Menu hebdo automatique', unlocked: false },
        { level: 5, text: 'Illimité (1 Lix/recette)', unlocked: false },
        { level: 6, text: 'MAÎTRE — cadre doré animé', unlocked: false },
      ],
    },
  });

  // === CARACTÈRES ===
  const [charOnboarded, setCharOnboarded] = useState(null);
  const [userCollection, setUserCollection] = useState([]);
  const [activeCharSlug, setActiveCharSlug] = useState(null);
  const [showCharOnboarding, setShowCharOnboarding] = useState(false);
  const [selectedChar, setSelectedChar] = useState(null);
  const [previewChar, setPreviewChar] = useState(null);
  const [cardViewIndex, setCardViewIndex] = useState(0);
  const [charFlipped, setCharFlipped] = useState(false);
  const [charPowers, setCharPowers] = useState([]);
  const [loadingPowers, setLoadingPowers] = useState(false);
  const [onboardingSelected, setOnboardingSelected] = useState(null);
  const [inlinePowerModal, setInlinePowerModal] = useState(null);
  const [humanTab, setHumanTab] = useState('binome');
  const [userNameAvatar, setUserNameAvatar] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    const toValue = dropdownOpen ? 0 : 1;
    Animated.timing(dropdownAnim, { toValue, duration: 200, useNativeDriver: false }).start();
    setDropdownOpen(!dropdownOpen);
  };

  const flipAnim = useRef(new Animated.Value(0)).current;
  const cardViewIndexRef = useRef(0);
  const cardFlatListRef = useRef(null);

  const CARD_WIDTH = wp(280);
  const CARD_SPACING = wp(12);
  const CARD_SNAP = CARD_WIDTH + CARD_SPACING;

  const onCardViewableChange = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const idx = viewableItems[0].index;
      if (idx !== undefined && idx !== null) {
        cardViewIndexRef.current = idx;
        setCardViewIndex(idx);
      }
    }
  }).current;

  const cardViewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const hdrs = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY };

  const handleCharRecharge = (charId) => {
    const char = ownedChars[charId];
    if (!char) return;
    setCharRecharging(true);
    rechargeProgress.setValue(0);

    Animated.timing(rechargeProgress, {
      toValue: 1, duration: 2000, useNativeDriver: false,
    }).start(() => {
      setCharRecharging(false);
      rechargeProgress.setValue(0);

      const bonusXp = char.recharge_energy_cost;
      setOwnedChars(prev => ({
        ...prev,
        [charId]: {
          ...prev[charId],
          uses_remaining: prev[charId].uses_max,
          xp: prev[charId].xp + bonusXp,
        }
      }));

      showLixAlert('Rechargé', '+' + char.uses_max + ' utilisations restaurées !\n+' + bonusXp + ' XP bonus', [{ text: 'Super', color: '#00D984' }], '⚡');
    });
  };

  // === CARACTÈRES — Fonctions Supabase ===
  const supaRpc = async (fnName, params = {}) => {
    const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + fnName, {
      method: 'POST', headers: POST_HEADERS, body: JSON.stringify(params),
    });
    return res.json();
  };

  const loadCharacterData = async () => {
    try {
      const userId = TEST_USER_ID;
      const onb = await supaRpc('check_character_onboarding', { p_user_id: userId });
      const isOnboarded = onb?.first_character_chosen || false;
      setCharOnboarded(isOnboarded);

      if (!isOnboarded) {
        setShowCharOnboarding(true);
        const charsRes = await fetch(SUPABASE_URL + '/rest/v1/lixverse_characters?tier=eq.standard&order=sort_order.asc', { headers: HEADERS });
        const chars = await charsRes.json();
        setUserCollection((chars || []).map(c => ({ ...c, owned: false, level: 0, fragments: 0 })));
        return;
      }

      const collection = await supaRpc('get_user_collection', { p_user_id: userId });
      if (collection && Array.isArray(collection)) {
        setUserCollection(collection);
        const active = collection.find(c => c.is_active);
        if (active) setActiveCharSlug(active.slug);
      }
    } catch (e) {
      console.error('Character load error:', e);
    }
  };

  const chooseFirstCharacter = async (slug) => {
    try {
      const data = await supaRpc('choose_first_character', { p_user_id: TEST_USER_ID, p_slug: slug });
      if (data?.success) {
        setCharOnboarded(true);
        setShowCharOnboarding(false);
        setActiveCharSlug(slug);
        loadCharacterData();
      }
    } catch (e) {
      console.error('Choose character error:', e);
    }
  };

  const switchActiveCharacter = async (slug) => {
    try {
      const data = await supaRpc('set_active_character', { p_user_id: TEST_USER_ID, p_slug: slug });
      if (data?.success) {
        setActiveCharSlug(slug);
        setUserCollection(prev => prev.map(c => ({ ...c, is_active: c.slug === slug })));
      }
    } catch (e) {
      console.error('Switch character error:', e);
    }
  };

  const loadCharPowers = async (slug) => {
    setLoadingPowers(true);
    try {
      const data = await supaRpc('get_character_powers', { p_user_id: TEST_USER_ID, p_slug: slug });
      setCharPowers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Powers load error:', e);
    }
    setLoadingPowers(false);
  };

  // ══════════════════════════════════════════════════════════════
  // POUVOIRS — CONSOMMATION + RECHARGE
  // ══════════════════════════════════════════════════════════════

  const FREE_POWER_TYPES = ['toggle'];
  const FREE_POWER_KEYS = ['owl_resume_macros', 'owl_alerte_macros', 'fox_mode_regime'];

  const shouldConsumePower = (power) => {
    if (FREE_POWER_TYPES.includes(power.action_type)) return false;
    if (FREE_POWER_KEYS.includes(power.power_key)) return false;
    return true;
  };

  const consumePower = async (powerKey) => {
    try {
      const data = await supaRpc('use_character_power', { p_user_id: TEST_USER_ID, p_power_key: powerKey });
      if (data?.success) {
        setUserCollection(prev => prev.map(c =>
          c.slug === selectedChar?.slug
            ? { ...c, uses_remaining: data.uses_remaining }
            : c
        ));
        return { success: true, uses_remaining: data.uses_remaining };
      }
      if (data?.error === 'No uses remaining') {
        showLixAlert('⚡ Utilisations épuisées',
          'Recharge ton ' + (selectedChar?.name || '') + ' dans l\'onglet Caractères.',
          [{ text: 'Recharger', color: '#00D984', onPress: () => rechargeChar() }, { text: 'Fermer', style: 'cancel' }], '⚡');
        return { success: false, error: 'no_uses' };
      }
      return { success: false, error: data?.error };
    } catch (e) {
      console.error('Consume power error:', e);
      return { success: false, error: 'network' };
    }
  };

  const rechargeChar = async () => {
    if (!selectedChar) return;
    try {
      const data = await supaRpc('recharge_character', { p_user_id: TEST_USER_ID, p_slug: selectedChar.slug });
      if (data?.success) {
        setUserCollection(prev => prev.map(c =>
          c.slug === selectedChar.slug
            ? { ...c, uses_remaining: data.uses_restored }
            : c
        ));
      }
    } catch (e) {
      console.error('Recharge error:', e);
    }
  };

  // Flip animation
  const flipCard = () => {
    const toVal = charFlipped ? 0 : 1;
    Animated.timing(flipAnim, {
      toValue: toVal, duration: 300, useNativeDriver: true,
    }).start(() => setCharFlipped(!charFlipped));
  };
  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const backInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  useEffect(() => {
    if (selectedChar && ALL_CHARACTERS[cardViewIndex]) {
      const newCharId = ALL_CHARACTERS[cardViewIndex].id;
      const collectionChar = userCollection.find(c => (c.slug || c.id) === newCharId);
      if (collectionChar) {
        setSelectedChar({ ...collectionChar, slug: collectionChar.slug || newCharId });
      } else {
        const fallback = ALL_CHARACTERS[cardViewIndex];
        setSelectedChar({ ...fallback, slug: newCharId, owned: false, level: 0, xp: 0, xp_next: 1000, uses_remaining: 0, uses_max: fallback.uses || 10, fragments: 0, fragments_required: 3 });
      }
      loadCharPowers(newCharId);
    }
  }, [cardViewIndex]);

  // === VÉRIFIER SPIN GRATUIT ===
  const checkFreeSpin = async () => {
    try {
      const data = await supaRpc('check_free_spin_available', { p_user_id: TEST_USER_ID });
      if (data && typeof data === 'object') {
        const available = data.free_available !== false;
        setFreeSpinAvailable(available);
        setFreeSpinUsed(!available);
      }
    } catch (e) {
      // Si erreur, vérifier manuellement via spin_history
      try {
        const res = await fetch(SUPABASE_URL + '/rest/v1/spin_history?user_id=eq.' + TEST_USER_ID + '&spin_tier=eq.normal&lix_cost=eq.0&created_at=gte.' + new Date().toISOString().slice(0, 10) + '&limit=1', { headers: HEADERS });
        const d = await res.json();
        const used = Array.isArray(d) && d.length > 0;
        setFreeSpinAvailable(!used);
        setFreeSpinUsed(used);
      } catch (e2) {
        setFreeSpinAvailable(true);
        setFreeSpinUsed(false);
      }
    }
  };

  // === CALLBACK APRÈS ANIMATION SPIN ===
  const onSpinComplete = (spinData) => {
    const rv = spinData.reward_value || {};
    const rType = spinData.reward_type;

    if (rType === 'fragment' || rType === 'full_card') {
      const fragTier = rv.tier || spinData.character_tier || 'standard';
      const fragSlug = spinData.character_name ? Object.entries(CHAR_NAMES).find(([k,v]) => v === spinData.character_name)?.[0] : randomSlugFromTier(fragTier);
      setFragmentResult({
        slug: fragSlug || 'unknown',
        name: spinData.character_name || CHAR_NAMES[fragSlug] || fragSlug || 'Inconnu',
        emoji: spinData.character_emoji || CHAR_EMOJIS[fragSlug] || '🎭',
        tier: fragTier,
        amount: rv.fragment || 1,
        isComplete: rType === 'full_card',
        levelUp: false,
        newLevel: 0,
        totalFrags: rv.fragment || 1,
        fragsNeeded: FRAGS_NIV1[fragTier] || 3,
      });
      setShowFragmentModal(true);
      fragmentSlideAnim.setValue(0);
    }

    // Rafraîchir spin gratuit
    checkFreeSpin();
  };

  // === DISTRIBUER UN FRAGMENT APRÈS SPIN (fallback client) ===
  const distributeFragment = async (tier, amount) => {
    const slug = randomSlugFromTier(tier);
    if (!slug) return null;

    setFragmentSaving(true);
    try {
      const data = await supaRpc('add_character_fragment', {
        p_user_id: TEST_USER_ID,
        p_slug: slug,
        p_amount: amount,
      });

      const result = {
        slug,
        name: CHAR_NAMES[slug] || slug,
        emoji: CHAR_EMOJIS[slug] || '🎭',
        tier,
        amount,
        isComplete: amount >= FRAGS_NIV1[tier],
        levelUp: data?.level_up || false,
        newLevel: data?.new_level || 0,
        totalFrags: data?.fragments || amount,
        fragsNeeded: FRAGS_NIV1[tier],
      };

      setFragmentResult(result);
      setShowFragmentModal(true);
      fragmentSlideAnim.setValue(0);
      return result;
    } catch (e) {
      console.error('Fragment distribution error:', e);
      return null;
    } finally {
      setFragmentSaving(false);
    }
  };

  const getSegments = () => {
    if (spinTier === 'super') return SUPER_SEGMENTS;
    if (spinTier === 'mega') return MEGA_SEGMENTS;
    return NORMAL_SEGMENTS;
  };

  useEffect(() => {
    if (!freeSpinUsed) { setTimeToFree(''); return; }
    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimeToFree(h + ':' + m + ':' + s);
    }, 1000);
    return () => clearInterval(timer);
  }, [freeSpinUsed]);

  useEffect(() => {
    loadAll();
    checkFreeSpin();
    // Avatar profil
    (async () => {
      try {
        const res = await fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + TEST_USER_ID + '&select=full_name', { headers: HEADERS });
        const d = await res.json();
        if (d && d[0]) setUserNameAvatar(d[0].full_name || '');
      } catch (e) {}
    })();
    // Pulse animation pour SPIN GRATUIT
    Animated.loop(
      Animated.sequence([
        Animated.timing(freeBtnPulse, { toValue: 1.04, duration: 1200, useNativeDriver: true }),
        Animated.timing(freeBtnPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  useEffect(() => { if (activeTab === 'characters') loadCharacterData(); }, [activeTab]);
  // Fake realtime — simuler des likes externes toutes les 12-27s
  useEffect(() => {
    if (wallStickers.length === 0) return;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * wallStickers.length);
      const randomSticker = wallStickers[randomIdx];
      if (randomSticker) {
        handleStickerTap(randomSticker);
      }
    }, 12000 + Math.random() * 15000);
    return () => clearInterval(interval);
  }, [wallStickers]);

  useEffect(() => {
    if (notifications.length === 0) return;
    Animated.loop(Animated.timing(notifScrollX, { toValue: -(notifications.length * wp(280)), duration: notifications.length * 5000, useNativeDriver: true })).start();
  }, [notifications]);

  // Binôme — star dot pulse animations
  useEffect(() => {
    dotPulseAnims.forEach((anim, i) => {
      const delay = Math.random() * 3000;
      const duration = 1500 + Math.random() * 2500;
      setTimeout(() => {
        Animated.loop(Animated.sequence([
          Animated.timing(anim, { toValue: 0.9 + Math.random() * 0.1, duration: duration, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0.15 + Math.random() * 0.15, duration: duration * 0.8, useNativeDriver: false }),
        ])).start();
      }, delay);
    });
    dotGlowAnims.forEach((anim, i) => {
      const delay = Math.random() * 4000;
      const duration = 2000 + Math.random() * 3000;
      setTimeout(() => {
        Animated.loop(Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: duration, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0, duration: duration, useNativeDriver: false }),
        ])).start();
      }, delay);
    });
  }, []);

  // Binôme — simulate incoming pokes when matched
  useEffect(() => {
    if (binomeStatus !== 'matched') return;
    const interval = setInterval(() => {
      if (Math.random() > 0.5) return;
      const allSigns = Object.values(LIXSIGNS).flatMap(cat => cat.signs);
      const randomSign = allSigns[Math.floor(Math.random() * allSigns.length)];
      setBinomeMessages(prev => [...prev, {
        id: Date.now().toString(),
        sign_id: randomSign.id,
        from: 'partner',
        timestamp: new Date().toISOString(),
        showText: false,
      }]);
    }, 30000 + Math.random() * 30000);
    return () => clearInterval(interval);
  }, [binomeStatus]);

  // Binôme — compte à rebours 24h retry
  useEffect(() => {
    if (!retryAfterTime) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = retryAfterTime - now;
      if (diff <= 0) {
        setRetryAfterTime(null);
        setRetryCountdown('');
        clearInterval(interval);
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setRetryCountdown(
        (hours > 0 ? hours + 'h ' : '') +
        (minutes > 0 ? minutes + 'min ' : '') +
        seconds + 's'
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [retryAfterTime]);

  const startBinomeSearch = () => {
    setBinomeStatus('searching');
    setSearchProgress(0);
    setSearchStep(0);
    setCompatibilityScore(0);
    setScanLines([]);

    // 1. Rotation radar continue
    radarAnim.setValue(0);
    Animated.loop(
      Animated.timing(radarAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();

    // 2. Cercles concentriques en cascade
    const startPulseRing = (anim, delay) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: false }),
            Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: false }),
          ])
        ).start();
      }, delay);
    };
    pulseRing1.setValue(0);
    pulseRing2.setValue(0);
    pulseRing3.setValue(0);
    startPulseRing(pulseRing1, 0);
    startPulseRing(pulseRing2, 700);
    startPulseRing(pulseRing3, 1400);

    // 3. Coordonnées GPS qui défilent
    const coordsInterval = setInterval(() => {
      setSearchCoords({
        lat: (Math.random() * 60 - 30).toFixed(4) + '°',
        lng: (Math.random() * 120 - 60).toFixed(4) + '°',
      });
    }, 150);

    // 4. Lignes de connexion progressives
    const linesInterval = setInterval(() => {
      const centerX = (SCREEN_WIDTH - wp(32)) / 2;
      const centerY = wp(90);
      const dotIdx = Math.floor(Math.random() * WORLD_DOTS.length);
      const dot = WORLD_DOTS[dotIdx];
      const dotX = (dot.x / 800) * (SCREEN_WIDTH - wp(32));
      const dotY = (dot.y / 400) * wp(180);
      const dx = dotX - centerX;
      const dy = dotY - centerY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      setScanLines(prev => {
        const newLines = [...prev, { x1: centerX, y1: centerY, length, angle, id: Date.now() }];
        return newLines.slice(-8);
      });
    }, 800);

    // 5. Étapes progressives tech
    const SEARCH_STEPS = [
      { text: 'Analyse morphologique du profil...', duration: 1500 },
      { text: 'Extraction des paramètres nutritionnels...', duration: 1800 },
      { text: 'Corrélation des objectifs de santé...', duration: 2000 },
      { text: 'Triangulation géographique...', duration: 1500 },
      { text: 'Scan des profils compatibles...', duration: 2500 },
      { text: 'Calcul de l\'indice de compatibilité...', duration: 2000 },
      { text: 'Vérification anti-triche...', duration: 1200 },
      { text: 'Binôme identifié !', duration: 800 },
    ];

    let stepIdx = 0;
    let elapsed = 0;
    const totalDuration = SEARCH_STEPS.reduce((s, step) => s + step.duration, 0);

    const stepTimer = () => {
      if (stepIdx >= SEARCH_STEPS.length) return;
      setSearchStep(stepIdx);
      const progress = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setSearchProgress(progress);

      if (stepIdx >= 4) {
        const targetCompat = 87;
        const compatProgress = Math.min(targetCompat, Math.round(((stepIdx - 4) / (SEARCH_STEPS.length - 4)) * targetCompat));
        setCompatibilityScore(compatProgress);
      }

      elapsed += SEARCH_STEPS[stepIdx].duration;
      stepIdx++;

      if (stepIdx < SEARCH_STEPS.length) {
        setTimeout(stepTimer, SEARCH_STEPS[stepIdx - 1].duration);
      } else {
        setTimeout(() => {
          clearInterval(coordsInterval);
          clearInterval(linesInterval);
          radarAnim.stopAnimation();
          pulseRing1.stopAnimation();
          pulseRing2.stopAnimation();
          pulseRing3.stopAnimation();

          // Appel RPC Supabase (quand ready) :
          // fetch(SUPABASE_URL + '/rest/v1/rpc/find_binome_match', {
          //   method: 'POST',
          //   headers: { ...hdrs, 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ p_user_id: TEST_USER_ID }),
          // }).then(r => r.json()).then(data => { ... })

          // Pour l'instant : simuler avec 15% de chance de "pas trouvé"
          const noMatch = Math.random() < 0.15;

          if (noMatch) {
            setSearchProgress(100);
            setCompatibilityScore(0);
            setBinomeStatus('no_match');
            setRetryAfterTime(Date.now() + 24 * 60 * 60 * 1000);
          } else {
            setCompatibilityScore(87);
            setSearchProgress(100);
            setBinomePartner(FAKE_MATCH);
            setBinomeCommonPoints(FAKE_MATCH.common_points);
            setBinomeDistance(FAKE_MATCH.distance_km);
            setBinomeStatus('proposed');
          }
        }, SEARCH_STEPS[SEARCH_STEPS.length - 1].duration);
      }
    };
    stepTimer();
  };

  const sendLixSign = (sign) => {
    setBinomeMessages(prev => [...prev, {
      id: Date.now().toString(),
      sign_id: sign.id,
      from: 'me',
      timestamp: new Date().toISOString(),
      showText: false,
    }]);
    setShowLixSignPicker(false);
  };

  const resetBinomeState = () => {
    setBinomeStatus('none');
    setBinomePartner(null);
    setBinomeMessages([]);
    setBinomeCommonPoints([]);
    setBinomeDistance(null);
    setSearchProgress(0);
    setSearchStep(0);
    setCompatibilityScore(0);
    setScanLines([]);
  };

  const breakBinome = () => {
    setShowBinomeAlert({
      visible: true,
      title: 'Rompre le Binôme ?',
      message: 'Tu perdras ta connexion avec ' + (binomePartner?.display_name || 'ton binôme') + ' et ton streak.',
      icon: '💔',
      buttons: [
        { text: 'Annuler', style: 'cancel', onPress: () => setShowBinomeAlert({ visible: false, title: '', message: '', icon: null, buttons: [] }) },
        { text: 'Rompre', style: 'destructive', onPress: () => {
          resetBinomeState();
          setShowBinomeAlert({ visible: false, title: '', message: '', icon: null, buttons: [] });
        }},
      ],
    });
  };

  const handleStickerTap = (sticker) => {
    const id = sticker.id;
    // Incrémenter le like
    setWallStickers(prev => prev.map(s => s.id === id ? { ...s, like_count: (s.like_count || 0) + 1 } : s));
    // Envoyer le like à Supabase (fire and forget)
    fetch(SUPABASE_URL + '/rest/v1/rpc/like_wall_sticker', {
      method: 'POST',
      headers: { ...hdrs, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_sticker_id: id, p_user_id: TEST_USER_ID }),
    }).catch(() => {});
    // Cœur flottant
    const heartId = Date.now() + Math.random();
    const heartEmojis = ['🩶', '🤍', '💛', '⭐', '✨'];
    const emoji = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    setFloatingHearts(prev => [...prev, { id: heartId, stickerId: id, x: Math.random() * wp(40) - wp(20), emoji }]);
    setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== heartId)), 1200);
    // Combo system
    const prevCount = comboCount[id] || 0;
    const newCount = prevCount + 1;
    setComboCount(prev => ({ ...prev, [id]: newCount }));
    // Reset combo timer
    if (comboTimer[id]) clearTimeout(comboTimer[id]);
    const timer = setTimeout(() => {
      setComboCount(prev => ({ ...prev, [id]: 0 }));
      setStrikeActive(prev => ({ ...prev, [id]: false }));
    }, 2000);
    setComboTimer(prev => ({ ...prev, [id]: timer }));
    // Shake animation — intensité augmente avec le combo
    if (!stickerShakeAnims[id]) {
      stickerShakeAnims[id] = new Animated.Value(0);
    }
    const shakeIntensity = Math.min(newCount * 1.5, 12);
    Animated.sequence([
      Animated.timing(stickerShakeAnims[id], { toValue: shakeIntensity, duration: 50, useNativeDriver: true }),
      Animated.timing(stickerShakeAnims[id], { toValue: -shakeIntensity, duration: 50, useNativeDriver: true }),
      Animated.timing(stickerShakeAnims[id], { toValue: shakeIntensity * 0.6, duration: 50, useNativeDriver: true }),
      Animated.timing(stickerShakeAnims[id], { toValue: -shakeIntensity * 0.6, duration: 50, useNativeDriver: true }),
      Animated.timing(stickerShakeAnims[id], { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    // Strike mode à 5+ combos
    if (newCount >= 5) {
      setStrikeActive(prev => ({ ...prev, [id]: true }));
    }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [a,b,c,d,e] = await Promise.all([
        fetch(SUPABASE_URL+'/rest/v1/users_profile?user_id=eq.'+TEST_USER_ID+'&select=lix_balance',{headers:hdrs}),
        fetch(SUPABASE_URL+'/rest/v1/lixverse_user_characters?user_id=eq.'+TEST_USER_ID+'&select=character_id',{headers:hdrs}),
        fetch(SUPABASE_URL+'/rest/v1/lixverse_challenges?is_active=eq.true&order=start_date.asc',{headers:hdrs}),
        fetch(SUPABASE_URL+'/rest/v1/lixverse_notifications?order=created_at.desc&limit=20',{headers:hdrs}),
        fetch(SUPABASE_URL+'/rest/v1/lixverse_group_members?user_id=eq.'+TEST_USER_ID+'&select=group_id,personal_score,lixverse_groups(id,name,member_count,total_score,invite_code)',{headers:hdrs}),
      ]);
      const [aD,bD,cD,dD,eD] = await Promise.all([a.json(),b.json(),c.json(),d.json(),e.json()]);
      if(aD[0]?.lix_balance!=null)setLixBalance(aD[0].lix_balance);
      if(Array.isArray(bD))setOwnedCharacters(bD.map(x=>x.character_id));
      if(Array.isArray(cD))setChallenges(cD);
      if(Array.isArray(dD))setNotifications(dD);
      if(Array.isArray(eD))setMyGroups(eD);
      // Wall of Health stickers
      const wallRes = await fetch(SUPABASE_URL + '/rest/v1/wall_stickers?is_visible=eq.true&order=like_count.desc&limit=30', { headers: hdrs });
      const wallData = await wallRes.json();
      if (Array.isArray(wallData)) setWallStickers(wallData);
      // Sticker catalog
      const catRes = await fetch(SUPABASE_URL + '/rest/v1/wall_sticker_catalog?is_available=eq.true&order=sort_order.asc', { headers: hdrs });
      const catData = await catRes.json();
      if (Array.isArray(catData)) setStickerCatalog(catData);
      // Ma certification
      const certMonth = new Date().toISOString().slice(0, 7);
      const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
      const certRes = await fetch(SUPABASE_URL + '/rest/v1/wall_certifications?user_id=eq.' + TEST_USER_ID + '&or=(month_year.eq.' + certMonth + ',month_year.eq.' + prevMonth + ')&order=month_year.desc&limit=1', { headers: hdrs });
      const certData = await certRes.json();
      if (Array.isArray(certData) && certData.length > 0) setMyCertification(certData[0]);
    }catch(err){console.error('Load:',err);}
    setLoading(false);
  };

  const createGroup = async () => {
    if (!newGroupName.trim() || !selectedChallenge) return;
    try {
      const code = selectedChallenge.challenge_type.toUpperCase().slice(0, 5) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const h = { ...hdrs, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
      const res = await fetch(SUPABASE_URL + '/rest/v1/lixverse_groups', { method: 'POST', headers: h, body: JSON.stringify({ challenge_id: selectedChallenge.id, name: newGroupName.trim(), created_by: TEST_USER_ID, creator_lixtag: 'LXM-2K7F4A', invite_code: code, member_count: 1 }) });
      const g = await res.json();
      if (g && g[0]) {
        await fetch(SUPABASE_URL + '/rest/v1/lixverse_group_members', { method: 'POST', headers: { ...h, 'Prefer': 'return=minimal' }, body: JSON.stringify({ group_id: g[0].id, user_id: TEST_USER_ID, lixtag: 'LXM-2K7F4A', country: 'Burundi' }) });
        showLixAlert('Groupe créé', '"' + newGroupName.trim() + '"\n\nCode : ' + code, [{ text: 'Parfait', color: '#00D984' }], '✅');
        setShowCreateGroup(false); setNewGroupName(''); loadAll();
      }
    } catch (e) { showLixAlert('Erreur', 'Création échouée. Vérifiez votre connexion.', [{ text: 'OK', style: 'cancel' }], '❌'); }
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) return;
    try {
      const h = { ...hdrs, 'Content-Type': 'application/json' };
      const res = await fetch(SUPABASE_URL + '/rest/v1/lixverse_groups?invite_code=eq.' + joinCode.trim().toUpperCase() + '&select=*', { headers: hdrs });
      const gs = await res.json();
      if (!gs || gs.length === 0) { showLixAlert('Code invalide', 'Aucun groupe trouvé avec ce code. Vérifiez l\'orthographe.', [{ text: 'Réessayer', style: 'cancel' }], '🔍'); return; }
      const g = gs[0];
      await fetch(SUPABASE_URL + '/rest/v1/lixverse_group_members', { method: 'POST', headers: { ...h, 'Prefer': 'return=minimal' }, body: JSON.stringify({ group_id: g.id, user_id: TEST_USER_ID, lixtag: 'LXM-2K7F4A', country: 'Burundi' }) });
      await fetch(SUPABASE_URL + '/rest/v1/lixverse_groups?id=eq.' + g.id, { method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' }, body: JSON.stringify({ member_count: g.member_count + 1 }) });
      showLixAlert('Rejoint', 'Tu fais maintenant partie de "' + g.name + '" !', [{ text: 'Super', color: '#00D984' }], '🤝'); setShowJoinGroup(false); setJoinCode(''); loadAll();
    } catch (e) { showLixAlert('Erreur', 'Impossible de rejoindre ce groupe.', [{ text: 'OK', style: 'cancel' }], '❌'); }
  };

  const renderDefiTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: wp(100) }}>
      {/* WALL OF HEALTH — Mur magnétique */}
      <View style={{ marginBottom: wp(16) }}>
        <View style={{ paddingHorizontal: wp(16), marginBottom: wp(8), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: fp(18), fontWeight: '800', color: '#D4AF37', letterSpacing: 1 }}>WALL OF HEALTH</Text>
          {/* Badge certification si éligible */}
          {myCertification && myCertification.is_certified && !myCertification.has_sticker && (
            <Pressable delayPressIn={120} onPress={() => setShowCertificationModal(true)}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: wp(4),
                backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: wp(8),
                paddingHorizontal: wp(8), paddingVertical: wp(4),
                borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}>
              <Text style={{ fontSize: fp(12) }}>❓</Text>
              <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#D4AF37' }}>BADGE</Text>
            </Pressable>
          )}
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.3)' }}>{Math.min(wallStickers.length, 9)}/9</Text>
        </View>
        {/* Le mur gris métallique */}
        <View style={{
          marginHorizontal: wp(8), borderRadius: wp(16), overflow: 'hidden',
          borderWidth: 2, borderColor: '#8B7A2E',
          shadowColor: '#D4AF37',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 14,
          elevation: 8,
        }}>
          <LinearGradient colors={['#3A3F46', '#2D3238', '#3A3F46', '#333840']}
            style={{ minHeight: wp(280), padding: wp(12), position: 'relative' }}>
            {/* Coins dorés élégants */}
            {[
              { top: wp(6), left: wp(6), borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: wp(4) },
              { top: wp(6), right: wp(6), borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: wp(4) },
              { bottom: wp(6), left: wp(6), borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: wp(4) },
              { bottom: wp(6), right: wp(6), borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: wp(4) },
            ].map((cornerStyle, i) => (
              <View key={i} style={{
                position: 'absolute', zIndex: 10,
                width: wp(20), height: wp(20),
                borderColor: '#8B7A2E',
                ...cornerStyle,
              }} />
            ))}
            {/* Titre doré — image agrandie */}
            <View style={{ alignItems: 'center', marginBottom: wp(4), paddingTop: wp(0) }}>
              <Image
                source={require('./assets/wall-of-health-title.webp')}
                style={{
                  width: wp(300),
                  height: wp(60),
                }}
                resizeMode="contain"
              />
            </View>
            {/* Indicateur mois + places */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(8), marginBottom: wp(8) }}>
              <View style={{
                backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: wp(8),
                paddingHorizontal: wp(10), paddingVertical: wp(3),
                borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)',
              }}>
                <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#D4AF37', letterSpacing: 1 }}>
                  {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}
                </Text>
              </View>
              <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.25)' }}>
                {Math.max(0, 9 - wallStickers.length)}/9 places restantes
              </Text>
            </View>
            {/* Stickers disposés organiquement */}
            {wallStickers.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: wp(30) }}>
                <Text style={{ fontSize: fp(32), marginBottom: wp(8) }}>🏆</Text>
                <Text style={{ fontSize: fp(14), fontWeight: '600', color: 'rgba(255,255,255,0.25)', marginBottom: wp(4) }}>
                  Le mur attend ses héros du mois
                </Text>
                <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.15)', textAlign: 'center', paddingHorizontal: wp(20) }}>
                  9 places — seuls les profils certifiés par l'algorithme anti-triche peuvent être affichés
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: wp(6), paddingBottom: wp(8), paddingHorizontal: wp(4) }}>
                {wallStickers.slice(0, 9).map((sticker, i) => {
                  const id = sticker.id;
                  const hearts = floatingHearts.filter(h => h.stickerId === id);
                  const combo = comboCount[id] || 0;
                  const isStrike = strikeActive[id] || false;
                  const shakeAnim = stickerShakeAnims[id];
                  const cardBg = isStrike
                    ? 'rgba(212,175,55,0.35)'
                    : combo >= 3
                      ? 'rgba(0,217,132,0.22)'
                      : 'rgba(45,50,56,0.85)';
                  const cardBorder = isStrike
                    ? 'rgba(212,175,55,0.7)'
                    : combo >= 3
                      ? 'rgba(0,217,132,0.4)'
                      : 'rgba(255,255,255,0.2)';
                  const glowColor = isStrike ? '#D4AF37' : '#00D984';
                  return (
                    <Animated.View key={id || i} style={{
                      width: wp(85), alignItems: 'center', padding: wp(6),
                      transform: [
                        { rotate: (sticker.rotation || (i % 2 === 0 ? -5 : 5)) + 'deg' },
                        { translateX: shakeAnim || 0 },
                      ],
                    }}>
                      {/* Cœurs flottants */}
                      {hearts.map(h => (
                        <Text key={h.id} style={{
                          position: 'absolute', top: -wp(12), left: wp(30) + (h.x || 0),
                          fontSize: fp(combo >= 5 ? 18 : 14), zIndex: 20, opacity: 0.9,
                        }}>{h.emoji || '🩶'}</Text>
                      ))}
                      {/* Badge combo */}
                      {combo >= 3 && (
                        <View style={{
                          position: 'absolute', top: -wp(6), right: wp(2), zIndex: 30,
                          backgroundColor: isStrike ? '#D4AF37' : '#00D984',
                          borderRadius: wp(8), paddingHorizontal: wp(5), paddingVertical: wp(1),
                        }}>
                          <Text style={{ fontSize: fp(8), fontWeight: '800', color: isStrike ? '#1A1D22' : '#FFF' }}>
                            x{combo}
                          </Text>
                        </View>
                      )}
                      {/* Clip doré métallique */}
                      <View style={{
                        width: wp(24), height: wp(10), borderTopLeftRadius: wp(5), borderTopRightRadius: wp(5),
                        borderBottomLeftRadius: wp(2), borderBottomRightRadius: wp(2),
                        marginBottom: wp(-4), zIndex: 2,
                        borderWidth: 1.5,
                        borderColor: isStrike ? '#D4AF37' : 'rgba(212,175,55,0.5)',
                        backgroundColor: isStrike ? 'rgba(212,175,55,0.35)' : 'rgba(212,175,55,0.15)',
                        shadowColor: '#D4AF37',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: isStrike ? 0.5 : 0.2,
                        shadowRadius: 3,
                        elevation: 2,
                      }}>
                        {/* Reflet sur le clip */}
                        <View style={{
                          position: 'absolute', top: wp(1.5), left: wp(4), right: wp(4),
                          height: wp(2), borderRadius: wp(1),
                          backgroundColor: 'rgba(255,255,255,0.2)',
                        }} />
                      </View>
                      {/* Carte sticker — zone tappable complète */}
                      <Pressable
                        onPress={() => handleStickerTap(sticker)}
                        delayPressIn={0}
                        style={({ pressed }) => ({
                          backgroundColor: cardBg,
                          borderRadius: wp(12),
                          padding: wp(8), alignItems: 'center', width: '100%',
                          borderWidth: 1.5, borderColor: cardBorder,
                          transform: [{ scale: pressed ? 0.92 : 1 }],
                          ...(isStrike ? {
                            shadowColor: glowColor,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.6,
                            shadowRadius: wp(8),
                            elevation: 8,
                          } : {}),
                        })}
                      >
                        <Text style={{ fontSize: fp(24) }}>{sticker.sticker_emoji}</Text>
                        <Text style={{
                          fontSize: fp(8), fontWeight: '700',
                          color: isStrike ? '#D4AF37' : '#FFF',
                          marginTop: wp(3),
                        }} numberOfLines={1}>
                          {sticker.display_name}
                        </Text>
                        <Text style={{
                          fontSize: fp(6),
                          color: isStrike ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.4)',
                          marginTop: wp(1), fontStyle: 'italic',
                        }} numberOfLines={1}>
                          {sticker.message}
                        </Text>
                        {/* Compteur likes + bouton cadeau */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(6), marginTop: wp(4), width: '100%' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
                            <Text style={{ fontSize: fp(10) }}>{isStrike ? '💛' : '🩶'}</Text>
                            <Text numberOfLines={1} style={{
                              fontSize: fp(8), fontWeight: isStrike ? '700' : '400',
                              color: isStrike ? '#D4AF37' : 'rgba(255,255,255,0.4)',
                              maxWidth: wp(28),
                            }}>
                              {(sticker.like_count || 0) >= 1000
                                ? ((sticker.like_count || 0) / 1000).toFixed(1) + 'K'
                                : (sticker.like_count || 0)}
                            </Text>
                          </View>
                          {/* Bouton Cadeau — empêche la propagation du tap */}
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation && e.stopPropagation();
                              setSelectedSticker(sticker);
                              setShowGiftModal(true);
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={({ pressed }) => ({ transform: [{ scale: pressed ? 1.3 : 1 }] })}
                          >
                            <Text style={{ fontSize: fp(10) }}>🎁</Text>
                          </Pressable>
                          {sticker.lix_received > 0 && (
                            <Text numberOfLines={1} style={{ fontSize: fp(6), color: 'rgba(212,175,55,0.5)', maxWidth: wp(22) }}>{sticker.lix_received}L</Text>
                          )}
                        </View>
                      </Pressable>
                    </Animated.View>
                  );
                })}
                {wallStickers.length >= 9 && (
                  <View style={{ width: '100%', alignItems: 'center', paddingTop: wp(8) }}>
                    <Text style={{ fontSize: fp(9), color: 'rgba(212,175,55,0.35)', fontStyle: 'italic' }}>
                      Mur complet — prochain renouvellement le 1er du mois
                    </Text>
                  </View>
                )}
              </View>
            )}
          </LinearGradient>
        </View>
      </View>
      {myGroups.length > 0 && (
        <View style={{ paddingHorizontal: wp(16), marginBottom: wp(16) }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>Mes équipes</Text>
          {myGroups.map((gm, i) => {
            const g = gm.lixverse_groups; if (!g) return null;
            return (
              <View key={i} style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(14), padding: wp(14), marginBottom: wp(8), borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}><Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{g.name}</Text><Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(2) }}>{g.member_count} membres | Score: {g.total_score}</Text></View>
                  <View style={{ backgroundColor: 'rgba(0,217,132,0.1)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(4) }}><Text style={{ fontSize: fp(10), fontWeight: '600', color: '#00D984' }}>Mon: {gm.personal_score || 0}</Text></View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: wp(8), backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(4) }}>
                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.25)' }}>Code: </Text><Text style={{ fontSize: fp(10), fontWeight: '700', color: '#D4AF37', letterSpacing: 1 }}>{g.invite_code}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
      <View style={{ paddingHorizontal: wp(16), marginBottom: wp(16) }}>
        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>Défis du mois</Text>
        {loading ? <ActivityIndicator color="#D4AF37" style={{ padding: wp(20) }} /> : challenges.map(ch => {
          const dl = new Date(ch.registration_deadline);
          const hLeft = Math.max(0, Math.ceil((dl - new Date()) / 3600000));
          const dLeft = Math.floor(hLeft / 24);
          const isOpen = hLeft > 0;
          const isUrgent = hLeft > 0 && hLeft <= 24;
          return (
            <View key={ch.id} style={{ borderRadius: wp(16), marginBottom: wp(10), borderWidth: 1.5, borderColor: ch.color + '40', overflow: 'hidden' }}>
              <LinearGradient colors={['#2A2F36', '#1E2328']} style={{ padding: wp(16), borderRadius: wp(14) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
                  <Text style={{ fontSize: fp(24), marginRight: wp(10) }}>{ch.icon}</Text>
                  <View style={{ flex: 1 }}><Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>{ch.title}</Text><Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>{ch.duration_days}j | Max {ch.max_group_size}/équipe</Text></View>
                  <View style={{
                    backgroundColor: isOpen
                      ? (isUrgent ? 'rgba(255,107,107,0.15)' : 'rgba(0,217,132,0.12)')
                      : 'rgba(255,255,255,0.06)',
                    borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3),
                    borderWidth: 1,
                    borderColor: isOpen
                      ? (isUrgent ? 'rgba(255,107,107,0.25)' : 'rgba(0,217,132,0.2)')
                      : 'rgba(255,255,255,0.08)',
                  }}>
                    <Text style={{
                      fontSize: fp(9), fontWeight: '700',
                      color: isOpen
                        ? (isUrgent ? '#FF6B6B' : '#00D984')
                        : 'rgba(255,255,255,0.3)',
                    }}>
                      {isOpen
                        ? (isUrgent ? hLeft + 'h restantes' : dLeft + 'j restants')
                        : 'Terminé'}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', marginBottom: wp(8) }}>{ch.description}</Text>
                {/* Barre de progression */}
                <View style={{ marginBottom: wp(10), marginTop: wp(4) }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(4) }}>
                    <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>
                      Jour {Math.min(Math.ceil((new Date() - new Date(ch.start_date || ch.created_at)) / 86400000), ch.duration_days || 30)}/{ch.duration_days || 30}
                    </Text>
                    <Text style={{ fontSize: fp(10), fontWeight: '600', color: ch.color || '#00D984' }}>
                      {Math.min(100, Math.round((Math.ceil((new Date() - new Date(ch.start_date || ch.created_at)) / 86400000) / (ch.duration_days || 30)) * 100))}%
                    </Text>
                  </View>
                  <View style={{ height: wp(4), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(2), overflow: 'hidden' }}>
                    <View style={{
                      height: '100%', borderRadius: wp(2),
                      backgroundColor: ch.color || '#00D984',
                      width: Math.min(100, Math.round((Math.ceil((new Date() - new Date(ch.start_date || ch.created_at)) / 86400000) / (ch.duration_days || 30)) * 100)) + '%',
                      opacity: 0.7,
                    }} />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: wp(6) }}>
                  {[{ e: '🥇', v: ch.reward_lix_first }, { e: '🥈', v: ch.reward_lix_second }, { e: '🥉', v: ch.reward_lix_third }].map((r, j) => (
                    <View key={j} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: j === 0 ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.05)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3), gap: wp(4) }}>
                      <Text style={{ fontSize: fp(10) }}>{r.e}</Text><Text style={{ fontSize: fp(10), fontWeight: '600', color: j === 0 ? '#D4AF37' : 'rgba(255,255,255,0.4)' }}>{r.v} Lix</Text>
                    </View>
                  ))}
                </View>
                <View style={{ marginTop: wp(10), flexDirection: 'row', gap: wp(8) }}>
                  <Pressable
                    onPress={() => { setSelectedChallenge(ch); setShowCreateGroup(true); }}
                    delayPressIn={120}
                    style={({ pressed }) => ({
                      flex: 1, paddingVertical: wp(11), borderRadius: wp(12), alignItems: 'center',
                      backgroundColor: (ch.color || '#D4AF37') + '20',
                      borderWidth: 1.5, borderColor: (ch.color || '#D4AF37') + '50',
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    })}
                  >
                    <Text style={{ fontSize: fp(11), fontWeight: '700', color: ch.color || '#D4AF37' }}>Créer une équipe</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { setSelectedChallenge(ch); setShowJoinGroup(true); }}
                    delayPressIn={120}
                    style={({ pressed }) => ({
                      flex: 1, paddingVertical: wp(11), borderRadius: wp(12), alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    })}
                  >
                    <Text style={{ fontSize: fp(11), fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>Rejoindre</Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          );
        })}
      </View>
      <View style={{ paddingHorizontal: wp(16) }}>
        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>Classements</Text>
        <View style={{ flexDirection: 'row', gap: wp(6), marginBottom: wp(12) }}>
          {['Groupes', 'Personnel', 'Binôme', 'Pays', 'Mondial'].map((t, i) => (
            <Pressable key={t} onPress={() => setLeaderboardTab(['groups', 'personal', 'binome', 'country', 'global'][i])} style={{ flex: 1, paddingVertical: wp(8), borderRadius: wp(10), alignItems: 'center', backgroundColor: leaderboardTab === ['groups', 'personal', 'binome', 'country', 'global'][i] ? '#D4AF37' : 'rgba(255,255,255,0.05)' }}>
              <Text style={{ fontSize: fp(9), fontWeight: '600', color: leaderboardTab === ['groups', 'personal', 'binome', 'country', 'global'][i] ? '#1A1D22' : 'rgba(255,255,255,0.4)' }}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(14), padding: wp(16), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
          {leaderboardTab === 'binome' ? (
            BINOME_LEADERBOARD.map(b => (
              <View key={b.rank} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(10), borderBottomWidth: b.rank < 5 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                <View style={{ width: wp(28), height: wp(28), borderRadius: wp(14), backgroundColor: b.rank <= 3 ? (b.rank === 1 ? 'rgba(212,175,55,0.2)' : b.rank === 2 ? 'rgba(192,192,192,0.2)' : 'rgba(205,127,50,0.2)') : 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: wp(10) }}>
                  <Text style={{ fontSize: fp(12), fontWeight: '700', color: b.rank === 1 ? '#D4AF37' : b.rank === 2 ? '#C0C0C0' : b.rank === 3 ? '#CD7F32' : 'rgba(255,255,255,0.3)' }}>{b.rank}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(12), fontWeight: '600', color: b.rank <= 3 ? '#FFF' : 'rgba(255,255,255,0.5)' }}>{b.names} {b.flags}</Text>
                  <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)' }}>🔥 {b.flames} flammes</Text>
                </View>
                <Text style={{ fontSize: fp(14), fontWeight: '700', color: b.rank <= 3 ? '#D4AF37' : 'rgba(255,255,255,0.3)' }}>{b.pts} pts</Text>
              </View>
            ))
          ) : (
            [1, 2, 3, 4, 5].map(r => (
              <View key={r} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(10), borderBottomWidth: r < 5 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                <View style={{ width: wp(28), height: wp(28), borderRadius: wp(14), backgroundColor: r <= 3 ? (r === 1 ? 'rgba(212,175,55,0.2)' : r === 2 ? 'rgba(192,192,192,0.2)' : 'rgba(205,127,50,0.2)') : 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: wp(10) }}>
                  <Text style={{ fontSize: fp(12), fontWeight: '700', color: r === 1 ? '#D4AF37' : r === 2 ? '#C0C0C0' : r === 3 ? '#CD7F32' : 'rgba(255,255,255,0.3)' }}>{r}</Text>
                </View>
                <View style={{ flex: 1 }}><Text style={{ fontSize: fp(13), fontWeight: '600', color: r <= 3 ? '#FFF' : 'rgba(255,255,255,0.5)' }}>{['Team Burundi', 'Les Champions', 'Dakar Fit', 'Équipe 4', 'Équipe 5'][r - 1]}</Text></View>
                <Text style={{ fontSize: fp(14), fontWeight: '700', color: r <= 3 ? '#D4AF37' : 'rgba(255,255,255,0.3)' }}>{600 - r * 80} pts</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
  const openCrate = (crate) => {
    if (lixBalance < crate.cost) { showLixAlert('Lix insuffisants', 'Il faut ' + crate.cost + ' Lix pour cette caisse.\n\nTon solde : ' + lixBalance + ' Lix', [{ text: 'Acheter des Lix', color: '#D4AF37', onPress: () => setActiveTab('lixspin') }, { text: 'Fermer', style: 'cancel' }], '💰'); return; }
    setLixBalance(p => p - crate.cost);
    const r = crate.rewards;
    const lixWon = Math.floor(r.lix_min + Math.random() * (r.lix_max - r.lix_min));
    setLixBalance(p => p + lixWon);
    const energyWon = Math.floor(r.energy_min + Math.random() * (r.energy_max - r.energy_min));
    let cardWon = null;
    let cardDup = false;
    let cardRef = 0;
    if (Math.random() < r.card_chance) {
      const tierW = { standard: 60, rare: 25, elite: 12, hyper: 2.5, ultimate: 0.5 };
      const totalW = r.card_tiers.reduce((s, t) => s + (tierW[t] || 1), 0);
      let rn = Math.random() * totalW;
      let selTier = r.card_tiers[0];
      for (const t of r.card_tiers) { rn -= (tierW[t] || 1); if (rn <= 0) { selTier = t; break; } }
      const tierChars = ALL_CHARACTERS.filter(c => c.tier === selTier);
      cardWon = tierChars[Math.floor(Math.random() * tierChars.length)];
      cardDup = ownedCharacters.includes(cardWon.id);
      const refT = { standard: 100, rare: 250, elite: 700, hyper: 2000, ultimate: 5000 };
      cardRef = cardDup ? (refT[cardWon.tier] || 100) : 0;
      if (cardDup) setLixBalance(p => p + cardRef);
      else setOwnedCharacters(p => [...p, cardWon.id]);
    }
    let msg = '💰 +' + lixWon + ' Lix\n⚡ +' + energyWon + ' Énergie';
    if (cardWon) {
      const tc = TIER_CONFIG[cardWon.tier];
      if (cardDup) {
        msg += '\n\n' + cardWon.emoji + ' ' + cardWon.name + ' (' + tc.label + ') DOUBLON\n+' + cardRef + ' Lix remboursés';
      } else {
        msg += '\n\n🎉 CARTE GAGNÉE !\n' + cardWon.emoji + ' ' + cardWon.name + ' (' + tc.label + ')\n' + cardWon.desc;
      }
    } else {
      msg += '\n\nPas de carte cette fois...';
    }
    showLixAlert(crate.name, msg, [{ text: 'Super !', color: '#D4AF37' }], crate.emoji);
    const h = { ...hdrs, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };
    if (cardWon && !cardDup) {
      fetch(SUPABASE_URL + '/rest/v1/lixverse_user_characters', { method: 'POST', headers: h, body: JSON.stringify({ user_id: TEST_USER_ID, character_id: cardWon.id, tier: cardWon.tier, obtained_via: 'crate' }) }).catch(() => {});
      fetch(SUPABASE_URL + '/rest/v1/lixverse_notifications', { method: 'POST', headers: h, body: JSON.stringify({ notification_type: 'character_won', lixtag: 'LXM-2K7F4A', message: 'LXM-2K7F4A a obtenu ' + cardWon.name + ' !', character_id: cardWon.id, color: cardWon.color }) }).catch(() => {});
    }
    fetch(SUPABASE_URL + '/rest/v1/lixverse_crate_history', { method: 'POST', headers: h, body: JSON.stringify({ user_id: TEST_USER_ID, crate_type: crate.id, lix_spent: crate.cost, character_won: cardWon ? cardWon.id : 'none', was_doublon: cardDup, lix_refunded: cardRef }) }).catch(() => {});
  };


  const cardW = (SCREEN_WIDTH - wp(48)) / 3;

  const renderCharactersTab = () => {
    const activeChar = userCollection.find(c => c.slug === activeCharSlug && c.owned !== false);
    const emojiMap = { emerald_owl: '🦉', hawk_eye: '🦅', ruby_tiger: '🐯', amber_fox: '🦊', gipsy_spider: '🕷️' };
    const getEmoji = (c) => emojiMap[c.slug] || ALL_CHARACTERS.find(a => a.id === c.slug)?.emoji || '🃏';
    const getLevelBadge = (c) => {
      const lv = c.level || 0;
      if (lv >= 6) return { text: 'MAX', color: '#FF4757' };
      if (lv >= 3) return { text: 'Niv' + lv, color: '#D4AF37' };
      return { text: 'Niv' + lv, color: '#00D984' };
    };

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(100) }}>
        {/* Personnage actif en haut */}
        {activeChar ? (
          <LinearGradient colors={['#3A3F46','#252A30','#333A42','#1A1D22']} style={{ borderRadius: wp(16), padding: wp(14), marginBottom: wp(16), borderWidth: 1, borderColor: '#4A4F55' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: wp(60), height: wp(60), borderRadius: wp(30), backgroundColor: 'rgba(0,217,132,0.12)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#00D984', marginRight: wp(12) }}>
                {(() => {
                  const charImg = getCharImage(activeChar.slug || activeChar.id);
                  if (charImg.img) {
                    return <Image source={charImg.img} style={{ width: wp(54), height: wp(54), borderRadius: wp(27) }} resizeMode="cover" />;
                  }
                  return <Text style={{ fontSize: fp(28) }}>{charImg.emoji}</Text>;
                })()}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6), marginBottom: wp(4) }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF' }}>{activeChar.name || activeChar.slug}</Text>
                  <Text style={{ fontSize: fp(10), color: '#00D984', fontWeight: '700' }}>ACTIF ✅</Text>
                </View>
                <View style={{ height: wp(5), backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(2.5), overflow: 'hidden', marginBottom: wp(4) }}>
                  <View style={{ height: '100%', borderRadius: wp(2.5), backgroundColor: '#00D984', width: Math.min(100, Math.round(((activeChar.xp || 0) / (activeChar.xp_next || 1000)) * 100)) + '%' }} />
                </View>
                <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.4)' }}>{activeChar.xp || 0}/{activeChar.xp_next || 1000} XP</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4), marginTop: wp(2) }}>
                  <View style={{ height: wp(3), flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(1.5), overflow: 'hidden' }}>
                    <View style={{ height: '100%', borderRadius: wp(1.5), backgroundColor: '#FF8C42', width: Math.min(100, Math.round(((activeChar.uses_remaining || 0) / (activeChar.uses_max || 10)) * 100)) + '%' }} />
                  </View>
                  <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.35)' }}>{activeChar.uses_remaining || 0}/{activeChar.uses_max || 10} utilisations</Text>
                </View>
              </View>
              <Pressable delayPressIn={120} onPress={() => { setSelectedChar(activeChar); setCharFlipped(false); flipAnim.setValue(0); loadCharPowers(activeChar.slug); }} style={({ pressed }) => ({ backgroundColor: '#00D984', borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(8), transform: [{ scale: pressed ? 0.93 : 1 }] })}>
                <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#1A1D22' }}>Utiliser</Text>
              </Pressable>
            </View>
          </LinearGradient>
        ) : (
          <View style={{ padding: wp(16), alignItems: 'center', marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.35)' }}>Aucun compagnon actif</Text>
          </View>
        )}

        {/* Titre collection */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(12) }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Ma collection</Text>
          <View style={{ backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(6), borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' }}>
            <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#D4AF37' }}>{userCollection.filter(c => c.owned !== false).length}/{userCollection.length || 13}</Text>
          </View>
        </View>

        {/* Grille 3 colonnes */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(8), marginBottom: wp(20) }}>
          {(userCollection.length > 0 ? userCollection : ALL_CHARACTERS.map(c => ({ ...c, slug: c.id, owned: ownedCharacters.includes(c.id), level: ownedChars[c.id]?.level || 0, xp: ownedChars[c.id]?.xp || 0, xp_next: ownedChars[c.id]?.xp_next || 1000, uses_remaining: ownedChars[c.id]?.uses_remaining || 0, uses_max: ownedChars[c.id]?.uses_max || 10, fragments: 0, fragments_required: 3, is_active: false }))).map(ch => {
            const own = ch.owned !== false && ch.owned !== undefined ? ch.owned : ownedCharacters.includes(ch.slug || ch.id);
            const isActive = (ch.slug || ch.id) === activeCharSlug;
            const badge = getLevelBadge(ch);
            return (
              <Pressable key={ch.slug || ch.id} delayPressIn={120}
                onPress={() => {
                  setSelectedChar(ch); setCharFlipped(false); flipAnim.setValue(0);
                  const charIndex = ALL_CHARACTERS.findIndex(c => c.id === (ch.slug || ch.id));
                  const idx = charIndex >= 0 ? charIndex : 0;
                  setCardViewIndex(idx);
                  cardViewIndexRef.current = idx;
                  loadCharPowers(ch.slug || ch.id);
                }}
                style={({ pressed }) => ({
                  width: cardW, borderRadius: wp(14), overflow: 'hidden',
                  opacity: 1,
                  borderWidth: isActive ? 2 : 1,
                  borderColor: isActive ? '#00D984' : own ? '#4A4F55' : 'rgba(255,255,255,0.08)',
                  transform: [{ scale: pressed ? 0.93 : 1 }],
                })}>
                <LinearGradient colors={['#3A3F46','#252A30','#333A42','#1A1D22']} style={{ alignItems: 'center', paddingVertical: wp(8) }}>
                  <View style={{ width: wp(50), height: wp(50), borderRadius: wp(25), backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', marginBottom: wp(4) }}>
                    {(() => {
                      const charImg = getCharImage(ch.slug || ch.id);
                      if (charImg.img) {
                        return <Image source={charImg.img} style={{ width: wp(46), height: wp(46), borderRadius: wp(23) }} resizeMode="cover" />;
                      }
                      return <Text style={{ fontSize: fp(24) }}>{charImg.emoji}</Text>;
                    })()}
                    {!own && <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: fp(20) }}>🔒</Text></View>}
                  </View>
                  <Text style={{ fontSize: fp(9), fontWeight: '700', color: own ? '#FFF' : 'rgba(255,255,255,0.4)', textAlign: 'center' }} numberOfLines={1}>{ch.name || ch.slug}</Text>
                  {own ? (
                    <View style={{ backgroundColor: badge.color, borderRadius: wp(4), paddingHorizontal: wp(5), paddingVertical: wp(1), marginTop: wp(3) }}>
                      <Text style={{ fontSize: fp(7), fontWeight: '700', color: '#FFF' }}>{badge.text}</Text>
                    </View>
                  ) : (
                    <View style={{ width: '80%', marginTop: wp(3), alignItems: 'center' }}>
                      <View style={{ width: '100%', height: wp(3), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(1.5), overflow: 'hidden', marginBottom: wp(2) }}>
                        <View style={{
                          height: '100%', borderRadius: wp(1.5),
                          backgroundColor: (ch.tier === 'mythique' || ch.tier === 'hyper') ? '#D4AF37'
                            : ch.tier === 'elite' ? '#B388FF'
                            : ch.tier === 'rare' ? '#4DA6FF' : '#00D984',
                          width: Math.min(100, Math.round(((ch.fragments || ch.duplicates_count || 0) / (ch.fragments_required || FRAGS_NIV1[ch.tier] || 3)) * 100)) + '%',
                        }} />
                      </View>
                      <Text style={{ fontSize: fp(7), color: 'rgba(255,255,255,0.25)' }}>
                        {ch.fragments || ch.duplicates_count || 0}/{ch.fragments_required || FRAGS_NIV1[ch.tier] || 3} frags
                      </Text>
                    </View>
                  )}
                  {own && (
                    <View style={{ width: '80%', marginTop: wp(4) }}>
                      <View style={{ height: wp(3), backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(1.5), overflow: 'hidden' }}>
                        <View style={{ height: '100%', borderRadius: wp(1.5), backgroundColor: '#00D984', width: Math.min(100, Math.round(((ch.xp || 0) / (ch.xp_next || 1000)) * 100)) + '%' }} />
                      </View>
                    </View>
                  )}
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

      </ScrollView>
    );
  };
  const triggerArrowBounce = (strong) => {
    arrowBounce.setValue(strong ? 1.6 : 1);
    Animated.spring(arrowBounce, {
      toValue: 0,
      friction: 6,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const doSpin = async () => {
    if (isSpinning || spinLoading) return;
    const segments = getSegments();

    setSpinLoading(true);

    try {
      // ═══ APPEL SERVEUR — le résultat est décidé ici ═══
      const spinPromise = supaRpc('execute_spin', {
        p_user_id: TEST_USER_ID,
        p_spin_tier: spinTier,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connexion lente — réessaie')), 15000)
      );
      const data = await Promise.race([spinPromise, timeoutPromise]);

      // S'assurer que reward_value est un objet (pas une string JSON)
      if (data && typeof data.reward_value === 'string') {
        try { data.reward_value = JSON.parse(data.reward_value); } catch(e) {}
      }

      if (!data?.success) {
        const errMsg = data?.error || data?.message || JSON.stringify(data);
        if (errMsg === 'Lix insuffisants' || errMsg === 'Insufficient Lix') {
          const required = data?.required || data?.cost || (spinTier === 'normal' ? 50 : spinTier === 'super' ? 150 : 500);
          const current = data?.current || data?.current_lix || lixBalance;
          showLixAlert(
            '💰 Lix insuffisants',
            'Il te faut ' + required + ' Lix pour ce spin.\n\nTon solde actuel : ' + current + ' Lix\nIl te manque ' + (required - current) + ' Lix.',
            [
              { text: 'Recharger en Lix', color: '#D4AF37', onPress: () => { setActiveTab('lixspin'); }},
              { text: 'Fermer', style: 'cancel' },
            ],
            '💰'
          );
        } else {
          showLixAlert('Erreur', errMsg, [{ text: 'OK', style: 'cancel' }], '⚠️');
        }
        setSpinLoading(false);
        return;
      }

      // ═══ RÉSULTAT REÇU DU SERVEUR ═══
      setServerResult(data);

      // Mettre à jour le solde Lix localement
      if (data.new_lix_balance !== undefined) setLixBalance(data.new_lix_balance);
      if (data.new_energy !== undefined) setUserEnergy(data.new_energy);
      if (data.is_free) setFreeSpinUsed(true);

      setSpinLoading(false);

      // ═══ ANIMER LA ROUE VERS LE SEGMENT SERVEUR ═══
      // Mapper le résultat serveur au segment local
      const findWinnerIndex = (segs, srvData) => {
        const sType = srvData.reward_type;
        const sVal = srvData.reward_value || {};

        // Map des types serveur → types locaux
        const typeMap = {
          'energy': 'energy',
          'lix': 'lix',
          'fragment': 'fragment',
          'xscan': 'scan',
          'free_spin': 'free_spin',
          'full_card': 'card',
        };
        const localType = typeMap[sType] || sType;

        // Extraire la valeur numérique selon le type
        let targetAmount = null;
        if (localType === 'energy') targetAmount = sVal.energy;
        if (localType === 'lix') targetAmount = sVal.lix;
        if (localType === 'scan') targetAmount = sVal.scans;
        if (localType === 'fragment') targetAmount = sVal.fragment;

        // PASSE 1 : Match exact (type + montant)
        for (let i = 0; i < segs.length; i++) {
          const r = segs[i].reward;
          if (r.type !== localType) continue;

          if (localType === 'energy' && targetAmount != null && r.amount === targetAmount) return i;
          if (localType === 'lix' && targetAmount != null && r.amount === targetAmount) return i;
          if (localType === 'scan' && targetAmount != null && r.amount === targetAmount) return i;
          if (localType === 'fragment') {
            const fragTier = sVal.tier || srvData.character_tier;
            if (r.tier === fragTier) return i;
          }
          if (localType === 'free_spin') return i;
          if (localType === 'card') return i;
        }

        // PASSE 2 : Match par type seul (fallback si le montant ne correspond pas)
        for (let i = 0; i < segs.length; i++) {
          if (segs[i].reward.type === localType) return i;
        }

        // PASSE 3 : Fallback absolu — premier segment
        console.warn('findWinnerIndex: no match for', sType, sVal, '→ fallback segment 0');
        return 0;
      };

      const winnerIndex = findWinnerIndex(segments, data);
      const winner = segments[winnerIndex];

      setIsSpinning(true); setSpinResult(null); setShowSpinResultModal(false); setSpinWinnerSeg(null);
      setWinnerGlowIdx(null); glowOpacity.setValue(0);

      const angledSegs = getSegmentAngles(segments);
      const winSeg = angledSegs[winnerIndex];
      const winMidAngle = winSeg.startAngle + winSeg.sweepAngle / 2;
      const targetAngle = 360 - winMidAngle;
      const totalRotation = 360 * 5 + targetAngle;

      const duration = spinTier === 'mega' ? 6000 : spinTier === 'super' ? 5000 : 4000;

      // Arrow tick listener — bounce on rivet crossings
      let lastTickIndex = -1;
      const totalTicks = 12;
      const listenerId = spinAnim.addListener(({ value }) => {
        const normalizedAngle = value % 360;
        const tickIndex = Math.floor(normalizedAngle / (360 / totalTicks));
        if (tickIndex !== lastTickIndex) {
          lastTickIndex = tickIndex;
          const progress = value / totalRotation;
          const isSlowdown = progress > 0.85;
          triggerArrowBounce(isSlowdown);
          if (isSlowdown) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
        }
      });

      spinAnim.setValue(0);
      Animated.timing(spinAnim, {
        toValue: totalRotation,
        duration: duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        spinAnim.removeListener(listenerId);
        setIsSpinning(false);
        setSpinWinnerSeg(winner);
        setWinnerGlowIdx(winnerIndex);

        // Glow pulse on winner segment
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowOpacity, { toValue: 0.6, duration: 500, useNativeDriver: true }),
            Animated.timing(glowOpacity, { toValue: 0.1, duration: 500, useNativeDriver: true }),
          ])
        ).start();

        // Haptic based on reward type
        const rType = data.reward_value?.type || winner.reward.type;
        if (rType === 'card_complete' || rType === 'card') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        } else if (rType === 'fragment') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        }

        // Show result modal after 2s glow
        setTimeout(() => {
          glowOpacity.stopAnimation();
          glowOpacity.setValue(0);
          setShowSpinResultModal(true);
          if (rType === 'fragment' || rType === 'card_complete' || rType === 'card') {
            spinResultPulse.setValue(1);
            Animated.loop(
              Animated.sequence([
                Animated.timing(spinResultPulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
                Animated.timing(spinResultPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
              ])
            ).start();
          }
          // Process server-side reward results
          onSpinComplete(data);
        }, 2000);
      });

    } catch (e) {
      console.error('Spin error:', e);
      showLixAlert('Erreur', e?.message || e?.details || JSON.stringify(e), [{ text: 'OK', style: 'cancel' }], '⚠️');
      setSpinLoading(false);
      setIsSpinning(false);
      setWinnerGlowIdx(null);
    }
  };

  const renderSpinResultModal = () => {
    if (!showSpinResultModal || !spinWinnerSeg) return null;
    const rw = spinWinnerSeg.reward;
    let emoji = '⚡'; let title = ''; let titleColor = '#00D984'; let btnText = 'Récupérer'; let btnColor = '#00D984';
    let borderColor = 'transparent';

    if (rw.type === 'energy') {
      emoji = '⚡'; title = '+' + rw.amount + ' Énergie'; titleColor = '#00D984'; btnColor = '#00D984';
    } else if (rw.type === 'lix') {
      emoji = '💰'; title = '+' + rw.amount + ' Lix'; titleColor = '#D4AF37'; btnColor = '#D4AF37';
    } else if (rw.type === 'fragment') {
      const charName = serverResult?.character_name || (fragmentResult ? fragmentResult.name : null);
      const charEmoji = serverResult?.character_emoji || (fragmentResult ? fragmentResult.emoji : null);
      const charTier = serverResult?.character_tier || rw.tier;
      const tierColor = charTier === 'mythique' ? '#D4AF37' : charTier === 'elite' ? '#9B59B6' : charTier === 'rare' ? '#4DA6FF' : '#00D984';
      emoji = charEmoji || (rw.tier === 'mythique' ? '👑' : rw.tier === 'elite' ? '🏆' : '🔮');
      title = charName
        ? charName + '\n+' + rw.amount + ' Fragment obtenu !'
        : 'Fragment ' + rw.tier.charAt(0).toUpperCase() + rw.tier.slice(1) + ' !';
      titleColor = tierColor; btnColor = tierColor; borderColor = tierColor;
      btnText = 'INTÉGRER ←';
    } else if (rw.type === 'card') {
      const cardTier = rw.tier || 'elite';
      const cardColor = cardTier === 'mythique' ? '#FF1493' : '#E74C3C';
      emoji = fragmentResult ? fragmentResult.emoji : '🏆';
      title = fragmentResult ? fragmentResult.name + ' COMPLÈTE !' : 'CARTE COMPLÈTE !';
      titleColor = cardColor; btnText = 'Voir →'; btnColor = cardColor; borderColor = cardColor;
    }

    return (
      <Modal visible={showSpinResultModal} transparent animationType="fade" onRequestClose={() => { setShowSpinResultModal(false); spinResultPulse.stopAnimation(); }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24) }}>
          <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
            style={{
              borderRadius: wp(20), padding: wp(24), width: '100%', alignItems: 'center',
              borderWidth: borderColor !== 'transparent' ? 2 : 0, borderColor: borderColor,
            }}>
            <Animated.Text style={{
              fontSize: rw.type === 'fragment' ? fp(60) : fp(40), marginBottom: wp(12),
              transform: [{ scale: (rw.type === 'fragment' || rw.type === 'card') ? spinResultPulse : 1 }],
            }}>{emoji}</Animated.Text>
            <Text style={{ fontSize: rw.type === 'card' ? fp(24) : fp(22), fontWeight: '800', color: titleColor, textAlign: 'center', marginBottom: wp(8) }}>{title}</Text>
            {rw.type === 'fragment' && (
              <>
              <Text style={{ fontSize: fp(12), color: '#D4AF37', marginBottom: wp(4) }}>— {(serverResult?.character_tier || rw.tier || '').charAt(0).toUpperCase() + (serverResult?.character_tier || rw.tier || '').slice(1)} —</Text>
              <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginBottom: wp(8) }}>x{rw.amount} fragment{rw.amount > 1 ? 's' : ''}</Text>
              </>
            )}
            <Pressable delayPressIn={120}
              onPress={() => {
                setShowSpinResultModal(false);
                spinResultPulse.stopAnimation();
                if (rw.type === 'fragment' || rw.type === 'card' || rw.type === 'full_card') {
                  if (fragmentResult) {
                    setShowFragmentModal(true);
                  } else {
                    setActiveTab('characters');
                    loadCharacterData();
                  }
                }
              }}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], marginTop: wp(12), width: '100%' })}>
              <LinearGradient colors={[btnColor, btnColor + 'CC']}
                style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>{btnText}</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>
    );
  };

  const renderLixSpinTab = () => {
    const segments = getSegments();
    const angledSegs = getSegmentAngles(segments);
    const wheelR = wp(120);
    const innerR = wp(112);
    const cx = wp(130);
    const cy = wp(130);
    const svgSize = cx * 2;
    const rot = spinAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
    const arrowRotation = arrowBounce.interpolate({ inputRange: [0, 1, 1.6], outputRange: ['0deg', '15deg', '25deg'] });

    let spinCost = 0;
    if (spinTier === 'normal') spinCost = (freeSpinAvailable && !freeSpinUsed) ? 0 : 50;
    else if (spinTier === 'super') spinCost = 150;
    else spinCost = 500;

    const spinBtnLabel = spinTier === 'normal' ? (spinCost === 0 ? '🎁 SPIN GRATUIT' : 'SPIN — 50 Lix')
      : spinTier === 'super' ? 'SUPERSPIN — 150 Lix 🔥'
      : 'MEGASPIN — 500 Lix 💎';

    const spinBtnColors = spinTier === 'normal' && spinCost === 0 ? ['#00D984', '#00B871']
      : ['#3A3F46', '#252A30'];
    const spinBtnBorder = spinTier === 'mega' ? '#D4AF37' : spinTier === 'super' ? '#FF8C42' : (spinCost === 0 ? '#00D984' : '#4A4F55');

    const tierButtons = [
      { key: 'normal', label: 'Spin ⚡', sub: !freeSpinUsed ? 'Gratuit' : '50 Lix' },
      { key: 'super', label: 'SuperSpin 🔥', sub: '150 Lix' },
      { key: 'mega', label: 'MegaSpin 💎', sub: '500 Lix' },
    ];

    const onBtnPressIn = () => {
      Animated.spring(spinBtnScale, { toValue: 0.94, friction: 8, tension: 200, useNativeDriver: true }).start();
    };
    const onBtnPressOut = () => {
      Animated.spring(spinBtnScale, { toValue: 1, friction: 5, tension: 300, useNativeDriver: true }).start();
    };

    // Unique gradient colors used by current segments
    const usedColors = [...new Set(angledSegs.map(s => s.color))];

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: wp(100) }}>
        {/* Solde */}
        <View style={{ alignItems: 'center', paddingTop: wp(16), marginBottom: wp(16) }}>
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginBottom: wp(4) }}>MON SOLDE</Text>
          <Text style={{ fontSize: fp(32), fontWeight: '800', color: '#D4AF37' }}>{lixBalance.toLocaleString('fr-FR')}</Text>
          <Text style={{ fontSize: fp(12), color: 'rgba(212,175,55,0.5)' }}>Lix</Text>
        </View>

        {/* Tier Selector */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: wp(8), marginBottom: wp(20), paddingHorizontal: wp(12) }}>
          {tierButtons.map(tb => {
            const active = spinTier === tb.key;
            return (
              <Pressable key={tb.key} delayPressIn={120}
                onPress={() => { if (!isSpinning) { setSpinTier(tb.key); setWinnerGlowIdx(null); } }}
                style={({ pressed }) => ({
                  flex: 1, height: wp(50), borderRadius: wp(12),
                  overflow: 'hidden',
                  borderWidth: active ? 1.5 : 1,
                  borderColor: active ? '#D4AF37' : '#4A4F55',
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}>
                {active ? (
                  <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(4) }}>
                    <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#FFF' }}>{tb.label}</Text>
                    <Text style={{ fontSize: fp(10), color: '#D4AF37', marginTop: wp(2) }}>{tb.sub}</Text>
                  </LinearGradient>
                ) : (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(30,35,42,0.6)', paddingHorizontal: wp(4) }}>
                    <Text style={{ fontSize: fp(11), fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>{tb.label}</Text>
                    <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.25)', marginTop: wp(2) }}>{tb.sub}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Wheel */}
        <View style={{ alignItems: 'center', marginBottom: wp(20) }}>
          {/* Arrow indicator — reactive bounce */}
          <Animated.View style={{
            marginBottom: -wp(8), zIndex: 10,
            transform: [{ rotate: arrowRotation }],
            shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: wp(4), shadowOffset: { width: 0, height: wp(2) }, elevation: 6,
          }}>
            <Svg width={wp(20)} height={wp(28)} viewBox="0 0 20 28">
              <Defs>
                <SvgLinearGradient id="arrowGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#D4AF37" />
                  <Stop offset="1" stopColor="#B8952E" />
                </SvgLinearGradient>
              </Defs>
              <Polygon points="10,28 0,4 3,0 17,0 20,4" fill="url(#arrowGrad)" stroke="#8B7A2E" strokeWidth="1.5" strokeLinejoin="round" />
            </Svg>
          </Animated.View>

          <View style={{ width: svgSize, height: svgSize }}>
            <Animated.View style={{ width: svgSize, height: svgSize, transform: [{ rotate: rot }] }}>
              <Svg width={svgSize} height={svgSize} viewBox={'0 0 ' + svgSize + ' ' + svgSize}>
                <Defs>
                  {/* Radial gradients for each segment color */}
                  {usedColors.map(color => {
                    const grad = SEGMENT_GRADIENTS[color] || { inner: color, outer: color };
                    return (
                      <RadialGradient key={'grad_' + color} id={'sg_' + color.replace('#', '')} cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor={grad.inner} stopOpacity="0.95" />
                        <Stop offset="100%" stopColor={grad.outer} stopOpacity="1" />
                      </RadialGradient>
                    );
                  })}
                  {/* Hub radial gradient */}
                  <RadialGradient id="hubGrad" cx="50%" cy="40%" r="60%">
                    <Stop offset="0%" stopColor="#4A5060" />
                    <Stop offset="100%" stopColor="#1A1D22" />
                  </RadialGradient>
                </Defs>

                {/* Proportional colored segments with radial gradients */}
                {angledSegs.map((seg, i) => (
                  <Path key={'seg' + i}
                    d={describeArc(cx, cy, innerR, seg.startAngle, seg.startAngle + seg.sweepAngle)}
                    fill={'url(#sg_' + seg.color.replace('#', '') + ')'}
                  />
                ))}

                {/* Segment separators */}
                {angledSegs.map((seg, i) => {
                  const rad = (seg.startAngle - 90) * Math.PI / 180;
                  const lx = cx + innerR * Math.cos(rad);
                  const ly = cy + innerR * Math.sin(rad);
                  return <Line key={'sep' + i} x1={cx} y1={cy} x2={lx} y2={ly} stroke="#1A1D22" strokeWidth={wp(1.5)} />;
                })}

                {/* Winner glow overlay */}
                {winnerGlowIdx !== null && angledSegs[winnerGlowIdx] && (
                  <Path
                    d={describeArc(cx, cy, innerR, angledSegs[winnerGlowIdx].startAngle, angledSegs[winnerGlowIdx].startAngle + angledSegs[winnerGlowIdx].sweepAngle)}
                    fill="rgba(255,255,255,0.35)"
                    opacity={0.5}
                  />
                )}

                {/* Segment labels — SVG icon + value + type */}
                {angledSegs.map((seg, i) => {
                  const midAngle = seg.startAngle + seg.sweepAngle / 2;
                  const midRad = (midAngle - 90) * Math.PI / 180;
                  const rType = getSegmentRewardType(seg);
                  const iconR = innerR * 0.72;
                  const iconSize = (rType === 'card' || rType === 'full_card') ? wp(28) : wp(20);
                  const iconX = cx + iconR * Math.cos(midRad);
                  const iconY = cy + iconR * Math.sin(midRad);
                  return (
                    <G key={'lbl' + i}>
                      {renderSegmentIcon(rType, seg.reward.tier, iconX, iconY, iconSize, midAngle)}
                    </G>
                  );
                })}

                {/* Inner gold border */}
                <Circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#D4AF37" strokeWidth={wp(1.5)} />

                {/* Outer metallic ring */}
                <Circle cx={cx} cy={cy} r={wheelR} fill="none" stroke="#3A3F46" strokeWidth={wp(8)} />
                {/* Gold inner edge of ring */}
                <Circle cx={cx} cy={cy} r={wheelR - wp(4)} fill="none" stroke="#D4AF37" strokeWidth={wp(1.5)} />

                {/* 3D Gold rivets */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const a = (i * 30 - 90) * Math.PI / 180;
                  const rx = cx + wheelR * Math.cos(a);
                  const ry = cy + wheelR * Math.sin(a);
                  return (
                    <G key={'rv' + i}>
                      <Circle cx={rx} cy={ry} r={wp(5)} fill="rgba(212,175,55,0.3)" />
                      <Circle cx={rx} cy={ry} r={wp(3.5)} fill="#D4AF37" />
                      <Circle cx={rx - wp(0.8)} cy={ry - wp(0.8)} r={wp(1.5)} fill="#F0E070" />
                    </G>
                  );
                })}

                {/* Hub shadow */}
                <Circle cx={cx} cy={cy} r={wp(30)} fill="rgba(0,0,0,0.25)" />
                {/* Hub center */}
                <Circle cx={cx} cy={cy} r={wp(28)} fill="url(#hubGrad)" stroke="#D4AF37" strokeWidth={wp(2)} />
              </Svg>
            </Animated.View>

            {/* Hub icon (non-rotating) */}
            <View style={{
              position: 'absolute', top: cy - wp(28), left: cx - wp(28),
              width: wp(56), height: wp(56), borderRadius: wp(28),
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Text style={{ fontSize: fp(22) }}>{spinTier === 'mega' ? '💎' : spinTier === 'super' ? '🔥' : '⚡'}</Text>
              <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#D4AF37', marginTop: -wp(2) }}>
                {spinTier === 'mega' ? 'MEGA' : spinTier === 'super' ? 'SUPER' : 'SPIN'}
              </Text>
            </View>
          </View>

          {/* Spin button with spring press */}
          <Animated.View style={{
            transform: [{ scale: (spinCost === 0 && spinTier === 'normal' && !isSpinning) ? Animated.multiply(spinBtnScale, freeBtnPulse) : spinBtnScale }],
            marginTop: wp(16), width: wp(220),
            opacity: (isSpinning || spinLoading) ? 0.5 : 1,
          }}>
            <Pressable delayPressIn={120} onPress={doSpin} disabled={isSpinning || spinLoading}
              onPressIn={onBtnPressIn} onPressOut={onBtnPressOut}
              style={{ width: '100%' }}>
              <LinearGradient colors={spinBtnColors}
                style={{
                  paddingVertical: wp(14), borderRadius: wp(24), alignItems: 'center', height: wp(48), justifyContent: 'center',
                  borderWidth: spinCost === 0 && spinTier === 'normal' ? 0 : 2,
                  borderColor: spinBtnBorder,
                  shadowColor: spinTier === 'mega' ? '#D4AF37' : spinTier === 'super' ? '#FF8C42' : 'transparent',
                  shadowOpacity: spinTier !== 'normal' ? 0.4 : 0,
                  shadowRadius: spinTier === 'mega' ? wp(12) : wp(8),
                  elevation: spinTier !== 'normal' ? 4 : 0,
                }}>
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>{spinBtnLabel}</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Free spin counter */}
          <View style={{ marginTop: wp(10), alignItems: 'center' }}>
            {freeSpinAvailable && !freeSpinUsed ? (
              <Text style={{ fontSize: fp(11), color: '#00D984' }}>🎁 1 spin gratuit disponible</Text>
            ) : (
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)' }}>
                Prochain spin gratuit dans {timeToFree || '--:--:--'}
              </Text>
            )}
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: wp(16), marginBottom: wp(20) }} />

        {/* ═══ ABONNEMENTS ═══ */}
        <View style={{ paddingHorizontal: wp(16), marginBottom: wp(24) }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#D4AF37', marginBottom: wp(4) }}>Abonnements</Text>
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.3)', marginBottom: wp(12) }}>Débloque l'accès complet à LIXUM</Text>

          {/* Gold */}
          <Pressable delayPressIn={120} onPress={() => showLixAlert('Gold', 'Bientôt disponible.\n\n10 000 Lix/mois + 150 énergie/6h + fragments bonus', [{ text: 'Me notifier', color: '#D4AF37' }, { text: 'Fermer', style: 'cancel' }], '⭐')}
            style={({ pressed }) => ({ marginBottom: wp(8), transform: [{ scale: pressed ? 0.97 : 1 }] })}>
            <LinearGradient colors={['#3A3F46', '#252A30', '#333A42']}
              style={{ borderRadius: wp(14), padding: wp(16), borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.3)', flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: 'rgba(212,175,55,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: wp(12), borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)' }}>
                <Text style={{ fontSize: fp(20) }}>⭐</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#D4AF37' }}>Gold</Text>
                  <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: wp(6), paddingHorizontal: wp(6), paddingVertical: wp(1) }}>
                    <Text style={{ fontSize: fp(8), fontWeight: '700', color: '#D4AF37' }}>POPULAIRE</Text>
                  </View>
                </View>
                <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>10K Lix + 150 énergie/6h + fragments</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(212,175,55,0.2)', borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(6) }}>
                <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#D4AF37' }}>$9.99</Text>
                <Text style={{ fontSize: fp(8), color: 'rgba(212,175,55,0.6)', textAlign: 'center' }}>/mois</Text>
              </View>
            </LinearGradient>
          </Pressable>

          {/* Platinum */}
          <Pressable delayPressIn={120} onPress={() => showLixAlert('Platinum', 'Bientôt disponible.\n\n18 000 Lix/mois + 350 énergie/6h + fragments Elite', [{ text: 'Me notifier', color: '#00CEC9' }, { text: 'Fermer', style: 'cancel' }], '💎')}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}>
            <LinearGradient colors={['#3A3F46', '#252A30', '#333A42']}
              style={{ borderRadius: wp(14), padding: wp(16), borderWidth: 1.5, borderColor: 'rgba(0,206,201,0.3)', flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: 'rgba(0,206,201,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: wp(12), borderWidth: 1, borderColor: 'rgba(0,206,201,0.25)' }}>
                <Text style={{ fontSize: fp(20) }}>💎</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#00CEC9' }}>Platinum</Text>
                <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>18K Lix + 350 énergie/6h + fragments Elite</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(0,206,201,0.2)', borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(6) }}>
                <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#00CEC9' }}>$14.99</Text>
                <Text style={{ fontSize: fp(8), color: 'rgba(0,206,201,0.6)', textAlign: 'center' }}>/mois</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: wp(16), marginBottom: wp(20) }} />
        <View style={{ paddingHorizontal: wp(16) }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Acheter des Lix</Text>
          {[{ n: 'Micro', p: '$0.99', l: 990, b: '', c: '#00D984' }, { n: 'Basic', p: '$4.99', l: 5240, b: '+5%', c: '#4DA6FF' }, { n: 'Standard', p: '$9.99', l: 10990, b: '+10%', c: '#9B6DFF', best: true }, { n: 'Mega', p: '$29.99', l: 35990, b: '+20%', c: '#D4AF37' }, { n: 'Ultra', p: '$99.99', l: 129990, b: '+30%', c: '#D4AF37', ultra: true }].map((pk, i) => (
            <Pressable key={i} delayPressIn={120} onPress={() => showLixAlert('Achat ' + pk.n, pk.p + ' → ' + pk.l.toLocaleString('fr-FR') + ' Lix\n\nBientôt disponible.', [{ text: 'OK', style: 'cancel' }], '💎')} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: wp(14), borderRadius: wp(14), marginBottom: wp(8), backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: pk.ultra ? 2 : pk.best ? 1.5 : 1, borderColor: pk.ultra ? '#D4AF37' : pk.best ? pk.c + '50' : pk.c + '25', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
              <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: pk.c + '15', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}><LixGem size={wp(22)} /></View>
              <View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6), flexWrap: 'wrap' }}><Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{pk.n}</Text>{pk.b ? <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: wp(6), paddingHorizontal: wp(6), paddingVertical: wp(1) }}><Text style={{ fontSize: fp(9), fontWeight: '700', color: '#D4AF37' }}>{pk.b}</Text></View> : null}</View><Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>{pk.l.toLocaleString('fr-FR')} Lix</Text>{pk.best ? <View style={{ backgroundColor: 'rgba(0,217,132,0.15)', borderRadius: wp(6), paddingHorizontal: wp(6), paddingVertical: wp(2), marginTop: wp(3), alignSelf: 'flex-start' }}><Text style={{ fontSize: fp(7), fontWeight: '800', color: '#00D984' }}>MEILLEUR RAPPORT</Text></View> : null}</View>
              <View style={{ backgroundColor: pk.c + '20', borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(6) }}><Text style={{ fontSize: fp(13), fontWeight: '700', color: pk.c }}>{pk.p}</Text></View>
            </Pressable>
          ))}
        </View>
        <View style={{ paddingHorizontal: wp(16), marginTop: wp(24) }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Recharger énergie</Text>
          {[{ n: 'Mini', e: 30, l: 300, d: 'Recharge légère', emoji: '⚡', c: '#FFB800' }, { n: 'Standard', e: 80, l: 700, d: 'Recharge quotidienne', emoji: '⚡⚡', c: '#FF8C42', best: true }, { n: 'XL', e: 200, l: 1500, d: 'Recharge complète', emoji: '⚡⚡⚡', c: '#FF6B6B' }].map((pk, i) => (
            <Pressable key={i} delayPressIn={120} onPress={() => { if (lixBalance < pk.l) { showLixAlert('Lix insuffisants', 'Il faut ' + pk.l + ' Lix pour cette recharge.', [{ text: 'Fermer', style: 'cancel' }], '⚡'); return; } setLixBalance(p => p - pk.l); showLixAlert('Rechargé', '+' + pk.e + ' énergie ajoutée !', [{ text: 'Super', color: '#00D984' }], '⚡'); }} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: wp(12), borderRadius: wp(12), marginBottom: wp(6), backgroundColor: pk.best ? 'rgba(255,140,66,0.08)' : 'rgba(255,255,255,0.03)', borderWidth: pk.best ? 1.5 : 1, borderColor: pk.best ? (pk.c || '#00D984') + '40' : 'rgba(255,255,255,0.08)', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
              <Text style={{ fontSize: fp(14), marginRight: wp(10) }}>{pk.emoji || '⚡'}</Text>
              <View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}>
  <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>+{pk.e} énergie</Text>
  {pk.best && <View style={{ backgroundColor: 'rgba(255,140,66,0.15)', borderRadius: wp(4), paddingHorizontal: wp(5), paddingVertical: wp(1) }}><Text style={{ fontSize: fp(7), fontWeight: '800', color: '#FF8C42' }}>POPULAIRE</Text></View>}
</View><Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>{pk.d}</Text></View>
              <Text style={{ fontSize: fp(12), fontWeight: '700', color: pk.c || '#00D984' }}>{pk.l} Lix</Text>
            </Pressable>
          ))}
        </View>

        {/* Spin Result Modal */}
        {renderSpinResultModal()}

        {/* ══════ MODAL FRAGMENT GAGNÉ ══════ */}
        <Modal visible={showFragmentModal} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(20) }}>
            {fragmentResult && (
              <Animated.View style={{
                transform: [{ translateX: fragmentSlideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -W] }) }],
                opacity: fragmentSlideAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.5, 0] }),
              }}>
                <View style={{
                  backgroundColor: '#1E2530', borderRadius: wp(20),
                  borderWidth: 1.5,
                  borderColor: fragmentResult.isComplete ? '#D4AF37'
                    : fragmentResult.tier === 'mythique' ? 'rgba(212,175,55,0.4)'
                    : fragmentResult.tier === 'elite' ? 'rgba(138,43,226,0.4)'
                    : fragmentResult.tier === 'rare' ? 'rgba(77,166,255,0.4)'
                    : 'rgba(0,217,132,0.3)',
                  padding: wp(24), alignItems: 'center', width: W - wp(40),
                }}>
                  <Text style={{ fontSize: fp(50), marginBottom: wp(10) }}>{fragmentResult.emoji}</Text>
                  <Text style={{ fontSize: fp(18), fontWeight: '800', color: '#EAEEF3', marginBottom: wp(4) }}>{fragmentResult.name}</Text>
                  <Text style={{
                    fontSize: fp(10), fontWeight: '700', letterSpacing: 2,
                    color: fragmentResult.tier === 'mythique' ? '#D4AF37'
                      : fragmentResult.tier === 'elite' ? '#B388FF'
                      : fragmentResult.tier === 'rare' ? '#4DA6FF'
                      : '#00D984',
                    textTransform: 'uppercase', marginBottom: wp(14),
                  }}>{fragmentResult.tier}</Text>

                  {fragmentResult.isComplete ? (
                    <View style={{ alignItems: 'center', marginBottom: wp(14) }}>
                      <Text style={{ fontSize: fp(22), marginBottom: wp(6) }}>🎉</Text>
                      <Text style={{ fontSize: fp(14), fontWeight: '800', color: '#D4AF37', textAlign: 'center' }}>CARTE COMPLÈTE !</Text>
                      <Text style={{ fontSize: fp(11), color: '#8892A0', textAlign: 'center', marginTop: wp(4) }}>{fragmentResult.name} est maintenant Niveau 1 !</Text>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center', marginBottom: wp(14) }}>
                      <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#00D984' }}>+{fragmentResult.amount} fragment{fragmentResult.amount > 1 ? 's' : ''} 🧩</Text>
                      <Text style={{ fontSize: fp(11), color: '#8892A0', marginTop: wp(4) }}>{fragmentResult.totalFrags} / {fragmentResult.fragsNeeded} pour Niv 1</Text>
                      <View style={{ width: '80%', height: wp(8), borderRadius: wp(4), backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: wp(8) }}>
                        <View style={{
                          width: Math.min((fragmentResult.totalFrags / fragmentResult.fragsNeeded) * 100, 100) + '%',
                          height: '100%', borderRadius: wp(4),
                          backgroundColor: fragmentResult.tier === 'mythique' ? '#D4AF37'
                            : fragmentResult.tier === 'elite' ? '#B388FF'
                            : fragmentResult.tier === 'rare' ? '#4DA6FF' : '#00D984',
                        }} />
                      </View>
                    </View>
                  )}

                  {fragmentResult.levelUp && (
                    <View style={{ backgroundColor: 'rgba(212,175,55,0.08)', borderRadius: wp(10), borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', paddingHorizontal: wp(14), paddingVertical: wp(8), marginBottom: wp(14), width: '100%' }}>
                      <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#D4AF37', textAlign: 'center' }}>⬆️ Niveau {fragmentResult.newLevel} atteint !</Text>
                    </View>
                  )}

                  <Pressable
                    onPress={() => {
                      Animated.timing(fragmentSlideAnim, {
                        toValue: 1, duration: 400, useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease),
                      }).start(async () => {
                        setShowFragmentModal(false);
                        setFragmentResult(null);
                        fragmentSlideAnim.setValue(0);
                        setActiveTab('characters');
                        await loadCharacterData();
                        try {
                          const res = await fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + TEST_USER_ID + '&select=lix_balance,energy', { headers: HEADERS });
                          const d = await res.json();
                          if (d && d[0]) {
                            if (d[0].lix_balance != null) setLixBalance(d[0].lix_balance);
                            if (d[0].energy != null) setUserEnergy(d[0].energy);
                          }
                        } catch (e) {}
                      });
                    }}
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? '#00B572' : '#00D984',
                      borderRadius: wp(14), paddingVertical: wp(14), paddingHorizontal: wp(40),
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    })}
                  >
                    <Text style={{ fontSize: fp(14), fontWeight: '800', color: '#1A1D22', letterSpacing: 1 }}>INTÉGRER ←</Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}
          </View>
        </Modal>
      </ScrollView>
    );
  };

  const LixSignBubble = ({ sign, isOwn, showText, onPress }) => {
    const category = Object.values(LIXSIGNS).find(cat => cat.signs.some(s => s.id === sign.sign_id));
    const signData = category?.signs.find(s => s.id === sign.sign_id);
    if (!signData || !category) return null;
    return (
      <Pressable onPress={onPress} delayPressIn={120}
        style={({ pressed }) => ({
          flexDirection: isOwn ? 'row-reverse' : 'row',
          alignItems: 'center', gap: wp(8),
          marginBottom: wp(6), alignSelf: isOwn ? 'flex-end' : 'flex-start',
          transform: [{ scale: pressed ? 0.92 : 1 }],
        })}>
        <View style={{
          width: wp(48), height: wp(48), borderRadius: wp(24),
          backgroundColor: isOwn ? 'rgba(0,217,132,0.12)' : 'rgba(77,166,255,0.12)',
          borderWidth: 1.5, borderColor: isOwn ? 'rgba(0,217,132,0.25)' : 'rgba(77,166,255,0.25)',
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Svg width={wp(24)} height={wp(24)} viewBox={signData.viewBox} fill={category.color}>
            <Path d={signData.svgPath} />
          </Svg>
        </View>
        {showText && (
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(10),
            paddingHorizontal: wp(10), paddingVertical: wp(6),
            maxWidth: wp(150),
          }}>
            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.6)' }}>{signData.text}</Text>
          </View>
        )}
        <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.2)' }}>
          {new Date(sign.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Pressable>
    );
  };

  const SuiviHumainTeaser = () => {
    const [notifyPressed, setNotifyPressed] = useState(false);
    return (
      <View style={{ paddingHorizontal: wp(16), alignItems: 'center' }}>
        <View style={{ backgroundColor: 'rgba(212,175,55,0.12)', borderRadius: wp(20), paddingHorizontal: wp(16), paddingVertical: wp(6), borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', marginBottom: wp(16) }}>
          <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#D4AF37', letterSpacing: 2 }}>BIENTÔT DISPONIBLE</Text>
        </View>
        <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#EAEEF3', textAlign: 'center', marginBottom: wp(8) }}>Suivi Humain</Text>
        <Text style={{ fontSize: fp(12), color: '#8892A0', textAlign: 'center', lineHeight: fp(18), marginBottom: wp(20), paddingHorizontal: wp(10) }}>
          Un vrai nutritionniste te suit chaque semaine.{'\n'}Tes données santé lui sont envoyées automatiquement.{'\n'}Communication 100% confidentielle via LixTag.
        </Text>
        <View style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(16), padding: wp(16), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: wp(20) }}>
          {[
            { step: '1', icon: '🔍', title: 'Trouve ton nutritionniste', desc: 'Recherche parmi des professionnels certifiés. Vois leur expérience dans l\'app.', color: '#4DA6FF' },
            { step: '2', icon: '🔒', title: 'Connexion anonyme', desc: 'Toi et le nutritionniste ne voyez que vos LixTags. LIXUM protège ton identité.', color: '#00D984' },
            { step: '3', icon: '📋', title: 'Rapport hebdomadaire', desc: 'Chaque semaine, le nutritionniste analyse tes données et envoie des recommandations personnalisées.', color: '#D4AF37' },
          ].map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: idx < 2 ? wp(16) : 0 }}>
              <View style={{ alignItems: 'center', marginRight: wp(12), width: wp(30) }}>
                <View style={{ width: wp(28), height: wp(28), borderRadius: wp(14), backgroundColor: item.color + '15', borderWidth: 1.5, borderColor: item.color + '40', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(14) }}>{item.icon}</Text>
                </View>
                {idx < 2 && <View style={{ width: 1.5, height: wp(16), backgroundColor: 'rgba(255,255,255,0.08)', marginTop: wp(4) }} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fp(13), fontWeight: '700', color: item.color, marginBottom: wp(3) }}>{item.title}</Text>
                <Text style={{ fontSize: fp(10), color: '#8892A0', lineHeight: fp(15) }}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,217,132,0.06)', borderRadius: wp(12), padding: wp(12), borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)', marginBottom: wp(16) }}>
          <Text style={{ fontSize: fp(20), marginRight: wp(10) }}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#00D984' }}>100% confidentiel</Text>
            <Text style={{ fontSize: fp(9), color: '#8892A0', marginTop: wp(2) }}>Tu communiques par Lixsigns uniquement. Le nutritionniste ne voit jamais ton nom.</Text>
          </View>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,140,66,0.06)', borderRadius: wp(12), padding: wp(12), borderWidth: 1, borderColor: 'rgba(255,140,66,0.15)', marginBottom: wp(20) }}>
          <Text style={{ fontSize: fp(20), marginRight: wp(10) }}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#FF8C42' }}>Coaching nutritionnel</Text>
            <Text style={{ fontSize: fp(9), color: '#8892A0', marginTop: wp(2) }}>Ce service propose du coaching nutritionnel, pas des consultations médicales. En cas de pathologie, consulte un médecin.</Text>
          </View>
        </View>
        <Pressable
          onPress={() => {
            setNotifyPressed(true);
            showLixAlert('🔔 Notification activée', 'Tu seras prévenu dès le lancement du Suivi Humain !', [{ text: 'Super', color: '#D4AF37' }], '🔔');
          }}
          disabled={notifyPressed}
          style={({ pressed }) => ({
            width: '100%', paddingVertical: wp(14), borderRadius: wp(14),
            backgroundColor: notifyPressed ? 'rgba(212,175,55,0.08)' : pressed ? '#B8952E' : '#D4AF37',
            borderWidth: notifyPressed ? 1 : 0, borderColor: 'rgba(212,175,55,0.3)',
            alignItems: 'center', transform: [{ scale: pressed && !notifyPressed ? 0.97 : 1 }],
          })}
        >
          <Text style={{ fontSize: fp(14), fontWeight: '700', color: notifyPressed ? '#D4AF37' : '#1A1D22' }}>
            {notifyPressed ? '🔔 Tu seras notifié' : '🔔 Me notifier au lancement'}
          </Text>
        </Pressable>
        <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: wp(10), marginBottom: wp(20) }}>
          Coût estimé : à partir de 200 Lix/semaine
        </Text>
      </View>
    );
  };

  const renderHumanTab = () => {
    if (humanTab === 'suivi') {
      return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: wp(8), paddingBottom: wp(100) }}>
          {/* ══════ ONGLETS INTERNES HUMAN ══════ */}
          <View style={{
            flexDirection: 'row', marginHorizontal: wp(16), marginBottom: wp(16),
            backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12), padding: wp(3),
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
          }}>
            <Pressable onPress={() => setHumanTab('binome')} style={{
              flex: 1, paddingVertical: wp(10), borderRadius: wp(10),
              backgroundColor: 'transparent', alignItems: 'center',
            }}>
              <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#6B7B8D' }}>🤝 Binôme</Text>
            </Pressable>
            <Pressable onPress={() => setHumanTab('suivi')} style={{
              flex: 1, paddingVertical: wp(10), borderRadius: wp(10),
              backgroundColor: 'rgba(212,175,55,0.12)',
              borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)', alignItems: 'center',
            }}>
              <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#D4AF37' }}>👨‍⚕️ Suivi Humain</Text>
            </Pressable>
          </View>
          <SuiviHumainTeaser />
        </ScrollView>
      );
    }

    // humanTab === 'binome' → render internal tabs + binome content (which has its own ScrollView)
    return renderBinomeContent();
  };

  const HumanTabSelector = () => (
    <View style={{
      flexDirection: 'row', marginHorizontal: wp(16), marginBottom: wp(12),
      backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12), padding: wp(3),
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    }}>
      <Pressable onPress={() => setHumanTab('binome')} style={{
        flex: 1, paddingVertical: wp(10), borderRadius: wp(10),
        backgroundColor: 'rgba(0,217,132,0.12)',
        borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)', alignItems: 'center',
      }}>
        <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#00D984' }}>🤝 Binôme</Text>
      </Pressable>
      <Pressable onPress={() => setHumanTab('suivi')} style={{
        flex: 1, paddingVertical: wp(10), borderRadius: wp(10),
        backgroundColor: 'transparent', alignItems: 'center',
      }}>
        <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#6B7B8D' }}>👨‍⚕️ Suivi Humain</Text>
      </Pressable>
    </View>
  );

  const renderBinomeContent = () => {
    const radarRotate = radarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const SEARCH_STEP_TEXTS = [
      'Analyse morphologique du profil...',
      'Extraction des paramètres nutritionnels...',
      'Corrélation des objectifs de santé...',
      'Triangulation géographique...',
      'Scan des profils compatibles...',
      'Calcul de l\'indice de compatibilité...',
      'Vérification anti-triche...',
      'Binôme identifié !',
    ];

    if (binomeStatus === 'matched' && binomePartner) {
      const myCalories = 1200;
      const myBurned = 280;
      const myMood = '💪';
      const myWeather = '🌤️';
      return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: wp(100), paddingHorizontal: wp(16), paddingTop: wp(8) }}>
          <View style={{ marginHorizontal: wp(-16) }}><HumanTabSelector /></View>
          {/* Header duo */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(16), padding: wp(16), marginBottom: wp(16), borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#FFF' }}>Vous</Text>
                <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.4)' }}>LXM-2K7F4A</Text>
                <Text style={{ fontSize: fp(16) }}>🇧🇮</Text>
                <View style={{ backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3), marginTop: wp(4) }}>
                  <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#00D984' }}>Score 72</Text>
                </View>
              </View>
              <View style={{ alignItems: 'center', paddingHorizontal: wp(10) }}>
                <Svg width={wp(28)} height={wp(28)} viewBox="0 0 24 24" fill="#D4AF37">
                  <Path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                </Svg>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#FFF' }}>{binomePartner.display_name}</Text>
                <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.4)' }}>{binomePartner.lixtag}</Text>
                <Text style={{ fontSize: fp(16) }}>{binomePartner.country_flag}</Text>
                <View style={{ backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3), marginTop: wp(4) }}>
                  <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#00D984' }}>Score {binomePartner.vitality_score}</Text>
                </View>
              </View>
            </View>
            <View style={{ alignItems: 'center', marginTop: wp(10), gap: wp(4) }}>
              <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>{binomePartner.distance_km?.toLocaleString('fr-FR')} km vous séparent</Text>
              <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FF8C42' }}>🔥 {binomePartner.streak_days} jours de streak commun</Text>
            </View>
          </View>

          {/* Aujourd'hui — 2 colonnes */}
          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(8) }}>Aujourd'hui</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(14), padding: wp(14), marginBottom: wp(16), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
            <View style={{ flexDirection: 'row', marginBottom: wp(4) }}>
              <Text style={{ flex: 1, fontSize: fp(10), fontWeight: '600', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>Vous</Text>
              <Text style={{ width: wp(80), fontSize: fp(10), fontWeight: '600', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}></Text>
              <Text style={{ flex: 1, fontSize: fp(10), fontWeight: '600', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>{binomePartner.display_name.split(' ')[0]}</Text>
            </View>
            {[
              { label: 'Calories mangées', mine: myCalories, theirs: binomePartner.today_calories_eaten, icon: '🍽️' },
              { label: 'Calories brûlées', mine: myBurned, theirs: binomePartner.today_calories_burned, icon: '🔥' },
              { label: 'Humeur', mine: myMood, theirs: binomePartner.today_mood, icon: '😊' },
              { label: 'Météo', mine: myWeather, theirs: binomePartner.today_weather, icon: '🌤️' },
            ].map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(6), borderTopWidth: i > 0 ? 1 : 0, borderTopColor: 'rgba(255,255,255,0.04)' }}>
                <Text style={{ flex: 1, fontSize: fp(13), fontWeight: '600', color: '#FFF', textAlign: 'center' }}>{row.mine}</Text>
                <Text style={{ width: wp(80), fontSize: fp(10), color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>{row.icon} {row.label.split(' ').pop()}</Text>
                <Text style={{ flex: 1, fontSize: fp(13), fontWeight: '600', color: '#FFF', textAlign: 'center' }}>{row.theirs}</Text>
              </View>
            ))}
          </View>

          {/* Objectif du jour */}
          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(8) }}>Objectif du jour</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(14), padding: wp(14), marginBottom: wp(16), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(8) }}>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Progression commune</Text>
              <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#00D984' }}>68%</Text>
            </View>
            <View style={{ height: wp(8), borderRadius: wp(4), backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <View style={{ height: '100%', width: '68%', borderRadius: wp(4), backgroundColor: '#00D984' }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: wp(10), gap: wp(6) }}>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>🔥 {binomePartner.streak_days} jours consécutifs réussis</Text>
            </View>
          </View>

          {/* Bouton Poke */}
          <Pressable delayPressIn={120} onPress={() => setShowLixSignPicker(true)} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], marginBottom: wp(16) })}>
            <LinearGradient colors={['#D4AF37', '#B8941F']} style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: wp(8) }}>
              <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="#FFF">
                <Path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </Svg>
              <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>Envoyer un LixSign</Text>
            </LinearGradient>
          </Pressable>

          {/* Messages récents */}
          {binomeMessages.length > 0 && (
            <View>
              <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(8) }}>Messages récents</Text>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(14), padding: wp(12), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                {binomeMessages.slice(-10).reverse().map(msg => (
                  <LixSignBubble
                    key={msg.id}
                    sign={msg}
                    isOwn={msg.from === 'me'}
                    showText={msg.showText || tooltipSign === msg.id}
                    onPress={() => {
                      if (msg.from === 'partner') {
                        setTooltipSign(msg.id);
                        setTimeout(() => setTooltipSign(null), 3000);
                      }
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Rompre */}
          <Pressable onPress={breakBinome} style={{ paddingVertical: wp(20), alignItems: 'center' }}>
            <Text style={{ fontSize: fp(12), color: 'rgba(255,75,75,0.4)' }}>Rompre le Binôme</Text>
          </Pressable>
        </ScrollView>
      );
    }

    // États none / searching / proposed / pending_sent / declined
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: wp(100), paddingTop: wp(8) }}>
        <HumanTabSelector />
        {/* Header */}
        <View style={{ alignItems: 'center', paddingHorizontal: wp(16) }}>
          <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#D4AF37', letterSpacing: 2, marginBottom: wp(4) }}>BINÔME</Text>
          <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginBottom: wp(16) }}>Trouve ton partenaire santé</Text>
        </View>

        {/* Carte du monde avec points lumineux étoiles */}
        {(binomeStatus === 'none' || binomeStatus === 'searching') && (
          <View style={{
            marginHorizontal: wp(16), borderRadius: wp(16), overflow: 'hidden',
            borderWidth: 1.5, borderColor: 'rgba(77,166,255,0.12)',
            height: wp(180), position: 'relative',
            backgroundColor: '#0D1117',
          }}>
            {/* Image de fond — carte du monde sombre */}
            <Image
              source={require('./assets/world-map-dark.webp')}
              style={{
                width: '100%', height: '100%', position: 'absolute',
                opacity: 0.75,
              }}
              resizeMode="cover"
            />
            {/* Points lumineux étoiles */}
            {WORLD_DOTS.map((dot, i) => {
              const dotSize = dot.size === 'large' ? wp(7) : dot.size === 'medium' ? wp(5) : wp(3.5);
              const glowSize = dot.size === 'large' ? wp(22) : dot.size === 'medium' ? wp(16) : wp(11);
              const pulseAnim = dotPulseAnims[i];
              const glowAnim = dotGlowAnims[i];
              return (
                <View key={i} style={{
                  position: 'absolute',
                  left: (dot.x / 800) * (SCREEN_WIDTH - wp(32)) - glowSize / 2,
                  top: (dot.y / 400) * wp(180) - glowSize / 2,
                  width: glowSize, height: glowSize,
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  {/* Halo glow externe */}
                  <Animated.View style={{
                    position: 'absolute',
                    width: glowSize, height: glowSize, borderRadius: glowSize / 2,
                    backgroundColor: 'rgba(120,180,255,0.08)',
                    opacity: glowAnim,
                    transform: [{ scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1.3],
                    }) }],
                  }} />
                  {/* Halo glow moyen */}
                  <Animated.View style={{
                    position: 'absolute',
                    width: glowSize * 0.6, height: glowSize * 0.6, borderRadius: glowSize * 0.3,
                    backgroundColor: 'rgba(140,200,255,0.15)',
                    opacity: pulseAnim,
                  }} />
                  {/* Point central lumineux */}
                  <Animated.View style={{
                    width: dotSize, height: dotSize, borderRadius: dotSize / 2,
                    backgroundColor: '#DDEEFF',
                    opacity: pulseAnim,
                    shadowColor: '#88CCFF',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.9,
                    shadowRadius: dot.size === 'large' ? wp(6) : dot.size === 'medium' ? wp(4) : wp(2.5),
                    elevation: dot.size === 'large' ? 6 : dot.size === 'medium' ? 4 : 2,
                  }} />
                </View>
              );
            })}
            {/* OVERLAY RADAR — seulement pendant searching */}
            {binomeStatus === 'searching' && (
              <View style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                justifyContent: 'center', alignItems: 'center',
              }}>
                {[pulseRing1, pulseRing2, pulseRing3].map((anim, i) => (
                  <Animated.View key={i} style={{
                    position: 'absolute',
                    width: wp(160), height: wp(160),
                    borderRadius: wp(80),
                    borderWidth: 1, borderColor: '#D4AF37',
                    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                    transform: [{ scale: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.2, 1.2],
                    }) }],
                  }} />
                ))}
                <Animated.View style={{
                  position: 'absolute',
                  width: wp(2), height: wp(70),
                  backgroundColor: '#D4AF37',
                  opacity: 0.5,
                  transform: [{ rotate: radarRotate }],
                }} />
                <View style={{
                  width: wp(14), height: wp(14), borderRadius: wp(7),
                  backgroundColor: '#D4AF37',
                  borderWidth: 2.5, borderColor: '#FFF',
                  shadowColor: '#D4AF37', shadowOpacity: 1, shadowRadius: wp(10),
                  elevation: 8,
                }} />
                {scanLines.map((line, i) => (
                  <View key={line.id || i} style={{
                    position: 'absolute',
                    left: line.x1, top: line.y1,
                    width: line.length, height: 1,
                    backgroundColor: 'rgba(212,175,55,0.12)',
                    transform: [{ rotate: line.angle + 'deg' }],
                  }} />
                ))}
              </View>
            )}
          </View>
        )}

        {(binomeStatus === 'none' || binomeStatus === 'searching') && (
          <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: wp(8), marginBottom: wp(12) }}>4 832 membres actifs</Text>
        )}

        {/* Console tech pendant searching */}
        {binomeStatus === 'searching' && (
          <View style={{ marginHorizontal: wp(16), marginTop: wp(4) }}>
            <View style={{
              backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: wp(12),
              padding: wp(12), borderWidth: 1,
              borderColor: 'rgba(0,217,132,0.15)',
            }}>
              {/* Coordonnées GPS monospace */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(8) }}>
                <Text style={{ fontSize: fp(9), fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: 'rgba(0,217,132,0.5)' }}>
                  LAT {searchCoords.lat}
                </Text>
                <Text style={{ fontSize: fp(9), fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: 'rgba(0,217,132,0.5)' }}>
                  LNG {searchCoords.lng}
                </Text>
                <Text style={{ fontSize: fp(9), fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: 'rgba(212,175,55,0.5)' }}>
                  {searchProgress}%
                </Text>
              </View>
              {/* Barre de progression dégradé */}
              <View style={{ height: wp(4), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(2), marginBottom: wp(8), overflow: 'hidden' }}>
                <LinearGradient
                  colors={['#00D984', '#D4AF37']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ height: '100%', width: searchProgress + '%', borderRadius: wp(2) }}
                />
              </View>
              {/* Étape courante */}
              <Text style={{
                fontSize: fp(11), color: '#D4AF37',
                fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                marginBottom: wp(4),
              }}>
                {'> '}{SEARCH_STEP_TEXTS[searchStep] || '...'}
              </Text>
              {/* Score de compatibilité progressif */}
              {compatibilityScore > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8), marginTop: wp(4) }}>
                  <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
                    COMPATIBILITÉ
                  </Text>
                  <View style={{ flex: 1, height: wp(3), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(1.5), overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: compatibilityScore + '%', backgroundColor: compatibilityScore > 70 ? '#00D984' : '#FF8C42', borderRadius: wp(1.5) }} />
                  </View>
                  <Text style={{ fontSize: fp(10), fontWeight: '700', color: compatibilityScore > 70 ? '#00D984' : '#FF8C42', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
                    {compatibilityScore}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* État proposed — profil trouvé, comparaison */}
        {binomeStatus === 'proposed' && binomePartner && (
          <View style={{ paddingHorizontal: wp(16) }}>
            {/* Badge compatibilité */}
            <View style={{ alignItems: 'center', marginBottom: wp(12) }}>
              <View style={{
                backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: wp(20),
                paddingHorizontal: wp(16), paddingVertical: wp(6),
                borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)',
                flexDirection: 'row', alignItems: 'center', gap: wp(6),
              }}>
                <Text style={{ fontSize: fp(11), color: 'rgba(0,217,132,0.6)' }}>Compatibilité</Text>
                <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#00D984' }}>{compatibilityScore}%</Text>
              </View>
            </View>
            {/* Carte comparaison */}
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(16),
              padding: wp(16), borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              marginBottom: wp(12),
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(12) }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF' }}>Vous</Text>
                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>LXM-2K7F4A</Text>
                  <Text style={{ fontSize: fp(20), marginTop: wp(4) }}>🇧🇮</Text>
                  <View style={{ backgroundColor: 'rgba(0,217,132,0.15)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3), marginTop: wp(4) }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '600', color: '#00D984' }}>Score 72</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'center', paddingHorizontal: wp(10) }}>
                  <Text style={{ fontSize: fp(24), color: 'rgba(212,175,55,0.5)' }}>⇄</Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF' }}>{binomePartner.display_name}</Text>
                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>{binomePartner.lixtag}</Text>
                  <Text style={{ fontSize: fp(20), marginTop: wp(4) }}>{binomePartner.country_flag}</Text>
                  <View style={{ backgroundColor: 'rgba(0,217,132,0.15)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3), marginTop: wp(4) }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '600', color: '#00D984' }}>Score {binomePartner.vitality_score}</Text>
                  </View>
                </View>
              </View>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginBottom: wp(8) }}>
                {binomeDistance ? binomeDistance.toLocaleString('fr-FR') + ' km vous séparent' : ''}
              </Text>
              <Text style={{ fontSize: fp(12), fontWeight: '600', color: '#D4AF37', marginBottom: wp(8) }}>Points en commun</Text>
              {binomeCommonPoints.map((point, i) => (
                <View key={i} style={{
                  flexDirection: 'row', alignItems: 'center', gap: wp(8),
                  paddingVertical: wp(6), borderBottomWidth: i < binomeCommonPoints.length - 1 ? 1 : 0,
                  borderBottomColor: 'rgba(255,255,255,0.04)',
                }}>
                  <View style={{
                    width: wp(24), height: wp(24), borderRadius: wp(12),
                    backgroundColor: 'rgba(0,217,132,0.12)',
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: fp(11), color: '#00D984' }}>✓</Text>
                  </View>
                  <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', flex: 1 }}>{point.text}</Text>
                </View>
              ))}
            </View>
            {/* Bouton Envoyer la demande */}
            <Pressable delayPressIn={120}
              onPress={() => {
                setBinomeStatus('pending_sent');
                Animated.loop(
                  Animated.sequence([
                    Animated.timing(pendingPulse, { toValue: 1, duration: 1000, useNativeDriver: false }),
                    Animated.timing(pendingPulse, { toValue: 0.6, duration: 1000, useNativeDriver: false }),
                  ])
                ).start();
                // Simuler réponse après 8-15s (démo)
                const delay = 8000 + Math.random() * 7000;
                setTimeout(() => {
                  const accepted = Math.random() > 0.3;
                  pendingPulse.stopAnimation();
                  setBinomeStatus(accepted ? 'matched' : 'declined');
                }, delay);
              }}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}>
              <LinearGradient colors={['#D4AF37', '#B8941F']}
                style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', marginBottom: wp(8) }}>
                <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Envoyer la demande</Text>
                <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.6)', marginTop: wp(2) }}>
                  Une invitation sera envoyée à {binomePartner.display_name}
                </Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => { resetBinomeState(); }}
              style={{ paddingVertical: wp(12), alignItems: 'center' }}>
              <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.25)' }}>Chercher quelqu'un d'autre</Text>
            </Pressable>
          </View>
        )}

        {/* État pending_sent — en attente de confirmation */}
        {binomeStatus === 'pending_sent' && binomePartner && (
          <View style={{ paddingHorizontal: wp(16), alignItems: 'center' }}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(16),
              padding: wp(20), borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)',
              alignItems: 'center', width: '100%', marginBottom: wp(16),
            }}>
              <Text style={{ fontSize: fp(28), marginBottom: wp(8) }}>{binomePartner.country_flag}</Text>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>{binomePartner.display_name}</Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginBottom: wp(16) }}>{binomePartner.lixtag}</Text>
              {/* Bouton pulsant désactivé */}
              <Animated.View style={{ width: '100%', opacity: pendingPulse }}>
                <View style={{
                  paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center',
                  backgroundColor: 'rgba(212,175,55,0.15)',
                  borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.3)',
                }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#D4AF37' }}>En attente de confirmation...</Text>
                </View>
              </Animated.View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8), marginTop: wp(12) }}>
                <ActivityIndicator size="small" color="#D4AF37" />
                <Text style={{ fontSize: fp(11), color: 'rgba(212,175,55,0.5)' }}>
                  Notification envoyée à {binomePartner.display_name}
                </Text>
              </View>
            </View>
            <Pressable onPress={() => { pendingPulse.stopAnimation(); resetBinomeState(); }}
              style={{ paddingVertical: wp(12) }}>
              <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.25)' }}>Annuler la demande</Text>
            </Pressable>
          </View>
        )}

        {/* État declined — demande refusée */}
        {binomeStatus === 'declined' && (
          <View style={{ paddingHorizontal: wp(16), alignItems: 'center' }}>
            <View style={{
              backgroundColor: 'rgba(255,107,107,0.06)', borderRadius: wp(16),
              padding: wp(24), borderWidth: 1, borderColor: 'rgba(255,107,107,0.12)',
              alignItems: 'center', width: '100%', marginBottom: wp(16),
            }}>
              <Text style={{ fontSize: fp(36), marginBottom: wp(12) }}>😔</Text>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
                Demande déclinée
              </Text>
              <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: fp(18) }}>
                {binomePartner?.display_name || 'L\'utilisateur'} a décliné l'invitation.{'\n'}Votre identité reste confidentielle.
              </Text>
            </View>
            <Pressable delayPressIn={120}
              onPress={() => { resetBinomeState(); }}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], width: '100%' })}>
              <LinearGradient colors={['#D4AF37', '#B8941F']}
                style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Relancer la recherche</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* État no_match — aucun binôme trouvé, countdown 24h */}
        {binomeStatus === 'no_match' && (
          <View style={{ paddingHorizontal: wp(16), alignItems: 'center' }}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(16),
              padding: wp(24), borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              alignItems: 'center', width: '100%', marginBottom: wp(16),
            }}>
              {/* Icône globe avec loupe */}
              <View style={{
                width: wp(70), height: wp(70), borderRadius: wp(35),
                backgroundColor: 'rgba(77,166,255,0.1)',
                borderWidth: 1, borderColor: 'rgba(77,166,255,0.2)',
                justifyContent: 'center', alignItems: 'center',
                marginBottom: wp(16),
              }}>
                <Svg width={wp(32)} height={wp(32)} viewBox="0 0 24 24" fill="none">
                  <Circle cx="11" cy="11" r="7" stroke="#4DA6FF" strokeWidth="1.5" />
                  <Line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" />
                  <Path d="M11 8a3 3 0 00-3 3" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', marginBottom: wp(6), textAlign: 'center' }}>
                Aucun binôme disponible
              </Text>
              <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: fp(18), marginBottom: wp(16) }}>
                Tous les profils compatibles ont déjà un binôme actif. De nouveaux membres rejoignent LIXUM chaque jour !
              </Text>
              {/* Compte à rebours */}
              {retryAfterTime && (
                <View style={{
                  backgroundColor: 'rgba(212,175,55,0.08)', borderRadius: wp(14),
                  padding: wp(16), width: '100%', alignItems: 'center',
                  borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)',
                }}>
                  <Text style={{ fontSize: fp(10), color: 'rgba(212,175,55,0.5)', letterSpacing: 1, marginBottom: wp(6) }}>
                    PROCHAINE TENTATIVE DANS
                  </Text>
                  <Text style={{
                    fontSize: fp(24), fontWeight: '800', color: '#D4AF37',
                    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                  }}>
                    {retryCountdown || '—'}
                  </Text>
                </View>
              )}
              {/* Bouton désactivé ou actif selon le timer */}
              {!retryAfterTime ? (
                <Pressable delayPressIn={120}
                  onPress={() => { resetBinomeState(); }}
                  style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], width: '100%', marginTop: wp(16) })}>
                  <LinearGradient colors={['#D4AF37', '#B8941F']}
                    style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Relancer la recherche</Text>
                  </LinearGradient>
                </Pressable>
              ) : (
                <View style={{
                  width: '100%', marginTop: wp(16),
                  paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '600', color: 'rgba(255,255,255,0.2)' }}>
                    Recherche verrouillée
                  </Text>
                </View>
              )}
            </View>
            {/* Info encourageante */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: wp(8),
              backgroundColor: 'rgba(0,217,132,0.06)', borderRadius: wp(12),
              padding: wp(12), width: '100%',
              borderWidth: 1, borderColor: 'rgba(0,217,132,0.1)',
            }}>
              <Text style={{ fontSize: fp(16) }}>💡</Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(0,217,132,0.6)', flex: 1, lineHeight: fp(16) }}>
                En attendant, continue tes défis et améliore ton Score Vitalité pour augmenter tes chances de match !
              </Text>
            </View>
          </View>
        )}

        {/* TODO: Activer quand notifications push en place
        {binomeStatus === 'pending_received' && binomePartner && (
          <View style={{ paddingHorizontal: wp(16) }}>
            <View style={{
              backgroundColor: 'rgba(212,175,55,0.06)', borderRadius: wp(16),
              padding: wp(16), borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)',
              marginBottom: wp(16),
            }}>
              <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#D4AF37', textAlign: 'center', marginBottom: wp(12) }}>
                Demande de Binôme reçue !
              </Text>
            </View>
            <Pressable delayPressIn={120} onPress={() => setBinomeStatus('matched')}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}>
              <LinearGradient colors={['#00D984', '#00B871']}
                style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', marginBottom: wp(8) }}>
                <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>C'est mon Binôme !</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => { resetBinomeState(); }}
              style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,107,107,0.15)' }}>
              <Text style={{ fontSize: fp(14), color: 'rgba(255,107,107,0.5)' }}>Je décline</Text>
            </Pressable>
          </View>
        )}
        */}

        {/* Bouton principal — état none */}
        {binomeStatus === 'none' && (
          <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: wp(16) }}>
            {retryAfterTime ? (
              <View style={{
                width: '100%',
                paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              }}>
                <Text style={{ fontSize: fp(14), fontWeight: '600', color: 'rgba(255,255,255,0.2)' }}>
                  Recherche disponible dans {retryCountdown || '—'}
                </Text>
              </View>
            ) : (
              <Pressable delayPressIn={120} onPress={startBinomeSearch} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], width: '100%' })}>
                <LinearGradient colors={['#D4AF37', '#B8941F']} style={{ paddingVertical: wp(16), borderRadius: wp(16), alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Appeler mon Binôme</Text>
                </LinearGradient>
              </Pressable>
            )}
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.25)', marginTop: wp(12), textAlign: 'center' }}>
              Matching basé sur : objectifs, régime, activités
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderNavBar = () => (
    <View style={{
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
    }}>
      {NAV_TABS.map((tab) => {
        const active = activeNavTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: wp(4) }}
            onPress={() => setActiveNavTab(tab.key)}
          >
            <View style={{ position: 'relative' }}>
              {tab.isSpecial ? (
                <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24">
                  <Circle cx="12" cy="12" r="10" fill="none" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={1.2} opacity={active ? 0.9 : 0.5} />
                  <Ellipse cx="12" cy="12" rx="4" ry="10" fill="none" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.8} opacity={active ? 0.6 : 0.3} />
                  <Ellipse cx="12" cy="12" rx="7.5" ry="10" fill="none" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.6} opacity={active ? 0.4 : 0.2} />
                  <Ellipse cx="12" cy="8" rx="9" ry="2.5" fill="none" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.7} opacity={active ? 0.5 : 0.25} />
                  <Line x1="2" y1="12" x2="22" y2="12" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.8} opacity={active ? 0.5 : 0.3} />
                  <Ellipse cx="12" cy="16" rx="9" ry="2.5" fill="none" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.7} opacity={active ? 0.5 : 0.25} />
                  <Circle cx="12" cy="2.5" r={1.3} fill={active ? "#5DFFB4" : "#6B7B8D"} opacity={active ? 1 : 0.5} />
                  <Circle cx="5" cy="5.5" r={1.1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.9 : 0.4} />
                  <Circle cx="19" cy="5.5" r={1.1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.9 : 0.4} />
                  <Circle cx="3" cy="12" r={1.2} fill={active ? "#5DFFB4" : "#6B7B8D"} opacity={active ? 1 : 0.5} />
                  <Circle cx="21" cy="12" r={1.2} fill={active ? "#5DFFB4" : "#6B7B8D"} opacity={active ? 1 : 0.5} />
                  <Circle cx="8" cy="8" r={1} fill={active ? "#FFFFFF" : "#8892A0"} opacity={active ? 0.8 : 0.3} />
                  <Circle cx="16" cy="8" r={1} fill={active ? "#FFFFFF" : "#8892A0"} opacity={active ? 0.8 : 0.3} />
                  <Circle cx="12" cy="12" r={1.3} fill={active ? "#FFFFFF" : "#8892A0"} opacity={active ? 0.9 : 0.4} />
                  <Circle cx="7" cy="15.5" r={1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.8 : 0.35} />
                  <Circle cx="17" cy="15.5" r={1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.8 : 0.35} />
                  <Circle cx="5.5" cy="18.5" r={1.1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.9 : 0.4} />
                  <Circle cx="18.5" cy="18.5" r={1.1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.9 : 0.4} />
                  <Circle cx="12" cy="21.5" r={1.3} fill={active ? "#5DFFB4" : "#6B7B8D"} opacity={active ? 1 : 0.5} />
                  <Line x1="12" y1="2.5" x2="8" y2="8" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.5 : 0.2} />
                  <Line x1="12" y1="2.5" x2="16" y2="8" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.5 : 0.2} />
                  <Line x1="8" y1="8" x2="12" y2="12" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                  <Line x1="16" y1="8" x2="12" y2="12" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                  <Line x1="12" y1="12" x2="7" y2="15.5" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                  <Line x1="12" y1="12" x2="17" y2="15.5" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                  <Line x1="7" y1="15.5" x2="12" y2="21.5" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                  <Line x1="17" y1="15.5" x2="12" y2="21.5" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                </Svg>
              ) : tab.isMedicAi ? (
                <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                  <Defs>
                    <SvgLinearGradient id="medicNavGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                      <Stop offset="0%" stopColor="#FF6B8A" />
                      <Stop offset="100%" stopColor="#FF3B5C" />
                    </SvgLinearGradient>
                  </Defs>
                  <Rect x="8" y="2" width="8" height="20" rx="2" fill="url(#medicNavGrad)" opacity={active ? 1 : 0.5} />
                  <Rect x="2" y="8" width="20" height="8" rx="2" fill="url(#medicNavGrad)" opacity={active ? 1 : 0.5} />
                  <Path d="M12 11.5c.5-.8 1.5-1 2-.5s.5 1.5 0 2.5l-2 2-2-2c-.5-1-.5-2 0-2.5s1.5-.3 2 .5z" fill="white" opacity={0.7} />
                </Svg>
              ) : (
                <Ionicons
                  name={active ? tab.iconActive : tab.iconDefault}
                  size={wp(22)}
                  color={active ? '#00D984' : '#6B7B8D'}
                />
              )}
            </View>
            <Text style={{
              fontSize: fp(9), fontWeight: '600', letterSpacing: wp(0.3), marginTop: -2,
              color: tab.isSpecial
                ? (active ? '#00D984' : '#6B7B8D')
                : tab.isMedicAi
                  ? (active ? '#FF3B5C' : '#8892A0')
                  : (active ? '#00D984' : '#6B7B8D'),
            }}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#141A22' }}>
      <LinearGradient colors={['#1A1D22','#252A30','#1E2328']} style={{flex:1}}>
        <StatusBar barStyle="light-content"/>
        <View style={{ paddingTop: Platform.OS === 'android' ? 35 : 50, paddingBottom: wp(6), paddingHorizontal: wp(16), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: fp(24), fontWeight: '800', color: '#D4AF37', letterSpacing: 1 }}>LixVerse</Text>
            <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', letterSpacing: 2.5 }}>UNIVERS LIXUM</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(10) }}>
            {/* Cloche notifications */}
            <Pressable delayPressIn={120} onPress={() => setShowNotifPanel(true)}
              style={({ pressed }) => ({
                width: wp(36), height: wp(36), borderRadius: wp(18),
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                justifyContent: 'center', alignItems: 'center',
                transform: [{ scale: pressed ? 0.9 : 1 }],
              })}>
              <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <Path d="M13.73 21a2 2 0 01-3.46 0" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round"/>
              </Svg>
              {unreadCount > 0 && (
                <View style={{
                  position: 'absolute', top: wp(-2), right: wp(-2),
                  minWidth: wp(16), height: wp(16), borderRadius: wp(8),
                  backgroundColor: '#FF3B5C',
                  justifyContent: 'center', alignItems: 'center',
                  paddingHorizontal: wp(4),
                  borderWidth: 1.5, borderColor: '#1A1D22',
                }}>
                  <Text style={{ fontSize: fp(8), fontWeight: '800', color: '#FFF' }}>{unreadCount}</Text>
                </View>
              )}
            </Pressable>
            {/* Badge compact Lix + dropdown */}
            <TouchableOpacity onPress={toggleDropdown} style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.4)',
              borderWidth: 1, borderColor: '#4A4F55',
              borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
            }}>
              <LixGem size={14} />
              <Text style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: fp(14), marginLeft: 4 }}>{lixBalance}</Text>
              <Text style={{ color: '#888', fontSize: fp(10), marginLeft: 4 }}>▾</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Dropdown Lix/Énergie/Profil */}
        {dropdownOpen && (
          <TouchableOpacity activeOpacity={1} onPress={toggleDropdown} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}>
            <Animated.View style={{
              position: 'absolute', top: Platform.OS === 'android' ? 85 : 100, right: wp(16),
              backgroundColor: 'rgba(16, 20, 28, 0.97)',
              borderWidth: 1, borderColor: '#4A4F55',
              borderRadius: 16, padding: 16, zIndex: 999,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 10,
              opacity: dropdownAnim,
              transform: [{ translateY: dropdownAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
            }}>
              <TouchableOpacity onPress={() => { toggleDropdown(); setActiveTab('lixspin'); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                <LixGem size={14} />
                <Text style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>{lixBalance}</Text>
                <Text style={{ color: '#888', fontSize: 14, marginLeft: 6 }}>Lix</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { toggleDropdown(); setActiveTab('lixspin'); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                <Svg width={14} height={14} viewBox="0 0 24 24">
                  <Path d="M13 2L3 14h7l-2 8 10-12h-7z" fill={userEnergy <= 5 ? '#FF6B6B' : '#FFB800'} />
                </Svg>
                <Text style={{ color: userEnergy <= 5 ? '#FF6B6B' : '#FFF', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>{userEnergy}</Text>
                <Text style={{ color: '#888', fontSize: 14, marginLeft: 6 }}>énergie</Text>
              </TouchableOpacity>
              <View style={{ borderTopWidth: 1, borderTopColor: '#4A4F55', marginVertical: 4 }} />
              <TouchableOpacity onPress={() => { toggleDropdown(); setActiveNavTab('profile'); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                <Text style={{ fontSize: 18 }}>{activeCharSlug ? ({ emerald_owl: '🦉', hawk_eye: '🦅', ruby_tiger: '🐯', amber_fox: '🦊', gipsy: '🕷️', jade_phoenix: '🔥', silver_wolf: '🐺', boukki: '🦴', iron_rhino: '🦏', coral_dolphin: '🐬' })[activeCharSlug] || '👤' : '👤'}</Text>
                <Text style={{ color: '#FFF', fontSize: 14, marginLeft: 8, flex: 1 }}>Mon Profil</Text>
                <Text style={{ color: '#888', fontSize: 14 }}>→</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        )}
        {notifications.length>0&&(<View style={{height:wp(28),backgroundColor:'rgba(212,175,55,0.06)',borderBottomWidth:1,borderBottomColor:'rgba(212,175,55,0.1)',overflow:'hidden',justifyContent:'center'}}><Animated.View style={{flexDirection:'row',transform:[{translateX:notifScrollX}]}}>{[...notifications,...notifications].map((n,i)=>(<View key={i} style={{width:wp(280),flexDirection:'row',alignItems:'center',paddingHorizontal:wp(10),gap:wp(6)}}><View style={{width:wp(6),height:wp(6),borderRadius:wp(3),backgroundColor:n.color||'#D4AF37'}}/><Text style={{fontSize:fp(10),color:'rgba(255,255,255,0.5)',flex:1}} numberOfLines={1}>{n.message}</Text></View>))}</Animated.View></View>)}
        <View style={{flexDirection:'row',marginHorizontal:wp(16),marginVertical:wp(10),gap:wp(6)}}>
          {[{key:'defi',label:'Défi',icon:'🏆'},{key:'human',label:'Human',icon:'🤝'},{key:'characters',label:'Caractères',icon:'🃏'},{key:'lixspin',label:'Lix & Spin',icon:'💎'}].map(tab=>(<Pressable key={tab.key} onPress={()=>setActiveTab(tab.key)} style={{flex:1,paddingVertical:wp(10),borderRadius:wp(12),alignItems:'center',backgroundColor:activeTab===tab.key?'#D4AF37':'rgba(255,255,255,0.05)',borderWidth:1,borderColor:activeTab===tab.key?'#D4AF37':'rgba(255,255,255,0.08)'}}><Text style={{fontSize:fp(14)}}>{tab.icon}</Text><Text style={{fontSize:fp(10),fontWeight:'600',marginTop:wp(2),color:activeTab===tab.key?'#1A1D22':'rgba(255,255,255,0.4)'}}>{tab.label}</Text></Pressable>))}
        </View>
        {activeTab==='defi'&&renderDefiTab()}
        {activeTab==='human'&&renderHumanTab()}
        {activeTab==='characters'&&renderCharactersTab()}
        {activeTab==='lixspin'&&renderLixSpinTab()}
      </LinearGradient>
      {renderNavBar()}
      <Modal visible={showCreateGroup} transparent animationType="fade" onRequestClose={() => setShowCreateGroup(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24) }}>
          <LinearGradient colors={['#2A2F36','#1E2328','#252A30']} style={{ borderRadius: wp(20), padding: wp(24), width: '100%' }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(6) }}>Créer un groupe</Text>
            <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginBottom: wp(20) }}>{selectedChallenge?.title || 'Défi'}</Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12), paddingHorizontal: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: wp(20) }}>
              <TextInput style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }} placeholder="Nom de ton équipe..." placeholderTextColor="rgba(255,255,255,0.25)" value={newGroupName} onChangeText={setNewGroupName} autoFocus maxLength={30} />
            </View>
            <Pressable delayPressIn={120} onPress={createGroup}><LinearGradient colors={['#D4AF37','#B8941F']} style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>Créer et inviter</Text></LinearGradient></Pressable>
            <Pressable onPress={() => setShowCreateGroup(false)} style={{ paddingVertical: wp(12), alignItems: 'center', marginTop: wp(8) }}><Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.35)' }}>Annuler</Text></Pressable>
          </LinearGradient>
        </View>
      </Modal>
      <Modal visible={showJoinGroup} transparent animationType="fade" onRequestClose={() => setShowJoinGroup(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24) }}>
          <LinearGradient colors={['#2A2F36','#1E2328','#252A30']} style={{ borderRadius: wp(20), padding: wp(24), width: '100%' }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(6) }}>Rejoindre un groupe</Text>
            <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginBottom: wp(20) }}>Code d'invitation de ton ami</Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12), paddingHorizontal: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: wp(20) }}>
              <TextInput style={{ fontSize: fp(18), color: '#D4AF37', paddingVertical: wp(14), textAlign: 'center', letterSpacing: 2, fontWeight: '700' }} placeholder="XXXXX-XXXX" placeholderTextColor="rgba(212,175,55,0.3)" value={joinCode} onChangeText={setJoinCode} autoFocus autoCapitalize="characters" maxLength={10} />
            </View>
            <Pressable delayPressIn={120} onPress={joinGroup}><LinearGradient colors={['#00D984','#00B871']} style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>Rejoindre</Text></LinearGradient></Pressable>
            <Pressable onPress={() => setShowJoinGroup(false)} style={{ paddingVertical: wp(12), alignItems: 'center', marginTop: wp(8) }}><Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.35)' }}>Annuler</Text></Pressable>
          </LinearGradient>
        </View>
      </Modal>
      {showCharacterDetail && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setShowCharacterDetail(null)}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setShowCharacterDetail(null)}>
            <Pressable onPress={() => {}} style={{ width: wp(260), alignItems: 'center' }}>
              {/* === LA CARTE DYNAMIQUE === */}
              <View style={{
                width: wp(260), borderRadius: wp(16), overflow: 'hidden',
                borderWidth: wp(3),
                borderColor: showCharacterDetail.tier === 'ultimate' ? '#DFE6E9' : showCharacterDetail.tier === 'hyper' ? '#00CEC9' : showCharacterDetail.tier === 'elite' ? '#D4AF37' : showCharacterDetail.tier === 'rare' ? '#A4B0BE' : '#CD7F32',
              }}>
                {/* --- HEADER BADGES --- */}
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: wp(8),
                }}>
                  {/* Icône fonctionnalité */}
                  <View style={{
                    width: wp(32), height: wp(32), borderRadius: wp(16),
                    backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1.5,
                    borderColor: TIER_CONFIG[showCharacterDetail.tier].color,
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: fp(14) }}>{showCharacterDetail.emoji}</Text>
                  </View>
                  {/* Tier badge */}
                  <View style={{
                    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: wp(6),
                    paddingHorizontal: wp(8), paddingVertical: wp(3),
                    borderWidth: 1, borderColor: TIER_CONFIG[showCharacterDetail.tier].color,
                  }}>
                    <Text style={{ fontSize: fp(9), fontWeight: '800', color: TIER_CONFIG[showCharacterDetail.tier].color, letterSpacing: 1 }}>
                      {TIER_CONFIG[showCharacterDetail.tier].label.toUpperCase()}
                    </Text>
                  </View>
                  {/* Compteur */}
                  <View style={{
                    width: wp(28), height: wp(28), borderRadius: wp(14),
                    backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1.5,
                    borderColor: TIER_CONFIG[showCharacterDetail.tier].color,
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '800', color: '#FFF' }}>x1</Text>
                  </View>
                </View>

                {/* --- DURÉE / USES badge (sous le compteur) --- */}
                <View style={{
                  position: 'absolute', top: wp(40), right: wp(8), zIndex: 10,
                  backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: wp(6),
                  paddingHorizontal: wp(6), paddingVertical: wp(2),
                  borderWidth: 1, borderColor: showCharacterDetail.uses > 0 ? '#00D984' : '#FF8C42',
                }}>
                  <Text style={{ fontSize: fp(8), fontWeight: '700', color: showCharacterDetail.uses > 0 ? '#00D984' : '#FF8C42' }}>
                    {showCharacterDetail.uses > 0 ? showCharacterDetail.uses + ' USES' : showCharacterDetail.unlock_hours > 0 ? (showCharacterDetail.unlock_hours >= 720 ? Math.round(showCharacterDetail.unlock_hours / 24) + 'J' : showCharacterDetail.unlock_hours + 'H') : '∞'}
                  </Text>
                </View>

                {/* --- IMAGE ILLUSTRATION --- */}
                {showCharacterDetail.image ? (
                  <Image
                    source={showCharacterDetail.image}
                    style={{ width: wp(254), height: wp(340), resizeMode: 'cover' }}
                  />
                ) : (
                  <View style={{
                    width: wp(254), height: wp(340),
                    backgroundColor: TIER_CONFIG[showCharacterDetail.tier].bg,
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: fp(80) }}>{showCharacterDetail.emoji}</Text>
                  </View>
                )}

                {/* --- BARRE DE PROGRESSION --- */}
                <View style={{
                  position: 'absolute', bottom: wp(80), left: wp(10), right: wp(10), zIndex: 10,
                }}>
                  <View style={{
                    height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(0,0,0,0.4)',
                    overflow: 'hidden',
                  }}>
                    <View style={{
                      height: '100%', borderRadius: wp(2), width: '100%',
                      backgroundColor: TIER_CONFIG[showCharacterDetail.tier].color,
                    }} />
                  </View>
                  <Text style={{
                    fontSize: fp(8), color: 'rgba(255,255,255,0.6)', textAlign: 'right', marginTop: wp(2),
                  }}>
                    {showCharacterDetail.uses > 0 ? showCharacterDetail.uses + '/' + showCharacterDetail.uses + ' utilisations' : showCharacterDetail.unlock_hours > 0 ? 'Plein' : ''}
                  </Text>
                </View>

                {/* --- PLAQUE NOM EN BAS --- */}
                <View style={{
                  backgroundColor: 'rgba(0,0,0,0.75)',
                  paddingVertical: wp(12), paddingHorizontal: wp(14),
                  borderTopWidth: 2,
                  borderTopColor: showCharacterDetail.tier === 'ultimate' ? '#DFE6E9' : showCharacterDetail.tier === 'hyper' ? '#00CEC9' : showCharacterDetail.tier === 'elite' ? '#D4AF37' : showCharacterDetail.tier === 'rare' ? '#A4B0BE' : '#CD7F32',
                }}>
                  <Text style={{
                    fontSize: fp(18), fontWeight: '800', color: TIER_CONFIG[showCharacterDetail.tier].color,
                    textAlign: 'center', letterSpacing: 2,
                  }}>
                    {showCharacterDetail.name}
                  </Text>
                  <Text style={{
                    fontSize: fp(10), color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: wp(4),
                  }}>
                    {showCharacterDetail.desc}
                  </Text>
                </View>
              </View>

              {/* === BONUS INFO SOUS LA CARTE === */}
              <View style={{ width: '100%', marginTop: wp(12), gap: wp(6) }}>
                <View style={{
                  backgroundColor: 'rgba(0,217,132,0.1)', borderRadius: wp(10),
                  padding: wp(10), borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                }}>
                  <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#00D984', marginBottom: wp(2) }}>ABONNÉ</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.5)' }}>{showCharacterDetail.bonus_abonne}</Text>
                </View>
                <View style={{
                  backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: wp(10),
                  padding: wp(10), borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
                }}>
                  <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#D4AF37', marginBottom: wp(2) }}>NON ABONNÉ</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.5)' }}>{showCharacterDetail.bonus_non_abonne}</Text>
                </View>
              </View>

              {/* Possédé ou non */}
              <View style={{ marginTop: wp(12) }}>
                {ownedCharacters.includes(showCharacterDetail.id) ? (
                  <View style={{
                    backgroundColor: TIER_CONFIG[showCharacterDetail.tier].color + '30',
                    borderRadius: wp(12), paddingVertical: wp(10), paddingHorizontal: wp(24),
                  }}>
                    <Text style={{ fontSize: fp(13), fontWeight: '700', color: TIER_CONFIG[showCharacterDetail.tier].color }}>✓ Possédé</Text>
                  </View>
                ) : (
                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: wp(12), paddingVertical: wp(10), paddingHorizontal: wp(24),
                  }}>
                    <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.3)' }}>Ouvre des caisses !</Text>
                  </View>
                )}
              </View>

              {/* Fermer */}
              <Pressable onPress={() => setShowCharacterDetail(null)}
                style={{ paddingVertical: wp(14) }}>
                <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.3)' }}>Fermer</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}
      {/* Modal Gift Lix */}
      {showGiftModal && selectedSticker && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setShowGiftModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24) }}>
            <LinearGradient colors={['#2A2F36', '#1E2328']} style={{ borderRadius: wp(20), padding: wp(24), width: '100%', alignItems: 'center' }}>
              <Text style={{ fontSize: fp(32), marginBottom: wp(8) }}>🎁</Text>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>Offrir des Lix à {selectedSticker.display_name}</Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(20) }}>Ton solde : {lixBalance} Lix</Text>
              {[10, 50, 100, 500].map(amount => (
                <Pressable key={amount} delayPressIn={120}
                  onPress={() => {
                    if (lixBalance < amount) { showLixAlert('Lix insuffisants', 'Tu n\'as pas assez de Lix pour ce cadeau.', [{ text: 'Fermer', style: 'cancel' }], '💰'); return; }
                    setLixBalance(p => p - amount);
                    setSelectedSticker(s => ({ ...s, lix_received: (s.lix_received || 0) + amount }));
                    setWallStickers(prev => prev.map(s => s.id === selectedSticker.id ? { ...s, lix_received: (s.lix_received || 0) + amount } : s));
                    fetch(SUPABASE_URL + '/rest/v1/rpc/gift_lix_to_sticker', { method: 'POST', headers: { ...hdrs, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_sticker_id: selectedSticker.id, p_from_user_id: TEST_USER_ID, p_amount: amount }) }).catch(() => {});
                    showLixAlert('Merci', amount + ' Lix offerts à ' + selectedSticker.display_name + ' !', [{ text: 'De rien', color: '#D4AF37' }], '🎁');
                    setShowGiftModal(false);
                  }}
                  style={({ pressed }) => ({
                    width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    paddingVertical: wp(14), paddingHorizontal: wp(16), borderRadius: wp(12), marginBottom: wp(6),
                    backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)',
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  })}>
                  <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{amount} Lix</Text>
                  <Text style={{ fontSize: fp(12), color: '#D4AF37' }}>Offrir →</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => setShowGiftModal(false)} style={{ paddingVertical: wp(12), marginTop: wp(8) }}>
                <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>Annuler</Text>
              </Pressable>
            </LinearGradient>
          </View>
        </Modal>
      )}
      {/* Modal Certification */}
      {showCertificationModal && myCertification && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setShowCertificationModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(20) }}>
            <LinearGradient colors={['#2A2F36', '#1E2328', '#252A30']} style={{ borderRadius: wp(20), padding: wp(24), width: '100%', alignItems: 'center' }}>
              <Text style={{ fontSize: fp(48), marginBottom: wp(8) }}>🎉</Text>
              <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#D4AF37', marginBottom: wp(4) }}>Félicitations !</Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: wp(16), lineHeight: fp(19) }}>
                Tu as maintenu un Score Vitalité de {myCertification.avg_vitality_score?.toFixed(0) || '—'} pendant {myCertification.days_above_threshold || '—'} jours !{'\n'}Score anti-triche : {myCertification.total_score?.toFixed(0)}/100
              </Text>
              <View style={{ flexDirection: 'row', gap: wp(12), marginBottom: wp(20) }}>
                <View style={{ alignItems: 'center', backgroundColor: 'rgba(0,217,132,0.1)', borderRadius: wp(12), paddingHorizontal: wp(14), paddingVertical: wp(10) }}>
                  <Text style={{ fontSize: fp(9), color: 'rgba(0,217,132,0.6)', marginBottom: wp(2) }}>Régularité</Text>
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#00D984' }}>{myCertification.score_regularity?.toFixed(0)}</Text>
                </View>
                <View style={{ alignItems: 'center', backgroundColor: 'rgba(77,166,255,0.1)', borderRadius: wp(12), paddingHorizontal: wp(14), paddingVertical: wp(10) }}>
                  <Text style={{ fontSize: fp(9), color: 'rgba(77,166,255,0.6)', marginBottom: wp(2) }}>Cohérence</Text>
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#4DA6FF' }}>{myCertification.score_coherence?.toFixed(0)}</Text>
                </View>
                <View style={{ alignItems: 'center', backgroundColor: 'rgba(155,109,255,0.1)', borderRadius: wp(12), paddingHorizontal: wp(14), paddingVertical: wp(10) }}>
                  <Text style={{ fontSize: fp(9), color: 'rgba(155,109,255,0.6)', marginBottom: wp(2) }}>Engagement</Text>
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#9B6DFF' }}>{myCertification.score_engagement?.toFixed(0)}</Text>
                </View>
              </View>
              <Pressable delayPressIn={120} onPress={() => { setShowCertificationModal(false); setShowStickerCreation(true); }}>
                <LinearGradient colors={['#D4AF37', '#B8941F']} style={{ paddingHorizontal: wp(36), paddingVertical: wp(14), borderRadius: wp(14) }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>Choisir mon sticker</Text>
                </LinearGradient>
              </Pressable>
              <Pressable onPress={() => setShowCertificationModal(false)} style={{ paddingVertical: wp(12), marginTop: wp(8) }}>
                <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.3)' }}>Plus tard</Text>
              </Pressable>
            </LinearGradient>
          </View>
        </Modal>
      )}

      {/* Modal Création Sticker */}
      {showStickerCreation && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setShowStickerCreation(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' }}>
            <ScrollView contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 40 : 60, paddingHorizontal: wp(20), paddingBottom: wp(40) }}>
              <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#D4AF37', textAlign: 'center', marginBottom: wp(4) }}>Choisis ton sticker</Text>
              <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: wp(20) }}>Il sera collé sur le Wall of Health</Text>

              {/* Stickers gratuits */}
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#00D984', marginBottom: wp(8) }}>Gratuits</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(8), marginBottom: wp(16) }}>
                {stickerCatalog.filter(s => s.category === 'free').map(s => (
                  <Pressable key={s.id} onPress={() => setSelectedStickerChoice(s)}
                    style={({ pressed }) => ({
                      width: (SCREEN_WIDTH - wp(56)) / 4, paddingVertical: wp(10), borderRadius: wp(12), alignItems: 'center',
                      backgroundColor: selectedStickerChoice?.id === s.id ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                      borderWidth: selectedStickerChoice?.id === s.id ? 2 : 1,
                      borderColor: selectedStickerChoice?.id === s.id ? '#D4AF37' : 'rgba(255,255,255,0.08)',
                      transform: [{ scale: pressed ? 0.92 : 1 }],
                    })}>
                    <Text style={{ fontSize: fp(24) }}>{s.emoji}</Text>
                    <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>{s.name}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Stickers premium */}
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#D4AF37', marginBottom: wp(8) }}>Premium</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(8), marginBottom: wp(16) }}>
                {stickerCatalog.filter(s => s.category === 'premium').map(s => (
                  <Pressable key={s.id} onPress={() => setSelectedStickerChoice(s)}
                    style={({ pressed }) => ({
                      width: (SCREEN_WIDTH - wp(56)) / 4, paddingVertical: wp(10), borderRadius: wp(12), alignItems: 'center',
                      backgroundColor: selectedStickerChoice?.id === s.id ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                      borderWidth: selectedStickerChoice?.id === s.id ? 2 : 1,
                      borderColor: selectedStickerChoice?.id === s.id ? '#D4AF37' : 'rgba(255,255,255,0.08)',
                      transform: [{ scale: pressed ? 0.92 : 1 }],
                    })}>
                    <Text style={{ fontSize: fp(24) }}>{s.emoji}</Text>
                    <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>{s.name}</Text>
                    <View style={{ backgroundColor: 'rgba(212,175,55,0.2)', borderRadius: wp(4), paddingHorizontal: wp(4), paddingVertical: wp(1), marginTop: wp(2) }}>
                      <Text style={{ fontSize: fp(7), fontWeight: '700', color: '#D4AF37' }}>{s.cost_lix} Lix</Text>
                    </View>
                  </Pressable>
                ))}
              </View>

              {/* Drapeaux */}
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#4DA6FF', marginBottom: wp(8) }}>Drapeaux</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: wp(20) }}>
                <View style={{ flexDirection: 'row', gap: wp(8) }}>
                  {stickerCatalog.filter(s => s.category === 'country').map(s => (
                    <Pressable key={s.id} onPress={() => setSelectedStickerChoice(s)}
                      style={({ pressed }) => ({
                        paddingVertical: wp(8), paddingHorizontal: wp(12), borderRadius: wp(10), alignItems: 'center',
                        backgroundColor: selectedStickerChoice?.id === s.id ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                        borderWidth: selectedStickerChoice?.id === s.id ? 2 : 1,
                        borderColor: selectedStickerChoice?.id === s.id ? '#D4AF37' : 'rgba(255,255,255,0.08)',
                        transform: [{ scale: pressed ? 0.92 : 1 }],
                      })}>
                      <Text style={{ fontSize: fp(20) }}>{s.emoji}</Text>
                      <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>{s.name}</Text>
                      <Text style={{ fontSize: fp(7), color: '#D4AF37', marginTop: wp(1) }}>100 Lix</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              {/* Message */}
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF', marginBottom: wp(8) }}>Ton message</Text>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12), paddingHorizontal: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: wp(16) }}>
                <TextInput
                  style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12), textAlign: 'center' }}
                  placeholder="Pour mes enfants"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={stickerMessage}
                  onChangeText={(t) => setStickerMessage(t.slice(0, 25))}
                  maxLength={25}
                />
              </View>
              <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginBottom: wp(20) }}>{stickerMessage.length}/25 caractères</Text>

              {/* Preview */}
              {selectedStickerChoice && stickerMessage.trim() && (
                <View style={{ alignItems: 'center', marginBottom: wp(20) }}>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', marginBottom: wp(8) }}>Aperçu</Text>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(14), padding: wp(14), alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', transform: [{ rotate: '-3deg' }] }}>
                    <View style={{ width: wp(20), height: wp(6), borderRadius: wp(3), backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: wp(-2) }} />
                    <Text style={{ fontSize: fp(32), marginTop: wp(4) }}>{selectedStickerChoice.emoji}</Text>
                    <Text style={{ fontSize: fp(11), fontWeight: '600', color: '#FFF', marginTop: wp(4) }}>Malick K.</Text>
                    <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginTop: wp(2) }}>"{stickerMessage}"</Text>
                  </View>
                </View>
              )}

              {/* Bouton Coller */}
              <Pressable delayPressIn={120}
                onPress={() => {
                  if (!selectedStickerChoice) { showLixAlert('Sticker manquant', 'Choisis un sticker avant de le coller.', [{ text: 'OK', style: 'cancel' }], '🎨'); return; }
                  if (!stickerMessage.trim()) { showLixAlert('Message manquant', 'Écris ton message avant de coller le sticker.', [{ text: 'OK', style: 'cancel' }], '✏️'); return; }
                  const cost = selectedStickerChoice.cost_lix || 0;
                  if (cost > 0 && lixBalance < cost) { showLixAlert('Lix insuffisants', 'Il te faut ' + cost + ' Lix pour ce sticker.', [{ text: 'Fermer', style: 'cancel' }], '💰'); return; }
                  if (cost > 0) setLixBalance(p => p - cost);
                  const newSticker = {
                    id: Date.now().toString(),
                    user_id: TEST_USER_ID,
                    display_name: 'Malick K.',
                    country: 'Burundi',
                    country_flag: '🇧🇮',
                    sticker_emoji: selectedStickerChoice.emoji,
                    sticker_id: selectedStickerChoice.id,
                    message: stickerMessage.trim(),
                    vitality_score: myCertification?.avg_vitality_score || 0,
                    month_year: myCertification?.month_year || '',
                    like_count: 0,
                    lix_received: 0,
                    rotation: Math.floor(Math.random() * 20) - 10,
                  };
                  setWallStickers(prev => [newSticker, ...prev]);
                  // Save to Supabase
                  const h = { ...hdrs, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };
                  fetch(SUPABASE_URL + '/rest/v1/wall_stickers', { method: 'POST', headers: h, body: JSON.stringify({
                    user_id: TEST_USER_ID,
                    certification_id: myCertification?.id,
                    display_name: 'Malick K.',
                    country: 'Burundi',
                    country_flag: '🇧🇮',
                    sticker_emoji: selectedStickerChoice.emoji,
                    sticker_id: selectedStickerChoice.id,
                    sticker_cost: cost,
                    message: stickerMessage.trim(),
                    vitality_score: myCertification?.avg_vitality_score || 0,
                    month_year: myCertification?.month_year || '',
                    position_x: Math.random(),
                    position_y: Math.random(),
                    rotation: newSticker.rotation,
                  }) }).catch(() => {});
                  // Mark certification as has_sticker
                  if (myCertification?.id) {
                    fetch(SUPABASE_URL + '/rest/v1/wall_certifications?id=eq.' + myCertification.id, { method: 'PATCH', headers: h, body: JSON.stringify({ has_sticker: true }) }).catch(() => {});
                    setMyCertification(prev => prev ? { ...prev, has_sticker: true } : prev);
                  }
                  // Notification
                  fetch(SUPABASE_URL + '/rest/v1/lixverse_notifications', { method: 'POST', headers: h, body: JSON.stringify({
                    notification_type: 'wall_sticker',
                    lixtag: 'LXM-2K7F4A',
                    message: 'Malick K. a collé un sticker ' + selectedStickerChoice.emoji + ' sur le Wall of Health !',
                    color: '#D4AF37',
                  }) }).catch(() => {});
                  setShowStickerCreation(false);
                  setSelectedStickerChoice(null);
                  setStickerMessage('');
                  showLixAlert('Sticker collé', 'Ton sticker est maintenant visible sur le Wall of Health !\n\nLes membres peuvent te liker et t\'offrir des Lix.', [{ text: 'Voir le mur', color: '#D4AF37', onPress: () => setActiveTab('defi') }], '🎉');
                }}
                style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], opacity: (!selectedStickerChoice || !stickerMessage.trim()) ? 0.4 : 1 })}>
                <LinearGradient colors={['#D4AF37', '#B8941F']} style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>
                    Coller au Wall of Health {selectedStickerChoice?.cost_lix > 0 ? '(' + selectedStickerChoice.cost_lix + ' Lix)' : '(Gratuit)'}
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable onPress={() => { setShowStickerCreation(false); setSelectedStickerChoice(null); setStickerMessage(''); }} style={{ paddingVertical: wp(14), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>Annuler</Text>
              </Pressable>
            </ScrollView>
          </View>
        </Modal>
      )}
      {/* Modal Binôme Alert */}
      {showBinomeAlert.visible && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setShowBinomeAlert({ visible: false, title: '', message: '', icon: null, buttons: [] })}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}>
            <LinearGradient colors={['#2A2F36', '#1E2328', '#252A30']} style={{ borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), padding: wp(24), alignItems: 'center' }}>
              {showBinomeAlert.icon && <Text style={{ fontSize: fp(40), marginBottom: wp(10) }}>{showBinomeAlert.icon}</Text>}
              <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', marginBottom: wp(8) }}>{showBinomeAlert.title}</Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: wp(20), lineHeight: fp(19) }}>{showBinomeAlert.message}</Text>
              <View style={{ width: '100%', gap: wp(8) }}>
                {showBinomeAlert.buttons.map((btn, i) => (
                  <Pressable key={i} delayPressIn={120} onPress={btn.onPress}
                    style={({ pressed }) => ({
                      paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center',
                      backgroundColor: btn.style === 'destructive' ? 'rgba(255,75,75,0.15)' : btn.style === 'cancel' ? 'rgba(255,255,255,0.05)' : 'rgba(212,175,55,0.15)',
                      borderWidth: 1,
                      borderColor: btn.style === 'destructive' ? 'rgba(255,75,75,0.3)' : btn.style === 'cancel' ? 'rgba(255,255,255,0.1)' : 'rgba(212,175,55,0.3)',
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    })}>
                    <Text style={{ fontSize: fp(14), fontWeight: '600', color: btn.style === 'destructive' ? '#FF4B4B' : btn.style === 'cancel' ? 'rgba(255,255,255,0.4)' : '#D4AF37' }}>{btn.text}</Text>
                  </Pressable>
                ))}
              </View>
            </LinearGradient>
          </View>
        </Modal>
      )}
      {/* Modal LixSign Picker */}
      {showLixSignPicker && (
        <Modal visible={true} transparent animationType="slide" onRequestClose={() => setShowLixSignPicker(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
            <LinearGradient colors={['#2A2F36', '#1E2328', '#252A30']} style={{ borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), maxHeight: '70%' }}>
              <View style={{ padding: wp(16), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(12) }}>
                  <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF' }}>Envoyer un LixSign</Text>
                  <Pressable onPress={() => setShowLixSignPicker(false)}>
                    <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>✕</Text>
                  </Pressable>
                </View>
                {/* Message confidentialité */}
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: wp(8),
                  backgroundColor: 'rgba(0,217,132,0.06)', borderRadius: wp(10),
                  padding: wp(10), marginBottom: wp(12),
                  borderWidth: 1, borderColor: 'rgba(0,217,132,0.1)',
                }}>
                  <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#00D984" strokeWidth="1.5" strokeLinejoin="round"/>
                  </Svg>
                  <Text style={{ fontSize: fp(9), color: 'rgba(0,217,132,0.6)', flex: 1, lineHeight: fp(13) }}>
                    Chez LIXUM, la communication se fait par signes pour protéger votre santé mentale et prévenir tout harcèlement.
                  </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: wp(6) }}>
                    {Object.entries(LIXSIGNS).map(([key, cat]) => (
                      <Pressable key={key} onPress={() => setLixSignCategory(key)}
                        style={{
                          paddingHorizontal: wp(12), paddingVertical: wp(6), borderRadius: wp(10),
                          backgroundColor: lixSignCategory === key ? cat.color + '25' : 'rgba(255,255,255,0.05)',
                          borderWidth: 1, borderColor: lixSignCategory === key ? cat.color + '50' : 'rgba(255,255,255,0.08)',
                        }}>
                        <Text style={{ fontSize: fp(10), fontWeight: '600', color: lixSignCategory === key ? cat.color : 'rgba(255,255,255,0.4)' }}>{cat.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <ScrollView contentContainerStyle={{ padding: wp(16) }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(10), justifyContent: 'center' }}>
                  {LIXSIGNS[lixSignCategory]?.signs.map(sign => (
                    <Pressable key={sign.id} delayPressIn={120} onPress={() => sendLixSign(sign)}
                      style={({ pressed }) => ({
                        width: (SCREEN_WIDTH - wp(74)) / 3, alignItems: 'center', paddingVertical: wp(12),
                        borderRadius: wp(14), backgroundColor: 'rgba(255,255,255,0.04)',
                        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                        transform: [{ scale: pressed ? 0.9 : 1 }],
                      })}>
                      <View style={{
                        width: wp(48), height: wp(48), borderRadius: wp(24),
                        backgroundColor: LIXSIGNS[lixSignCategory].color + '15',
                        borderWidth: 1, borderColor: LIXSIGNS[lixSignCategory].color + '30',
                        justifyContent: 'center', alignItems: 'center', marginBottom: wp(6),
                      }}>
                        <Svg width={wp(24)} height={wp(24)} viewBox={sign.viewBox} fill={LIXSIGNS[lixSignCategory].color}>
                          <Path d={sign.svgPath} />
                        </Svg>
                      </View>
                      <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.5)', textAlign: 'center' }} numberOfLines={1}>{sign.text}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </LinearGradient>
          </View>
        </Modal>
      )}
      {/* Panel Notifications */}
      <Modal visible={showNotifPanel} transparent animationType="slide" onRequestClose={() => setShowNotifPanel(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }} onPress={() => setShowNotifPanel(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34),
                maxHeight: SCREEN_WIDTH * 1.4,
              }}>
              {/* Poignée */}
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(16) }} />
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(16) }}>
                <View>
                  <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Notifications</Text>
                  {unreadCount > 0 && (
                    <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(2) }}>
                      {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                    </Text>
                  )}
                </View>
                {unreadCount > 0 && (
                  <Pressable delayPressIn={120}
                    onPress={() => setNotifList(prev => prev.map(n => ({ ...n, read: true })))}
                    style={({ pressed }) => ({
                      paddingHorizontal: wp(12), paddingVertical: wp(6),
                      borderRadius: wp(8), backgroundColor: 'rgba(0,217,132,0.1)',
                      borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    })}>
                    <Text style={{ fontSize: fp(10), fontWeight: '600', color: '#00D984' }}>Tout marquer lu</Text>
                  </Pressable>
                )}
              </View>
              {/* Liste notifications */}
              <ScrollView style={{ maxHeight: SCREEN_WIDTH * 1.0 }} showsVerticalScrollIndicator={false}>
                {notifList.length === 0 ? (
                  <View style={{ padding: wp(30), alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(28), marginBottom: wp(8) }}>🔔</Text>
                    <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.25)' }}>Aucune notification</Text>
                  </View>
                ) : (
                  notifList.map((notif) => (
                    <Pressable key={notif.id} delayPressIn={120}
                      onPress={() => {
                        setNotifList(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                        if (notif.type === 'binome_request') {
                          setShowNotifPanel(false);
                          setActiveTab('binome');
                        }
                      }}
                      style={({ pressed }) => ({
                        flexDirection: 'row', alignItems: 'flex-start', gap: wp(12),
                        padding: wp(14), borderRadius: wp(14), marginBottom: wp(6),
                        backgroundColor: notif.read ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
                        borderWidth: 1,
                        borderColor: notif.read ? 'rgba(255,255,255,0.04)' : notif.color + '25',
                        borderLeftWidth: notif.read ? 1 : wp(3),
                        borderLeftColor: notif.read ? 'rgba(255,255,255,0.04)' : notif.color,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      })}>
                      <View style={{
                        width: wp(36), height: wp(36), borderRadius: wp(12),
                        backgroundColor: notif.color + '15',
                        justifyContent: 'center', alignItems: 'center',
                        marginTop: wp(2),
                      }}>
                        <Text style={{ fontSize: fp(16) }}>{notif.emoji}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(2) }}>
                          <Text style={{ fontSize: fp(13), fontWeight: notif.read ? '500' : '700', color: notif.read ? 'rgba(255,255,255,0.5)' : '#FFF', flex: 1 }} numberOfLines={1}>
                            {notif.title}
                          </Text>
                          {!notif.read && (
                            <View style={{ width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: notif.color, marginLeft: wp(6) }} />
                          )}
                        </View>
                        <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', lineHeight: fp(16), marginBottom: wp(4) }} numberOfLines={2}>
                          {notif.message}
                        </Text>
                        <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.2)' }}>{notif.time}</Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </ScrollView>
              {/* Fermer */}
              <Pressable onPress={() => setShowNotifPanel(false)}
                style={{ paddingVertical: wp(14), alignItems: 'center', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginTop: wp(12) }}>
                <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Fermer</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>
      {/* Modal Alert LIXUM — remplace Alert.alert natif */}
      <Modal visible={lixAlert.visible} transparent animationType="fade" onRequestClose={hideLixAlert}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24) }}>
          <LinearGradient colors={['#2A2F36', '#1E2328', '#252A30']} style={{ borderRadius: wp(20), paddingHorizontal: wp(24), paddingVertical: wp(28), width: '100%', alignItems: 'center' }}>
            {lixAlert.emoji ? <Text style={{ fontSize: fp(36), marginBottom: wp(12) }}>{lixAlert.emoji}</Text> : null}
            <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: wp(8) }}>{lixAlert.title}</Text>
            <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: fp(19), marginBottom: wp(20) }}>{lixAlert.message}</Text>
            {lixAlert.buttons.map((btn, i) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';
              const btnColor = btn.color || (isDestructive ? '#FF6B6B' : '#D4AF37');
              return (
                <Pressable key={i} delayPressIn={120}
                  onPress={() => { hideLixAlert(); if (btn.onPress) btn.onPress(); }}
                  style={({ pressed }) => ({
                    width: '100%', paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center', marginBottom: wp(6),
                    backgroundColor: isCancel ? 'transparent' : btnColor + '20',
                    borderWidth: isCancel ? 1 : 0,
                    borderColor: isCancel ? 'rgba(255,255,255,0.1)' : 'transparent',
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  })}>
                  <Text style={{ fontSize: fp(15), fontWeight: isCancel ? '500' : '700', color: isCancel ? 'rgba(255,255,255,0.4)' : btnColor }}>{btn.text}</Text>
                </Pressable>
              );
            })}
            {lixAlert.buttons.length === 0 && (
              <Pressable onPress={hideLixAlert} style={{ paddingVertical: wp(14), width: '100%', alignItems: 'center', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Text style={{ fontSize: fp(15), fontWeight: '500', color: 'rgba(255,255,255,0.4)' }}>OK</Text>
              </Pressable>
            )}
          </LinearGradient>
        </View>
      </Modal>

      {/* Modal Onboarding Caractères */}
      <Modal visible={showCharOnboarding} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <LinearGradient colors={['#3A3F46','#252A30','#333A42','#1A1D22']} style={{ width: '92%', maxHeight: '90%', borderRadius: wp(20), padding: wp(20), borderWidth: 1, borderColor: '#4A4F55' }}>
            <Text style={{ fontSize: fp(22), fontWeight: '700', color: '#D4AF37', textAlign: 'center', marginBottom: wp(6) }}>Bienvenue dans le LixVerse !</Text>
            <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: wp(20) }}>Choisis ton premier compagnon de santé</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: wp(12), paddingHorizontal: wp(4) }}>
              {userCollection.map(ch => {
                const emojiMap = { emerald_owl: '🦉', hawk_eye: '🦅', ruby_tiger: '🐯', amber_fox: '🦊', gipsy_spider: '🕷️' };
                const em = emojiMap[ch.slug] || ALL_CHARACTERS.find(a => a.id === ch.slug)?.emoji || '🃏';
                const isSel = onboardingSelected === ch.slug;
                return (
                  <Pressable key={ch.slug || ch.id} delayPressIn={120} onPress={() => setOnboardingSelected(ch.slug)}
                    style={({ pressed }) => ({ width: wp(160), height: wp(220), borderRadius: wp(14), overflow: 'hidden', borderWidth: isSel ? 2.5 : 1, borderColor: isSel ? '#D4AF37' : '#4A4F55', transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                    <LinearGradient colors={['#3A3F46','#252A30','#333A42','#1A1D22']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: wp(10) }}>
                      <View style={{ width: wp(80), height: wp(80), borderRadius: wp(40), backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', marginBottom: wp(8) }}>
                        <Text style={{ fontSize: fp(50) }}>{em}</Text>
                      </View>
                      <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', textAlign: 'center' }}>{ch.name || ch.slug}</Text>
                      <Text style={{ fontSize: fp(10), color: '#00D984', textAlign: 'center', marginTop: wp(2) }}>{ch.specialty || ch.tier || 'Standard'}</Text>
                      <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: wp(4) }} numberOfLines={2}>{ch.description || ch.desc || ALL_CHARACTERS.find(a => a.id === ch.slug)?.desc || ''}</Text>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable delayPressIn={120} disabled={!onboardingSelected} onPress={() => onboardingSelected && chooseFirstCharacter(onboardingSelected)}
              style={({ pressed }) => ({ marginTop: wp(20), opacity: onboardingSelected ? 1 : 0.4, transform: [{ scale: pressed && onboardingSelected ? 0.95 : 1 }] })}>
              <LinearGradient colors={onboardingSelected ? ['#00D984','#00B871'] : ['#333A42','#2A2F36']} style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>Choisir ce compagnon</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>

      {/* Modal Détail Personnage avec Flip */}
      {selectedChar && (
        <Modal visible={true} transparent animationType="slide" onRequestClose={() => { setSelectedChar(null); setCharFlipped(false); flipAnim.setValue(0); setInlinePowerModal(null); }}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' }} onPress={() => { setSelectedChar(null); setCharFlipped(false); flipAnim.setValue(0); setInlinePowerModal(null); }}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={{ borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), overflow: 'hidden', maxHeight: SCREEN_WIDTH * 1.8 }}>
                {/* FACE — Swipe Tinder entre cartes */}
                <Animated.View style={{ opacity: frontInterpolate, position: charFlipped ? 'absolute' : 'relative', width: '100%' }}>
                  <View style={{ backgroundColor: 'rgba(0,0,0,0.92)', borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), paddingTop: wp(12), paddingBottom: wp(24) }}>
                    <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: wp(10) }} />

                    {/* FlatList horizontale — navigation native */}
                    <View style={{ height: wp(380), width: W }}>
                      <FlatList
                        ref={cardFlatListRef}
                        data={ALL_CHARACTERS}
                        horizontal
                        pagingEnabled={false}
                        snapToInterval={CARD_SNAP}
                        snapToAlignment="center"
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: (W - CARD_WIDTH) / 2 }}
                        initialScrollIndex={cardViewIndex}
                        getItemLayout={(_, index) => ({
                          length: CARD_SNAP,
                          offset: CARD_SNAP * index,
                          index,
                        })}
                        onViewableItemsChanged={onCardViewableChange}
                        viewabilityConfig={cardViewabilityConfig}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => {
                          const acSlug = item.id;
                          const coll = userCollection.length > 0 ? userCollection : ALL_CHARACTERS.map(c => ({ ...c, slug: c.id, owned: ownedCharacters.includes(c.id), level: ownedChars[c.id]?.level || 0, xp: ownedChars[c.id]?.xp || 0, xp_next: ownedChars[c.id]?.xp_next || 1000, uses_remaining: ownedChars[c.id]?.uses_remaining || 0, uses_max: ownedChars[c.id]?.uses_max || 10, fragments: 0, fragments_required: 3, is_active: false }));
                          const ch = coll.find(c => (c.slug || c.id) === acSlug) || { ...item, slug: acSlug, owned: false };
                          const charImg = getCharImage(acSlug);
                          const own = ch.owned !== false && ch.owned !== undefined ? ch.owned : ownedCharacters.includes(acSlug);
                          const usesRem = ch.uses_remaining || 0;
                          const usesMax = ch.uses_max || item.uses || 10;
                          const name = CHAR_NAMES[acSlug] || ch.name || item.name || acSlug;

                          return (
                            <View style={{ width: CARD_WIDTH, marginRight: CARD_SPACING }}>
                              <View style={{ width: CARD_WIDTH, height: wp(370), borderRadius: wp(8), overflow: 'hidden', backgroundColor: '#000' }}>
                                {charImg.img ? (
                                  <Image source={charImg.img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                ) : (
                                  <View style={{ width: '100%', height: '100%', backgroundColor: '#1E2530', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: fp(80) }}>{charImg.emoji}</Text>
                                    <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginTop: wp(8) }}>{name}</Text>
                                  </View>
                                )}

                                {/* Badge utilisations en haut à droite */}
                                {own && (
                                  <View style={{ position: 'absolute', top: wp(12), right: wp(12), backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(4) }}>
                                    <Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.8)' }}>{usesRem}/{usesMax} ⚡</Text>
                                  </View>
                                )}

                                {/* Overlay lock si non possédé */}
                                {!own && (
                                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: fp(50) }}>🔒</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          );
                        }}
                      />
                    </View>

                    {/* Infos SOUS la carte */}
                    {(() => {
                      const ac = ALL_CHARACTERS[cardViewIndex];
                      if (!ac) return null;
                      const acSlug = ac.id;
                      const coll = userCollection.length > 0 ? userCollection : ALL_CHARACTERS.map(c => ({ ...c, slug: c.id, owned: ownedCharacters.includes(c.id), level: ownedChars[c.id]?.level || 0, xp: ownedChars[c.id]?.xp || 0, xp_next: ownedChars[c.id]?.xp_next || 1000, uses_remaining: ownedChars[c.id]?.uses_remaining || 0, uses_max: ownedChars[c.id]?.uses_max || 10, fragments: 0, fragments_required: 3, is_active: false }));
                      const ch = coll.find(c => (c.slug || c.id) === acSlug) || { ...ac, slug: acSlug, owned: false };
                      const own = ch.owned !== false && ch.owned !== undefined ? ch.owned : ownedCharacters.includes(acSlug);
                      const isActive = acSlug === activeCharSlug;
                      const tier = ch.tier || ac.tier || 'standard';
                      const name = CHAR_NAMES[acSlug] || ch.name || ac.name || acSlug;
                      const usesRem = ch.uses_remaining || 0;
                      const usesMax = ch.uses_max || ac.uses || 10;
                      const xp = ch.xp || 0;
                      const xpNext = ch.xp_next || 1000;
                      const frags = ch.fragments || ch.duplicates_count || 0;
                      const fragsReq = ch.fragments_required || FRAGS_NIV1[tier] || 3;

                      return (
                        <View style={{ paddingHorizontal: (SCREEN_WIDTH - wp(280)) / 2 }}>
                          <View style={{ width: wp(280), marginTop: wp(8), alignItems: 'center' }}>
                            {/* Barre XP si possédé */}
                            {own && (
                              <View style={{ width: '100%', marginTop: wp(4) }}>
                                <View style={{ height: wp(4), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(2), overflow: 'hidden' }}>
                                  <View style={{ height: '100%', borderRadius: wp(2), backgroundColor: '#5A4A2E', width: Math.min(100, Math.round((xp / xpNext) * 100)) + '%' }} />
                                </View>
                                <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: wp(3) }}>{xp}/{xpNext} XP</Text>
                              </View>
                            )}

                            {/* Barre fragments si non possédé */}
                            {!own && (
                              <View style={{ width: '100%', marginTop: wp(4) }}>
                                <View style={{ height: wp(4), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(2), overflow: 'hidden' }}>
                                  <View style={{ height: '100%', borderRadius: wp(2), backgroundColor: '#5A4A2E', width: Math.min(100, Math.round((frags / fragsReq) * 100)) + '%' }} />
                                </View>
                                <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: wp(3) }}>🧩 {frags}/{fragsReq} fragments</Text>
                              </View>
                            )}

                            {/* Badge ACTIF */}
                            {own && isActive && (
                              <View style={{ backgroundColor: 'rgba(139,122,46,0.15)', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(2), marginTop: wp(6) }}>
                                <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#8B7A3E' }}>ACTIF ✓</Text>
                              </View>
                            )}
                          </View>

                          {/* Boutons compacts */}
                          <View style={{ width: wp(280), marginTop: wp(6), gap: wp(4) }}>
                            {own ? (
                              <>
                                {!isActive && (
                                  <Pressable delayPressIn={120} onPress={() => switchActiveCharacter(acSlug)} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                                    <LinearGradient colors={['#8B7A2E','#6B5A1E']} style={{ paddingVertical: wp(10), borderRadius: wp(10), alignItems: 'center' }}>
                                      <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF' }}>Équiper</Text>
                                    </LinearGradient>
                                  </Pressable>
                                )}
                                <Pressable delayPressIn={120}
                                  onPress={() => {
                                    if (usesRem === 0) {
                                      showLixAlert('⚡ Recharge nécessaire', 'Recharge ton ' + name + ' avec ' + (ch.recharge_energy || 10) + ' énergie.', [{ text: 'Recharger', color: '#00D984', onPress: () => rechargeChar() }, { text: 'Fermer', style: 'cancel' }], '⚡');
                                    } else {
                                      flipCard();
                                      if (charPowers.length === 0) loadCharPowers(acSlug);
                                    }
                                  }}
                                  style={({ pressed }) => ({ opacity: usesRem === 0 ? 0.5 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                                  <LinearGradient colors={usesRem === 0 ? ['#333A42','#2A2F36'] : ['#3A3520','#2A2815']} style={{ paddingVertical: wp(10), borderRadius: wp(10), alignItems: 'center' }}>
                                    <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#B8A472' }}>{usesRem === 0 ? 'Recharger' : 'Pouvoirs →'}</Text>
                                  </LinearGradient>
                                </Pressable>
                              </>
                            ) : (
                              <Pressable delayPressIn={120} onPress={() => { setSelectedChar(null); setCharFlipped(false); flipAnim.setValue(0); setInlinePowerModal(null); setActiveTab('lixspin'); }}
                                style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                                <View style={{ paddingVertical: wp(10), borderRadius: wp(10), alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                                  <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.3)' }}>Obtenir via Spin Wheel</Text>
                                </View>
                              </Pressable>
                            )}
                            <Pressable onPress={() => { setSelectedChar(null); setCharFlipped(false); flipAnim.setValue(0); setInlinePowerModal(null); }} style={{ paddingVertical: wp(8), alignItems: 'center' }}>
                              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.25)' }}>Fermer</Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    })()}

                    {/* Indicateur de pagination — dots (max 7 visibles) */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: wp(12), gap: wp(4) }}>
                      {(() => {
                        const total = ALL_CHARACTERS.length;
                        const maxDots = 7;
                        let start = Math.max(0, cardViewIndex - Math.floor(maxDots / 2));
                        let end = start + maxDots;
                        if (end > total) { end = total; start = Math.max(0, end - maxDots); }
                        return ALL_CHARACTERS.slice(start, end).map((_, i) => {
                          const realIdx = start + i;
                          return <View key={realIdx} style={{ width: realIdx === cardViewIndex ? wp(8) : wp(5), height: realIdx === cardViewIndex ? wp(8) : wp(5), borderRadius: wp(4), backgroundColor: realIdx === cardViewIndex ? '#B8A472' : 'rgba(255,255,255,0.15)' }} />;
                        });
                      })()}
                    </View>

                    {/* Indication swipe */}
                    {ALL_CHARACTERS.length > 1 && (
                      <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: wp(6), marginBottom: wp(4) }}>← Glisse pour voir les autres →</Text>
                    )}
                  </View>
                </Animated.View>

                {/* DOS — Pouvoirs */}
                <Animated.View style={{ opacity: backInterpolate, position: !charFlipped ? 'absolute' : 'relative', width: '100%' }}>
                  <LinearGradient colors={['#0D0D0D','#111111','#0A0A0A','#080808']} style={{ borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34) }}>
                    <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(16) }} />
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#D4AF37', textAlign: 'center', marginBottom: wp(16) }}>POUVOIRS</Text>

                      {loadingPowers ? (
                        <ActivityIndicator color="#D4AF37" size="large" style={{ marginVertical: wp(30) }} />
                      ) : charPowers.length > 0 ? charPowers.map((power, idx) => {
                        const isUnlocked = power.unlocked;

                        return (
                          <View key={power.power_key || idx} style={{
                            marginBottom: wp(8),
                            backgroundColor: isUnlocked ? 'rgba(0,217,132,0.06)' : 'rgba(255,255,255,0.02)',
                            borderRadius: wp(10), padding: wp(10),
                            borderWidth: 1,
                            borderColor: isUnlocked ? 'rgba(0,217,132,0.15)' : 'rgba(255,255,255,0.05)',
                          }}>
                            {/* Header du pouvoir */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
                              <Text style={{ fontSize: fp(14), marginRight: wp(6) }}>
                                {power.icon || '🔮'}
                              </Text>
                              <Text style={{
                                color: isUnlocked ? '#EAEEF3' : '#555E6C',
                                fontSize: fp(10), fontWeight: '700', flex: 1,
                              }}>
                                {power.name_fr || power.name || power.power_key}
                              </Text>
                              {power.is_superpower && isUnlocked && (
                                <View style={{
                                  backgroundColor: 'rgba(212,175,55,0.1)',
                                  paddingHorizontal: wp(6), paddingVertical: wp(2), borderRadius: wp(4),
                                }}>
                                  <Text style={{ color: '#D4AF37', fontSize: fp(7), fontWeight: '800' }}>
                                    SUPERPOWER
                                  </Text>
                                </View>
                              )}
                              {!isUnlocked && (
                                <Text style={{ color: '#FF6B6B', fontSize: fp(8), fontWeight: '600' }}>
                                  🔒 Niv{power.level_required || power.required_level || 0}
                                </Text>
                              )}
                            </View>

                            {/* Description */}
                            <Text style={{
                              color: isUnlocked ? '#8892A0' : '#444B55',
                              fontSize: fp(8), marginBottom: wp(8),
                            }}>
                              {power.description_fr || power.description || ''}
                            </Text>

                            {/* Bouton d'action — DISPATCH par action_type */}
                            {isUnlocked ? (
                              (() => {
                                switch (power.action_type) {

                                  case 'redirect':
                                    return (
                                      <Pressable delayPressIn={120}
                                        onPress={async () => {
                                          if (shouldConsumePower(power)) {
                                            const r = await consumePower(power.power_key);
                                            if (!r.success) return;
                                          }
                                          setSelectedChar(null); setCharFlipped(false); flipAnim.setValue(0); setInlinePowerModal(null);
                                          showLixAlert('Pouvoir activé', (power.name_fr || power.name || power.power_key) + ' — Redirection...', [{ text: 'OK', color: '#00D984' }], '✨');
                                        }}
                                        style={({ pressed }) => ({
                                          paddingVertical: wp(7), borderRadius: wp(8),
                                          backgroundColor: pressed ? 'rgba(0,217,132,0.15)' : 'rgba(0,217,132,0.08)',
                                          borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                                          alignItems: 'center',
                                        })}
                                      >
                                        <Text style={{ color: '#00D984', fontSize: fp(9), fontWeight: '700' }}>
                                          Ouvrir →
                                        </Text>
                                      </Pressable>
                                    );

                                  case 'redirect_with_boost':
                                    return (
                                      <Pressable delayPressIn={120}
                                        onPress={async () => {
                                          const r = await consumePower(power.power_key);
                                          if (!r.success) return;
                                          setSelectedChar(null); setCharFlipped(false); flipAnim.setValue(0); setInlinePowerModal(null);
                                          showLixAlert('Boost activé !', 'Le boost sera appliqué à ta prochaine activité.', [{ text: 'Super', color: '#D4AF37' }], '🐯');
                                        }}
                                        style={({ pressed }) => ({
                                          paddingVertical: wp(7), borderRadius: wp(8),
                                          backgroundColor: pressed ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.08)',
                                          borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
                                          alignItems: 'center',
                                        })}
                                      >
                                        <Text style={{ color: '#D4AF37', fontSize: fp(9), fontWeight: '700' }}>
                                          Activer le Boost →
                                        </Text>
                                      </Pressable>
                                    );

                                  case 'modal_inline':
                                    return (
                                      <Pressable delayPressIn={120}
                                        onPress={async () => {
                                          if (shouldConsumePower(power)) {
                                            const r = await consumePower(power.power_key);
                                            if (!r.success) return;
                                          }
                                          setInlinePowerModal(power.power_key);
                                        }}
                                        style={({ pressed }) => ({
                                          paddingVertical: wp(7), borderRadius: wp(8),
                                          backgroundColor: pressed ? 'rgba(0,217,132,0.15)' : 'rgba(0,217,132,0.08)',
                                          borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                                          alignItems: 'center',
                                        })}
                                      >
                                        <Text style={{ color: '#00D984', fontSize: fp(9), fontWeight: '700' }}>
                                          Activer
                                        </Text>
                                      </Pressable>
                                    );

                                  case 'toggle':
                                    return (
                                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: '#8892A0', fontSize: fp(9), marginRight: wp(8) }}>
                                          Préférence active
                                        </Text>
                                        <View style={{
                                          width: wp(36), height: wp(20), borderRadius: wp(10),
                                          backgroundColor: 'rgba(0,217,132,0.3)', padding: wp(2),
                                          justifyContent: 'center',
                                        }}>
                                          <View style={{
                                            width: wp(16), height: wp(16), borderRadius: wp(8),
                                            backgroundColor: '#00D984', alignSelf: 'flex-end',
                                          }} />
                                        </View>
                                      </View>
                                    );

                                  default:
                                    return (
                                      <Text style={{ color: '#555E6C', fontSize: fp(8), textAlign: 'center' }}>
                                        Type non supporté
                                      </Text>
                                    );
                                }
                              })()
                            ) : (
                              <View style={{
                                paddingVertical: wp(7), borderRadius: wp(8),
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
                                alignItems: 'center',
                              }}>
                                <Text style={{ color: '#555E6C', fontSize: fp(8) }}>
                                  🔒 Débloque au Niveau {power.level_required || power.required_level || 0}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      }) : (
                        <View style={{ alignItems: 'center', paddingVertical: wp(30) }}>
                          <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.3)' }}>Aucun pouvoir chargé</Text>
                        </View>
                      )}

                      {/* Sous-modals inline */}
                      {inlinePowerModal === 'hawk_micronutriments' && (
                        <View style={{ backgroundColor: 'rgba(77,166,255,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(77,166,255,0.2)' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(6) }}>🔬 Micronutriments</Text>
                          <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(12) }}>Disponible après votre prochain scan Xscan</Text>
                          <Pressable delayPressIn={120} onPress={() => { setSelectedChar(null); setCharFlipped(false); flipAnim.setValue(0); setInlinePowerModal(null); }} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                            <LinearGradient colors={['#4DA6FF','#2E86DE']} style={{ paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center' }}>
                              <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FFF' }}>Scanner maintenant →</Text>
                            </LinearGradient>
                          </Pressable>
                        </View>
                      )}
                      {inlinePowerModal === 'fox_sub_1' && (
                        <View style={{ backgroundColor: 'rgba(255,140,66,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(255,140,66,0.2)' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(6) }}>🔄 Substitution d'ingrédient</Text>
                          <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(12) }}>Scannez un repas puis choisissez un ingrédient à substituer</Text>
                          <Pressable delayPressIn={120} onPress={() => { setSelectedChar(null); setCharFlipped(false); flipAnim.setValue(0); setInlinePowerModal(null); }} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                            <LinearGradient colors={['#FF8C42','#E67E22']} style={{ paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center' }}>
                              <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FFF' }}>Aller au scan →</Text>
                            </LinearGradient>
                          </Pressable>
                        </View>
                      )}
                      {inlinePowerModal === 'gipsy_mood_nutrition' && (
                        <View style={{ backgroundColor: 'rgba(155,109,255,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(155,109,255,0.2)' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>🕸️ Humeur ↔ Nutrition</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: wp(60), marginBottom: wp(10) }}>
                            {['L','M','Me','J','V','S','D'].map((d, i) => {
                              const h = [30, 55, 40, 70, 45, 60, 50][i];
                              return (
                                <View key={d} style={{ alignItems: 'center' }}>
                                  <View style={{ width: wp(16), height: wp(h * 0.8), borderRadius: wp(4), backgroundColor: 'rgba(155,109,255,0.4)' }} />
                                  <Text style={{ fontSize: fp(7), color: 'rgba(255,255,255,0.3)', marginTop: wp(2) }}>{d}</Text>
                                </View>
                              );
                            })}
                          </View>
                          <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>Données simulées — corrélations réelles bientôt disponibles</Text>
                        </View>
                      )}

                      {/* Bouton Retourner */}
                      <Pressable delayPressIn={120} onPress={() => { flipCard(); setInlinePowerModal(null); }} style={({ pressed }) => ({ marginTop: wp(16), transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(14), paddingVertical: wp(14), alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>↩ Retourner</Text>
                        </View>
                      </Pressable>

                      <Pressable onPress={() => { setSelectedChar(null); setCharFlipped(false); flipAnim.setValue(0); setInlinePowerModal(null); }} style={{ paddingVertical: wp(12), alignItems: 'center' }}>
                        <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.3)' }}>Fermer</Text>
                      </Pressable>
                    </ScrollView>
                  </LinearGradient>
                </Animated.View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Modal Détail Personnage (ancien — conservé pour compatibilité) */}
      <Modal visible={showCharDetail} transparent animationType="slide" onRequestClose={() => setShowCharDetail(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }} onPress={() => setShowCharDetail(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34),
                maxHeight: SCREEN_WIDTH * 1.6,
              }}>
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(16) }} />
              <ScrollView showsVerticalScrollIndicator={false}>
                {selectedCharacter && (
                  <View>
                    <View style={{ alignItems: 'center', marginBottom: wp(16) }}>
                      <View style={{
                        width: wp(100), height: wp(100), borderRadius: wp(16),
                        backgroundColor: 'rgba(0,217,132,0.08)',
                        borderWidth: selectedCharacter.level >= 4 ? 2.5 : 1.5,
                        borderColor: selectedCharacter.level >= 5 ? '#D4AF37' : selectedCharacter.level >= 4 ? 'rgba(0,217,132,0.5)' : 'rgba(0,217,132,0.2)',
                        justifyContent: 'center', alignItems: 'center',
                        shadowColor: selectedCharacter.level >= 5 ? '#D4AF37' : '#00D984',
                        shadowOpacity: selectedCharacter.level >= 3 ? 0.5 : 0,
                        shadowRadius: wp(8), elevation: selectedCharacter.level >= 3 ? 6 : 0,
                        marginBottom: wp(8), overflow: 'hidden',
                      }}>
                        {ALL_CHARACTERS.find(c => c.id === selectedCharacter.id)?.image ? (
                          <Image source={ALL_CHARACTERS.find(c => c.id === selectedCharacter.id).image} style={{ width: wp(85), height: wp(85), borderRadius: wp(12) }} resizeMode="cover" />
                        ) : (
                          <Text style={{ fontSize: fp(40) }}>{ALL_CHARACTERS.find(c => c.id === selectedCharacter.id)?.emoji || '🦉'}</Text>
                        )}
                        <View style={{ position: 'absolute', bottom: -wp(6), right: -wp(6), backgroundColor: selectedCharacter.level >= 5 ? '#D4AF37' : '#00D984', borderRadius: wp(10), paddingHorizontal: wp(8), paddingVertical: wp(3), borderWidth: 2, borderColor: '#1E2328' }}>
                          <Text style={{ fontSize: fp(10), fontWeight: '800', color: '#FFF' }}>{selectedCharacter.level >= 6 ? 'MAX' : 'Niv.' + selectedCharacter.level}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: fp(20), fontWeight: '800', color: '#FFF' }}>{selectedCharacter.name}</Text>
                      <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginTop: wp(4) }}>{selectedCharacter.specialty}</Text>
                    </View>
                    <Pressable onPress={() => setShowCharDetail(false)} style={{ paddingVertical: wp(12), alignItems: 'center' }}>
                      <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.3)' }}>Fermer</Text>
                    </Pressable>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal previewChar supprimé — fusionné dans selectedChar */}

    </View>
  );
}