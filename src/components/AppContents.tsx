import {useHistory} from "react-router-dom";
import Collage from "./Collage";
import {InfoWindow} from "./InfoWindow";
import {ControlPanel} from "./ControlPanel";
import React, {SyntheticEvent, useMemo} from "react";
import {i18n} from "i18next";
import {useStateSafe} from "../hooks/useStateSafe";
import collageSourcesSet from "../models/collageSourcesSet";
import {useWindowAspectRatioClass} from "../hooks/useWindowAspectRatio";
import {getRecommendedCollageSize} from "../models/sizeAutoSelector";

const recommendedCollageSize = getRecommendedCollageSize(collageSourcesSet.getSizes());

export interface AppContentsProps {
    i18n: i18n,
    section: string,
    itemId?: string
}

export function AppContents(props: AppContentsProps) {
    const history = useHistory();
    const [collageSizeName, setCollageSizeName] = useStateSafe(recommendedCollageSize);
    const collageSources = useMemo(() =>
            collageSourcesSet.getSources(collageSizeName),
        [collageSizeName]
    );
    useWindowAspectRatioClass(document.body, {
        'horizontal-control-panel': aspectRatio => aspectRatio < collageSourcesSet.collageAspectRatio
    });

    function onMainAreaClick(event: SyntheticEvent<HTMLDivElement, MouseEvent>) {
        if (event.target === event.currentTarget) {
            history.replace('/collage/');
        }
    }

    return (
        <div className='app' lang={props.i18n && props.i18n.language}>
            <div className={'main-area'} onClick={onMainAreaClick}>
                {props.section === 'collage' && <Collage layerId={props.itemId} collageSources={collageSources}/>}
                {props.section === 'description' && <InfoWindow itemId={props.itemId}/>}
            </div>
            <ControlPanel collageSizeName={collageSizeName} onCollageSizeChange={setCollageSizeName}/>
        </div>
    );
}