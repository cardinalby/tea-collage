import {capitalizeFirstLetter} from "../models/strUtils";
import React from "react";
import '../css/languageSelector.css';
import {classNames} from "../models/reactUtils";
import {useTranslation} from "react-i18next";
import {getSupportedLanguages} from "../hooks/useLanguage";

export interface LanguageSelectorProps {
    language: string,
    onChange?: (lang: string) => void
}

export function LanguageSelector(props: LanguageSelectorProps) {
    const {i18n} = useTranslation();
    const langWithoutCode = props.language &&
        i18n.services.languageUtils.getLanguagePartFromCode(props.language);
    const supportedLngs = getSupportedLanguages(i18n);
    const currentLangIndex = supportedLngs.indexOf(langWithoutCode);

    const buttons = supportedLngs.map((lang, index) =>
        <div
            className={classNames(
                'lang-selector-option',
                index === currentLangIndex ? 'lang-current' : undefined
             )}
             onClick={() => props.onChange && props.onChange(lang)}
             key={index}
        >
            {capitalizeFirstLetter(lang)}
        </div>
    );

    return (
        <div className='lang-selector'>
            <div
                className={classNames(
                    'lang-selector-highlight',
                    'highlight-index-' + currentLangIndex
                )}
            />
            {buttons}
        </div>
    );
}