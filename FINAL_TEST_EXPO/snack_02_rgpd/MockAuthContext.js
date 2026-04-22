import React, { createContext, useContext, useState } from 'react';

var MOCK_USER_ID = '66666666-6666-6666-6666-666666666666';

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
    deletionPending: deletionPending,
    accountDeletedSuccessVisible: accountDeletedSuccessVisible,
    accountDeletedScheduledDate: accountDeletedScheduledDate,
    lastAction: lastAction,
    signOut: signOut,
    restoreAccount: restoreAccount,
    triggerAccountDeletedSuccess: triggerAccountDeletedSuccess,
    acknowledgeAccountDeleted: acknowledgeAccountDeleted,
    testTriggerRestoreModal: testTriggerRestoreModal,
    testReset: testReset,
    handleDeleteAccountMock: handleDeleteAccountMock
  };

  return React.createElement(MockAuthContext.Provider, { value: value }, props.children);
}

export function useAuth() {
  var ctx = useContext(MockAuthContext);
  if (!ctx) throw new Error('useAuth must be used inside MockAuthProvider');
  return ctx;
}
