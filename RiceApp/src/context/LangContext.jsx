// context/LangContext.jsx
// Manages app language. Telugu is default (village users).
// Reuses the i18n string keys from the website's translation.json

import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Inline strings — keeps the app working offline
// Extend with the full website translation.json keys as needed
const strings = {
  te: {
    greeting:        'నమస్కారం!',
    greetingSub:     'ఏ బియ్యం కావాలి?',
    searchPlaceholder: 'బియ్యం వెతకండి...',
    voiceSearch:     'వాయిస్ సెర్చ్',
    voiceHint:       'మైక్ నొక్కి చెప్పండి',
    whatDoYouNeed:   'మీకు ఏమి కావాలి?',
    daily:           'రోజువారీ',
    function:        'ఫంక్షన్',
    healthy:         'ఆరోగ్యం',
    bestDeals:       'ఈ రోజు బెస్ట్ డీల్స్',
    marketPrices:    'ఈ రోజు మార్కెట్ ధరలు',
    navHome:         'హోమ్',
    navSearch:       'వెతుకు',
    navOrders:       'ఆర్డర్లు',
    navProfile:      'ప్రొఫైల్',
    kmAway:          'కి.మీ దూరం',
    lowestPrice:     'అతి తక్కువ ధర',
    orderNow:        'ఆర్డర్ చేయండి',
    off:             'తక్కువ',
    loading:         'లోడ్ అవుతోంది...',
    error:           'సమస్య వచ్చింది. మళ్ళీ ప్రయత్నించండి.',
  },
  hi: {
    greeting:        'नमस्ते!',
    greetingSub:     'कौन सा चावल चाहिए?',
    searchPlaceholder: 'चावल खोजें...',
    voiceSearch:     'आवाज़ खोज',
    voiceHint:       'माइक दबाकर बोलें',
    whatDoYouNeed:   'आपको क्या चाहिए?',
    daily:           'रोज़ाना',
    function:        'फंक्शन',
    healthy:         'स्वस्थ',
    bestDeals:       'आज के बेस्ट डील्स',
    marketPrices:    'आज के बाज़ार भाव',
    navHome:         'होम',
    navSearch:       'खोजें',
    navOrders:       'ऑर्डर',
    navProfile:      'प्रोफ़ाइल',
    kmAway:          'किमी दूर',
    lowestPrice:     'सबसे कम कीमत',
    orderNow:        'ऑर्डर करें',
    off:             'छूट',
    loading:         'लोड हो रहा है...',
    error:           'समस्या आई। फिर कोशिश करें।',
  },
  en: {
    greeting:        'Hello!',
    greetingSub:     'What rice do you need today?',
    searchPlaceholder: 'Search for rice...',
    voiceSearch:     'Voice search',
    voiceHint:       'Tap mic and say variety name',
    whatDoYouNeed:   'What do you need?',
    daily:           'Daily Rice',
    function:        'Function',
    healthy:         'Healthy',
    bestDeals:       "Today's Best Deals",
    marketPrices:    "Today's Market Prices",
    navHome:         'Home',
    navSearch:       'Search',
    navOrders:       'Orders',
    navProfile:      'Profile',
    kmAway:          'km away',
    lowestPrice:     'LOWEST',
    orderNow:        'Order Now',
    off:             'OFF',
    loading:         'Loading...',
    error:           'Something went wrong. Please try again.',
  },
};

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLangState] = useState('te'); // Telugu default

  const setLang = useCallback(async (newLang) => {
    setLangState(newLang);
    await AsyncStorage.setItem('lang', newLang);
  }, []);

  // t('greeting') → string in current language
  const t = useCallback(
    (key) => strings[lang]?.[key] ?? strings.en[key] ?? key,
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t, strings }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
