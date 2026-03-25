import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Animated, Dimensions, PixelRatio, StatusBar, Alert, Modal, TextInput, ActivityIndicator, Image } from 'react-native';
import Svg, { Defs, Rect, Path, Circle, Line, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

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
  { id: 'emerald_owl', name: 'EMERALD OWL', tier: 'standard', color: '#00D984', emoji: '🦉', image: require('./assets/emerald_owl.png'), desc: '3 recettes perso gratuites', bonus_abonne: 'Recettes 5→3 Lix', bonus_non_abonne: '3 recettes gratuites', uses: 3, unlock_hours: 0 },
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
  { x: 160, y: 150, color: '#00D984' },
  { x: 240, y: 280, color: '#4DA6FF' },
  { x: 390, y: 90, color: '#9B6DFF' },
  { x: 400, y: 160, color: '#D4AF37' },
  { x: 420, y: 220, color: '#FF8C42' },
  { x: 410, y: 280, color: '#00D984' },
  { x: 500, y: 80, color: '#4DA6FF' },
  { x: 580, y: 100, color: '#FF6B81' },
  { x: 620, y: 140, color: '#00D984' },
  { x: 660, y: 290, color: '#D4AF37' },
  { x: 430, y: 190, color: '#FF8C42' },
  { x: 370, y: 200, color: '#9B6DFF' },
  { x: 200, y: 100, color: '#4DA6FF' },
  { x: 540, y: 60, color: '#00D984' },
  { x: 450, y: 120, color: '#FF6B81' },
];

const FAKE_MATCH = {
  lixtag: 'LXM-8F2K9B',
  display_name: 'Aminata D.',
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
  { rank: 1, names: 'Aminata & Malick', flags: '🇸🇳🇧🇮', flames: 42, pts: 520 },
  { rank: 2, names: 'Kofi & Fatou', flags: '🇬🇭🇲🇱', flames: 38, pts: 480 },
  { rank: 3, names: 'Grace & Samuel', flags: '🇰🇪🇰🇪', flames: 35, pts: 440 },
  { rank: 4, names: 'Aïcha & Omar', flags: '🇹🇳🇩🇿', flames: 30, pts: 390 },
  { rank: 5, names: 'Blessing & Emeka', flags: '🇳🇬🇳🇬', flames: 27, pts: 350 },
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

const LIX_PACKS = [
  { name: 'Micro', price: '$0.99', lix: 990, bonus: '', color: '#00D984' },
  { name: 'Basic', price: '$4.99', lix: 5240, bonus: '+5%', color: '#4DA6FF' },
  { name: 'Standard', price: '$9.99', lix: 10990, bonus: '+10%', color: '#9B6DFF' },
  { name: 'Mega', price: '$29.99', lix: 35990, bonus: '+20%', color: '#D4AF37' },
  { name: 'Ultra', price: '$99.99', lix: 129990, bonus: '+30%', color: '#D4AF37' },
];

export default function LixVersePage() {
  const [activeTab, setActiveTab] = useState('defi');
  const [lixBalance, setLixBalance] = useState(500);
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
  const [wallStickers, setWallStickers] = useState([]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [shakingSticker, setShakingSticker] = useState(null);
  const [stickerCatalog, setStickerCatalog] = useState([]);
  const [myCertification, setMyCertification] = useState(null);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [showStickerCreation, setShowStickerCreation] = useState(false);
  const [selectedStickerChoice, setSelectedStickerChoice] = useState(null);
  const [stickerMessage, setStickerMessage] = useState('');
  const notifScrollX = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  // Binôme states
  const [binomeStatus, setBinomeStatus] = useState('none');
  const [binomePartner, setBinomePartner] = useState(null);
  const [binomeCommonPoints, setBinomeCommonPoints] = useState([]);
  const [binomeDistance, setBinomeDistance] = useState(null);
  const [binomePokes, setBinomePokes] = useState([]);
  const [showLixSignPicker, setShowLixSignPicker] = useState(false);
  const [lixSignCategory, setLixSignCategory] = useState('encouragement');
  const [binomeMessages, setBinomeMessages] = useState([]);
  const [showBinomeAlert, setShowBinomeAlert] = useState({ visible: false, title: '', message: '', icon: null, buttons: [] });
  const [searchProgress, setSearchProgress] = useState(0);
  const [tooltipSign, setTooltipSign] = useState(null);
  const radarAnim = useRef(new Animated.Value(0)).current;
  const radarPulse = useRef(new Animated.Value(0.3)).current;
  const dotPulseAnims = useRef(Array.from({ length: 15 }, () => new Animated.Value(0.3))).current;
  const hdrs = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY };

  useEffect(() => { loadAll(); }, []);
  // Fake realtime — animation aléatoire toutes les 10-20s
  useEffect(() => {
    if (wallStickers.length === 0) return;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * wallStickers.length);
      const randomSticker = wallStickers[randomIdx];
      if (randomSticker) {
        setShakingSticker(randomSticker.id);
        // Ajouter un cœur flottant
        const heartId = Date.now() + Math.random();
        setFloatingHearts(prev => [...prev, { id: heartId, stickerId: randomSticker.id, x: Math.random() * wp(30) - wp(15) }]);
        setTimeout(() => setShakingSticker(null), 600);
        setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== heartId)), 1500);
      }
    }, 10000 + Math.random() * 10000);
    return () => clearInterval(interval);
  }, [wallStickers]);

  useEffect(() => {
    if (notifications.length === 0) return;
    Animated.loop(Animated.timing(notifScrollX, { toValue: -(notifications.length * wp(280)), duration: notifications.length * 5000, useNativeDriver: true })).start();
  }, [notifications]);

  // Binôme — dot pulse animations
  useEffect(() => {
    dotPulseAnims.forEach((anim, i) => {
      const delay = i * 200 + Math.random() * 800;
      setTimeout(() => {
        Animated.loop(Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 1200 + Math.random() * 800, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 1200 + Math.random() * 800, useNativeDriver: true }),
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

  const startBinomeSearch = () => {
    setBinomeStatus('searching');
    setSearchProgress(0);
    // Radar rotation animation
    radarAnim.setValue(0);
    Animated.loop(Animated.timing(radarAnim, { toValue: 360, duration: 2000, useNativeDriver: true })).start();
    // Radar pulse
    Animated.loop(Animated.sequence([
      Animated.timing(radarPulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.timing(radarPulse, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
    ])).start();
    // Progress steps
    const steps = [
      { pct: 20, delay: 1500 },
      { pct: 50, delay: 3000 },
      { pct: 75, delay: 4500 },
      { pct: 100, delay: 6000 },
    ];
    steps.forEach(s => {
      setTimeout(() => setSearchProgress(s.pct), s.delay);
    });
    // After 6s, match found
    setTimeout(() => {
      radarAnim.stopAnimation();
      radarPulse.stopAnimation();
      setBinomePartner(FAKE_MATCH);
      setBinomeCommonPoints(FAKE_MATCH.common_points);
      setBinomeDistance(FAKE_MATCH.distance_km);
      setBinomeStatus('matched');
    }, 6500);
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

  const breakBinome = () => {
    setShowBinomeAlert({
      visible: true,
      title: 'Rompre le Binôme ?',
      message: 'Tu perdras ta connexion avec ' + (binomePartner?.display_name || 'ton binôme') + ' et ton streak.',
      icon: '💔',
      buttons: [
        { text: 'Annuler', style: 'cancel', onPress: () => setShowBinomeAlert({ visible: false, title: '', message: '', icon: null, buttons: [] }) },
        { text: 'Rompre', style: 'destructive', onPress: () => {
          setBinomeStatus('none');
          setBinomePartner(null);
          setBinomeMessages([]);
          setBinomeCommonPoints([]);
          setBinomeDistance(null);
          setSearchProgress(0);
          setShowBinomeAlert({ visible: false, title: '', message: '', icon: null, buttons: [] });
        }},
      ],
    });
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
        Alert.alert('Groupe créé ✓', '"' + newGroupName.trim() + '"\n\nCode : ' + code);
        setShowCreateGroup(false); setNewGroupName(''); loadAll();
      }
    } catch (e) { Alert.alert('Erreur', 'Création échouée.'); }
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) return;
    try {
      const h = { ...hdrs, 'Content-Type': 'application/json' };
      const res = await fetch(SUPABASE_URL + '/rest/v1/lixverse_groups?invite_code=eq.' + joinCode.trim().toUpperCase() + '&select=*', { headers: hdrs });
      const gs = await res.json();
      if (!gs || gs.length === 0) { Alert.alert('Code invalide'); return; }
      const g = gs[0];
      await fetch(SUPABASE_URL + '/rest/v1/lixverse_group_members', { method: 'POST', headers: { ...h, 'Prefer': 'return=minimal' }, body: JSON.stringify({ group_id: g.id, user_id: TEST_USER_ID, lixtag: 'LXM-2K7F4A', country: 'Burundi' }) });
      await fetch(SUPABASE_URL + '/rest/v1/lixverse_groups?id=eq.' + g.id, { method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' }, body: JSON.stringify({ member_count: g.member_count + 1 }) });
      Alert.alert('Rejoint ✓', '"' + g.name + '"'); setShowJoinGroup(false); setJoinCode(''); loadAll();
    } catch (e) { Alert.alert('Erreur', 'Impossible de rejoindre.'); }
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
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.3)' }}>{wallStickers.length} stickers</Text>
        </View>
        {/* Le mur gris métallique */}
        <View style={{
          marginHorizontal: wp(8), borderRadius: wp(16), overflow: 'hidden',
          borderWidth: 2, borderColor: 'rgba(74,79,85,0.6)',
        }}>
          <LinearGradient colors={['#3A3F46', '#2D3238', '#3A3F46', '#333840']}
            style={{ minHeight: wp(280), padding: wp(12), position: 'relative' }}>
            {/* Vis métalliques aux coins */}
            {[[wp(8), wp(8)], [wp(8), null, null, wp(8)], [null, null, wp(8), wp(8)], [null, wp(8), wp(8)]].map((pos, i) => (
              <View key={i} style={{
                position: 'absolute', zIndex: 10,
                top: pos[0] != null ? pos[0] : undefined,
                right: pos[1] != null ? pos[1] : undefined,
                bottom: pos[2] != null ? pos[2] : undefined,
                left: pos[3] != null ? pos[3] : undefined,
                width: wp(10), height: wp(10), borderRadius: wp(5),
                backgroundColor: 'rgba(74,79,85,0.8)',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
              }} />
            ))}
            {/* Titre gravé */}
            <View style={{ alignItems: 'center', marginBottom: wp(12), paddingTop: wp(8) }}>
              <Text style={{ fontSize: fp(8), fontWeight: '700', color: 'rgba(212,175,55,0.4)', letterSpacing: 3 }}>✦ LIXUM WALL OF HEALTH ✦</Text>
            </View>
            {/* Stickers disposés organiquement */}
            {wallStickers.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: wp(40) }}>
                <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.2)' }}>Le mur attend ses premiers héros...</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: wp(10), paddingBottom: wp(8) }}>
                {wallStickers.slice(0, 12).map((sticker, i) => {
                  const isShaking = shakingSticker === sticker.id;
                  const hearts = floatingHearts.filter(h => h.stickerId === sticker.id);
                  return (
                    <View key={sticker.id || i} style={{
                      width: wp(75), alignItems: 'center', padding: wp(6),
                      transform: [
                        { rotate: (sticker.rotation || (i % 2 === 0 ? -5 : 5)) + 'deg' },
                        { translateX: isShaking ? (Math.random() > 0.5 ? wp(2) : -wp(2)) : 0 },
                      ],
                    }}>
                      {/* Cœurs flottants */}
                      {hearts.map(h => (
                        <Text key={h.id} style={{
                          position: 'absolute', top: -wp(10), left: wp(30) + (h.x || 0),
                          fontSize: fp(14), zIndex: 20, opacity: 0.8,
                        }}>🩶</Text>
                      ))}
                      {/* Aimant */}
                      <View style={{
                        width: wp(18), height: wp(6), borderRadius: wp(3),
                        backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: wp(-3), zIndex: 2,
                      }} />
                      {/* Sticker card */}
                      <View style={{
                        backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(10),
                        padding: wp(6), alignItems: 'center', width: '100%',
                        borderWidth: 1, borderColor: isShaking ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                      }}>
                        <Text style={{ fontSize: fp(22) }}>{sticker.sticker_emoji}</Text>
                        <Text style={{ fontSize: fp(7), fontWeight: '600', color: '#FFF', marginTop: wp(3) }} numberOfLines={1}>
                          {sticker.display_name}
                        </Text>
                        <Text style={{ fontSize: fp(6), color: 'rgba(255,255,255,0.35)', marginTop: wp(1), fontStyle: 'italic' }} numberOfLines={1}>
                          {sticker.message}
                        </Text>
                        {/* Like + Gift — directement sur le sticker */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6), marginTop: wp(3) }}>
                          {/* Bouton Like — tap = cœur s'envole + shake */}
                          <Pressable
                            onPress={() => {
                              setWallStickers(prev => prev.map(s => s.id === sticker.id ? { ...s, like_count: (s.like_count || 0) + 1 } : s));
                              setShakingSticker(sticker.id);
                              const hId = Date.now() + Math.random();
                              setFloatingHearts(prev => [...prev, { id: hId, stickerId: sticker.id, x: Math.random() * wp(20) - wp(10) }]);
                              setTimeout(() => setShakingSticker(null), 400);
                              setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== hId)), 1200);
                              fetch(SUPABASE_URL + '/rest/v1/rpc/like_wall_sticker', { method: 'POST', headers: { ...hdrs, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_sticker_id: sticker.id, p_user_id: TEST_USER_ID }) }).catch(() => {});
                            }}
                            style={({ pressed }) => ({
                              flexDirection: 'row', alignItems: 'center', gap: wp(2),
                              transform: [{ scale: pressed ? 1.4 : 1 }],
                            })}
                          >
                            <Text style={{ fontSize: fp(9) }}>🩶</Text>
                            <Text style={{ fontSize: fp(7), color: 'rgba(255,255,255,0.3)' }}>
                              {(sticker.like_count || 0) >= 1000 ? ((sticker.like_count || 0) / 1000).toFixed(1) + 'K' : (sticker.like_count || 0)}
                            </Text>
                          </Pressable>
                          {/* Bouton Cadeau — ouvre le modal gift */}
                          <Pressable
                            onPress={() => { setSelectedSticker(sticker); setShowGiftModal(true); }}
                            style={({ pressed }) => ({ transform: [{ scale: pressed ? 1.3 : 1 }] })}
                          >
                            <Text style={{ fontSize: fp(9) }}>🎁</Text>
                          </Pressable>
                          {sticker.lix_received > 0 && (
                            <Text style={{ fontSize: fp(6), color: 'rgba(212,175,55,0.4)' }}>{sticker.lix_received}L</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
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
          const dl = new Date(ch.registration_deadline); const hLeft = Math.max(0, Math.ceil((dl - new Date()) / 3600000));
          return (
            <Pressable key={ch.id} delayPressIn={120} onPress={() => setSelectedChallenge(selectedChallenge?.id === ch.id ? null : ch)} style={({ pressed }) => ({ borderRadius: wp(16), marginBottom: wp(10), borderWidth: 1.5, borderColor: ch.color + '40', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
              <LinearGradient colors={['#2A2F36', '#1E2328']} style={{ padding: wp(16) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
                  <Text style={{ fontSize: fp(24), marginRight: wp(10) }}>{ch.icon}</Text>
                  <View style={{ flex: 1 }}><Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>{ch.title}</Text><Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>{ch.duration_days}j | Max {ch.max_group_size}/équipe</Text></View>
                  <View style={{ backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3) }}><Text style={{ fontSize: fp(10), fontWeight: '700', color: '#FF6B6B' }}>{hLeft}h</Text></View>
                </View>
                <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', marginBottom: wp(8) }}>{ch.description}</Text>
                <View style={{ flexDirection: 'row', gap: wp(6) }}>
                  {[{ e: '🥇', v: ch.reward_lix_first }, { e: '🥈', v: ch.reward_lix_second }, { e: '🥉', v: ch.reward_lix_third }].map((r, j) => (
                    <View key={j} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: j === 0 ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.05)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3), gap: wp(4) }}>
                      <Text style={{ fontSize: fp(10) }}>{r.e}</Text><Text style={{ fontSize: fp(10), fontWeight: '600', color: j === 0 ? '#D4AF37' : 'rgba(255,255,255,0.4)' }}>{r.v} Lix</Text>
                    </View>
                  ))}
                </View>
                {selectedChallenge?.id === ch.id && (
                  <View style={{ marginTop: wp(10), flexDirection: 'row', gap: wp(8) }}>
                    <Pressable onPress={() => setShowCreateGroup(true)} style={{ flex: 1, paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center', backgroundColor: ch.color + '20', borderWidth: 1, borderColor: ch.color + '40' }}><Text style={{ fontSize: fp(12), fontWeight: '700', color: ch.color }}>Créer un groupe</Text></Pressable>
                    <Pressable onPress={() => setShowJoinGroup(true)} style={{ flex: 1, paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}><Text style={{ fontSize: fp(12), fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>Rejoindre</Text></Pressable>
                  </View>
                )}
              </LinearGradient>
            </Pressable>
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
    if (lixBalance < crate.cost) { Alert.alert('Lix insuffisants', 'Il faut ' + crate.cost + ' Lix.\nTon solde: ' + lixBalance); return; }
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
    Alert.alert(crate.emoji + ' ' + crate.name, msg);
    const h = { ...hdrs, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };
    if (cardWon && !cardDup) {
      fetch(SUPABASE_URL + '/rest/v1/lixverse_user_characters', { method: 'POST', headers: h, body: JSON.stringify({ user_id: TEST_USER_ID, character_id: cardWon.id, tier: cardWon.tier, obtained_via: 'crate' }) }).catch(() => {});
      fetch(SUPABASE_URL + '/rest/v1/lixverse_notifications', { method: 'POST', headers: h, body: JSON.stringify({ notification_type: 'character_won', lixtag: 'LXM-2K7F4A', message: 'LXM-2K7F4A a obtenu ' + cardWon.name + ' !', character_id: cardWon.id, color: cardWon.color }) }).catch(() => {});
    }
    fetch(SUPABASE_URL + '/rest/v1/lixverse_crate_history', { method: 'POST', headers: h, body: JSON.stringify({ user_id: TEST_USER_ID, crate_type: crate.id, lix_spent: crate.cost, character_won: cardWon ? cardWon.id : 'none', was_doublon: cardDup, lix_refunded: cardRef }) }).catch(() => {});
  };

  const renderCharactersTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(100) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(16) }}>
        <View><Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Ma collection</Text><Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>{ownedCharacters.length}/13</Text></View>
        <View style={{ backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(6), borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' }}><Text style={{ fontSize: fp(11), fontWeight: '700', color: '#D4AF37' }}>{Math.round((ownedCharacters.length / 13) * 100)}%</Text></View>
      </View>
      {['standard', 'rare', 'elite', 'hyper', 'ultimate'].map(tier => {
        const cfg = TIER_CONFIG[tier]; const chars = ALL_CHARACTERS.filter(c => c.tier === tier);
        return (
          <View key={tier} style={{ marginBottom: wp(20) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8), marginBottom: wp(10) }}><View style={{ backgroundColor: cfg.bg, borderRadius: wp(8), paddingHorizontal: wp(10), paddingVertical: wp(4) }}><Text style={{ fontSize: fp(11), fontWeight: '700', color: cfg.color }}>{cfg.label}</Text></View><Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.3)' }}>{chars.filter(c => ownedCharacters.includes(c.id)).length}/{chars.length}</Text></View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(8) }}>
              {chars.map(ch => {
                const own = ownedCharacters.includes(ch.id);
                return (
                  <Pressable key={ch.id} delayPressIn={120} onPress={() => setShowCharacterDetail(ch)}
                    style={({ pressed }) => ({
                      width: (SCREEN_WIDTH - wp(48)) / 3,
                      borderRadius: wp(14), overflow: 'hidden',
                      backgroundColor: own ? cfg.bg : 'rgba(255,255,255,0.03)',
                      borderWidth: own ? 1.5 : 1,
                      borderColor: own ? cfg.border : 'rgba(255,255,255,0.08)',
                      transform: [{ scale: pressed ? 0.93 : 1 }],
                    })}>
                    {/* Image miniature */}
                    <View style={{ width: '100%', height: wp(80), justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                      {ch.image ? (
                        <Image source={ch.image} style={{ width: '100%', height: wp(80), resizeMode: 'cover', opacity: own ? 1 : 0.25 }} />
                      ) : (
                        <Text style={{ fontSize: fp(32), opacity: own ? 1 : 0.25 }}>{ch.emoji}</Text>
                      )}
                      {!own && (
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' }}>
                          <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                            <Rect x="3" y="11" width="18" height="11" rx="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
                            <Path d="M7 11V7a5 5 0 0110 0v4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                          </Svg>
                        </View>
                      )}
                    </View>
                    <View style={{ padding: wp(6), alignItems: 'center' }}>
                      <Text style={{ fontSize: fp(8), fontWeight: '700', textAlign: 'center', color: own ? cfg.color : 'rgba(255,255,255,0.4)' }}>{ch.name}</Text>
                      {own ? (
                        <View style={{ backgroundColor: cfg.color, borderRadius: wp(4), paddingHorizontal: wp(5), paddingVertical: wp(1), marginTop: wp(3) }}>
                          <Text style={{ fontSize: fp(6), fontWeight: '700', color: '#FFF' }}>POSSÉDÉ</Text>
                        </View>
                      ) : (
                        <Text style={{ fontSize: fp(6), color: 'rgba(255,255,255,0.2)', marginTop: wp(3) }}>Non possédé</Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
      <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12), marginTop: wp(8) }}>Ouvrir une caisse</Text>
      {CRATES.map(cr => (
        <Pressable key={cr.id} delayPressIn={120} onPress={() => openCrate(cr)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: wp(14), borderRadius: wp(14), marginBottom: wp(8), borderWidth: 1.5, borderColor: cr.color + '40', backgroundColor: cr.color + '08', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
          <Text style={{ fontSize: fp(28), marginRight: wp(12) }}>{cr.emoji}</Text>
          <View style={{ flex: 1 }}><Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{cr.name}</Text><Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>{cr.desc}</Text></View>
          <View style={{ backgroundColor: cr.color + '25', borderRadius: wp(10), paddingHorizontal: wp(10), paddingVertical: wp(5) }}><Text style={{ fontSize: fp(12), fontWeight: '700', color: cr.color }}>{cr.cost}</Text></View>
        </Pressable>
      ))}
    </ScrollView>
  );
  const doSpin = () => {
    if (isSpinning) return;
    const cost = freeSpinUsed ? 50 : 0;
    if (cost > 0 && lixBalance < cost) { Alert.alert('Lix insuffisants', 'Il faut 50 Lix.\nSolde: ' + lixBalance); return; }
    setIsSpinning(true); setSpinResult(null);
    if (cost > 0) setLixBalance(p => p - cost);
    if (!freeSpinUsed) setFreeSpinUsed(true);
    const tw = SPIN_RESULTS.reduce((s, r) => s + r.weight, 0);
    let rn = Math.random() * tw; let res = SPIN_RESULTS[0];
    for (const r of SPIN_RESULTS) { rn -= r.weight; if (rn <= 0) { res = r; break; } }
    spinAnim.setValue(0);
    Animated.timing(spinAnim, { toValue: (5 + Math.random() * 3) * 360, duration: 3000 + Math.random() * 1500, useNativeDriver: true }).start(() => {
      setIsSpinning(false); setSpinResult(res);
      if (res.type === 'lix') setLixBalance(p => p + res.value);
      fetch(SUPABASE_URL + '/rest/v1/lixverse_spin_history', { method: 'POST', headers: { ...hdrs, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }, body: JSON.stringify({ user_id: TEST_USER_ID, result_type: res.type, result_value: String(res.value), lix_spent: cost, was_free: cost === 0 }) }).catch(() => {});
    });
  };

  const renderLixSpinTab = () => {
    const spinCost = freeSpinUsed ? 50 : 0;
    const rot = spinAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: wp(100) }}>
        <View style={{ alignItems: 'center', paddingTop: wp(16), marginBottom: wp(20) }}>
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginBottom: wp(4) }}>MON SOLDE</Text>
          <Text style={{ fontSize: fp(32), fontWeight: '800', color: '#D4AF37' }}>{lixBalance.toLocaleString('fr-FR')}</Text>
          <Text style={{ fontSize: fp(12), color: 'rgba(212,175,55,0.5)' }}>Lix</Text>
        </View>
        <View style={{ alignItems: 'center', marginBottom: wp(24) }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(14) }}>Spin Wheel</Text>
          {!freeSpinUsed && <View style={{ backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: wp(10), paddingHorizontal: wp(14), paddingVertical: wp(6), marginBottom: wp(14), borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)' }}><Text style={{ fontSize: fp(12), fontWeight: '600', color: '#00D984' }}>1 tour gratuit !</Text></View>}
          <View style={{ width: wp(200), height: wp(200), marginBottom: wp(16) }}>
            <Animated.View style={{ width: wp(200), height: wp(200), borderRadius: wp(100), borderWidth: wp(4), borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.04)', transform: [{ rotate: rot }] }}>
              {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (<View key={i} style={{ position: 'absolute', width: wp(2), height: wp(80), backgroundColor: ['#00D984','#4DA6FF','#FF8C42','#9B6DFF','#D4AF37','#FF6B6B','#00D984','#4DA6FF','#FF8C42','#9B6DFF','#D4AF37','#FF6B6B'][i] + '30', top: wp(20), left: wp(99), transform: [{ rotate: (i*30)+'deg' }], transformOrigin: 'bottom center' }} />))}
              <View style={{ width: wp(50), height: wp(50), borderRadius: wp(25), backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: fp(10), fontWeight: '800', color: '#FFF' }}>LIX</Text></View>
            </Animated.View>
          </View>
          <Pressable delayPressIn={120} onPress={doSpin} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], opacity: isSpinning ? 0.5 : 1 })}>
            <LinearGradient colors={spinCost === 0 ? ['#00D984','#00B871'] : ['#D4AF37','#B8941F']} style={{ paddingHorizontal: wp(36), paddingVertical: wp(14), borderRadius: wp(24) }}>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>{isSpinning ? '...' : spinCost === 0 ? 'Tourner GRATUIT' : 'Tourner — 50 Lix'}</Text>
            </LinearGradient>
          </Pressable>
          {spinResult && <View style={{ marginTop: wp(16), paddingVertical: wp(14), paddingHorizontal: wp(24), borderRadius: wp(14), alignItems: 'center', backgroundColor: spinResult.color + '15', borderWidth: 1, borderColor: spinResult.color + '30' }}><Text style={{ fontSize: fp(18), fontWeight: '700', color: spinResult.type === 'nothing' ? 'rgba(255,255,255,0.3)' : spinResult.color }}>{spinResult.type === 'nothing' ? '😔 Rien' : '🎉 ' + spinResult.label}</Text></View>}
        </View>
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: wp(16), marginBottom: wp(20) }} />
        <View style={{ paddingHorizontal: wp(16) }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Acheter des Lix</Text>
          {[{ n: 'Micro', p: '$0.99', l: 990, b: '', c: '#00D984' }, { n: 'Basic', p: '$4.99', l: 5240, b: '+5%', c: '#4DA6FF' }, { n: 'Standard', p: '$9.99', l: 10990, b: '+10%', c: '#9B6DFF' }, { n: 'Mega', p: '$29.99', l: 35990, b: '+20%', c: '#D4AF37' }, { n: 'Ultra', p: '$99.99', l: 129990, b: '+30%', c: '#D4AF37' }].map((pk, i) => (
            <Pressable key={i} delayPressIn={120} onPress={() => Alert.alert('Achat', pk.n + ' : ' + pk.p + ' → ' + pk.l.toLocaleString('fr-FR') + ' Lix\n\nBientôt disponible.')} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: wp(14), borderRadius: wp(14), marginBottom: wp(8), backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: pk.c + '25', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
              <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: pk.c + '15', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}><Text style={{ fontSize: fp(16), fontWeight: '800', color: pk.c }}>L</Text></View>
              <View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}><Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{pk.n}</Text>{pk.b ? <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: wp(6), paddingHorizontal: wp(6), paddingVertical: wp(1) }}><Text style={{ fontSize: fp(9), fontWeight: '700', color: '#D4AF37' }}>{pk.b}</Text></View> : null}</View><Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>{pk.l.toLocaleString('fr-FR')} Lix</Text></View>
              <View style={{ backgroundColor: pk.c + '20', borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(6) }}><Text style={{ fontSize: fp(13), fontWeight: '700', color: pk.c }}>{pk.p}</Text></View>
            </Pressable>
          ))}
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: wp(12) }}>Les Lix ne débloquent pas le premium. Abonnez-vous pour MedicAi et plus.</Text>
        </View>
        <View style={{ paddingHorizontal: wp(16), marginTop: wp(24) }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Recharger énergie</Text>
          {[{ n: 'Mini', e: 30, l: 300, d: '~3 chats' }, { n: 'Standard', e: 80, l: 700, d: '~8 chats' }, { n: 'XL', e: 200, l: 1500, d: '~20 chats' }].map((pk, i) => (
            <Pressable key={i} delayPressIn={120} onPress={() => { if (lixBalance < pk.l) { Alert.alert('Insuffisant', pk.l + ' Lix requis'); return; } setLixBalance(p => p - pk.l); Alert.alert('✓', '+' + pk.e + ' énergie !'); }} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: wp(12), borderRadius: wp(12), marginBottom: wp(6), backgroundColor: 'rgba(0,217,132,0.05)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.12)', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
              <Text style={{ fontSize: fp(14), marginRight: wp(10) }}>⚡</Text>
              <View style={{ flex: 1 }}><Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>+{pk.e} énergie</Text><Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>{pk.d}</Text></View>
              <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#00D984' }}>{pk.l} Lix</Text>
            </Pressable>
          ))}
        </View>
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

  const renderBinomeTab = () => {
    const radarRotate = radarAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
    const searchTexts = ['Analyse de votre profil...', 'Recherche de profils compatibles...', 'Calcul des points communs...', 'Binôme trouvé !'];
    const searchTextIdx = searchProgress < 20 ? 0 : searchProgress < 50 ? 1 : searchProgress < 75 ? 2 : 3;

    if (binomeStatus === 'matched' && binomePartner) {
      const myCalories = 1200;
      const myBurned = 280;
      const myMood = '💪';
      const myWeather = '🌤️';
      return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: wp(100), paddingHorizontal: wp(16), paddingTop: wp(12) }}>
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

    // État searching ou none
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: wp(100), paddingHorizontal: wp(16), paddingTop: wp(16), alignItems: 'center' }}>
        <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#D4AF37', letterSpacing: 2, marginBottom: wp(4) }}>BINÔME</Text>
        <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginBottom: wp(16) }}>Trouve ton partenaire santé</Text>

        {/* Carte du monde */}
        <View style={{ backgroundColor: '#1A1D22', borderRadius: wp(16), overflow: 'hidden', padding: wp(8), marginBottom: wp(12), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', position: 'relative' }}>
          <Svg width={SCREEN_WIDTH - wp(48)} height={wp(160)} viewBox="0 0 800 400">
            <Rect width="800" height="400" fill="transparent" />
            <Path d="M120,120 C130,80 180,60 200,80 C220,60 260,70 270,100 C280,130 260,180 240,200 C220,220 180,240 160,220 C140,200 110,160 120,120Z" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="rgba(255,255,255,0.02)" />
            <Path d="M370,130 C380,100 420,90 440,110 C460,130 470,180 460,230 C450,270 430,300 410,310 C390,300 370,270 365,230 C360,190 360,160 370,130Z" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="rgba(255,255,255,0.03)" />
            <Path d="M360,60 C370,40 410,30 430,50 C440,60 445,80 440,100 C430,110 400,115 380,105 C370,95 355,80 360,60Z" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="rgba(255,255,255,0.02)" />
            <Path d="M450,50 C480,30 560,20 620,40 C660,55 680,90 670,130 C660,160 620,170 580,160 C540,150 500,130 480,110 C460,90 440,70 450,50Z" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="rgba(255,255,255,0.02)" />
            <Path d="M220,230 C240,210 260,220 270,250 C275,280 265,320 250,340 C235,350 220,340 215,310 C210,280 210,250 220,230Z" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="rgba(255,255,255,0.02)" />
            <Path d="M620,270 C640,255 680,260 690,280 C695,300 680,320 660,325 C640,320 615,300 620,270Z" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="rgba(255,255,255,0.02)" />
            {WORLD_DOTS.map((dot, i) => (
              <Circle key={i} cx={dot.x} cy={dot.y} r={4} fill={dot.color} opacity={0.7} />
            ))}
          </Svg>
          {/* Animated dot overlays */}
          {WORLD_DOTS.map((dot, i) => {
            const mapW = SCREEN_WIDTH - wp(48);
            const dotX = (dot.x / 800) * mapW + wp(8);
            const dotY = (dot.y / 400) * wp(160) + wp(8);
            return (
              <Animated.View key={'pulse' + i} style={{
                position: 'absolute', left: dotX - wp(4), top: dotY - wp(4),
                width: wp(8), height: wp(8), borderRadius: wp(4),
                backgroundColor: dot.color,
                opacity: dotPulseAnims[i],
              }} />
            );
          })}
          {/* Radar overlay when searching */}
          {binomeStatus === 'searching' && (
            <Animated.View style={{
              position: 'absolute', top: wp(8) + wp(80) - wp(60),
              left: (SCREEN_WIDTH - wp(48)) / 2 + wp(8) - wp(60),
              width: wp(120), height: wp(120), borderRadius: wp(60),
              borderWidth: 2, borderColor: 'rgba(212,175,55,0.4)',
              opacity: radarPulse,
              transform: [{ rotate: radarRotate }],
            }}>
              <View style={{ position: 'absolute', top: 0, left: wp(59), width: wp(2), height: wp(60), backgroundColor: 'rgba(212,175,55,0.5)' }} />
            </Animated.View>
          )}
        </View>

        <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', marginBottom: wp(20) }}>4 832 membres actifs</Text>

        {binomeStatus === 'searching' ? (
          <View style={{ width: '100%', alignItems: 'center' }}>
            {/* Progress bar */}
            <View style={{ width: '100%', height: wp(6), borderRadius: wp(3), backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: wp(10) }}>
              <View style={{ height: '100%', width: searchProgress + '%', borderRadius: wp(3), backgroundColor: '#D4AF37' }} />
            </View>
            <Text style={{ fontSize: fp(12), color: searchProgress >= 75 ? '#00D984' : '#D4AF37', fontWeight: '600' }}>
              {searchTexts[searchTextIdx]}
            </Text>
          </View>
        ) : (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Pressable delayPressIn={120} onPress={startBinomeSearch} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], width: '100%' })}>
              <LinearGradient colors={['#D4AF37', '#B8941F']} style={{ paddingVertical: wp(16), borderRadius: wp(16), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Appeler mon Binôme</Text>
              </LinearGradient>
            </Pressable>
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.25)', marginTop: wp(12), textAlign: 'center' }}>
              Matching basé sur : objectifs, régime, activités
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={{flex:1}}>
      <LinearGradient colors={['#1A1D22','#252A30','#1E2328']} style={{flex:1}}>
        <StatusBar barStyle="light-content"/>
        <View style={{paddingTop:Platform.OS==='android'?35:50,paddingBottom:wp(6),paddingHorizontal:wp(16),flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <View>
            <Text style={{fontSize:fp(24),fontWeight:'800',color:'#D4AF37',letterSpacing:1}}>LixVerse</Text>
            <Text style={{fontSize:fp(9),color:'rgba(255,255,255,0.3)',letterSpacing:2.5}}>UNIVERS LIXUM</Text>
          </View>
          <View style={{flexDirection:'row',alignItems:'center',gap:wp(6),backgroundColor:'rgba(212,175,55,0.12)',borderRadius:wp(12),paddingHorizontal:wp(12),paddingVertical:wp(6),borderWidth:1,borderColor:'rgba(212,175,55,0.25)'}}>
            <View style={{width:wp(10),height:wp(10),borderRadius:wp(5),backgroundColor:'#D4AF37'}}/>
            <Text style={{fontSize:fp(14),fontWeight:'700',color:'#D4AF37'}}>{lixBalance} Lix</Text>
          </View>
        </View>
        {notifications.length>0&&(<View style={{height:wp(28),backgroundColor:'rgba(212,175,55,0.06)',borderBottomWidth:1,borderBottomColor:'rgba(212,175,55,0.1)',overflow:'hidden',justifyContent:'center'}}><Animated.View style={{flexDirection:'row',transform:[{translateX:notifScrollX}]}}>{[...notifications,...notifications].map((n,i)=>(<View key={i} style={{width:wp(280),flexDirection:'row',alignItems:'center',paddingHorizontal:wp(10),gap:wp(6)}}><View style={{width:wp(6),height:wp(6),borderRadius:wp(3),backgroundColor:n.color||'#D4AF37'}}/><Text style={{fontSize:fp(10),color:'rgba(255,255,255,0.5)',flex:1}} numberOfLines={1}>{n.message}</Text></View>))}</Animated.View></View>)}
        <View style={{flexDirection:'row',marginHorizontal:wp(16),marginVertical:wp(10),gap:wp(6)}}>
          {[{key:'defi',label:'Défi',icon:'🏆'},{key:'binome',label:'Binôme',icon:'🤝'},{key:'characters',label:'Caractères',icon:'🃏'},{key:'lixspin',label:'Lix & Spin',icon:'💎'}].map(tab=>(<Pressable key={tab.key} onPress={()=>setActiveTab(tab.key)} style={{flex:1,paddingVertical:wp(10),borderRadius:wp(12),alignItems:'center',backgroundColor:activeTab===tab.key?'#D4AF37':'rgba(255,255,255,0.05)',borderWidth:1,borderColor:activeTab===tab.key?'#D4AF37':'rgba(255,255,255,0.08)'}}><Text style={{fontSize:fp(14)}}>{tab.icon}</Text><Text style={{fontSize:fp(10),fontWeight:'600',marginTop:wp(2),color:activeTab===tab.key?'#1A1D22':'rgba(255,255,255,0.4)'}}>{tab.label}</Text></Pressable>))}
        </View>
        {activeTab==='defi'&&renderDefiTab()}
        {activeTab==='binome'&&renderBinomeTab()}
        {activeTab==='characters'&&renderCharactersTab()}
        {activeTab==='lixspin'&&renderLixSpinTab()}
      </LinearGradient>
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
                    if (lixBalance < amount) { Alert.alert('Lix insuffisants'); return; }
                    setLixBalance(p => p - amount);
                    setSelectedSticker(s => ({ ...s, lix_received: (s.lix_received || 0) + amount }));
                    setWallStickers(prev => prev.map(s => s.id === selectedSticker.id ? { ...s, lix_received: (s.lix_received || 0) + amount } : s));
                    fetch(SUPABASE_URL + '/rest/v1/rpc/gift_lix_to_sticker', { method: 'POST', headers: { ...hdrs, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_sticker_id: selectedSticker.id, p_from_user_id: TEST_USER_ID, p_amount: amount }) }).catch(() => {});
                    Alert.alert('Merci 🎁', amount + ' Lix offerts à ' + selectedSticker.display_name + ' !');
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
                  if (!selectedStickerChoice) { Alert.alert('Choisis un sticker'); return; }
                  if (!stickerMessage.trim()) { Alert.alert('Écris ton message'); return; }
                  const cost = selectedStickerChoice.cost_lix || 0;
                  if (cost > 0 && lixBalance < cost) { Alert.alert('Lix insuffisants', 'Il te faut ' + cost + ' Lix pour ce sticker.'); return; }
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
                  Alert.alert('🎉 Sticker collé !', 'Ton sticker est maintenant visible sur le Wall of Health. Les membres peuvent te liker et t\'offrir des Lix !');
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
    </View>
  );
}