import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import te from './te.json';
import hi from './hi.json';

const resources = {
  en: { translation: en },
  te: { translation: te },
  hi: { translation: hi },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'te', 'hi'],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    lng: 'en', // Default language
    cache: {
      enabled: true,
      prefix: 'i18next_res_',
      expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    backend: {
      loadPath: '{{lng}}|{{ns}}',
    },
    compatibilityJSON: 'v3',
  });

// Load saved language from AsyncStorage
AsyncStorage.getItem('language').then((savedLang) => {
  if (savedLang && ['en', 'te', 'hi'].includes(savedLang)) {
    i18n.changeLanguage(savedLang);
  }
});

export default i18n;
