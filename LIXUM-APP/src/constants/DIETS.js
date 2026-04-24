// DIETS — source unique de vérité pour les régimes alimentaires.
// Remplace les 2 definitions divergentes :
//   - registerConstants.texts.fr.diets + texts.en.diets (avec desc)
//   - profileConstants.DIETS (sans desc, orphelin)
// Utilisé par RegisterPage (Phase4Diet) et EditProfilePage (tab Objectifs).

var DIETS = [
  {
    key: 'classic',
    emoji: '🍗',
    color: '#00D984',
    labelFr: 'Classique',
    labelEn: 'Classic',
    descFr: 'Aucune restriction',
    descEn: 'No restriction'
  },
  {
    key: 'vegetarian',
    emoji: '🥬',
    color: '#00BFA6',
    labelFr: 'Végétarien',
    labelEn: 'Vegetarian',
    descFr: 'Sans viande ni poisson',
    descEn: 'No meat or fish'
  },
  {
    key: 'vegan',
    emoji: '🌱',
    color: '#00D984',
    labelFr: 'Végan',
    labelEn: 'Vegan',
    descFr: 'Aucun produit animal',
    descEn: 'No animal products'
  },
  {
    key: 'keto',
    emoji: '🥑',
    color: '#D4AF37',
    labelFr: 'Kéto',
    labelEn: 'Keto',
    descFr: 'Faible en glucides, riche en lipides',
    descEn: 'Low carb, high fat'
  },
  {
    key: 'halal',
    emoji: '🌙',
    color: '#00BFA6',
    labelFr: 'Halal',
    labelEn: 'Halal',
    descFr: 'Conforme aux préceptes islamiques',
    descEn: 'Islamic dietary laws'
  }
];

export { DIETS };
export default DIETS;
