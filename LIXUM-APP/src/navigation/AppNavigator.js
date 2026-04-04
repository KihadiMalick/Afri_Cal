import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

// Les pages seront importées au fur et à mesure
const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Accueil" component={() => null} />
        <Tab.Screen name="Repas" component={() => null} />
        <Tab.Screen name="MedicAi" component={() => null} />
        <Tab.Screen name="Activite" component={() => null} />
        <Tab.Screen name="LixVerse" component={() => null} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
