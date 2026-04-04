import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import DashboardPage from '../pages/dashboard/DashboardPage';
import RepasPage from '../pages/repas/RepasPage';
import ActivityPage from '../pages/activity/ActivityPage';
import MedicAiPage from '../pages/medicai/index';
import LixVersePage from '../pages/lixverse/LixVersePage';
import RegisterPage from '../pages/register/RegisterPage';
import LoginPage from '../pages/login/LoginPage';
import ProfilePage from '../pages/profile/ProfilePage';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const PlaceholderScreen = () => null;

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tab.Screen name="Accueil" component={DashboardPage} />
      <Tab.Screen name="Repas" component={RepasPage} />
      <Tab.Screen name="MedicAi" component={MedicAiPage} />
      <Tab.Screen name="Activite" component={ActivityPage} />
      <Tab.Screen name="LixVerse" component={LixVersePage} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Register" component={RegisterPage} />
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Profile" component={ProfilePage} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
