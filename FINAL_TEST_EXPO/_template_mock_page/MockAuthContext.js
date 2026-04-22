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

  var signOut = function() {
    console.log('[MockAuth] signOut called');
    setDeletionPending(null);
    setAccountDeletedSuccessVisible(false);
    setAccountDeletedScheduledDate(null);
  };

  var restoreAccount = function() {
    console.log('[MockAuth] restoreAccount called');
    return new Promise(function(resolve) {
      setTimeout(function() {
        setDeletionPending(null);
        resolve({ success: true });
      }, 1000);
    });
  };

  var triggerAccountDeletedSuccess = function(scheduledDateISO) {
    console.log('[MockAuth] triggerAccountDeletedSuccess:', scheduledDateISO);
    setAccountDeletedScheduledDate(scheduledDateISO || null);
    setAccountDeletedSuccessVisible(true);
  };

  var acknowledgeAccountDeleted = function() {
    console.log('[MockAuth] acknowledgeAccountDeleted');
    setAccountDeletedSuccessVisible(false);
    setAccountDeletedScheduledDate(null);
    signOut();
    return Promise.resolve();
  };

  var value = {
    userId: MOCK_USER_ID,
    language: 'FR',
    deletionPending: deletionPending,
    accountDeletedSuccessVisible: accountDeletedSuccessVisible,
    accountDeletedScheduledDate: accountDeletedScheduledDate,
    signOut: signOut,
    restoreAccount: restoreAccount,
    triggerAccountDeletedSuccess: triggerAccountDeletedSuccess,
    acknowledgeAccountDeleted: acknowledgeAccountDeleted,
    _setDeletionPending: setDeletionPending
  };

  return React.createElement(MockAuthContext.Provider, { value: value }, props.children);
}

export function useAuth() {
  var ctx = useContext(MockAuthContext);
  if (!ctx) throw new Error('useAuth must be used inside MockAuthProvider');
  return ctx;
}
