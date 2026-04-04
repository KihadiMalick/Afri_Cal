import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import DashboardPage from '../pages/dashboard/DashboardPage';
import RepasPage from '../pages/repas/RepasPage';
import ActivityPage from '../pages/activity/ActivityPage';
import LixVersePage from '../pages/lixverse/LixVersePage';

const Tab = createBottomTabNavigator();

const PlaceholderScreen = () => null;

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Accueil" component={DashboardPage} />
        <Tab.Screen name="Repas" component={RepasPage} />
        <Tab.Screen name="MedicAi" component={PlaceholderScreen} />
        <Tab.Screen name="Activite" component={ActivityPage} />
        <Tab.Screen name="LixVerse" component={LixVersePage} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
