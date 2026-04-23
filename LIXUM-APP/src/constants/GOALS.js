// GOALS — source unique de vérité pour les objectifs utilisateur.
// Remplace les 2 definitions divergentes :
//   - registerConstants.texts.fr.goals + texts.en.goals (Ionicons)
//   - profileConstants.GOALS (emojis)
// Utilise Ionicons (cohérence Premium) + labels FR/EN + color par goal.

var GOALS = [
  {
    key: 'lose',
    labelFr: 'Perte de poids',
    labelEn: 'Weight loss',
    icon: 'trending-down-outline',
    color: '#00BFA6'
  },
  {
    key: 'maintain',
    labelFr: 'Maintien',
    labelEn: 'Stay fit',
    icon: 'swap-horizontal-outline',
    color: '#00D984'
  },
  {
    key: 'gain',
    labelFr: 'Prise de masse',
    labelEn: 'Weight gain',
    icon: 'trending-up-outline',
    color: '#D4AF37'
  }
];

export { GOALS };
export default GOALS;
