import {useStateSafe} from "./useStateSafe";
import {i18n} from "i18next";

function clearBackendCacheIfFailed(i18n: i18n, lang: string) {
    const backendState = i18n.services?.backendConnector?.state;
    if (backendState && backendState[`${lang}|translation`] === -1) {
        delete backendState[`${lang}|translation`];
    }
}

export function getSupportedLanguages(i18n: i18n): string[] {
    return i18n.services.languageUtils.supportedLngs
        ? i18n.services.languageUtils.supportedLngs.filter(lang => lang !== 'cimode')
        : [];
}

function getInitLanguage(i18n: i18n): string {
    if (i18n.services.resourceStore.data[i18n.language] !== undefined) {
        return i18n.language;
    }
    const fallbackLanguages = i18n.services.languageUtils.getFallbackCodes(
        // using fallbackLng in options forces fetching all items
        getSupportedLanguages(i18n),
        i18n.language
    );
    if (fallbackLanguages) {
        const foundFallback = fallbackLanguages.find(lang => lang !== i18n.language);
        if (foundFallback) {
            return foundFallback
        }
    }
    return i18n.language;
}

export interface LanguageState {
    currentLang: string,
    changeLanguage: (lang: string) => Promise<string>
}

export function useLanguage(i18n: i18n): LanguageState {
    const [currentLang, setCurrentLang] = useStateSafe(() => {
        const initLang = getInitLanguage(i18n);
        if (initLang !== i18n.language) {
            // noinspection JSIgnoredPromiseFromCall
            i18n.changeLanguage(initLang);
        }
        return initLang;
    });

    async function changeLanguage(lang: string) {
        setCurrentLang(lang);
        try {
            clearBackendCacheIfFailed(i18n, lang);
            await i18n.changeLanguage(lang);
            if (i18n.services.resourceStore.data[lang] === undefined) {
                setCurrentLang(currentLang);
                await i18n.changeLanguage(currentLang);
                return currentLang;
            }
            return lang;
        } catch (e) {
            setCurrentLang(currentLang);
            return currentLang;
        }
    }

    return {
        currentLang,
        changeLanguage
    }
}