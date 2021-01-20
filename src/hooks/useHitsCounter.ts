import {useEffect} from "react";

export function useHitsCounter() {
    useEffect(() => {
        if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
            window.fetch(
                'https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fcardinalby.github.io%2Ftea-collage%2F&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=visitors&edge_flat=false',
                {mode: 'no-cors'}
            );
        }
    })
}