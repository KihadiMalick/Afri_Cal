// ──────────────────────────────────────────────────────────────────────────────
// NotificationService.js — PUSH NOTIFICATIONS DÉSACTIVÉES TEMPORAIREMENT
// [DÉSACTIVÉ TEMPORAIREMENT - Push notifications V2]
//
// Raison : le requestPermissionsAsync() crash l'app au login quand il
// entre en conflit avec le popup Android "Enregistrer le mot de passe".
//
// Plan V2 :
// - Permission DIFFÉRÉE (au moment où l'user active une fonctionnalité)
// - Setup token push avec try/catch complet
// - Test isolé avant intégration
//
// Les fonctions exportent des no-op pour ne pas casser les appelants
// existants (MediBookPages, index.js medicai). Les notifs in-app
// (cloche LixVerse) fonctionnent SANS ce service.
// ──────────────────────────────────────────────────────────────────────────────

// [DÉSACTIVÉ TEMPORAIREMENT - Push notifications V2]
// var Notifications = require('expo-notifications');

// [DÉSACTIVÉ TEMPORAIREMENT - Push notifications V2]
// Notifications.setNotificationHandler({
//   handleNotification: function() {
//     return Promise.resolve({
//       shouldShowAlert: true,
//       shouldPlaySound: true,
//       shouldSetBadge: true,
//     });
//   },
// });

var registerForPushNotifications = function(userId) {
  // [DÉSACTIVÉ TEMPORAIREMENT - Push notifications V2]
  console.log('[Notifications] Push notifications désactivées — skip registration');
  return Promise.resolve(null);
};

var scheduleVaccineReminder = function(vaccination, userId) {
  // [DÉSACTIVÉ TEMPORAIREMENT - Push notifications V2]
  return Promise.resolve();
};

var scheduleMedicationReminder = function(medication, userId) {
  // [DÉSACTIVÉ TEMPORAIREMENT - Push notifications V2]
  return Promise.resolve();
};

var scheduleAnalysisReminder = function(analysis, userId) {
  // [DÉSACTIVÉ TEMPORAIREMENT - Push notifications V2]
  return Promise.resolve();
};

var cancelAllReminders = function(referenceId, userId) {
  // [DÉSACTIVÉ TEMPORAIREMENT - Push notifications V2]
  return Promise.resolve();
};

var rescheduleAllReminders = function(userId) {
  // [DÉSACTIVÉ TEMPORAIREMENT - Push notifications V2]
  return Promise.resolve();
};

module.exports = {
  registerForPushNotifications: registerForPushNotifications,
  scheduleVaccineReminder: scheduleVaccineReminder,
  scheduleMedicationReminder: scheduleMedicationReminder,
  scheduleAnalysisReminder: scheduleAnalysisReminder,
  cancelAllReminders: cancelAllReminders,
  rescheduleAllReminders: rescheduleAllReminders,
};
