import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivitiesScreen } from '@/screens/activities/ActivitiesScreen';
import { ActivityDetailScreen } from '@/screens/activities/ActivityDetailScreen';
import type { ActivitiesStackParamList } from '@/types';

const Stack = createNativeStackNavigator<ActivitiesStackParamList>();

export function ActivitiesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 200,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="ActivitiesList" component={ActivitiesScreen} />
      <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
    </Stack.Navigator>
  );
}
