import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Suppress the i18next Locize promotional console message
window.__locize_promo_suppressed = true;

i18n
    .use(HttpBackend)          // Load translations from /locales/{lng}/translation.json
    .use(LanguageDetector)     // Auto-detect browser language
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'te', 'hi'],
        debug: false,
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
