import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MealsScreen } from '@/screens/meals/MealsScreen';
import { ScanScreen } from '@/screens/meals/ScanScreen';
import { AddMealScreen } from '@/screens/meals/AddMealScreen';
import type { MealsStackParamList } from '@/types';
import { useTheme } from '@/context/ThemeContext';

const Stack = createNativeStackNavigator<MealsStackParamList>();

export function MealsNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="MealsList" component={MealsScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="AddMeal" component={AddMealScreen} />
    </Stack.Navigator>
  );
}
