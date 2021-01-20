import {useTranslation} from "react-i18next";
import React from "react";

function getImgUrl(trackedUrl: string|undefined): string {
    if (!trackedUrl || !process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        return process.env.PUBLIC_URL + '/hits_badge_fake.svg';
    }
    return 'https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=' +
        encodeURIComponent(trackedUrl) +
        '&count_bg=%2374655B&title_bg=%23000000&icon=&icon_color=%23E7E7E7&title=visitors&edge_flat=false';
}

function getGraphUrl(trackedUrl: string|undefined): string {
    if (!trackedUrl) {
        return '#tracked_url_not_set';
    }
    return 'https://hits.seeyoufarm.com/api/count/graph/dailyhits.svg?url=' +
        encodeURIComponent(trackedUrl);
}

export interface HitsCounterProps {
    visible: boolean
}

export function HitsCounter(props: HitsCounterProps) {
    const {t} = useTranslation();
    const trackedUrl = process.env.REACT_APP_HITS_COUNTER_TRACKED_URL;

    return (
        <a href={getGraphUrl(trackedUrl)}
           className='hits-counter'
           style={{display: props.visible ? 'block' : 'none'}}
        >
            <img
                src={getImgUrl(trackedUrl)}
                alt={t('actions.visitors_stats')}
                title={t('actions.visitors_stats')}
            />
        </a>
    );
}