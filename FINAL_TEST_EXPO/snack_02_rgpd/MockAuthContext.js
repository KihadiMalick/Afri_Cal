import React, { createContext, useContext, useState } from 'react';

var MOCK_USER_ID = '66666666-6666-6666-6666-666666666666';

// Profil utilisateur hardcode pour reproduire fidelement la capture prod
// (NIV 1, 0/80 XP, Lix 16750, Energie 76, Cartes 14/16, IMC 25.1 Surpoids)
var MOCK_PROFILE = {
  display_name: 'Malick',
  lixtag: 'LXM-QJLMVQ',
  age: 40,
  weight: 86,
  height: 185,
  gender: 'male',
  activity_level: 'moderate',
  goal: 'maintain',
  diet: 'balanced',
  created_at: '2025-11-01T10:00:00Z'
};

var MOCK_USER_XP = {
  user_xp: 0,
  user_level: 1,
  xp_progress: 0,
  xp_needed: 80,
  xp_percent: 0
};

var MockAuthContext = createContext(null);

export function MockAuthProvider(props) {
  var _deletionPending = useState(null);
  var deletionPending = _deletionPending[0];
  var setDeletionPending = _deletionPending[1];

  var _accountDeletedSuccessVisible = useState(false);
  var accountDeletedSuccessVisible = _accountDeletedSuccessVisible[0];
  var setAccountDeletedSuccessVisible = _accountDeletedSuccessVisible[1];

  var _accountDeletedScheduledDate = useState(null);
  var accountDeletedScheduledDate = _accountDeletedScheduledDate[0];
  var setAccountDeletedScheduledDate = _accountDeletedScheduledDate[1];

  var _lastAction = useState('');
  var lastAction = _lastAction[0];
  var setLastAction = _lastAction[1];

  // === Profile / XP / Lix / Energy / Cartes (hardcodes pour snack) ===
  var _profile = useState(MOCK_PROFILE);
  var profile = _profile[0];

  var _lixBalance = useState(16750);
  var lixBalance = _lixBalance[0];
  var setLixBalance = _lixBalance[1];

  var _userXP = useState(MOCK_USER_XP);
  var userXP = _userXP[0];

  var _subscriptionTier = useState('free');
  var subscriptionTier = _subscriptionTier[0];

  var _energy = useState(76);
  var energy = _energy[0];
  var setEnergy = _energy[1];

  var _ownedCharacters = useState(14);
  var ownedCharacters = _ownedCharacters[0];

  var _activeCharSlug = useState(null);
  var activeCharSlug = _activeCharSlug[0];

  var updateLixBalance = function(n) {
    setLixBalance(n);
  };

  var updateEnergy = function(n) {
    setEnergy(n);
  };

  var refreshLixFromServer = function() {
    return Promise.resolve({ success: true });
  };

  var refreshUserXP = function() {
    return Promise.resolve();
  };

  function log(msg) {
    console.log('[MockAuth]', msg);
    setLastAction(msg);
  }

  var signOut = function() {
    log('signOut');
    setDeletionPending(null);
    setAccountDeletedSuccessVisible(false);
    setAccountDeletedScheduledDate(null);
    return Promise.resolve();
  };

  var restoreAccount = function() {
    log('restoreAccount (mocked setTimeout 1000ms)');
    return new Promise(function(resolve) {
      setTimeout(function() {
        setDeletionPending(null);
        log('restoreAccount success');
        resolve({ success: true });
      }, 1000);
    });
  };

  var triggerAccountDeletedSuccess = function(scheduledDateISO) {
    log('triggerAccountDeletedSuccess: ' + (scheduledDateISO || 'null'));
    setAccountDeletedScheduledDate(scheduledDateISO || null);
    setAccountDeletedSuccessVisible(true);
  };

  var acknowledgeAccountDeleted = function() {
    log('acknowledgeAccountDeleted -> signOut');
    setAccountDeletedSuccessVisible(false);
    setAccountDeletedScheduledDate(null);
    return signOut();
  };

  // === MOCK-ONLY helpers ===

  var testTriggerRestoreModal = function(daysFromNow) {
    var d = new Date();
    d.setDate(d.getDate() + (daysFromNow || 15));
    var nowISO = new Date().toISOString();
    log('TEST: simule user soft-deleted, scheduled J+' + daysFromNow);
    setDeletionPending({
      deletedAt: nowISO,
      scheduledDeletionAt: d.toISOString()
    });
  };

  // Set deletionPending SANS ouvrir la modale (pour tester la banniere seule)
  var testSetBannerOnly = function(daysFromNow) {
    var d = new Date();
    d.setDate(d.getDate() + (daysFromNow || 15));
    var nowISO = new Date().toISOString();
    log('TEST: banniere seule J+' + daysFromNow);
    setDeletionPending({
      deletedAt: nowISO,
      scheduledDeletionAt: d.toISOString()
    });
  };

  var testReset = function() {
    log('TEST: reset all states');
    setDeletionPending(null);
    setAccountDeletedSuccessVisible(false);
    setAccountDeletedScheduledDate(null);
  };

  var handleDeleteAccountMock = function(selectedReasons, reasonOther) {
    log('handleDeleteAccountMock reasons=' + JSON.stringify(selectedReasons) + ' other="' + (reasonOther || '') + '"');
    return new Promise(function(resolve) {
      setTimeout(function() {
        var d = new Date();
        d.setDate(d.getDate() + 30);
        triggerAccountDeletedSuccess(d.toISOString());
        resolve({ success: true });
      }, 1500);
    });
  };

  var value = {
    userId: MOCK_USER_ID,
    language: 'FR',
    // Flow RGPD (existant)
    deletionPending: deletionPending,
    accountDeletedSuccessVisible: accountDeletedSuccessVisible,
    accountDeletedScheduledDate: accountDeletedScheduledDate,
    lastAction: lastAction,
    signOut: signOut,
    restoreAccount: restoreAccount,
    triggerAccountDeletedSuccess: triggerAccountDeletedSuccess,
    acknowledgeAccountDeleted: acknowledgeAccountDeleted,
    testTriggerRestoreModal: testTriggerRestoreModal,
    testSetBannerOnly: testSetBannerOnly,
    testReset: testReset,
    handleDeleteAccountMock: handleDeleteAccountMock,
    // Profile / XP / stats (nouveaux pour ProfilePageMock 100% fidele)
    profile: profile,
    lixBalance: lixBalance,
    userXP: userXP,
    subscriptionTier: subscriptionTier,
    energy: energy,
    ownedCharacters: ownedCharacters,
    activeCharSlug: activeCharSlug,
    updateLixBalance: updateLixBalance,
    updateEnergy: updateEnergy,
    refreshLixFromServer: refreshLixFromServer,
    refreshUserXP: refreshUserXP
  };

  return React.createElement(MockAuthContext.Provider, { value: value }, props.children);
}

export function useAuth() {
  var ctx = useContext(MockAuthContext);
  if (!ctx) throw new Error('useAuth must be used inside MockAuthProvider');
  return ctx;
}
