import React from 'react';

// Stub minimal pour remplacer @react-navigation/native dans le snack.
// useFocusEffect s'execute une fois au mount (pas de focus/blur dynamique).
// useRoute retourne un objet statique.

export function useFocusEffect(callback) {
  React.useEffect(function() {
    var cleanup = callback();
    return cleanup;
  }, []);
}

export function useRoute() {
  return { params: {}, name: 'ProfilePage', key: 'profile-mock' };
}
