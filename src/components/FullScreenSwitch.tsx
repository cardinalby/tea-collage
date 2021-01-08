import {ReactComponent as Icon} from "../images/full_screen.svg";
import '../css/fullScreenSwitch.css';
import React from "react";
import screenFull from "screenfull";

export function isFullScreenEnabled(): boolean {
    return screenFull.isEnabled;
}

export function FullScreenSwitch() {
    function onClick() {
        if (screenFull.isEnabled) {
            if (screenFull.isFullscreen) {
                // noinspection JSIgnoredPromiseFromCall
                screenFull.exit();
            } else {
                // noinspection JSIgnoredPromiseFromCall
                screenFull.request();
            }
        }
    }

    return (
        <div className='full-screen-switch' onClick={onClick}>
            <Icon/>
        </div>
    );
}