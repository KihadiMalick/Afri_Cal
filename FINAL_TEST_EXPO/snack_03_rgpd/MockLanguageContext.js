import React from 'react';

var LanguageContext = React.createContext('fr');

function LanguageProvider(props) {
  var state = React.useState('fr');
  return React.createElement(LanguageContext.Provider, { value: state[0] }, props.children);
}

function useLanguage() {
  return React.useContext(LanguageContext);
}

export { LanguageProvider, useLanguage };
