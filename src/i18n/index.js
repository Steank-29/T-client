import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English
import enHome from './locales/en/home.json';
import enCommon from './locales/en/common.json';

// French
import frHome from './locales/fr/home.json';
import frCommon from './locales/fr/common.json';

// Arabic
import arHome from './locales/ar/home.json';
import arCommon from './locales/ar/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        home: enHome,
        common: enCommon,
      },
      fr: {
        home: frHome,
        common: frCommon,
      },
      ar: {
        home: arHome,
        common: arCommon,
      },
    },
    fallbackLng: 'fr',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;