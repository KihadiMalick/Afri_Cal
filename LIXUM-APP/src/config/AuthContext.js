import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
var NotificationService = require('../services/NotificationService');

var AuthContext = createContext(null);

export function AuthProvider(props) {
  var _userId = useState(null);
  var userId = _userId[0], setUserId = _userId[1];

  var _isLoading = useState(true);
  var isLoading = _isLoading[0], setIsLoading = _isLoading[1];

  var _isAuthenticated = useState(false);
  var isAuthenticated = _isAuthenticated[0], setIsAuthenticated = _isAuthenticated[1];

  // === SHARED LIX BALANCE & ENERGY ===
  var _lixBalance = useState(0);
  var lixBalance = _lixBalance[0], setLixBalance = _lixBalance[1];

  var _energy = useState(20);
  var energy = _energy[0], setEnergy = _energy[1];

  // === SUBSCRIPTION & ENERGY GATES ===
  var _subscriptionTier = useState('free');
  var subscriptionTier = _subscriptionTier[0], setSubscriptionTier = _subscriptionTier[1];

  var _subscriptionExpiresAt = useState(null);
  var subscriptionExpiresAt = _subscriptionExpiresAt[0], setSubscriptionExpiresAt = _subscriptionExpiresAt[1];

  var _onboardingUsage = useState({ xscan: 0, gallery: 0, chat: 0, recipe: 0, medic: 0, cartscan: 0 });
  var onboardingUsage = _onboardingUsage[0], setOnboardingUsage = _onboardingUsage[1];

  var _pushToken = useState(null);
  var pushToken = _pushToken[0], setPushToken = _pushToken[1];

  // === ALIXEN NOTIFICATIONS STATE ===
  var _alixenNotifications = useState([]);
  var alixenNotifications = _alixenNotifications[0], setAlixenNotifications = _alixenNotifications[1];
  var _alixenNotifCount = useState(0);
  var alixenNotifCount = _alixenNotifCount[0], setAlixenNotifCount = _alixenNotifCount[1];

  // === LIXVERSE USER NOTIFICATIONS STATE ===
  var _lixverseNotifications = useState([]);
  var lixverseNotifications = _lixverseNotifications[0], setLixverseNotifications = _lixverseNotifications[1];
  var _lixverseNotifCount = useState(0);
  var lixverseNotifCount = _lixverseNotifCount[0], setLixverseNotifCount = _lixverseNotifCount[1];

  var fetchAlixenNotifications = useCallback(async function() {
    if (!userId) { setAlixenNotifications([]); setAlixenNotifCount(0); return; }
    try {
      var { data, error } = await supabase.rpc('get_unread_notifications', { p_user_id: userId });
      if (error) {
        console.warn('[LIXUM Notifications] RPC error:', error.message || error);
        setAlixenNotifications([]);
        setAlixenNotifCount(0);
        return;
      }
      if (!Array.isArray(data)) {
        console.warn('[LIXUM Notifications] RPC returned non-array:', typeof data);
        setAlixenNotifications([]);
        setAlixenNotifCount(0);
        return;
      }
      var sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      var filtered = data.filter(function(n) {
        return n && typeof n === 'object' && n.id && (!n.created_at || new Date(n.created_at) > sevenDaysAgo);
      }).slice(0, 20);
      setAlixenNotifications(filtered);
      setAlixenNotifCount(filtered.length);
    } catch (e) {
      console.warn('[LIXUM Notifications] fetch error:', e);
      setAlixenNotifications([]);
      setAlixenNotifCount(0);
    }
  }, [userId]);

  var markNotificationRead = useCallback(async function(notifId) {
    try {
      await supabase.rpc('mark_notification_read', { p_user_id: userId, p_notification_id: notifId });
      setAlixenNotifications(function(prev) { return prev.filter(function(n) { return n.id !== notifId; }); });
      setAlixenNotifCount(function(prev) { return Math.max(0, prev - 1); });
    } catch (e) {
      console.warn('markNotificationRead error:', e);
    }
  }, [userId]);

  var markAllNotificationsRead = useCallback(async function() {
    try {
      await supabase.rpc('mark_all_notifications_read', { p_user_id: userId });
      setAlixenNotifications([]);
      setAlixenNotifCount(0);
    } catch (e) {
      console.warn('markAllNotificationsRead error:', e);
    }
  }, [userId]);

  var fetchLixverseNotifications = useCallback(async function() {
    if (!userId) { setLixverseNotifications([]); setLixverseNotifCount(0); return; }
    try {
      var { data, error } = await supabase.rpc('get_unread_lixverse_notifications', { p_user_id: userId });
      if (error) {
        console.warn('[LIXUM LixVerse Notifs] RPC error:', error.message || error);
        setLixverseNotifications([]);
        setLixverseNotifCount(0);
        return;
      }
      if (!Array.isArray(data)) {
        console.warn('[LIXUM LixVerse Notifs] RPC returned non-array:', typeof data);
        setLixverseNotifications([]);
        setLixverseNotifCount(0);
        return;
      }
      var filtered = data.filter(function(n) {
        return n && typeof n === 'object' && n.id;
      }).slice(0, 20);
      setLixverseNotifications(filtered);
      setLixverseNotifCount(filtered.length);
    } catch (e) {
      console.warn('[LIXUM LixVerse Notifs] fetch error:', e);
      setLixverseNotifications([]);
      setLixverseNotifCount(0);
    }
  }, [userId]);

  var markLixverseNotificationRead = useCallback(async function(notifId) {
    try {
      await supabase.rpc('mark_lixverse_notification_read', { p_user_id: userId, p_notification_id: notifId });
      setLixverseNotifications(function(prev) { return prev.map(function(n) { return n.id === notifId ? Object.assign({}, n, { read_at: new Date().toISOString() }) : n; }); });
      setLixverseNotifCount(function(prev) { return Math.max(0, prev - 1); });
    } catch (e) {
      console.warn('markLixverseNotificationRead error:', e);
    }
  }, [userId]);

  var markAllLixverseNotificationsRead = useCallback(async function() {
    try {
      await supabase.rpc('mark_all_lixverse_notifications_read', { p_user_id: userId });
      setLixverseNotifications(function(prev) { return prev.map(function(n) { return Object.assign({}, n, { read_at: new Date().toISOString() }); }); });
      setLixverseNotifCount(0);
    } catch (e) {
      console.warn('markAllLixverseNotificationsRead error:', e);
    }
  }, [userId]);

  var updateLixBalance = useCallback(function(newBalance) {
    setLixBalance(newBalance);
  }, []);

  var updateEnergy = useCallback(function(newEnergy) {
    setEnergy(newEnergy);
  }, []);

  var refreshLixFromServer = useCallback(async function() {
    if (!userId) return;
    try {
      var { data } = await supabase
        .from('users_profile')
        .select('lix_balance, energy, subscription_tier, subscription_expires_at, onboarding_xscan_used, onboarding_gallery_used, onboarding_chat_used, onboarding_recipe_used, onboarding_medic_used, onboarding_cartscan_used')
        .eq('user_id', userId)
        .single();
      if (data) {
        setLixBalance(data.lix_balance || 0);
        setEnergy(data.energy || 20);
        setSubscriptionTier(data.subscription_tier || 'free');
        setSubscriptionExpiresAt(data.subscription_expires_at || null);
        setOnboardingUsage({
          xscan: data.onboarding_xscan_used || 0,
          gallery: data.onboarding_gallery_used || 0,
          chat: data.onboarding_chat_used || 0,
          recipe: data.onboarding_recipe_used || 0,
          medic: data.onboarding_medic_used || 0,
          cartscan: data.onboarding_cartscan_used || 0
        });
      }
    } catch (e) {
      console.warn('refreshLixFromServer error:', e);
    }
  }, [userId]);

  // Load initial balance when userId is set + ALIXEN notifs
  // [BUG FIXÉ - 17 Avril 2026]
  // Système ALIXEN notifications complet : refresh balance + génération auto + fetch unread.
  // FIX: supabase.rpc() en supabase-js 2.102.1 retourne un thenable sans .catch() natif.
  // Wrappé dans Promise.resolve() + .then(null, errorHandler) pour forcer une vraie Promise.
  useEffect(function() {
    if (userId) {
      refreshLixFromServer();
      Promise.resolve(supabase.rpc('check_and_generate_notifications', { p_user_id: userId })).then(null, function(e) { console.warn('check_and_generate_notifications error:', e); });
      fetchAlixenNotifications();
      fetchLixverseNotifications();
    }
  }, [userId, refreshLixFromServer, fetchAlixenNotifications, fetchLixverseNotifications]);

  useEffect(function() {
    // 1. Verifier la session existante au demarrage
    supabase.auth.getSession().then(function(result) {
      var session = result.data.session;
      if (session && session.user) {
        setUserId(session.user.id);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    }).catch(function(err) {
      console.warn('AuthContext getSession error:', err);
      setIsLoading(false);
    });

    // 2. Ecouter les changements d'etat auth (login/logout/refresh)
    var listener = supabase.auth.onAuthStateChange(function(event, session) {
      if (session && session.user) {
        setUserId(session.user.id);
        setIsAuthenticated(true);
      } else {
        setUserId(null);
        setIsAuthenticated(false);
        setLixBalance(0);
        setEnergy(20);
        setSubscriptionTier('free');
        setSubscriptionExpiresAt(null);
        setOnboardingUsage({ xscan: 0, gallery: 0, chat: 0, recipe: 0, medic: 0, cartscan: 0 });
        setAlixenNotifications([]);
        setAlixenNotifCount(0);
        setLixverseNotifications([]);
        setLixverseNotifCount(0);
      }
    });

    return function() {
      if (listener && listener.data && listener.data.subscription) {
        listener.data.subscription.unsubscribe();
      }
    };
  }, []);

  var signOut = async function() {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.multiRemove(['lixum_access_token', 'lixum_user_id']);
      setUserId(null);
      setIsAuthenticated(false);
      setLixBalance(0);
      setEnergy(20);
      setSubscriptionTier('free');
      setSubscriptionExpiresAt(null);
      setOnboardingUsage({ xscan: 0, gallery: 0, chat: 0, recipe: 0, medic: 0, cartscan: 0 });
      setAlixenNotifications([]);
      setAlixenNotifCount(0);
      setLixverseNotifications([]);
      setLixverseNotifCount(0);
    } catch (err) {
      console.warn('signOut error:', err);
    }
  };

  return (
    React.createElement(AuthContext.Provider, {
      value: {
        userId: userId,
        isAuthenticated: isAuthenticated,
        isLoading: isLoading,
        signOut: signOut,
        lixBalance: lixBalance,
        energy: energy,
        updateLixBalance: updateLixBalance,
        updateEnergy: updateEnergy,
        refreshLixFromServer: refreshLixFromServer,
        subscriptionTier: subscriptionTier,
        subscriptionExpiresAt: subscriptionExpiresAt,
        onboardingUsage: onboardingUsage,
        setOnboardingUsage: setOnboardingUsage,
        pushToken: pushToken,
        alixenNotifications: alixenNotifications,
        alixenNotifCount: alixenNotifCount,
        fetchAlixenNotifications: fetchAlixenNotifications,
        markNotificationRead: markNotificationRead,
        markAllNotificationsRead: markAllNotificationsRead,
        lixverseNotifications: lixverseNotifications,
        lixverseNotifCount: lixverseNotifCount,
        fetchLixverseNotifications: fetchLixverseNotifications,
        markLixverseNotificationRead: markLixverseNotificationRead,
        markAllLixverseNotificationsRead: markAllLixverseNotificationsRead,
      }
    }, props.children)
  );
}

export function useAuth() {
  var ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
