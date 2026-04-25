// utils/haptics.js
// === LIXUM HAPTIC HELPERS ===
// Single source of truth pour tous les feedbacks haptiques.
// Copie identique de LIXUM-APP/src/utils/haptics.js (Phase 1).

import * as Haptics from 'expo-haptics';

function hapticLight() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
}

function hapticMedium() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
}

function hapticSuccess() {
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
}

function hapticError() {
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch (e) {}
}

function hapticWarning() {
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch (e) {}
}

export { hapticLight, hapticMedium, hapticSuccess, hapticError, hapticWarning };
