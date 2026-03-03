import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MealsNavigator } from './MealsNavigator';
import { ActivitiesNavigator } from './ActivitiesNavigator';
import { CalendarScreen } from '@/screens/calendar/CalendarScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { useTokens } from '@/context/ThemeContext';
import { useLocale } from '@/context/LocaleContext';
import { layout } from '@/theme/spacing';
import type { MainTabParamList } from '@/types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, { icon: string; label_fr: string; label_en: string }> = {
  Dashboard: { icon: '\u{1F3E0}', label_fr: 'Accueil', label_en: 'Home' },
  Activities: { icon: '\u{1F3C3}', label_fr: 'Activites', label_en: 'Activity' },
  Calendar: { icon: '\u{1F4CA}', label_fr: 'Journal', label_en: 'Journal' },
  Profile: { icon: '\u{1F464}', label_fr: 'Profil', label_en: 'Profile' },
};

function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  const tk = useTokens();
  const config = TAB_ICONS[routeName];

  return (
    <View style={styles.tabIconWrap}>
      {focused && (
        <View style={[styles.activeIndicator, { backgroundColor: tk.accent }]} />
      )}
      <Text style={[
        styles.tabIconText,
        {
          fontSize: focused ? 26 : 22,
          opacity: focused ? 1 : 0.55,
        },
      ]}>
        {config?.icon || '\u{2B50}'}
      </Text>
    </View>
  );
}

export function MainNavigator() {
  const tk = useTokens();
  const { locale } = useLocale();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon routeName={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: tk.accent,
        tabBarInactiveTintColor: tk.iconInactive,
        tabBarStyle: {
          backgroundColor: tk.tabBarBg,
          borderTopColor: tk.tabBarBorder,
          borderTopWidth: 1,
          height: layout.tabBarHeight,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 6,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
            },
            android: { elevation: 12 },
            default: {},
          }),
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
          textTransform: 'uppercase' as const,
          letterSpacing: 0.5,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={MealsNavigator}
        options={{ tabBarLabel: locale === 'fr' ? 'Accueil' : 'Home' }}
      />
      <Tab.Screen
        name="Activities"
        component={ActivitiesNavigator}
        options={{ tabBarLabel: locale === 'fr' ? 'Activites' : 'Activity' }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarLabel: 'Journal' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: locale === 'fr' ? 'Profil' : 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 24,
    height: 3,
    borderRadius: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#00ff9d',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
      },
      default: {},
    }),
  },
  tabIconText: {
    marginTop: 2,
  },
});
