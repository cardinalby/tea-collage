import {capitalizeFirstLetter} from "../models/strUtils";
import React from "react";
import '../css/languageSelector.css';
import {classNames} from "../models/reactUtils";
import {useTranslation} from "react-i18next";

export interface LanguageSelectorProps {
    language: string,
    onChange?: (lang: string) => void
}

export function LanguageSelector(props: LanguageSelectorProps) {
    const {i18n} = useTranslation();
    const buttons = Object.keys(i18n.services.resourceStore.data).map((lang, index) =>
        <div className={classNames(
                'lang-selector-option',
                props.language === lang ? 'lang-current' : undefined
             )}
             onClick={() => props.onChange && props.onChange(lang)}
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