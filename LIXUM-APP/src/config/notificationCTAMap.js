import { Linking, Alert } from 'react-native';

function hostname(url) {
  return String(url || '').replace(/^https?:\/\//, '').split('/')[0];
}

function openExternal(url) {
  Alert.alert(
    'Lien externe',
    'Vous allez quitter LIXUM pour ' + hostname(url) + '. Continuer ?',
    [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Continuer', onPress: function() {
        try {
          Linking.canOpenURL(url).then(function(supported) {
            if (supported) {
              Linking.openURL(url).catch(function() {
                Alert.alert('Ce lien ne peut pas être ouvert sur cet appareil');
              });
            } else {
              Alert.alert('Ce lien ne peut pas être ouvert sur cet appareil');
            }
          }).catch(function() {
            Alert.alert('Ce lien ne peut pas être ouvert sur cet appareil');
          });
        } catch (e) {
          Alert.alert('Ce lien ne peut pas être ouvert sur cet appareil');
        }
      }},
    ]
  );
}

export function getAlixenCTA(notification, navigation) {
  if (!notification || !navigation) return null;
  var type = notification.notification_type;

  switch (type) {
    case 'calorie_deficit_3d':
      return { label: 'Logger un repas', action: function() { navigation.navigate('Repas'); } };
    case 'calorie_surplus_3d':
      return { label: 'Voir mes repas', action: function() { navigation.navigate('Repas'); } };
    case 'meal_skipped':
      return { label: 'Scanner un repas', action: function() { navigation.navigate('Repas'); } };
    case 'sedentary_5d':
      return { label: 'Enregistrer activité', action: function() { navigation.navigate('Activite'); } };
    case 'hydration_low':
      return { label: "Ajouter de l'eau", action: function() { navigation.navigate('Accueil'); } };
    case 'mood_not_logged_7d':
      return { label: 'Logger mon humeur', action: function() { navigation.navigate('Accueil'); } };
    case 'weight_not_logged_14d':
      return { label: 'Mettre à jour mon poids', action: function() { navigation.navigate('Profile', { scrollTo: 'weight' }); } };

    case 'vaccine_due':
    case 'vaccine_overdue':
      return { label: 'Voir mon carnet vaccinal', action: function() { navigation.navigate('MedicAi', { openSection: 'medibook', reportSection: 'vaccinations' }); } };
    case 'medication_reminder':
    case 'medication_refill':
      return { label: 'Voir mes médicaments', action: function() { navigation.navigate('MedicAi', { openSection: 'medibook', reportSection: 'medications' }); } };
    case 'analysis_reminder':
      return { label: 'Voir mes analyses', action: function() { navigation.navigate('MedicAi', { openSection: 'medibook' }); } };

    case 'medibook_empty_vaccines':
      return { label: 'Ajouter un vaccin', action: function() { navigation.navigate('MedicAi', { openSection: 'medibook', reportSection: 'vaccinations' }); } };
    case 'medibook_empty_allergies':
      return { label: 'Ajouter une allergie', action: function() { navigation.navigate('MedicAi', { openSection: 'medibook', reportSection: 'allergies' }); } };
    case 'medibook_empty_medications':
      return { label: 'Ajouter un médicament', action: function() { navigation.navigate('MedicAi', { openSection: 'medibook', reportSection: 'medications' }); } };
    case 'medibook_empty_diagnostics':
      return { label: 'Ajouter un diagnostic', action: function() { navigation.navigate('MedicAi', { openSection: 'medibook', reportSection: 'diagnostics' }); } };

    case 'weekly_insight':
      return { label: 'Ouvrir ALIXEN', action: function() { navigation.navigate('MedicAi'); } };
    case 'annual_summary':
      return { label: 'Voir le bilan', action: function() { navigation.navigate('MedicAi'); } };

    default:
      return { label: 'Ouvrir MedicAi', action: function() { navigation.navigate('MedicAi'); } };
  }
}

export function getLixverseCTA(notification, navigation) {
  if (!notification || !navigation) return null;

  if (notification.external_url) {
    var url = notification.external_url;
    return { label: 'Consulter source officielle', action: function() { openExternal(url); } };
  }

  var type = notification.notification_type;
  switch (type) {
    case 'character_won':
    case 'character_unlocked':
      return { label: 'Voir mon personnage', action: function() { navigation.navigate('LixVerse'); } };
    case 'fragment_received':
      return { label: 'Voir mes fragments', action: function() { navigation.navigate('LixVerse'); } };
    case 'challenge_new':
      return { label: 'Rejoindre le défi', action: function() { navigation.navigate('LixVerse'); } };
    case 'challenge_won':
      return { label: 'Voir mes gains', action: function() { navigation.navigate('LixVerse'); } };
    case 'challenge_ending':
      return { label: 'Terminer le défi', action: function() { navigation.navigate('LixVerse'); } };
    case 'rank_up':
      return { label: 'Voir le classement', action: function() { navigation.navigate('LixVerse'); } };
    case 'group_invite':
      return { label: "Voir l'invitation", action: function() { navigation.navigate('LixVerse'); } };
    case 'group_created':
      return { label: 'Voir le groupe', action: function() { navigation.navigate('LixVerse'); } };
    case 'binome_match':
      return { label: 'Voir mon binôme', action: function() { navigation.navigate('LixVerse'); } };
    case 'nutritionist_message':
      return { label: 'Voir le message', action: function() { navigation.navigate('LixVerse'); } };
    case 'xp_milestone':
      return { label: 'Voir récompenses', action: function() { navigation.navigate('LixVerse'); } };
    case 'wall_sticker_liked':
      return { label: 'Voir Wall of Health', action: function() { navigation.navigate('LixVerse'); } };
    case 'fraud_warning':
      return { label: 'Voir mes défis', action: function() { navigation.navigate('LixVerse'); } };

    case 'admin_alert':
    case 'epidemic_alert':
    case 'contact_tracing':
      return { label: 'Compris', action: function() {} };

    default:
      return { label: 'Compris', action: function() {} };
  }
}
