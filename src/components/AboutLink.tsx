import '../css/aboutLink.css';
import React from "react";
import {useTranslation} from "react-i18next";
import {useHistory} from "react-router-dom";

export function AboutLink() {
    const {t} = useTranslation();
    const history = useHistory();

    return (
        <div
            className='about-link'
            title={t('teas.about.name')}
            onClick={() => history.push('/description/about')}
        >
            ?
        </div>
    );
}