var translations = {
  fr: {
    lixverse_title: 'LixVerse',
    lixverse_subtitle: 'UNIVERS LIXUM',
    tab_defi: 'Défi',
    tab_human: 'Human',
    tab_characters: 'Caractères',
    tab_lixshop: 'LixShop',
    no_active_character: 'Aucun compagnon actif',
    choose_character: 'Choisir un compagnon',
    my_collection: 'MA COLLECTION',
    coming_soon: 'Bientôt disponible',
    locked: 'VERROUILLÉ',
    activate: 'Activer ce caractère',
    activate_power: 'Activer ce pouvoir',
    recharge: 'Recharger',
    close: 'Fermer',
    fragments: 'fragments',
    uses: 'uses',
    bonus: 'BONUS',
    level: 'NIV',
    max: 'MAX',
    powers: 'POUVOIRS',
    superpower: 'SUPERPOWER'
  }
};

function t(key) {
  return translations.fr[key] || key;
}

export { t };
