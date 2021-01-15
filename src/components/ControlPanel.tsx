import {QualitySelector} from "./QualitySelector";
import collageSourcesSet from "../models/collageSourcesSet";
import {FullScreenSwitch, isFullScreenEnabled} from "./FullScreenSwitch";
import {LanguageSelector} from "./LanguageSelector";
import React from "react";
import {useTranslation} from "react-i18next";
import {GithubLink} from "./GithubLink";
import {useLanguage} from "../hooks/useLanguage";
import {AboutLink} from "./AboutLink";

export interface ControlPanelProps {
    collageSizeName: string,
    onCollageSizeChange?: (sizeName: string) => void
}

export function ControlPanel(props: ControlPanelProps) {
    const {i18n} = useTranslation();
    const {currentLang, changeLanguage} = useLanguage(i18n);

    return (
        <div className="control-panel">
            <LanguageSelector language={currentLang} onChange={changeLanguage}/>
            <div className='control-panel-center'/>
            <AboutLink/>
            <GithubLink url={'https://github.com/cardinalby/tea-collage'}/>
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