import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../config/AuthContext';
import ErrorBoundary from '../components/shared/ErrorBoundary';

import DashboardPage from '../pages/dashboard/DashboardPage';
import RepasPage from '../pages/repas/RepasPage';
import ActivityPage from '../pages/activity/ActivityPage';
import MedicAiPage from '../pages/medicai/index';
import LixVersePage from '../pages/lixverse/LixVersePage';
import RegisterPage from '../pages/register/RegisterPage';
import LoginPage from '../pages/login/LoginPage';
import WelcomePage from '../pages/WelcomePage';
import ProfilePage from '../pages/profile/ProfilePage';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SafeDashboard(props) { return <ErrorBoundary><DashboardPage {...props} /></ErrorBoundary>; }
function SafeRepas(props) { return <ErrorBoundary><RepasPage {...props} /></ErrorBoundary>; }
function SafeMedicAi(props) { return <ErrorBoundary><MedicAiPage {...props} /></ErrorBoundary>; }
function SafeActivity(props) { return <ErrorBoundary><ActivityPage {...props} /></ErrorBoundary>; }
function SafeLixVerse(props) { return <ErrorBoundary><LixVersePage {...props} /></ErrorBoundary>; }

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tab.Screen name="Accueil" component={SafeDashboard} />
      <Tab.Screen name="Repas" component={SafeRepas} />
      <Tab.Screen name="MedicAi" component={SafeMedicAi} />
      <Tab.Screen name="Activite" component={SafeActivity} />
      <Tab.Screen name="LixVerse" component={SafeLixVerse} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  var auth = useAuth();

  if (auth.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1E2530', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00D984" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {auth.isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Profile" component={ProfilePage} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomePage} />
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Register" component={RegisterPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
