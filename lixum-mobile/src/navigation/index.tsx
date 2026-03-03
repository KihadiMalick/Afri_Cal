import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import type { RootStackParamList } from '@/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_left',
          animationDuration: 200,
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ animation: 'slide_from_bottom', animationDuration: 250 }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
