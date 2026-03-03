import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { useTokens } from '@/context/ThemeContext';
import { borderRadius, spacing } from '@/theme/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const tk = useTokens();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: tk.t3 }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: tk.inputBg,
            color: tk.t1,
            borderColor: error ? tk.red : tk.cardBorder,
          },
          style,
        ]}
        placeholderTextColor={tk.t4}
        {...props}
      />
      {error && <Text style={[styles.error, { color: tk.red }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
