import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { MealsScreen } from '@/screens/meals/MealsScreen';
import { ScanScreen } from '@/screens/meals/ScanScreen';
import { AddMealScreen } from '@/screens/meals/AddMealScreen';
import { RecipesScreen } from '@/screens/meals/RecipesScreen';
import { ActivitiesScreen } from '@/screens/activities/ActivitiesScreen';
import { ActivityDetailScreen } from '@/screens/activities/ActivityDetailScreen';
import { CalendarScreen } from '@/screens/calendar/CalendarScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { useTokens } from '@/context/ThemeContext';
import type { MealsStackParamList, ActivitiesStackParamList } from '@/types';

/* ================================================================== */
/*  PREMIUM SVG ICONS                                                  */
/* ================================================================== */
function IconHome({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5H6a1 1 0 01-1-1v-9.5z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconMeals({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="13" r="7" stroke={color} strokeWidth={1.6} />
      <Path d="M12 6V3" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M9 10l3 3 3-3" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconActivity({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2L4.09 12.26a1 1 0 00.72 1.69H11l-1 8 8.91-10.26a1 1 0 00-.72-1.69H13l1-8z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconCalendar({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="17" rx="2" stroke={color} strokeWidth={1.6} />
      <Line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth={1.4} />
      <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx="8" cy="14" r="1" fill={color} />
      <Circle cx="12" cy="14" r="1" fill={color} />
      <Circle cx="16" cy="14" r="1" fill={color} />
    </Svg>
  );
}

function IconProfile({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={1.6} />
      <Path
        d="M4 21c0-3.31 3.58-6 8-6s8 2.69 8 6"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/* ================================================================== */
/*  SUB-NAVIGATORS (stacks inside sidebar content)                     */
/* ================================================================== */
const MealsStack = createNativeStackNavigator<MealsStackParamList>();
function MealsNav() {
  return (
    <MealsStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' }, animation: 'fade', animationDuration: 200 }}>
      <MealsStack.Screen name="MealsList" component={MealsScreen} />
      <MealsStack.Screen name="Scan" component={ScanScreen} />
      <MealsStack.Screen name="AddMeal" component={AddMealScreen} />
      <MealsStack.Screen name="Recipes" component={RecipesScreen} />
    </MealsStack.Navigator>
  );
}

const ActivitiesStack = createNativeStackNavigator<ActivitiesStackParamList>();
function ActivitiesNav() {
  return (
    <ActivitiesStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' }, animation: 'fade', animationDuration: 200 }}>
      <ActivitiesStack.Screen name="ActivitiesList" component={ActivitiesScreen} />
      <ActivitiesStack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
    </ActivitiesStack.Navigator>
  );
}

/* ================================================================== */
/*  SIDEBAR ITEM CONFIG                                                */
/* ================================================================== */
type TabKey = 'dashboard' | 'meals' | 'activities' | 'calendar' | 'profile';

const TABS: { key: TabKey; Icon: typeof IconHome; label: string }[] = [
  { key: 'dashboard', Icon: IconHome, label: 'Accueil' },
  { key: 'meals', Icon: IconMeals, label: 'Repas' },
  { key: 'activities', Icon: IconActivity, label: 'Activites' },
  { key: 'calendar', Icon: IconCalendar, label: 'Calendrier' },
  { key: 'profile', Icon: IconProfile, label: 'Profil' },
];

/* ================================================================== */
/*  MAIN NAVIGATOR — Metallic Brushed Sidebar                          */
/* ================================================================== */
export function MainNavigator() {
  const tk = useTokens();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardScreen />;
      case 'meals': return <MealsNav />;
      case 'activities': return <ActivitiesNav />;
      case 'calendar': return <CalendarScreen />;
      case 'profile': return <ProfileScreen />;
    }
  };

  return (
    <View style={styles.root}>
      {/* ---- SIDEBAR — brushed steel panel ---- */}
      <View style={[styles.sidebar, webSidebarBlur]}>
        {/* LX Logo mark — brushed metal with emerald ring */}
        <View style={styles.logoMark}>
          <Text style={styles.logoL}>L</Text>
          <Text style={styles.logoX}>X</Text>
        </View>

        {/* Nav icons */}
        <View style={styles.navItems}>
          {TABS.map(({ key, Icon }) => {
            const active = activeTab === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.navItem,
                  active && styles.navItemActive,
                ]}
                onPress={() => setActiveTab(key)}
                activeOpacity={0.7}
              >
                {active && <View style={styles.activeBar} />}
                <Icon color={active ? '#00E5A0' : 'rgba(160,170,185,0.40)'} size={22} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ---- CONTENT ---- */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

/* ================================================================== */
/*  STYLES                                                             */
/* ================================================================== */
const SIDEBAR_W = 56;

const webSidebarBlur = Platform.select({
  web: {
    // @ts-ignore
    backdropFilter: 'blur(20px) saturate(150%)',
    WebkitBackdropFilter: 'blur(20px) saturate(150%)',
  } as any,
  default: {},
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: SIDEBAR_W,
    borderRightWidth: 1,
    borderRightColor: 'rgba(120,130,150,0.06)',
    backgroundColor: 'rgba(8,10,14,0.92)',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(0,229,160,0.25)',
    backgroundColor: 'rgba(0,229,160,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0 0 14px rgba(0,229,160,0.10), inset 0 0 8px rgba(0,229,160,0.05)',
      } as any,
      default: {},
    }),
  },
  logoL: {
    fontFamily: Platform.OS === 'web' ? 'Outfit_700Bold, sans-serif' : 'Outfit_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  logoX: {
    fontFamily: Platform.OS === 'web' ? 'Outfit_900Black, sans-serif' : 'Outfit_900Black',
    fontSize: 15,
    fontWeight: '900',
    color: '#00E5A0',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,229,160,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  navItems: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 4,
  },
  navItem: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(0,229,160,0.06)',
  },
  activeBar: {
    position: 'absolute',
    left: -6,
    width: 3,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#00E5A0',
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0 0 8px rgba(0,229,160,0.30)',
      } as any,
      default: {},
    }),
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
