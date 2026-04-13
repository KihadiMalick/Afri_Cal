import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  var _energyDailyUsed = useState(0);
  var energyDailyUsed = _energyDailyUsed[0], setEnergyDailyUsed = _energyDailyUsed[1];

  var _dailyEnergyResetAt = useState(null);
  var dailyEnergyResetAt = _dailyEnergyResetAt[0], setDailyEnergyResetAt = _dailyEnergyResetAt[1];

  var _onboardingUsage = useState({ xscan: 0, gallery: 0, chat: 0, recipe: 0, medic: 0, cartscan: 0 });
  var onboardingUsage = _onboardingUsage[0], setOnboardingUsage = _onboardingUsage[1];

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
        .select('lix_balance, energy, subscription_tier, subscription_expires_at, energy_daily_used, daily_energy_reset_at, onboarding_xscan_used, onboarding_gallery_used, onboarding_chat_used, onboarding_recipe_used, onboarding_medic_used, onboarding_cartscan_used')
        .eq('user_id', userId)
        .single();
      if (data) {
        setLixBalance(data.lix_balance || 0);
        setEnergy(data.energy || 20);
        setSubscriptionTier(data.subscription_tier || 'free');
        setSubscriptionExpiresAt(data.subscription_expires_at || null);
        setEnergyDailyUsed(data.energy_daily_used || 0);
        setDailyEnergyResetAt(data.daily_energy_reset_at || null);
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

  // Load initial balance when userId is set
  useEffect(function() {
    if (userId) refreshLixFromServer();
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
        setEnergyDailyUsed(0);
        setDailyEnergyResetAt(null);
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
      setEnergyDailyUsed(0);
      setDailyEnergyResetAt(null);
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
        energyDailyUsed: energyDailyUsed,
        setEnergyDailyUsed: setEnergyDailyUsed,
        dailyEnergyResetAt: dailyEnergyResetAt,
        onboardingUsage: onboardingUsage,
        setOnboardingUsage: setOnboardingUsage,
      }
    }, props.children)
  );
}

export function useAuth() {
  var ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
