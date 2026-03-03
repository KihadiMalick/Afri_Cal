import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivitiesScreen } from '@/screens/activities/ActivitiesScreen';
import { ActivityDetailScreen } from '@/screens/activities/ActivityDetailScreen';
import { useTheme } from '@/context/ThemeContext';
import type { ActivitiesStackParamList } from '@/types';

const Stack = createNativeStackNavigator<ActivitiesStackParamList>();

export function ActivitiesNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_left',
        animationDuration: 200,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="ActivitiesList" component={ActivitiesScreen} />
      <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
    </Stack.Navigator>
  );
}
