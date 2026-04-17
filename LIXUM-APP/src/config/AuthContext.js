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

  var _energyMonthlyUsed = useState(0);
  var energyMonthlyUsed = _energyMonthlyUsed[0], setEnergyMonthlyUsed = _energyMonthlyUsed[1];

  var _monthlyEnergyResetAt = useState(null);
  var monthlyEnergyResetAt = _monthlyEnergyResetAt[0], setMonthlyEnergyResetAt = _monthlyEnergyResetAt[1];

  var _onboardingUsage = useState({ xscan: 0, gallery: 0, chat: 0, recipe: 0, medic: 0, cartscan: 0 });
  var onboardingUsage = _onboardingUsage[0], setOnboardingUsage = _onboardingUsage[1];

  var _pushToken = useState(null);
  var pushToken = _pushToken[0], setPushToken = _pushToken[1];

  // === ALIXEN NOTIFICATIONS STATE ===
  var _alixenNotifications = useState([]);
  var alixenNotifications = _alixenNotifications[0], setAlixenNotifications = _alixenNotifications[1];
  var _notifCount = useState(0);
  var notifCount = _notifCount[0], setNotifCount = _notifCount[1];

  var fetchAlixenNotifications = useCallback(async function() {
    if (!userId) { setAlixenNotifications([]); setNotifCount(0); return; }
    try {
      var { data, error } = await supabase.rpc('get_unread_notifications', { p_user_id: userId });
      if (error) {
        console.warn('[LIXUM Notifications] RPC error:', error.message || error);
        setAlixenNotifications([]);
        setNotifCount(0);
        return;
      }
      if (!Array.isArray(data)) {
        console.warn('[LIXUM Notifications] RPC returned non-array:', typeof data);
        setAlixenNotifications([]);
        setNotifCount(0);
        return;
      }
      var sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      var filtered = data.filter(function(n) {
        return n && typeof n === 'object' && n.id && (!n.created_at || new Date(n.created_at) > sevenDaysAgo);
      }).slice(0, 20);
      setAlixenNotifications(filtered);
      setNotifCount(filtered.length);
    } catch (e) {
      console.warn('[LIXUM Notifications] fetch error:', e);
      setAlixenNotifications([]);
      setNotifCount(0);
    }
  }, [userId]);

  var markNotificationRead = useCallback(async function(notifId) {
    try {
      await supabase.rpc('mark_notification_read', { p_user_id: userId, p_notification_id: notifId });
      setAlixenNotifications(function(prev) { return prev.filter(function(n) { return n.id !== notifId; }); });
      setNotifCount(function(prev) { return Math.max(0, prev - 1); });
    } catch (e) {
      console.warn('markNotificationRead error:', e);
    }
  }, [userId]);

  var markAllNotificationsRead = useCallback(async function() {
    try {
      await supabase.rpc('mark_all_notifications_read', { p_user_id: userId });
      setAlixenNotifications([]);
      setNotifCount(0);
    } catch (e) {
      console.warn('markAllNotificationsRead error:', e);
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
        .select('lix_balance, energy, subscription_tier, subscription_expires_at, energy_monthly_used, monthly_energy_reset_at, onboarding_xscan_used, onboarding_gallery_used, onboarding_chat_used, onboarding_recipe_used, onboarding_medic_used, onboarding_cartscan_used')
        .eq('user_id', userId)
        .single();
      if (data) {
        setLixBalance(data.lix_balance || 0);
        setEnergy(data.energy || 20);
        setSubscriptionTier(data.subscription_tier || 'free');
        setSubscriptionExpiresAt(data.subscription_expires_at || null);
        setEnergyMonthlyUsed(data.energy_monthly_used || 0);
        setMonthlyEnergyResetAt(data.monthly_energy_reset_at || null);
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
  // [PARTIELLEMENT RÉACTIVÉ - 17 Avril 2026]
  // refreshLixFromServer() réactivé après validation diagnostic Supabase (colonnes OK).
  // Les 2 appels ALIXEN notifs restent commentés pour isoler le coupable du crash.
  useEffect(function() {
    if (userId) {
      refreshLixFromServer();
      // supabase.rpc('check_and_generate_notifications', { p_user_id: userId }).catch(function(e) { console.warn('check_and_generate_notifications error:', e); });
      // fetchAlixenNotifications();
    }
  }, [userId, refreshLixFromServer]);

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
        setEnergyMonthlyUsed(0);
        setMonthlyEnergyResetAt(null);
        setOnboardingUsage({ xscan: 0, gallery: 0, chat: 0, recipe: 0, medic: 0, cartscan: 0 });
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
      setEnergyMonthlyUsed(0);
      setMonthlyEnergyResetAt(null);
      setOnboardingUsage({ xscan: 0, gallery: 0, chat: 0, recipe: 0, medic: 0, cartscan: 0 });
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
        energyMonthlyUsed: energyMonthlyUsed,
        setEnergyMonthlyUsed: setEnergyMonthlyUsed,
        monthlyEnergyResetAt: monthlyEnergyResetAt,
        onboardingUsage: onboardingUsage,
        setOnboardingUsage: setOnboardingUsage,
        pushToken: pushToken,
        alixenNotifications: alixenNotifications,
        notifCount: notifCount,
        fetchAlixenNotifications: fetchAlixenNotifications,
        markNotificationRead: markNotificationRead,
        markAllNotificationsRead: markAllNotificationsRead,
      }
    }, props.children)
  );
}

export function useAuth() {
  var ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
