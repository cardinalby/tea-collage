import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import detector from "i18next-browser-languagedetector";
import Backend from 'i18next-fetch-backend';

i18n
    .use(detector)
    .use(Backend)
    .use(initReactI18next)
    .init({
        detection: {
            lookupQuerystring: undefined,
            lookupCookie: undefined,
            lookupLocalStorage: 'i18nextLng',
            lookupSessionStorage: undefined,
            lookupFromPathIndex: undefined,
            lookupFromSubdomainIndex: undefined,
        },
        supportedLngs: ['en', 'ru'],
        load: 'languageOnly',
        backend: {
            loadPath: process.env.PUBLIC_URL + '/i18n/{{lng}}.json',
        },
        //resources
    });
