import {QualitySelector} from "./QualitySelector";
import collageSourcesSet from "../models/collageSourcesSet";
import {FullScreenSwitch, isFullScreenEnabled} from "./FullScreenSwitch";
import {LanguageSelector} from "./LanguageSelector";
import React from "react";
import {useStateSafe} from "../hooks/useStateSafe";
import {useTranslation} from "react-i18next";

export interface ControlPanelProps {
    collageSizeName: string,
    onCollageSizeChange?: (sizeName: string) => void
}

export function ControlPanel(props: ControlPanelProps) {
    const {i18n} = useTranslation();
    const [currentLang, setCurrentLang] = useStateSafe(i18n.language);

    function onLanguageChange(lang: string) {
        i18n.changeLanguage(lang)
            .then(() => setCurrentLang(lang));
    }

    return (
        <div className="control-panel">
            <LanguageSelector language={currentLang} onChange={onLanguageChange}/>
            <div className='control-panel-center'/>
            <QualitySelector
                sizes={collageSourcesSet.getSizes()}
                currentSize={props.collageSizeName}
                onChange={props.onCollageSizeChange}
            />
            {isFullScreenEnabled() && <FullScreenSwitch/>}
        </div>
    );
}