import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = 'lixum-biometric-enabled';

export function useBiometric() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  useEffect(() => {
    // Biometric n'est pas disponible sur le web
    if (Platform.OS === 'web') return;

    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsAvailable(compatible && enrolled);

      if (compatible) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('face');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        }
      }

      const saved = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      setIsEnabled(saved === 'true');
    })();
  }, []);

  const toggleBiometric = useCallback(async () => {
    const next = !isEnabled;
    setIsEnabled(next);
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, next ? 'true' : 'false');
  }, [isEnabled]);

  const authenticate = useCallback(async (promptMessage?: string): Promise<boolean> => {
    if (Platform.OS === 'web' || !isAvailable || !isEnabled) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: promptMessage || 'Confirmez votre identité',
      fallbackLabel: 'Utiliser le mot de passe',
      disableDeviceFallback: false,
    });

    return result.success;
  }, [isAvailable, isEnabled]);

  return {
    isAvailable,
    isEnabled,
    biometricType,
    toggleBiometric,
    authenticate,
  };
}
