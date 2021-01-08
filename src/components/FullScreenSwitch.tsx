import {ReactComponent as EnterIcon} from "../images/full_screen.svg";
import {ReactComponent as ExitIcon} from "../images/full_screen_exit.svg";
import '../css/fullScreenSwitch.css';
import React from "react";
import screenFull from "screenfull";
import {useStateSafe} from "../hooks/useStateSafe";
import {useTranslation} from "react-i18next";

export function isFullScreenEnabled(): boolean {
    return screenFull.isEnabled;
}

export function FullScreenSwitch() {
    const {t} = useTranslation();
    const [isFullscreen, setIsFullscreen] = useStateSafe(screenFull.isEnabled && screenFull.isFullscreen);

    function onClick() {
        if (screenFull.isEnabled) {
            if (screenFull.isFullscreen) {
                screenFull.exit().then(() => setIsFullscreen(false));
            } else {
                screenFull.request().then(() => setIsFullscreen(true));
            }
        }
    }

    const title = isFullscreen ? t('actions.exit_fullscreen') : t('actions.enter_fullscreen');

    return (
        <div className='full-screen-switch' onClick={onClick} title={title}>
            {isFullscreen ? <ExitIcon/> : <EnterIcon/>}
        </div>
    );
}