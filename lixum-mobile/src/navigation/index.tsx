import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
import { useAuth } from '@/context/AuthContext';
import { SkeletonLoader } from '@/components/ui/LoadingSkeleton';
import type { RootStackParamList } from '@/types';

/** Force all navigation backgrounds to be transparent/dark */
const LixumNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0D1117',
    card: 'transparent',
    border: 'transparent',
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: 'transparent' }]}>
        <SkeletonLoader width={120} height={120} radius={60} />
        <SkeletonLoader width={200} height={20} radius={10} style={{ marginTop: 24 }} />
        <SkeletonLoader width={150} height={14} radius={7} style={{ marginTop: 12 }} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={LixumNavTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 250,
          contentStyle: { backgroundColor: 'transparent' },
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
    gap: 8,
  },
});
