import React, { createContext, useContext, useState } from 'react';

var MockLanguageContext = createContext(null);

export function MockLanguageProvider(props) {
  var _language = useState('FR');
  var language = _language[0];
  var setLanguage = _language[1];

  var value = {
    language: language,
    setLanguage: setLanguage
  };

  return React.createElement(MockLanguageContext.Provider, { value: value }, props.children);
}

export function useLang() {
  var ctx = useContext(MockLanguageContext);
  if (!ctx) throw new Error('useLang must be used inside MockLanguageProvider');
  return ctx;
}
