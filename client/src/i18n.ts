import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import detector, { DetectorOptions } from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationVI from './locales/vi/translation.json';

type Resources = {
  [key: string]: {
    translation: Record<string, any>;
  };
};

const resources: Resources = {
  en: {
    translation: translationEN,
  },
  // vi: {
  //   translation: translationVI,
  // },
};

const options: DetectorOptions = {
  lookupQuerystring: 'lng',
  lookupCookie: 'i18next',
  lookupLocalStorage: 'i18nextLng',
  lookupSessionStorage: 'i18nextLng',
  lookupFromPathIndex: 0,
  lookupFromSubdomainIndex: 0,

  // Cache user language
  caches: ['localStorage', 'cookie'],
  excludeCacheFor: ['cimode'], // Exclude specific languages
};

i18n
  .use(initReactI18next)
  .use(detector)
  .init({
    resources,
    detection: options,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    debug: false, // Disable debug logs
  });

export default i18n;
