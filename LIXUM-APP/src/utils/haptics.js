// src/utils/haptics.js
// === LIXUM HAPTIC HELPERS ===
// Single source of truth pour tous les feedbacks haptiques.
// Importer dans n'importe quel composant via :
//   import { hapticLight, hapticMedium, hapticSuccess, hapticError, hapticWarning } from '../utils/haptics';
// Compatible Snack Expo et build natif.

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
