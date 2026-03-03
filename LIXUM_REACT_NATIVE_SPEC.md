# LIXUM — React Native Design Specification

**Afro-Futuristic Bio-Digital Health Dashboard**
_Reference document for faithful reproduction in React Native / Expo_

---

## 1. Concept & Philosophy

LIXUM is a health tracking dashboard with an **Afro-Futuristic** aesthetic:
- **Dark bio-digital feel** — deep forest-green/black backgrounds, circuit-board textures
- **Neon green accent** (`#00ff9d`) represents life, energy, and vitality
- **Glass morphism** — semi-transparent frosted cards layered over the background
- **Medical metaphors** — ECG waveforms, heartbeat pulses, biometric data display
- **Readable hierarchy** — health data must be instantly legible for non-technical users
- **Two themes** — Dark (default) and Light, with an ECG heartbeat sweep animation on toggle

---

## 2. Required Libraries

```bash
npx expo install expo-linear-gradient
npx expo install expo-font @expo-google-fonts/outfit
npx expo install react-native-svg
npx expo install react-native-reanimated
npx expo install @react-native-async-storage/async-storage
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
```

**Optional (blur effects — iOS only reliable):**
```bash
npx expo install expo-blur
```

---

## 3. Design Tokens

### 3.1 Color System

```typescript
// tokens.ts

export const DARK = {
  // Backgrounds
  mainBg:        "#020c07",
  sidebarBg1:    "#010d06",
  sidebarBg2:    "#020f08",
  sidebarBg3:    "#011009",
  inputBg:       "rgba(0,8,4,0.58)",
  rowBg:         "rgba(255,255,255,0.055)",

  // Cards
  cardBg:        "rgba(2,12,7,0.80)",
  cardBorder:    "rgba(255,255,255,0.11)",
  vCardBg1:      "rgba(255,255,255,0.07)",   // gradient start
  vCardBg2:      "rgba(0,255,157,0.04)",     // gradient end
  vCardBorder:   "rgba(255,255,255,0.10)",

  // Text hierarchy
  t1:            "rgba(255,255,255,0.94)",   // primary
  t2:            "rgba(255,255,255,0.68)",   // secondary
  t3:            "rgba(255,255,255,0.48)",   // tertiary
  t4:            "rgba(255,255,255,0.32)",   // quaternary

  // Accent
  accent:        "#00ff9d",
  accentSub:     "rgba(0,255,157,0.55)",
  accentGlow:    "rgba(0,255,157,0.40)",

  // Sidebar
  sidebarBorder:    "rgba(0,255,157,0.07)",
  logoBoxBg:        "rgba(0,255,157,0.06)",
  logoBoxBorder:    "rgba(0,255,157,0.20)",
  logoLetter:       "#7d8590",
  navActiveBg:      "rgba(0,255,157,0.07)",
  navHoverBg:       "rgba(255,255,255,0.03)",
  iconActive:       "#00ff9d",
  iconInactive:     "rgba(255,255,255,0.55)",
  labelActive:      "rgba(0,255,157,0.92)",
  labelInactive:    "rgba(255,255,255,0.52)",
  lixumSubColor:    "rgba(0,255,157,0.42)",
  logoutColor:      "rgba(255,255,255,0.45)",
  indicatorColor:   "#00ff9d",

  // Semantic
  amber:         "#f59e0b",
  amberLight:    "#eab308",
  amberDark:     "#ea580c",
  blue:          "#60a5fa",
  purple:        "#a78bfa",
  green:         "#34d399",
  red:           "#f87171",
  redBg:         "rgba(239,68,68,0.06)",
  redBorder:     "rgba(239,68,68,0.20)",

  // Pulse
  pulseCenter:   "rgba(0,255,157,0.18)",
  pulseEdge:     "rgba(0,255,157,0.06)",
  ringBorder:    "rgba(0,255,157,0.10)",

  // ECG overlay
  ecgOverlay:    "rgba(0,6,3,0.94)",
};

export const LIGHT = {
  // Backgrounds
  mainBg:        "#eaf7f0",
  sidebarBg1:    "#ecfdf5",
  sidebarBg2:    "#e8fdf2",
  sidebarBg3:    "#dcfce7",
  inputBg:       "rgba(255,255,255,0.85)",
  rowBg:         "rgba(0,120,60,0.07)",

  // Cards
  cardBg:        "rgba(255,255,255,0.92)",
  cardBorder:    "rgba(0,140,70,0.22)",
  vCardBg1:      "rgba(255,255,255,0.92)",
  vCardBg2:      "rgba(0,200,100,0.06)",
  vCardBorder:   "rgba(0,150,70,0.22)",

  // Text hierarchy
  t1:            "rgba(5,30,18,0.94)",
  t2:            "rgba(5,30,18,0.68)",
  t3:            "rgba(5,30,18,0.48)",
  t4:            "rgba(5,30,18,0.32)",

  // Accent
  accent:        "#059669",
  accentSub:     "rgba(5,150,100,0.68)",
  accentGlow:    "rgba(5,150,80,0.30)",

  // Sidebar
  sidebarBorder:    "rgba(0,150,70,0.14)",
  logoBoxBg:        "rgba(0,150,70,0.08)",
  logoBoxBorder:    "rgba(0,150,70,0.28)",
  logoLetter:       "#6b7280",
  navActiveBg:      "rgba(0,150,70,0.08)",
  navHoverBg:       "rgba(0,140,70,0.05)",
  iconActive:       "#059669",
  iconInactive:     "rgba(5,30,18,0.52)",
  labelActive:      "#047857",
  labelInactive:    "rgba(5,30,18,0.52)",
  lixumSubColor:    "rgba(5,150,80,0.50)",
  logoutColor:      "rgba(5,30,18,0.45)",
  indicatorColor:   "#059669",

  // Semantic (same as dark but with overrides where needed)
  amber:         "#b45309",
  amberLight:    "#d97706",
  amberDark:     "#ea580c",
  blue:          "#2563eb",
  purple:        "#a78bfa",
  green:         "#047857",
  red:           "#dc2626",
  redBg:         "rgba(239,68,68,0.06)",
  redBorder:     "rgba(239,68,68,0.20)",

  // Pulse
  pulseCenter:   "rgba(0,200,100,0.12)",
  pulseEdge:     "rgba(0,200,100,0.04)",
  ringBorder:    "rgba(0,180,90,0.08)",

  // ECG overlay (always dark)
  ecgOverlay:    "rgba(0,6,3,0.94)",
};
```

### 3.2 Typography

```typescript
// typography.ts

export const FONTS = {
  display:    "Outfit_900Black",       // or Outfit-Black
  heading:    "Outfit_700Bold",
  subheading: "Outfit_600SemiBold",
  body:       "Outfit_400Regular",
  medium:     "Outfit_500Medium",
  light:      "Outfit_300Light",
  mono:       "Courier New",           // system font, always available
};

export const FONT_SIZES = {
  // Labels / tags
  tag:        6,
  badge:      7,
  tiny:       9,
  micro:      10,
  xxs:        11,

  // Body
  xs:         12,
  sm:         14,
  base:       16,
  md:         18,

  // Headings
  lg:         20,
  xl:         24,
  "2xl":      30,
  "3xl":      36,

  // Display (numbers, stats)
  "4xl":      36,
  "5xl":      48,
  "6xl":      60,
  "7xl":      72,
};

export const LETTER_SPACING = {
  normal:     0,
  wide:       1,        // tracking-wide
  wider:      2,        // tracking-wider
  widest:     3,        // tracking-widest
  logoSub:    "0.28em", // use letterSpacing: 4.5 approx at 16px
  bioDash:    "0.32em",
  mono:       "0.22em",
  accentTag:  "0.18em",
};
```

### 3.3 Spacing & Border Radius

```typescript
export const SPACING = {
  // Padding scale
  px1: 4,  px2: 8,  px3: 12, px4: 16, px5: 20,
  px6: 24, px7: 28, px8: 32, px10: 40,

  // Common card padding
  cardPadMobile: 20,  // p-5
  cardPadTablet: 24,  // p-6
  sectionPadH:   12,  // px-3 on mobile
  sectionPadHMd: 28,  // px-7 on tablet

  // Gaps
  gap3: 12,  gap4: 16,  gap5: 20,

  // Sidebar
  sidebarWidthMobile: 56,
  sidebarWidthTablet: 88,
};

export const RADII = {
  // Cards
  cardSm:   28,  // rounded-[1.75rem]
  card:     32,  // rounded-[2rem]
  cardLg:   40,  // rounded-[2.5rem]

  // UI elements
  xl:       16,  // rounded-xl
  "2xl":    20,  // rounded-2xl
  lg:       12,  // rounded-lg
  full:     9999,

  // Sidebar
  sidebar: { topLeft: 0, topRight: 24, bottomRight: 24, bottomLeft: 0 },

  // Logo
  logo: 16,
};
```

---

## 4. Theme Context

```typescript
// ThemeContext.tsx
import React, {
  createContext, useContext, useState, useEffect, ReactNode
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type LixumTheme = "dark" | "light";

interface ThemeContextValue {
  theme:         LixumTheme;
  transitioning: boolean;   // true during ECG animation (980ms)
  toggleTheme:   () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark", transitioning: false, toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme,         setTheme]         = useState<LixumTheme>("dark");
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("lixum-theme").then((saved) => {
      if (saved === "dark" || saved === "light") setTheme(saved);
    });
  }, []);

  function toggleTheme() {
    if (transitioning) return;
    setTransitioning(true);
    // Switch at ECG mid-point (450ms)
    setTimeout(() => {
      const next: LixumTheme = theme === "dark" ? "light" : "dark";
      setTheme(next);
      AsyncStorage.setItem("lixum-theme", next);
    }, 450);
    // Remove overlay (980ms)
    setTimeout(() => setTransitioning(false), 980);
  }

  return (
    <ThemeContext.Provider value={{ theme, transitioning, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export const useTokens = () => {
  const { theme } = useTheme();
  return theme === "dark" ? DARK : LIGHT;  // imported from tokens.ts
};
```

---

## 5. Core Components

### 5.1 GlassCard

```typescript
// GlassCard.tsx
import React from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTokens } from "./ThemeContext";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  vitality?: boolean;   // use vitality card style (larger, more prominent)
}

export function GlassCard({ children, style, vitality = false }: Props) {
  const tk = useTokens();

  if (vitality) {
    return (
      <LinearGradient
        colors={[tk.vCardBg1, tk.vCardBg2]}
        start={{ x: 0.15, y: 0.08 }}
        end={{ x: 0.85, y: 0.92 }}
        style={[styles.vitalityCard, {
          borderColor: tk.vCardBorder,
        }, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, {
      backgroundColor: tk.cardBg,
      borderColor:     tk.cardBorder,
      shadowColor:     "#000",
    }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius:     28,
    borderWidth:      1,
    // iOS shadow
    shadowOffset:     { width: 0, height: 4 },
    shadowOpacity:    0.42,
    shadowRadius:     14,
    // Android
    elevation:        6,
    overflow:         "hidden",
  },
  vitalityCard: {
    borderRadius:     32,      // md: 40
    borderWidth:      1,
    shadowColor:      "#000",
    shadowOffset:     { width: 0, height: 8 },
    shadowOpacity:    0.45,
    shadowRadius:     24,
    elevation:        10,
    overflow:         "hidden",
  },
});
```

> **Note on blur:** React Native doesn't support `backdropFilter: blur()` natively.
> On iOS use `<BlurView intensity={20} tint="dark" />` from `expo-blur` as the card container.
> On Android, use a semi-opaque card background (already defined in tokens).

### 5.2 Skeleton Loader

```typescript
// SkeletonLoader.tsx
import React, { useEffect } from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "./ThemeContext";

interface Props {
  width:  number | string;
  height: number;
  radius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({ width, height, radius = 24, style }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1700 }),
      -1,
      true  // reverse
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-200, 200]) }],
  }));

  return (
    <View style={[{ width, height, borderRadius: radius, overflow: "hidden" }, style]}>
      <View style={[StyleSheet.absoluteFill, {
        backgroundColor: isDark ? "rgba(0,255,157,0.04)" : "rgba(0,140,70,0.06)",
      }]} />
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <LinearGradient
          colors={
            isDark
              ? ["transparent", "rgba(0,255,157,0.10)", "rgba(0,255,157,0.07)", "transparent"]
              : ["transparent", "rgba(0,140,70,0.16)", "rgba(0,140,70,0.10)", "transparent"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: "100%", height: "100%" }}
        />
      </Animated.View>
    </View>
  );
}
```

### 5.3 ECG Theme Overlay

```typescript
// ECGOverlay.tsx
import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue, useAnimatedProps, withTiming,
  useAnimatedStyle, Easing,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_W } = Dimensions.get("window");

// Generate ECG waveform path (16 heartbeat cycles)
function buildECGPath(cycles = 16): string {
  const W = 130, b = 35;
  let d = `M 0,${b}`;
  for (let i = 0; i < cycles; i++) {
    const x = i * W;
    d += ` L ${x+15},${b} L ${x+24},${b-7} L ${x+30},${b} L ${x+38},${b}`;
    d += ` L ${x+42},${b+7} L ${x+47},4 L ${x+52},${b+12} L ${x+57},${b}`;
    d += ` L ${x+69},${b} L ${x+75},${b-8} L ${x+82},${b-15} L ${x+89},${b-8} L ${x+95},${b}`;
  }
  d += ` L ${cycles * W + 10},${b}`;
  return d;
}

const ECG_PATH = buildECGPath(16);
const VIEW_W   = 16 * 130 + 10;  // 2090

// Animated SVG Path (for stroke-dashoffset reveal)
const AnimatedPath = Animated.createAnimatedComponent(Path);

export function ECGOverlay() {
  const overlayOpacity  = useSharedValue(0);
  const dashOffset      = useSharedValue(VIEW_W * 2);  // total path length approx
  const EASING          = Easing.bezier(0.4, 0, 0.2, 1);

  // Approximate path length (can refine with onLayout measurement)
  const PATH_LENGTH = VIEW_W * 1.4;

  useEffect(() => {
    // Fade in overlay
    overlayOpacity.value = withTiming(1, { duration: 100, easing: EASING });
    // Sweep ECG line (0 → PATH_LENGTH over 510ms = 52% of 980ms)
    dashOffset.value = withTiming(0, { duration: 510, easing: EASING });
    // Fade out overlay at 78% of 980ms = 764ms
    setTimeout(() => {
      overlayOpacity.value = withTiming(0, { duration: 216, easing: EASING });
    }, 764);
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const pathProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}>
      <Svg
        viewBox={`0 0 ${VIEW_W} 60`}
        width={SCREEN_W}
        height={80}
        preserveAspectRatio="none"
        style={styles.svg}
      >
        <AnimatedPath
          d={ECG_PATH}
          fill="none"
          stroke="#00ff9d"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={PATH_LENGTH}
          animatedProps={pathProps}
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position:        "absolute",
    zIndex:          9999,
    backgroundColor: "rgba(0,6,3,0.94)",
    alignItems:      "center",
    justifyContent:  "center",
  },
  svg: {
    position: "absolute",
  },
});
```

### 5.4 Neon Indicator (Active Nav)

```typescript
// NeonIndicator.tsx
import React from "react";
import { View } from "react-native";
import { useTokens } from "./ThemeContext";

export function NeonIndicator() {
  const tk = useTokens();
  return (
    <View style={{
      position:    "absolute",
      left:        0,
      top:         "50%" as any,
      width:       3,
      height:      24,
      borderTopRightRadius:    4,
      borderBottomRightRadius: 4,
      backgroundColor: tk.indicatorColor,
      // iOS glow
      shadowColor:    tk.indicatorColor,
      shadowOffset:   { width: 0, height: 0 },
      shadowOpacity:  0.8,
      shadowRadius:   8,
      elevation:      0,
    }} />
  );
}
```

### 5.5 Circuit Background Pattern

```typescript
// CircuitBackground.tsx
// The circuit board texture is an SVG pattern.
// In React Native, render it as a repeating SVG or use a PNG asset.
// Pattern: 80x80 grid with crosshair nodes at (20,20)(60,20)(20,60)(60,60)
// Dark lines: rgba(0,255,157,0.10) / Light lines: rgba(0,150,80,0.12)
// Use as an absolute background behind content.

import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Line, Circle, Rect } from "react-native-svg";
import { useTheme } from "./ThemeContext";

export function CircuitBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const lineColor   = isDark ? "rgba(0,255,157,0.10)"  : "rgba(0,150,80,0.12)";
  const circleColor = isDark ? "rgba(0,255,157,0.16)"  : "rgba(0,150,80,0.18)";
  const rectColor   = isDark ? "rgba(0,255,157,0.09)"  : "rgba(0,150,80,0.10)";

  // Tile one 80x80 cell and repeat using a pattern or manual tiling
  const TILE = 80;

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}>
      <Svg width="100%" height="100%">
        <Line x1="0" y1="20" x2={TILE} y2="20" stroke={lineColor} strokeWidth={0.4} />
        <Line x1="0" y1="60" x2={TILE} y2="60" stroke={lineColor} strokeWidth={0.4} />
        <Line x1="20" y1="0" x2="20" y2={TILE} stroke={lineColor} strokeWidth={0.4} />
        <Line x1="60" y1="0" x2="60" y2={TILE} stroke={lineColor} strokeWidth={0.4} />
        <Circle cx="20" cy="20" r="2" fill="none" stroke={circleColor} strokeWidth={0.5} />
        <Circle cx="60" cy="20" r="2" fill="none" stroke={circleColor} strokeWidth={0.5} />
        <Circle cx="20" cy="60" r="2" fill="none" stroke={circleColor} strokeWidth={0.5} />
        <Circle cx="60" cy="60" r="2" fill="none" stroke={circleColor} strokeWidth={0.5} />
        <Rect x="36" y="36" width="8" height="8" fill="none" stroke={rectColor} strokeWidth={0.4} rx="1" />
      </Svg>
    </View>
  );
}
// Note: For a proper repeating pattern, convert the SVG to a PNG tileable asset
// and use it as an ImageBackground with resizeMode="repeat".
```

---

## 6. Navigation Structure

### 6.1 Navigation Items

```typescript
// navigation.ts
import { Home, UtensilsCrossed, Activity, CalendarDays, UserCircle } from "lucide-react-native";
// OR use @expo/vector-icons

export const NAV_ITEMS = [
  { Icon: Home,            labelFr: "Accueil",   labelEn: "Home",     route: "dashboard"  },
  { Icon: UtensilsCrossed, labelFr: "Repas",     labelEn: "Meals",    route: "meals"      },
  { Icon: Activity,        labelFr: "Activités", labelEn: "Activity", route: "activities" },
  { Icon: CalendarDays,    labelFr: "Agenda",    labelEn: "Calendar", route: "calendar"   },
  { Icon: UserCircle,      labelFr: "Profil",    labelEn: "Profile",  route: "profile"    },
];
```

### 6.2 Layout — Sidebar (tablet) + Bottom Tab Bar (mobile)

**On phone (< 768px):** custom bottom navigation bar
**On tablet (≥ 768px):** vertical sidebar on the left

```typescript
// LixumShell.tsx (simplified structure)

export function LixumShell({ children }: { children: React.ReactNode }) {
  const { theme, transitioning } = useTheme();
  const tk     = useTokens();
  const isDark = theme === "dark";
  const { width } = useWindowDimensions();
  const isTablet  = width >= 768;

  return (
    <View style={{ flex: 1, backgroundColor: tk.mainBg }}>
      {/* Background circuit + heartbeat pulse */}
      <CircuitBackground />
      <HeartbeatPulse />

      {/* Layout */}
      <View style={{ flex: 1, flexDirection: isTablet ? "row" : "column" }}>
        {isTablet && <LixumSidebar />}

        {/* Page content */}
        <View style={{ flex: 1, overflow: "hidden" }}>
          {children}
        </View>

        {!isTablet && <LixumBottomBar />}
      </View>

      {/* ECG theme overlay (renders above all) */}
      {transitioning && <ECGOverlay />}
    </View>
  );
}
```

### 6.3 Sidebar Spec

```
Width:              56px (mobile) / 88px (tablet)
Border radius:      { topRight: 24, bottomRight: 24 } (only right side rounded)
Background:         LinearGradient vertical + circuit pattern overlay
  Dark:  ["#010d06", "#020f08", "#011009"]  (vertical 0%→55%→100%)
  Light: ["#ecfdf5", "#e8fdf2", "#dcfce7"]
Border right:       1px solid rgba(0,255,157,0.07) (dark) / rgba(0,150,70,0.14) (light)
Shadow:             4px 0 32px rgba(0,0,0,0.55) (dark)
Padding:            paddingTop: 24, paddingBottom: 20
```

**Logo (top):**
```
Container:  40×40px (or 44×44), borderRadius: 16
Background: rgba(0,255,157,0.06)  (dark) / rgba(0,150,70,0.08) (light)
Border:     1px solid rgba(0,255,157,0.20) (dark)
"L" text:   color #7d8590, font Courier New, bold
"X" text:   color #00ff9d, glow shadow
"lixum":    6-7px, uppercase, tracking very wide, color rgba(0,255,157,0.42)
```

**Nav Item (active):**
```
Background: rgba(0,255,157,0.07)  (dark)
Left indicator bar: 3px wide, 24px tall, rounded-right, color #00ff9d, glow shadow
Icon size: 30px, strokeWidth: 2, color #00ff9d, filter glow
Label: 9px uppercase bold, color rgba(0,255,157,0.92)
```

**Nav Item (inactive):**
```
Icon: 30px, strokeWidth 1.5, color rgba(255,255,255,0.55)
Label: 9px uppercase bold, color rgba(255,255,255,0.52)
On press: background rgba(255,255,255,0.03)
```

**Logout button (bottom):**
```
Icon: LogOut, 26px
Color: rgba(255,255,255,0.45) → rgba(239,68,68,1) on press
Label: "Sortir" (fr) / "Exit" (en)
```

---

## 7. Animations

### 7.1 Page Enter (Spring)

```typescript
// usePageEnterAnimation.ts
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

export function usePageEnterAnimation() {
  const opacity     = useSharedValue(0);
  const translateY  = useSharedValue(38);
  const scale       = useSharedValue(0.93);

  useEffect(() => {
    // Spring effect with overshoot
    opacity.value = withTiming(1, { duration: 270, easing: Easing.out(Easing.cubic) });
    translateY.value = withSpring(0, {
      damping:   14,
      stiffness: 160,
      mass:      0.8,
      overshootClamping: false,
    });
    scale.value = withSpring(1, {
      damping:   14,
      stiffness: 160,
      mass:      0.8,
    });
  }, []);

  return useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale:      scale.value      },
    ],
  }));
}

// Usage in a page component:
// const enterStyle = usePageEnterAnimation();
// return <Animated.View style={[{ flex: 1 }, enterStyle]}> ... </Animated.View>
```

### 7.2 Page Wipe Transition

When the user taps a nav item, trigger a wipe panel that sweeps left→right across the screen:

```typescript
// PageWipe.tsx
// Timing: 0.54s total
// 0% → translateX(-105%) screen width
// 40% → translateX(0%)         (panel covers screen)
// 60% → translateX(0%)         (holds)
// 100% → translateX(+105%)     (sweeps out right)
//
// Trigger: listen for navigation state changes
// Show for 580ms, then hide

import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
  withDelay, Easing, runOnJS,
} from "react-native-reanimated";
import { Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_W } = Dimensions.get("window");

export function PageWipe({ isDark }: { isDark: boolean }) {
  const translateX = useSharedValue(-SCREEN_W * 1.05);

  useEffect(() => {
    // In → hold → Out sequence
    translateX.value = withTiming(0, {
      duration: 216,  // 40% of 540ms
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
    setTimeout(() => {
      translateX.value = withTiming(SCREEN_W * 1.05, {
        duration: 216,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }, 324);   // hold for ~108ms (60-40% of 540ms)
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[{
      position: "absolute", inset: 0 as any,
      zIndex: 5, pointerEvents: "none",
    }, style]}>
      <LinearGradient
        colors={
          isDark
            ? ["transparent", "rgba(0,8,4,0.94)", "rgba(0,8,4,0.97)", "rgba(0,8,4,0.97)", "rgba(0,8,4,0.94)", "transparent"]
            : ["transparent", "rgba(234,253,245,0.95)", "rgba(234,253,245,0.98)", "rgba(234,253,245,0.98)", "rgba(234,253,245,0.95)", "transparent"]
        }
        locations={[0, 0.14, 0.40, 0.60, 0.86, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}
```

### 7.3 Heartbeat Pulse

```typescript
// HeartbeatPulse.tsx
// Two layered circles at center screen, animating on a 4s loop.
// Pulse: scale 1 → 1.18 → 0.97 → 1.09 → 1 over 4s
// Ring:  scale 1 → 1.22 → 1.12 → 1 over 4s

import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, Easing,
} from "react-native-reanimated";
import { useWindowDimensions } from "react-native";

export function HeartbeatPulse({ isDark }: { isDark: boolean }) {
  const { width, height } = useWindowDimensions();
  const size    = Math.min(width, height) * 0.55;   // 55vmin
  const sizeRing = Math.min(width, height) * 0.78;  // 78vmin

  const pulseScale   = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.5);
  const ringScale    = useSharedValue(1);
  const ringOpacity  = useSharedValue(0.14);

  const E = Easing.bezier(0.36, 0.07, 0.19, 0.97);

  useEffect(() => {
    // Pulse animation (4000ms loop)
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 560, easing: E }),
        withTiming(0.97, { duration: 560, easing: E }),
        withTiming(1.09, { duration: 560, easing: E }),
        withTiming(1,    { duration: 920, easing: E }),
        withTiming(1,    { duration: 400  }),  // hold at 65%
      ), -1, false
    );
    // Ring animation
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.22, { duration: 560, easing: E }),
        withTiming(1.12, { duration: 1120, easing: E }),
        withTiming(1,    { duration: 2320, easing: E }),
      ), -1, false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity:   pulseOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity:   ringOpacity.value,
  }));

  const pulseColor = isDark ? "rgba(0,255,157,0.18)" : "rgba(0,200,100,0.12)";
  const ringColor  = isDark ? "rgba(0,255,157,0.10)" : "rgba(0,180,90,0.08)";

  return (
    <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}
          pointerEvents="none">
      {/* Pulse circle */}
      <Animated.View style={[{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: pulseColor,
        position: "absolute",
      }, pulseStyle]} />
      {/* Ring circle */}
      <Animated.View style={[{
        width: sizeRing, height: sizeRing, borderRadius: sizeRing / 2,
        borderWidth: 1, borderColor: ringColor,
        backgroundColor: "transparent",
        position: "absolute",
      }, ringStyle]} />
    </View>
  );
}
```

### 7.4 Stagger Entrance

```typescript
// useStaggerEntrance.ts
// Apply sequential fade-in to list of cards, each delayed by 50ms.
// Usage: const delay = idx * 50 + 50;  → apply to each item's animation

function useStaggeredFadeIn(delay: number = 0) {
  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    setTimeout(() => {
      opacity.value    = withTiming(1, { duration: 400 });
      translateY.value = withTiming(0, { duration: 400 });
    }, delay);
  }, []);

  return useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}
```

---

## 8. Page Layouts

### 8.1 Dashboard Page

**Header:**
```
Row: space-between
Left:  "LIXUM" monospace (LI in #8b949e, X in #00ff9d with glow), "Bio-Digital Dashboard" accent-sub color
Right: User display name (t2, 16px bold)
```

**Vitality Card (full width):**
```
Style:      GlassCard vitality=true
Radius:     32px (mobile) / 40px (tablet)
Padding:    24px (mobile) / 40px (tablet)

Top row:
  Left:   "Score de Vitalité" label (accent color, 12px bold, text-shadow glow)
          Score number (Courier New, 60-72px, black weight)
          "%" in accent color, 24-30px black
          Username below (t2, 14px medium)
  Right:  Goal + Consumed columns (amber, 24-30px monospace bold)

Progress bar:
  Height: 14px, radius: full
  BG:     rgba(255,255,255,0.04), border rgba(255,255,255,0.04)
  Fill:   LinearGradient 90deg #ea580c → #f59e0b → #eab308
  Shadow: glow amber

Stats row (4 columns, border-right dividers):
  BRÛLÉS | RESTANTS | BMR | SÉRIE
  Label:   10px uppercase bold, t2 color
  Value:   Courier New, 36px (mobile) / 48px (tablet), black weight
  Unit:    10px, t4 color
```

**Widget Grid (2 columns):**
```
Cards: GlassCard, radius 28px, padding 20-24px
- Meals card:   amber accent label + "See all" link + list of meals + "Manage meals" footer
- Activity:     blue accent, big number (kcal burned), bar chart (7 days)
- Streak:       green accent, large number + days, progress bar
- Weight:       green accent, projected kg + change badge
```

**Sport Recommendation (conditional):**
```
Red-tinted card: bg rgba(239,68,68,0.05), border rgba(239,68,68,0.12)
3 metric boxes: walking km, running min, steps
```

### 8.2 Meals Page

**Header:** Title (2xl bold white) + Date (left) + Scan button + Add button (amber)
**Date picker + Total calories row**
**4 meal type cards (2×2 grid):** Breakfast (amber), Lunch (blue), Dinner (purple), Snack (green)
  Each card: meal type label, total kcal, list of meals with delete button

### 8.3 Activities Page

**Header:** Title + subtitle
**Total Burned Banner:** Full width GlassCard, big blue number (5xl/6xl), "kcal brûlées"
**Recommendation Card:** Red-tinted, 3 metric boxes
**Activities List Card:** Scrollable list with duration + kcal per activity, delete button

### 8.4 Calendar Page

**Header:** Title + subtitle
**Full-width CalendarView card:** 28rem height minimum
Calendar cells use LIXUM theme colors — no brown/terracotta.
Nav buttons: dark glass style with green border
Today ring: green accent color
Selected day detail: glass card, green left border

### 8.5 Profile Page

**Header:** Title + subtitle

**Avatar Card:**
```
Centered column
Avatar circle (80×80): bg rgba(0,255,157,0.06), border rgba(0,255,157,0.25), glow shadow
Display name: 20-24px black bold, t1
Email: 14px, t3
Premium badge: amber pill (if applicable)
```

**Biometric Data Card:**
```
Row list: Target kcal (amber), BMR (t1), TDEE (t1), Weight (accent), Height (t1)
Each row: label (t3, 14px) | value (Courier New, 14px bold, colored)
Row separator: 1px solid rgba(255,255,255,0.05)
```

**Settings Card:**
```
Language row:  label | locale badge (accent)
Theme row:     label | 🌙/☀️ toggle button (moon/sun + DARK/LIGHT text)
Edit Profile:  full-width button, accent color
Logout:        full-width button, red color
```

---

## 9. Neon X Glow Effect

The "X" in "LIXUM" logo uses a neon green text glow:

```typescript
// NeonX.tsx
import { Text, Platform } from "react-native";

// iOS: use textShadow
// Android: use a workaround (no textShadow) — wrap in a View with shadow

const neonXStyle = {
  color: "#00ff9d",
  // iOS
  textShadowColor:  "rgba(0,255,157,0.6)",
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 12,
};

// For a stronger glow on Android: render 2 Text layers via a View
// (outer blurred layer + inner sharp layer using absolute positioning)
```

---

## 10. Progress Bars

```typescript
// ProgressBar.tsx (for vitality score)
// Animated fill from 0 → percent (duration: 1000ms)

const fillAnim = useSharedValue(0);
useEffect(() => {
  fillAnim.value = withTiming(percent / 100, { duration: 1000 });
}, [percent]);

const fillStyle = useAnimatedStyle(() => ({
  width: `${fillAnim.value * 100}%` as any,
}));
```

**Gradient:** `["#ea580c", "#f59e0b", "#eab308"]` (left to right)

---

## 11. Form Input Style

```typescript
const inputStyle = {
  backgroundColor: isDark ? "rgba(0,8,4,0.58)" : "rgba(255,255,255,0.85)",
  borderWidth:     1,
  borderColor:     isDark ? "rgba(255,255,255,0.12)" : "rgba(0,140,70,0.22)",
  borderRadius:    12,
  padding:         12,   // 0.75rem
  color:           isDark ? "rgba(255,255,255,0.88)" : "rgba(5,30,18,0.88)",
  fontFamily:      "Outfit_400Regular",
  fontSize:        14,
};
// Focus state: add blue/green glow border
```

---

## 12. Key Visual Rules

1. **Monospace numbers everywhere** — All health metrics (calories, weight, score, streak) use Courier New with tabular numerals
2. **Staggered card entrance** — Each card animates in with 50ms offset delay
3. **Skeleton before data** — Every page shows shape-matched shimmer skeleton while loading; no spinners
4. **No scrollbars** — Scrollable areas never show visual scroll indicators
5. **Theme wipes cleanly** — ECG overlay on toggle; page wipe panel on navigation
6. **Neon glow only on accent** — Only the primary accent color (#00ff9d) has glow/shadow effects
7. **Glass cards** — Semi-transparent backgrounds with blur (iOS) or opaque-enough colors (Android)
8. **All text is readable** — In light theme, all card text inherits dark green (t2); amber/red/blue labels are preserved
9. **Battery-friendly animations** — Use only `transform` and `opacity` in animations (no layout animations)
10. **Bilingual** — All labels support French (primary) and English based on locale context

---

## 13. File Structure Suggestion

```
src/
├── theme/
│   ├── tokens.ts          # DARK, LIGHT color tokens
│   ├── typography.ts      # FONTS, FONT_SIZES
│   └── spacing.ts         # SPACING, RADII
├── context/
│   └── ThemeContext.tsx   # ThemeProvider, useTheme, useTokens
├── components/
│   ├── shell/
│   │   ├── LixumShell.tsx       # Main layout wrapper
│   │   ├── LixumSidebar.tsx     # Tablet sidebar
│   │   ├── LixumBottomBar.tsx   # Mobile bottom nav
│   │   ├── HeartbeatPulse.tsx   # Background pulse animation
│   │   ├── CircuitBackground.tsx# SVG circuit texture
│   │   ├── ECGOverlay.tsx       # Theme-change animation
│   │   └── PageWipe.tsx         # Page transition wipe
│   ├── ui/
│   │   ├── GlassCard.tsx        # Glass card container
│   │   ├── SkeletonLoader.tsx   # Shimmer skeleton
│   │   ├── NeonX.tsx            # Glowing X lettermark
│   │   ├── NeonIndicator.tsx    # Active nav bar
│   │   ├── ProgressBar.tsx      # Animated gradient bar
│   │   └── LixumInput.tsx       # Styled text input
│   └── dashboard/
│       ├── VitalityCard.tsx
│       ├── MealsWidget.tsx
│       ├── ActivityWidget.tsx
│       ├── StreakWidget.tsx
│       └── WeightWidget.tsx
└── screens/
    ├── DashboardScreen.tsx
    ├── MealsScreen.tsx
    ├── ActivitiesScreen.tsx
    ├── CalendarScreen.tsx
    └── ProfileScreen.tsx
```

---

## 14. Quick-Start Prompt for Claude

Use the following briefing for a new Claude session to implement this design:

> "Implement the **LIXUM** Afro-Futuristic health dashboard in React Native/Expo based on `LIXUM_REACT_NATIVE_SPEC.md`.
>
> Core requirements:
> - Dark theme default (`#020c07` bg, `#00ff9d` accent) + Light theme (`#eaf7f0` bg, `#059669` accent), toggled via React Context persisted to AsyncStorage
> - ECG heartbeat sweep animation (react-native-svg + Reanimated) on theme toggle — covers screen for 980ms, switches theme at 450ms midpoint
> - Page wipe transition (LinearGradient panel sweeps L→R, 540ms) on every navigation
> - Glass cards (expo-linear-gradient + semi-opaque backgrounds; expo-blur on iOS)
> - Shimmer skeleton loading for all pages (replace spinners)
> - Background: circuit-board SVG pattern + heartbeat pulse animation (scale/opacity loop, 4s)
> - All health numbers: Courier New monospace, very large (36-72px)
> - Sidebar nav on tablet / bottom tab bar on phone; icons size 30, active = neon glow
> - Staggered card fade-in entrance animation (50ms increments)
>
> Follow LIXUM_REACT_NATIVE_SPEC.md exactly for all color values, timing, and component structure."
