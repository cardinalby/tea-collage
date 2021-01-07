import i18n from 'i18next';
import enTranslation from './en/translation.json';
import ruTranslation from './ru/translation.json';
import { initReactI18next } from 'react-i18next';
import detector from "i18next-browser-languagedetector";

export const resources = {
    en: {
        translation: enTranslation,
    },
    ru: {
        translation: ruTranslation,
    },
} as const;

i18n
    .use(detector)
    .use(initReactI18next)
    .init({
        lng: 'en',
        fallbackLng: 'en',
        resources,
    });
