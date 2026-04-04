import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

var LanguageContext = createContext({ lang: 'fr', changeLang: function() {} });

export function LanguageProvider(props) {
  var _lang = useState('fr');
  var lang = _lang[0];
  var setLang = _lang[1];

  useEffect(function () {
    AsyncStorage.getItem('lixum_lang').then(function (saved) {
      if (saved === 'en' || saved === 'fr') setLang(saved);
    }).catch(function () {});
  }, []);

  var changeLang = function (newLang) {
    if (newLang !== 'fr' && newLang !== 'en') return;
    setLang(newLang);
    AsyncStorage.setItem('lixum_lang', newLang).catch(function () {});
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { lang: lang, changeLang: changeLang } },
    props.children
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

export default LanguageContext;
