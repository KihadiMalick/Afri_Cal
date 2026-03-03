import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { MealsNavigator } from './MealsNavigator';
import { ActivitiesNavigator } from './ActivitiesNavigator';
import { CalendarScreen } from '@/screens/calendar/CalendarScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { layout } from '@/theme/spacing';
import type { MainTabParamList } from '@/types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, string> = {
  Dashboard: '\u{1F3E0}', // 🏠 Home
  Activities: '\u{1F3C3}', // 🏃 Activités
  Calendar: '\u{1F4CA}', // 📊 Journal
  Profile: '\u{1F464}', // 👤 Profil
};

export function MainNavigator() {
  const { theme } = useTheme();
  const { t, locale } = useLocale();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
            {TAB_ICONS[route.name] || '\u{2B50}'}
          </Text>
        ),
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          height: layout.tabBarHeight,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={MealsNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Activities"
        component={ActivitiesNavigator}
        options={{ tabBarLabel: t.nav.activities }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarLabel: locale === 'fr' ? 'Journal' : 'Journal' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t.nav.profile }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 22,
  },
  tabIconActive: {
    fontSize: 24,
  },
});
