import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
    .use(HttpBackend)          // Load translations from /locales/{lng}/translation.json
    .use(LanguageDetector)     // Auto-detect browser language
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'te', 'hi'],
        interpolation: {
            escapeValue: false
        },
        backend: {
            // Loads from /locales/en/translation.json, /locales/te/translation.json, etc.
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
        // Only load the detected/current language, not all languages
        load: 'currentOnly',
        // Don't wait for translations to load before rendering
        // (keys will display briefly, then translate when loaded)
        react: {
            useSuspense: true,
        },
    });

export default i18n;
