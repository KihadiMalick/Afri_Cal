import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTokens } from '@/context/ThemeContext';
import { borderRadius, spacing } from '@/theme/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const tk = useTokens();

  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: tk.accent },
    secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: tk.cardBorder },
    accent: { backgroundColor: tk.accent },
    danger: { backgroundColor: tk.red },
  };

  const textColorMap: Record<string, string> = {
    primary: '#000000',
    secondary: tk.t1,
    accent: '#000000',
    danger: '#FFFFFF',
  };

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
    lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing['2xl'] },
  };

  const textSizes: Record<string, number> = { sm: 13, md: 15, lg: 17 };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColorMap[variant]} size="small" />
      ) : (
        <Text style={[
          styles.text,
          { color: textColorMap[variant], fontSize: textSizes[size] },
          textStyle,
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700',
  },
});
