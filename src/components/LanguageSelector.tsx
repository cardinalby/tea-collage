import i18n from "i18next";
import {capitalizeFirstLetter} from "../models/strUtils";
import React, {useState} from "react";
import '../css/languageSelector.css';
import {classNames} from "../models/reactUtils";
import {useIsMounted} from "../hooks/useIsMounted";

export interface LanguageSelectorProps {

}

export function LanguageSelector(props: LanguageSelectorProps) {
    const [currentLang, setCurrentLang] = useState(i18n.language);
    const isMounted = useIsMounted();

    function onLangOptionClick(lang: string) {
        i18n.changeLanguage(lang).then(() => {
            if (isMounted) {
                setCurrentLang(lang);
            }
        });
    }

    const buttons = Object.keys(i18n.services.resourceStore.data).map((lang, index) =>
        <div className={classNames(
                'lang-selector-option',
                currentLang === lang ? 'lang-current' : undefined
             )}
             onClick={() => onLangOptionClick(lang)}
             key={index}
        >
            {capitalizeFirstLetter(lang)}
        </div>
    );

    return (
        <>
            {buttons}
        </>
    );
}