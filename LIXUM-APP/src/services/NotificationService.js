var Notifications = require('expo-notifications');
var Platform = require('react-native').Platform;
var SUPABASE_URL = require('../config/supabase').SUPABASE_URL;
var SUPABASE_ANON_KEY = require('../config/supabase').SUPABASE_ANON_KEY;
var supabase = require('../config/supabase').supabase;

// ── NOTIFICATION HANDLER ─────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: function() {
    return Promise.resolve({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    });
  },
});

// ── HELPERS ──────────────────────────────────────────────────────────────────
var getAuthHeaders = function() {
  return supabase.auth.getSession().then(function(result) {
    var token = result.data.session ? result.data.session.access_token : SUPABASE_ANON_KEY;
    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    };
  });
};

var DAY_MS = 24 * 60 * 60 * 1000;

// ── REGISTER FOR PUSH NOTIFICATIONS ─────────────────────────────────────────
// TODO: Add push_token TEXT column to users_profile table in Supabase if not already present
var registerForPushNotifications = function(userId) {
  return new Promise(function(resolve) {
    if (Platform.OS === 'web') {
      console.log('[Notifications] Web platform — skip registration');
      resolve(null);
      return;
    }

    Notifications.getPermissionsAsync().then(function(statusResult) {
      var status = statusResult.status;
      if (status !== 'granted') {
        return Notifications.requestPermissionsAsync().then(function(askResult) {
          return askResult.status;
        });
      }
      return status;
    }).then(function(finalStatus) {
      if (finalStatus !== 'granted') {
        console.log('[Notifications] Permission not granted');
        resolve(null);
        return;
      }

      Notifications.getExpoPushTokenAsync({
        projectId: '2303bd63-dc83-43d1-b248-b6660299d940',
      }).then(function(tokenData) {
        var token = tokenData.data;
        console.log('[Notifications] Push token:', token);

        // Save token to users_profile
        if (userId && token) {
          getAuthHeaders().then(function(headers) {
            headers['Prefer'] = 'return=minimal';
            fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + userId, {
              method: 'PATCH',
              headers: headers,
              body: JSON.stringify({ push_token: token }),
            }).then(function() {
              console.log('[Notifications] Token saved to profile');
            }).catch(function(err) {
              console.warn('[Notifications] Failed to save token:', err);
            });
          });
        }

        // Android channel
        if (Platform.OS === 'android') {
          Notifications.setNotificationChannelAsync('health-reminders', {
            name: 'Rappels santé',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'default',
            vibrationPattern: [0, 250, 250, 250],
          });
        }

        resolve(token);
      }).catch(function(err) {
        console.warn('[Notifications] Token error:', err);
        resolve(null);
      });
    }).catch(function(err) {
      console.warn('[Notifications] Permission error:', err);
      resolve(null);
    });
  });
};

// ── STORE NOTIFICATION IN DB ─────────────────────────────────────────────────
var storeNotificationRecord = function(userId, type, referenceId, scheduledAt, expoId) {
  return getAuthHeaders().then(function(headers) {
    headers['Prefer'] = 'return=minimal';
    return fetch(SUPABASE_URL + '/rest/v1/alixen_notifications', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        user_id: userId,
        type: type,
        reference_id: referenceId,
        scheduled_at: scheduledAt,
        notification_expo_id: expoId,
      }),
    });
  });
};

// ── SCHEDULE VACCINE REMINDERS ───────────────────────────────────────────────
var scheduleVaccineReminder = function(vaccination, userId) {
  if (!vaccination.next_due_date) return Promise.resolve();

  var dueDate = new Date(vaccination.next_due_date);
  var now = new Date();
  var vacName = vaccination.vaccine_name || 'Vaccin';
  var refId = vaccination.id;
  var promises = [];

  // 3 months before
  var d3m = new Date(dueDate.getTime() - 90 * DAY_MS);
  if (d3m > now) {
    promises.push(
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rappel vaccin',
          body: 'Rappel vaccin ' + vacName + ' dans 3 mois — pensez à prendre rendez-vous',
          data: { type: 'vaccine_reminder', reference_id: refId },
          sound: 'default',
        },
        trigger: { date: d3m },
      }).then(function(expoId) {
        return storeNotificationRecord(userId, 'vaccine_reminder', refId, d3m.toISOString(), expoId);
      })
    );
  }

  // 1 month before
  var d1m = new Date(dueDate.getTime() - 30 * DAY_MS);
  if (d1m > now) {
    promises.push(
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rappel vaccin',
          body: 'Rappel vaccin ' + vacName + ' dans 1 mois',
          data: { type: 'vaccine_reminder', reference_id: refId },
          sound: 'default',
        },
        trigger: { date: d1m },
      }).then(function(expoId) {
        return storeNotificationRecord(userId, 'vaccine_reminder', refId, d1m.toISOString(), expoId);
      })
    );
  }

  // 1 week before
  var d1w = new Date(dueDate.getTime() - 7 * DAY_MS);
  if (d1w > now) {
    promises.push(
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rappel vaccin urgent',
          body: 'Rappel vaccin ' + vacName + ' dans 7 jours — prenez rendez-vous rapidement',
          data: { type: 'vaccine_reminder', reference_id: refId },
          sound: 'default',
        },
        trigger: { date: d1w },
      }).then(function(expoId) {
        return storeNotificationRecord(userId, 'vaccine_reminder', refId, d1w.toISOString(), expoId);
      })
    );
  }

  return Promise.all(promises).then(function() {
    console.log('[Notifications] Scheduled ' + promises.length + ' vaccine reminders for ' + vacName);
  });
};

// ── SCHEDULE MEDICATION REMINDERS ────────────────────────────────────────────
var scheduleMedicationReminder = function(medication, userId) {
  if (!medication.reminder_enabled || !medication.frequency_times || medication.frequency_times.length === 0) {
    return Promise.resolve();
  }

  var medName = medication.name || 'Médicament';
  var dosage = medication.dosage || '';
  var refId = medication.id;
  var promises = [];

  medication.frequency_times.forEach(function(timeStr) {
    var parts = timeStr.split(':');
    var hour = parseInt(parts[0], 10);
    var minute = parseInt(parts[1], 10) || 0;

    promises.push(
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Médicament à prendre',
          body: medName + (dosage ? ' ' + dosage : '') + ' — c\'est l\'heure de votre prise',
          data: { type: 'medication_reminder', reference_id: refId },
          sound: 'default',
        },
        trigger: { hour: hour, minute: minute, repeats: true },
      }).then(function(expoId) {
        return storeNotificationRecord(userId, 'medication_reminder', refId, timeStr, expoId);
      })
    );
  });

  return Promise.all(promises).then(function() {
    console.log('[Notifications] Scheduled ' + promises.length + ' medication reminders for ' + medName);
  });
};

// ── SCHEDULE ANALYSIS REMINDERS ──────────────────────────────────────────────
var scheduleAnalysisReminder = function(analysis, userId) {
  if (!analysis.is_scheduled || !analysis.scheduled_date) return Promise.resolve();

  var dueDate = new Date(analysis.scheduled_date);
  var now = new Date();
  var label = analysis.label || 'Analyse';
  var refId = analysis.id;
  var promises = [];

  // 1 week before
  var d1w = new Date(dueDate.getTime() - 7 * DAY_MS);
  if (d1w > now) {
    promises.push(
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rappel analyse',
          body: 'Analyse ' + label + ' prévue dans 7 jours',
          data: { type: 'analysis_reminder', reference_id: refId },
          sound: 'default',
        },
        trigger: { date: d1w },
      }).then(function(expoId) {
        return storeNotificationRecord(userId, 'analysis_reminder', refId, d1w.toISOString(), expoId);
      })
    );
  }

  // 1 day before
  var d1d = new Date(dueDate.getTime() - 1 * DAY_MS);
  if (d1d > now) {
    promises.push(
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rappel analyse demain',
          body: 'Analyse ' + label + ' demain — n\'oubliez pas',
          data: { type: 'analysis_reminder', reference_id: refId },
          sound: 'default',
        },
        trigger: { date: d1d },
      }).then(function(expoId) {
        return storeNotificationRecord(userId, 'analysis_reminder', refId, d1d.toISOString(), expoId);
      })
    );
  }

  return Promise.all(promises).then(function() {
    console.log('[Notifications] Scheduled ' + promises.length + ' analysis reminders for ' + label);
  });
};

// ── CANCEL ALL REMINDERS FOR A REFERENCE ─────────────────────────────────────
var cancelAllReminders = function(referenceId, userId) {
  return getAuthHeaders().then(function(headers) {
    return fetch(
      SUPABASE_URL + '/rest/v1/alixen_notifications?user_id=eq.' + userId + '&reference_id=eq.' + referenceId + '&select=notification_expo_id',
      { headers: headers }
    ).then(function(res) { return res.ok ? res.json() : []; });
  }).then(function(records) {
    var cancelPromises = records.map(function(rec) {
      if (rec.notification_expo_id) {
        return Notifications.cancelScheduledNotificationAsync(rec.notification_expo_id).catch(function() {});
      }
      return Promise.resolve();
    });

    return Promise.all(cancelPromises).then(function() {
      return getAuthHeaders().then(function(headers) {
        headers['Prefer'] = 'return=minimal';
        return fetch(
          SUPABASE_URL + '/rest/v1/alixen_notifications?user_id=eq.' + userId + '&reference_id=eq.' + referenceId,
          { method: 'DELETE', headers: headers }
        );
      });
    });
  }).then(function() {
    console.log('[Notifications] Cancelled reminders for reference ' + referenceId);
  });
};

// ── RESCHEDULE ALL REMINDERS ─────────────────────────────────────────────────
var rescheduleAllReminders = function(userId) {
  // 1. Cancel everything
  return Notifications.cancelAllScheduledNotificationsAsync().then(function() {
    return getAuthHeaders();
  }).then(function(headers) {
    // Clear all records in DB
    headers['Prefer'] = 'return=minimal';
    return fetch(
      SUPABASE_URL + '/rest/v1/alixen_notifications?user_id=eq.' + userId,
      { method: 'DELETE', headers: headers }
    ).then(function() {
      // Remove Prefer header for GET requests
      delete headers['Prefer'];
      return headers;
    });
  }).then(function(headers) {
    // 2. Fetch all active remindable data
    return Promise.all([
      fetch(SUPABASE_URL + '/rest/v1/vaccinations?user_id=eq.' + userId + '&next_due_date=not.is.null&select=*', { headers: headers }).then(function(r) { return r.ok ? r.json() : []; }),
      fetch(SUPABASE_URL + '/rest/v1/medications?user_id=eq.' + userId + '&reminder_enabled=eq.true&status=eq.active&select=*', { headers: headers }).then(function(r) { return r.ok ? r.json() : []; }),
      fetch(SUPABASE_URL + '/rest/v1/medical_analyses?user_id=eq.' + userId + '&is_scheduled=eq.true&select=*', { headers: headers }).then(function(r) { return r.ok ? r.json() : []; }),
    ]);
  }).then(function(results) {
    var vaccinations = results[0];
    var medications = results[1];
    var analyses = results[2];

    var schedulePromises = [];

    vaccinations.forEach(function(v) {
      schedulePromises.push(scheduleVaccineReminder(v, userId));
    });
    medications.forEach(function(m) {
      schedulePromises.push(scheduleMedicationReminder(m, userId));
    });
    analyses.forEach(function(a) {
      schedulePromises.push(scheduleAnalysisReminder(a, userId));
    });

    return Promise.all(schedulePromises);
  }).then(function() {
    console.log('[Notifications] All reminders rescheduled');
  }).catch(function(err) {
    console.warn('[Notifications] Reschedule error:', err);
  });
};

// ── EXPORTS ──────────────────────────────────────────────────────────────────
module.exports = {
  registerForPushNotifications: registerForPushNotifications,
  scheduleVaccineReminder: scheduleVaccineReminder,
  scheduleMedicationReminder: scheduleMedicationReminder,
  scheduleAnalysisReminder: scheduleAnalysisReminder,
  cancelAllReminders: cancelAllReminders,
  rescheduleAllReminders: rescheduleAllReminders,
};
