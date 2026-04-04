import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import WelcomePage from '../pages/WelcomePage';
import RepasPage from '../pages/repas/RepasPage';
import ActivityPage from '../pages/activity/ActivityPage';

const Tab = createBottomTabNavigator();

const PlaceholderScreen = () => null;

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Accueil" component={WelcomePage} />
        <Tab.Screen name="Repas" component={RepasPage} />
        <Tab.Screen name="MedicAi" component={PlaceholderScreen} />
        <Tab.Screen name="Activite" component={ActivityPage} />
        <Tab.Screen name="LixVerse" component={PlaceholderScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
