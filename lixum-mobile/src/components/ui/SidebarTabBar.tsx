/**
 * SidebarTabBar – Vertical glass sidebar for web navigation
 * Transparent glass-morphism sidebar replacing bottom tabs on web.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  type ViewStyle,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTokens } from '@/context/ThemeContext';
import { layout } from '@/theme/spacing';

const SIDEBAR_ICONS: Record<string, string> = {
  Dashboard: '\u{1F3E0}',
  Activities: '\u{1F3C3}',
  Calendar: '\u{1F4CA}',
  Profile: '\u{1F464}',
};

export function SidebarTabBar({ state, navigation }: BottomTabBarProps) {
  const tk = useTokens();

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: tk.sidebarBg1,
          borderRightColor: tk.sidebarBorder,
          width: layout.sidebarWidth,
        },
        Platform.OS === 'web' && styles.webBlur,
      ]}
    >
      {/* Logo mark */}
      <View style={[styles.logoBox, { backgroundColor: tk.logoBoxBg, borderColor: tk.logoBoxBorder }]}>
        <Text style={styles.logoMark}>
          <Text style={{ color: tk.logoLetter }}>L</Text>
          <Text style={{ color: tk.accent }}>X</Text>
        </Text>
      </View>

      {/* Navigation icons */}
      <View style={styles.iconsWrap}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const icon = SIDEBAR_ICONS[route.name] || '\u{2B50}';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={[
                styles.iconBtn,
                isFocused && { backgroundColor: tk.navActiveBg },
              ]}
            >
              <Text style={[styles.icon, { opacity: isFocused ? 1 : 0.5 }]}>
                {icon}
              </Text>
              {isFocused && (
                <View style={[styles.activeIndicator, { backgroundColor: tk.indicatorColor }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    height: '100%',
    borderRightWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  webBlur: Platform.select({
    web: {
      // @ts-ignore
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
    } as any,
    default: {},
  }) as ViewStyle,
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  logoMark: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  iconsWrap: {
    flex: 1,
    gap: 6,
    alignItems: 'center',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    fontSize: 22,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderRadius: 2,
  },
});
