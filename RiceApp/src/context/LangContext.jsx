// context/LangContext.jsx
// Manages app language using i18next

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [lang, setLangState] = useState('en'); // Default to English

  useEffect(() => {
    // Load saved language
    const loadLanguage = async () => {
      const savedLang = await AsyncStorage.getItem('language');
      if (savedLang && ['en', 'te', 'hi'].includes(savedLang)) {
        setLangState(savedLang);
        i18n.changeLanguage(savedLang);
      }
    };
    loadLanguage();
  }, [i18n]);

  const setLang = useCallback(async (newLang) => {
    setLangState(newLang);
    await AsyncStorage.setItem('language', newLang);
    i18n.changeLanguage(newLang);
  }, [i18n]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
