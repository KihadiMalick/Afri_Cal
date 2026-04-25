import React from 'react';

// Compte test-dev créé en DB Supabase pour ce sprint
var TEST_DEV_USER = {
  userId: 'c4e24be5-17e8-4c0e-85cc-47db9286b496',
  email: 'test-dev@lixum.com',
  displayName: 'Test Dev',
  lixtag: 'LXM-TESTDEV'
};

var AuthContext = React.createContext(TEST_DEV_USER);

function AuthProvider(props) {
  return React.createElement(AuthContext.Provider, { value: TEST_DEV_USER }, props.children);
}

function useAuth() {
  return React.useContext(AuthContext);
}

export { AuthProvider, useAuth };
